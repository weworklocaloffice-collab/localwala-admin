import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { PosAndTableOrderCommissionHistoryInterface } from 'src/app/interfaces/vendor.pos.and.table.order.commission.history.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-vendor-pos-table-order-commission-history',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './vendor-pos-table-order-commission-history.html',
})
export class VendorPosTableOrderCommissionHistory {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  history = new MatTableDataSource<PosAndTableOrderCommissionHistoryInterface>([]);
  displayedColumn = ['name', 'type', 'total'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/vendor_web/cashInHandHistory/posAndTableOrderCommission/' + this.util.getItem('_vendorId') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(response);
        if (response && response.history) {
          this.history = response.history;
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('MMMM dd, yyyy');
  }

  onOrderDetail(detail: PosAndTableOrderCommissionHistoryInterface) {
    console.log(detail);
    if (detail && detail.posOrderInfo && detail.posOrderInfo.id != '') {
      this.router.navigate(['vendor/pos-management/pos-order-detail/', detail.posOrderInfo.id]);
    } else if (detail && detail.tableOrderInfo && detail.tableOrderInfo.id != '') {
      this.router.navigate(['vendor/table-management/completed-table-order-detail/', detail.tableOrderInfo.id]);
    }
  }

}
