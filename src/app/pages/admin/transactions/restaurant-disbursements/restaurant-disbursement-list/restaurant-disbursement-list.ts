import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminRestaurantDisbursementReportInterface } from 'src/app/interfaces/admin.restaurant.disbursement.report.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogRestaurantDisbursementDetail } from './dialog-restaurant-disbursement-detail/dialog-restaurant-disbursement-detail';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-restaurant-disbursement-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './restaurant-disbursement-list.html',
})
export class RestaurantDisbursementList {

  list = new MatTableDataSource<AdminRestaurantDisbursementReportInterface>([]);
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
    private router: Router,
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    console.log(this.id);
    if (this.id != '' && this.id != null) {
      this.getReport();
    }
  }

  getReport() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/disbursement/restaurantReport/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminRestaurantDisbursementReportInterface) => {
              if (item && item.restaurant && item.restaurant?.id) {
                if (item.restaurant?.translations) {
                  const translation = item.restaurant.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurant.displayName = translation?.title || item.restaurant.name;
                  item.restaurant.displayAddress = translation?.address || item.restaurant.address;
                } else {
                  item.restaurant.displayName = item.restaurant?.name || '';
                  item.restaurant.displayAddress = item.restaurant?.address || '';
                }
              }

              if (item && item.withdrawalMethodDetail && item.withdrawalMethodDetail?.id) {
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
          this.list = new MatTableDataSource<AdminRestaurantDisbursementReportInterface>(mappedList);
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

  viewDisbursement(report: AdminRestaurantDisbursementReportInterface) {
    console.log(report);
    const dialogRef = this.dialog.open(DialogRestaurantDisbursementDetail, {
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

  acceptDisbursement(report: AdminRestaurantDisbursementReportInterface) {
    console.log(report);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/disbursement/acceptRestaurantDisbursement/' + report.id).subscribe({
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

  rejectDisbursement(report: AdminRestaurantDisbursementReportInterface) {
    console.log(report);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/disbursement/rejectRestaurantDisbursement/' + report.id).subscribe({
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

  onRestaurantDetail(item: AdminRestaurantDisbursementReportInterface) {
    console.log(item);
    if (item && item.restaurant && item.restaurant.id && item.restaurant.id != '') {
      this.router.navigate(['admin/restaurant-management/restaurant-detail', item.restaurant.id]);
    }
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      const spinnerRef = this.util.start();
      this.api.export_collection('v1/admin/disbursement/restaurant_report/export/' + this.id + '/' + exportOption).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'RestaurantDisbursement.xlsx' : 'RestaurantDisbursement.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'restaurantdisbursements.json';
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
