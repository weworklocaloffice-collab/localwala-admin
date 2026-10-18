import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AdminVendorDisbursementListInterface } from 'src/app/interfaces/admin.vendor.disbursement.list.interface';
import { DialogRestaurantDisbursementDetail } from 'src/app/pages/admin/transactions/restaurant-disbursements/restaurant-disbursement-list/dialog-restaurant-disbursement-detail/dialog-restaurant-disbursement-detail';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-restaurant-detail-disbursement-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './restaurant-detail-disbursement-list.html',
})
export class RestaurantDetailDisbursementList implements AfterViewInit {

  @Input() restaurantId!: string;
  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  results = new MatTableDataSource<AdminVendorDisbursementListInterface>([]);
  displayedColumn = ['report', 'amount', 'payout', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router,
    private dialog: MatDialog,
  ) {
  }

  ngAfterViewInit() {
    console.log(`------ ${this.restaurantId}`);
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'restaurant': this.restaurantId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/vendor_detail/disbursement_list?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminVendorDisbursementListInterface) => {
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
          this.results = new MatTableDataSource<AdminVendorDisbursementListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  viewDisbursement(report: AdminVendorDisbursementListInterface) {
    console.log(report);
    const dialogRef = this.dialog.open(DialogRestaurantDisbursementDetail, {
      data: { id: report.id },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'true') {
        this.getList();
      }
    });
  }

  acceptDisbursement(report: AdminVendorDisbursementListInterface) {
    console.log(report);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/disbursement/acceptRestaurantDisbursement/' + report.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true) {
          this.getList();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  rejectDisbursement(report: AdminVendorDisbursementListInterface) {
    console.log(report);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/disbursement/rejectRestaurantDisbursement/' + report.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true) {
          this.getList();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onDisbursementReport(item: AdminVendorDisbursementListInterface) {
    console.log(item);
    if (item && item.disbursement && item.disbursement.id && item.disbursement.id != '') {
      this.router.navigate(['admin/transaction/restaurant-disbursement-list/', item.disbursement.id]);
    }
  }

}
