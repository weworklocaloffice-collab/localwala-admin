import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminDeliverymanDisbursementReportInterface } from 'src/app/interfaces/admin.deliveryman.disbursement.report.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogDeliverymanDisbursementDetail } from './dialog-deliveryman-disbursement-detail/dialog-deliveryman-disbursement-detail';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-deliveryman-disbursement-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './deliveryman-disbursement-list.html',
})
export class DeliverymanDisbursementList {

  list = new MatTableDataSource<AdminDeliverymanDisbursementReportInterface>([]);
  displayedColumn = ['name', 'amount', 'payout', 'status', 'action'];
  id: string = '';
  reportNo: number = 0;
  reportTime: string = '';
  reportTotalAmount: number = 0;
  reportStatus: string = 'pending';
  exportType: string = 'export';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private location: Location,
    private router: Router
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    console.log(this.id);
    if (this.id != '' && this.id != null) {
      this.getReport();
    }
  }

  getReport() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/disbursement/deliverymanReport/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminDeliverymanDisbursementReportInterface) => {
              if (item && item.withdrawalMethodDetail && item.withdrawalMethodDetail.id) {
                if (item.withdrawalMethodDetail?.translations) {
                  const translation = item.withdrawalMethodDetail.translations.find((t) => t.code == this.util.appLocaleName());
                  item.withdrawalMethodDetail.displayName = translation?.title || item.withdrawalMethodDetail.name;
                } else {
                  item.withdrawalMethodDetail.displayName = item.withdrawalMethodDetail?.name || '';
                }
              }
              return item;
            }
          );
          this.list = new MatTableDataSource<AdminDeliverymanDisbursementReportInterface>(mappedList);
        }
        if (response && response.disbursement) {
          const disbursement = response.disbursement;
          this.reportNo = disbursement.disbursementNo;
          this.reportTotalAmount = disbursement.totalAmount;
          this.reportStatus = disbursement.status;
          this.reportTime = `${DateTime.fromISO(disbursement.createdAt).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy')} ${disbursement.generatedTime}`;
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  viewDisbursement(report: AdminDeliverymanDisbursementReportInterface) {
    console.log(report);
    const dialogRef = this.dialog.open(DialogDeliverymanDisbursementDetail, {
      data: { id: report.id },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'true') {
        this.getReport();
      }
    });
  }

  acceptDisbursement(report: AdminDeliverymanDisbursementReportInterface) {
    console.log(report);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/disbursement/acceptDeliverymanDisbursement/' + report.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true) {
          this.getReport();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  rejectDisbursement(report: AdminDeliverymanDisbursementReportInterface) {
    console.log(report);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/disbursement/rejectDeliverymanDisbursement/' + report.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true) {
          this.getReport();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onBack() {
    this.location.back();
  }

  onDeliverymanDetail(item: AdminDeliverymanDisbursementReportInterface) {
    console.log(item);
    if (item && item.driverInfo && item.driverInfo.id && item.driverInfo.id != '') {
      this.router.navigate(['admin/driver-management/deliveryman-details', item.driverInfo.id]);
    }
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      const spinnerRef = this.util.start();
      this.api.export_collection('v1/admin/disbursement/deliveryman_report/export/' + this.id + '/' + exportOption).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'DeliverymanDisbursement.xlsx' : 'DeliverymanDisbursement.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'deliverymandisbursements.json';
            this.api.download_export_file(blob, fileName);
          }
          this.exportType = 'export';
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.exportType = 'export';
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

}
