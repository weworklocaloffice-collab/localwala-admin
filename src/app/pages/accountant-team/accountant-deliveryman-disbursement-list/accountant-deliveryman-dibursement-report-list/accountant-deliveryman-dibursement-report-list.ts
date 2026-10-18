import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AccountantDeliverymanDisbursementReportListInterface } from 'src/app/interfaces/accountant.deliveryman.disbursement.report.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogAccountantDeliverymanDisbursementReport } from 'src/app/pages/accountant-team/accountant-deliveryman-disbursement-report/dialog-accountant-deliveryman-disbursement-report/dialog-accountant-deliveryman-disbursement-report';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-accountant-deliveryman-dibursement-report-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './accountant-deliveryman-dibursement-report-list.html',
})
export class AccountantDeliverymanDibursementReportList {

  list = new MatTableDataSource<AccountantDeliverymanDisbursementReportListInterface>([]);
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
    this.api.get_private('v1/accountant/deliveryman_disbursement_report/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AccountantDeliverymanDisbursementReportListInterface) => {
              if (item && item.withdrawalMethodDetail && item.withdrawalMethodDetail.id) {
                if (item.withdrawalMethodDetail?.translations) {
                  const translation = item.withdrawalMethodDetail.translations.find((t) => t.code == this.util.appLocaleName());
                  item.withdrawalMethodDetail.displayName = translation?.title || item.withdrawalMethodDetail.name;
                } else {
                  item.withdrawalMethodDetail.displayName = item.withdrawalMethodDetail?.name || '';
                }
              }

              if (item && item.defaultPayoutMethodDetailInfo && item.defaultPayoutMethodDetailInfo.id) {
                if (item.defaultPayoutMethodDetailInfo?.translations) {
                  const translation2 = item.defaultPayoutMethodDetailInfo.translations.find((t) => t.code == this.util.appLocaleName());
                  item.defaultPayoutMethodDetailInfo.displayName = translation2?.title || item.defaultPayoutMethodDetailInfo.name;
                } else {
                  item.defaultPayoutMethodDetailInfo.displayName = item.defaultPayoutMethodDetailInfo?.name || '';
                }
              }
              return item;
            }
          );
          this.list = new MatTableDataSource<AccountantDeliverymanDisbursementReportListInterface>(mappedList);
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
        this.util.handleError(error, 'accountant');
      }
    });
  }

  viewDisbursement(report: AccountantDeliverymanDisbursementReportListInterface) {
    console.log(report);
    const dialogRef = this.dialog.open(DialogAccountantDeliverymanDisbursementReport, {
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

  acceptDisbursement(report: AccountantDeliverymanDisbursementReportListInterface) {
    console.log(report);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/accountant/accept_deliveryman_disbursement/' + report.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true) {
          this.getReport();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'accountant');
      }
    });
  }

  rejectDisbursement(report: AccountantDeliverymanDisbursementReportListInterface) {
    console.log(report);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/accountant/reject_deliveryman_disbursement/' + report.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true) {
          this.getReport();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'accountant');
      }
    });
  }

  onBack() {
    this.location.back();
  }

  onDeliverymanDetail(item: AccountantDeliverymanDisbursementReportListInterface) {
    console.log(item);
    if (item && item.driverInfo && item.driverInfo.id && item.driverInfo.id != '') {
      this.router.navigate(['/accountant-team/u/deliveryman-detail', item.driverInfo.id]);
    }
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      const spinnerRef = this.util.start();
      this.api.export_collection('v1/accountant/disbursement/deliveryman_report/export/' + this.id + '/' + exportOption).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          const fileName = exportOption == 'excel' ? 'DeliverymanDisbursement.xlsx' : 'DeliverymanDisbursement.csv';
          this.api.download_export_file(blob, fileName);
          this.exportType = 'export';
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.exportType = 'export';
          this.util.handleError(error, 'accountant');
        }
      });
    }
  }

}
