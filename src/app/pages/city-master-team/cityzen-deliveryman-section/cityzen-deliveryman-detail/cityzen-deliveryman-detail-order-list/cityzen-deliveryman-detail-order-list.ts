import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { CityzenDeliverymanOrderListInterface } from 'src/app/interfaces/cityzen.deliveryman.order.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-deliveryman-detail-order-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-deliveryman-detail-order-list.html',
})
export class CityzenDeliverymanDetailOrderList implements AfterViewInit {

  @Input() driverId!: string;
  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  orders = new MatTableDataSource<CityzenDeliverymanOrderListInterface>([]);
  displayedColumn = ['id', 'date', 'location', 'earning', 'from', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {
  }

  ngAfterViewInit() {
    console.log(`------ ${this.driverId}`);
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'deliveryman': this.driverId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/deliveryman_detail_order_list?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.orders) {
          const mappedList = response.orders.map(
            (item: CityzenDeliverymanOrderListInterface) => {
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
              return item;
            }
          );
          this.orders = new MatTableDataSource<CityzenDeliverymanOrderListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'cityzen');
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
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  onOrderDetailPage(item: CityzenDeliverymanOrderListInterface) {
    console.log(`Order Id -> ${item.orderInfo.id}`);
    this.router.navigate(['cityzen-team/u/order-details', item.orderInfo.id]);
  }

  onOrderPrint(item: CityzenDeliverymanOrderListInterface) {
    console.log(`Order Id -> ${item.orderInfo.id}`);
    this.router.navigate(['cityzen-team/u/order-invoice', item.orderInfo.id]);
  }

  getStatusColor(orderStatus: string) {
    const okOrderStatus = ['ideal', 'accepted'];
    const successOrderStatus = ['driver_reached_restaurant', 'driver_pickpup_order', 'driver_reached_customer', 'delivered'];
    const failedOrderStatus = ['rejected', 'cancelled', 'accepted_another'];
    if (okOrderStatus.includes(orderStatus)) {
      return 'primary';
    } else if (successOrderStatus.includes(orderStatus)) {
      return 'success';
    } else if (failedOrderStatus.includes(orderStatus)) {
      return 'error';
    }
    return 'warning';
  }

  onUserInfo(item: CityzenDeliverymanOrderListInterface) {
    console.log(item);
    if (item && item.deliveryAddressRaw && item.deliveryAddressRaw.user && item.deliveryAddressRaw.user != '') {
      this.router.navigate(['cityzen-team/u/customer-detail', item.deliveryAddressRaw.user]);
    }
  }

  onRestaurantDetail(item: CityzenDeliverymanOrderListInterface) {
    console.log(item);
    if (item && item.restaurant && item.restaurant.id && item.restaurant.id !== '') {
      this.router.navigate(['cityzen-team/u/restaurant-detail', item.restaurant.id]);
    }
  }

}
