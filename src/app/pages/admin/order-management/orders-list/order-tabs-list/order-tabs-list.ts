import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { OrdersListInterface } from 'src/app/interfaces/orders.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-order-tabs-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './order-tabs-list.html',
})
export class OrderTabsList implements AfterViewInit {

  @Input() status!: string;
  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  orders = new MatTableDataSource<OrdersListInterface>([]);
  displayedColumn = ['id', 'date', 'customer', 'restaurant', 'amount', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  searchQuery: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router
  ) {

  }

  ngAfterViewInit() {
    console.log(`------ ${this.status}`);
    this.getList();
  }

  getList() {
    if (this.status != 'schedule') {
      this.isLoaded = false;
      const param: any = {
        'limit': this.pageSize,
        'page': this.currentPage,
        'status': this.status,
        'search': this.searchQuery,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.get_private('v1/admin/orders/getOrderList?' + httpParams.toString()).subscribe({
        next: (response: any) => {
          console.log(response);
          this.isLoaded = true;
          if (response && response.orders) {
            const mappedList = response.orders.map(
              (item: OrdersListInterface) => {
                if (item && item.restaurant && item.restaurant?.id) {
                  if (item.restaurant?.translations) {
                    const translation = item.restaurant.translations.find((t) => t.code == this.util.appLocaleName());
                    item.restaurant.displayName = translation?.title || item.restaurant.name;
                  } else {
                    item.restaurant.displayName = item.restaurant?.name || '';
                  }
                }

                if (item && item.paymentInfo && item.paymentInfo?.id) {
                  if (item.paymentInfo?.translations) {
                    const translation = item.paymentInfo.translations.find((t) => t.code == this.util.appLocaleName());
                    item.paymentInfo.displayName = translation?.value || item.paymentInfo.name;
                  } else {
                    item.paymentInfo.displayName = item.paymentInfo?.name || '';
                  }
                }
                return item;
              }
            );
            this.orders = new MatTableDataSource<OrdersListInterface>(mappedList);
            this.paginator.length = response.totalResults;
            this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          }
        }, error: (error: any) => {
          console.log(error);
          this.isLoaded = true;
          this.util.handleError(error, 'admin');
        }
      });
    } else if (this.status == 'schedule') {
      this.isLoaded = false;
      const param: any = {
        'limit': this.pageSize,
        'page': this.currentPage,
        'search': this.searchQuery,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.get_private('v1/admin/orders/getScheduleOrders?' + httpParams.toString()).subscribe({
        next: (response: any) => {
          console.log(response);
          this.isLoaded = true;
          if (response && response.orders) {
            const mappedList = response.orders.map(
              (item: OrdersListInterface) => {
                if (item && item.restaurant && item.restaurant?.id) {
                  if (item.restaurant?.translations) {
                    const translation = item.restaurant.translations.find((t) => t.code == this.util.appLocaleName());
                    item.restaurant.displayName = translation?.title || item.restaurant.name;
                  } else {
                    item.restaurant.displayName = item.restaurant?.name || '';
                  }
                }

                if (item && item.paymentInfo && item.paymentInfo?.id) {
                  if (item.paymentInfo?.translations) {
                    const translation = item.paymentInfo.translations.find((t) => t.code == this.util.appLocaleName());
                    item.paymentInfo.displayName = translation?.value || item.paymentInfo.name;
                  } else {
                    item.paymentInfo.displayName = item.paymentInfo?.name || '';
                  }
                }
                return item;
              }
            );
            this.orders = new MatTableDataSource<OrdersListInterface>(mappedList);
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
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  getStatusColor(orderStatus: string) {
    const okOrderStatus = ['created', 'accepted', 'preparing'];
    const successOrderStatus = ['delivered', 'ready', 'handover', 'ongoing'];
    const failedOrderStatus = ['cancelled', 'rejected', 'refunded', 'partially_refunded', 'pending_payments'];
    if (okOrderStatus.includes(orderStatus)) {
      return 'primary';
    } else if (successOrderStatus.includes(orderStatus)) {
      return 'success';
    } else if (failedOrderStatus.includes(orderStatus)) {
      return 'error';
    }
    return 'warning';
  }

  onOrderDetailPage(orderId: string) {
    console.log(`Order Id -> ${orderId}`);
    this.router.navigate(['admin/order-management/order-details', orderId]);
  }

  onOrderPrint(orderId: string) {
    console.log(`Order Id -> ${orderId}`);
    this.router.navigate(['admin/order-management/order-invoice', orderId]);
  }

  onUserInfo(item: OrdersListInterface) {
    console.log(item);
    if (item && item.userInfo && item.userInfo.id && item.userInfo.id != '') {
      this.router.navigate(['admin/customer-management/customer-detail', item.userInfo.id]);
    }
  }

  onRestaurantDetail(item: OrdersListInterface) {
    console.log(item);
    if (item && item.restaurant && item.restaurant.id && item.restaurant.id !== '') {
      this.router.navigate(['admin/restaurant-management/restaurant-detail', item.restaurant.id]);
    }
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      console.log('exportCollection Now');
      const spinnerRef = this.util.start();
      const param: any = {
        'type': exportOption,
        'status': this.status,
        'search': this.searchQuery,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/orders/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'Orders.xlsx' : 'Orders.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'orders.json';
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

  importCollection() {
    this.router.navigate(['admin/import-export-management/import-collection/', 'regular_orders']);
  }

  getName(): string {
    if (this.status == 'all') {
      return this.util.appTranslate('all_orders');
    } else if (this.status == 'created') {
      return this.util.appTranslate('new_orders');
    } else if (this.status == 'accepted') {
      return this.util.appTranslate('accepted_orders');
    } else if (this.status == 'schedule') {
      return this.util.appTranslate('schedule_orders');
    } else if (this.status == 'preparing') {
      return this.util.appTranslate('preparing_orders');
    } else if (this.status == 'ready') {
      return this.util.appTranslate('ready_orders');
    } else if (this.status == 'handover') {
      return this.util.appTranslate('handover_orders');
    } else if (this.status == 'ongoing') {
      return this.util.appTranslate('ongoing_orders');
    } else if (this.status == 'delivered') {
      return this.util.appTranslate('delivered_orders');
    } else if (this.status == 'cancelled') {
      return this.util.appTranslate('cancelled_orders');
    } else if (this.status == 'rejected') {
      return this.util.appTranslate('rejected_orders');
    } else if (this.status == 'refunded') {
      return this.util.appTranslate('refunded_orders');
    } else if (this.status == 'partially_refunded') {
      return this.util.appTranslate('partially_refunded_orders');
    } else if (this.status == 'pending_payments') {
      return this.util.appTranslate('pending_payments_orders');
    }
    return this.util.appTranslate('all_orders');
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
