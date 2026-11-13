import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogOrderDetail } from '../dialog-order-detail/dialog-order-detail';

@Component({
  selector: 'app-dairy-orders',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './orders.html',
})
export class Orders {
  isLoaded: boolean = false;
  list: any[] = [];
  statusCountEntries: { key: string; value: number }[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  searchText: string = '';
  displayedColumn: string[] = ['orderNo', 'customer', 'outlet', 'status', 'total', 'created', 'action'];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      limit: this.pageSize,
      page: this.currentPage + 1,
    };
    if (this.selectedStatus) {
      param.status = this.selectedStatus;
    }
    if (this.searchText) {
      param.search = this.searchText;
    }
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) {
        return;
      }
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/dairy/admin/orders?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        if (response && response.orders) {
          this.list = response.orders;
          const counts = response.statusCounts || {};
          this.statusCountEntries = Object.keys(counts).map((key: string) => ({
            key,
            value: counts[key],
          }));
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      },
      error: () => {
        this.isLoaded = true;
      },
    });
  }

  onStatusFilter() {
    this.currentPage = 0;
    this.getList();
  }

  onSearch() {
    this.currentPage = 0;
    this.getList();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  viewDetail(order: any) {
    this.dialog.open(DialogOrderDetail, {
      width: '720px',
      data: { orderId: order._id },
    });
  }
}
