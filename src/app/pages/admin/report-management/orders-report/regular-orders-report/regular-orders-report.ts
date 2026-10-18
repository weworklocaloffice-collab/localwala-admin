import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { Observable, map, startWith } from 'rxjs';
import { AdminCitiesListLimitedInterface } from 'src/app/interfaces/admin.cities.list.limited.interface';
import { AdminRegularOrderReportInterface } from 'src/app/interfaces/admin.regular.order.report.interface';
import { AdminRestaurantListLimitedInfoInterface, RestaurantLocality } from 'src/app/interfaces/admin.restaurant.list.limited.info.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-regular-orders-report',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, MatNativeDateModule],
  templateUrl: './regular-orders-report.html',
})
export class RegularOrdersReport {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  reports = new MatTableDataSource<AdminRegularOrderReportInterface>([]);
  displayedColumn = ['id', 'customer', 'restaurant', 'payment', 'real_total', 'item_discount', 'item_total', 'coupon_discount', 'delivery_charge', 'food_tax', 'service_tax', 'package_charge', 'package_charge_tax', 'delivery_tip', 'extra_charge', 'wallet_amount', 'grand_total', 'refunded_amount', 'deliveryman_earning', 'deliveryman_commission', 'restaurant_commission', 'status', 'date', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  isFilterApplied: boolean = false;
  filterDates = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  restaurant: string = '';
  searchQuery: string = '';
  cities: Observable<AdminCitiesListLimitedInterface[]>;
  listOfCities: AdminCitiesListLimitedInterface[] = [];
  cityCtrl = new FormControl('');
  restaurants: Observable<AdminRestaurantListLimitedInfoInterface[]>;
  listOfRestaurants: AdminRestaurantListLimitedInfoInterface[] = [];
  restaurantCtrl = new FormControl('');

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router
  ) {
    this.getCities();
    this.getList();
  }

  getCities() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/cities/listAllCities').subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        console.log(response);
        if (response) {
          this.listOfCities = response;
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterArrayItems(element) : this.listOfCities.slice()))
          );
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  private _filterArrayItems(value: any): AdminCitiesListLimitedInterface[] {
    let filterValue: string;
    if (value && value.name) {
      filterValue = value.name;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfCities.filter((element) =>
      this.getTranslatedCityName(element).toLowerCase().includes(filterValue)
    );
  }

  onFilter() {
    this.isFilterApplied = true;
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.searchQuery = '';
    this.getList();
  }

  onSearch() {
    this.isFilterApplied = false;
    this.pageSize = 5;
    this.currentPage = 0;
    this.restaurant = '';
    this.filterDates.controls['start'].setValue(null);
    this.filterDates.controls['end'].setValue(null);
    this.paginator.firstPage();
    this.getList();
  }

  clearFilter() {
    this.isFilterApplied = false;
    this.pageSize = 5;
    this.currentPage = 0;
    this.restaurant = '';
    this.filterDates.controls['start'].setValue(null);
    this.filterDates.controls['end'].setValue(null);
    this.searchQuery = '';
    this.paginator.firstPage();
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    let filterStartDate = '';
    let filterEndDate = '';
    if (this.filterDates.controls['start'].value != null && this.filterDates.controls['end'].value != null) {
      const start = this.filterDates.controls['start'].value;
      const end = this.filterDates.controls['end'].value;
      filterStartDate = DateTime.fromJSDate(new Date(start)).toFormat('dd/MM/yyyy');
      filterEndDate = DateTime.fromJSDate(new Date(end)).toFormat('dd/MM/yyyy');
    }
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'filter': this.isFilterApplied,
      'search': this.searchQuery,
      'restaurant': this.restaurant,
      'filterDates': `${filterStartDate}-${filterEndDate}`,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/admin/reports/orders?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminRegularOrderReportInterface) => {
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
          this.reports = new MatTableDataSource<AdminRegularOrderReportInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.reports);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onCitySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value && event.option.value) {
      this.restaurantCtrl.setValue(null);
      this.restaurant = '';
      this.getRestaurants(event.option.value);
    }
  }

  getRestaurants(id: string) {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/restaurant/getRestaurantByCityIdLimitedData/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.restaurants) {
          const mappedList = response.restaurants.map(
            (item: AdminRestaurantListLimitedInfoInterface) => {
              if (item && item.locality && item.locality?.id) {
                if (item.locality?.translations) {
                  const translation = item.locality.translations.find((t) => t.code == this.util.appLocaleName());
                  item.locality.displayName = translation?.value || item.locality.name;
                } else {
                  item.locality.displayName = item.locality?.name || '';
                }
              }
              return item;
            }
          );
          this.listOfRestaurants = mappedList;
          this.restaurants = this.restaurantCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterRestaurant(element) : this.listOfRestaurants.slice()))
          );
          console.log(this.restaurants);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  getTranslateRestaurantName(item: AdminRestaurantListLimitedInfoInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.title) {
        return found.title;
      }
    }
    return item.name;
  }

  getLocalityName(item: RestaurantLocality): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find((t) => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayRestaurantName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfRestaurants.find(item => item.id == id);
    const selectedLocality = selected ? this.getLocalityName(selected.locality) : '';
    const restaurantName = selected ? this.getTranslateRestaurantName(selected) : '';
    const ownerName: string = selected && selected.ownerInfo && selected.ownerInfo.firstName ? `${selected.ownerInfo.firstName} ${selected.ownerInfo.lastName}` : '';
    return `${restaurantName} ${selectedLocality ? ' - ' + selectedLocality + ' - ' + ownerName : ''}`
  };

  private _filterRestaurant(value: any): AdminRestaurantListLimitedInfoInterface[] {
    let filterValue: string;
    if (value && value.name) {
      filterValue = value.name;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfRestaurants.filter((element) =>
      this.getTranslateRestaurantName(element).toLowerCase().includes(filterValue)
    );
  }

  onRestaurantSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.restaurant = event.option.value;
    }
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

  receivedBy(order: AdminRegularOrderReportInterface) {
    if (order.paymentMode == 'online' && order.status == 'delivered') {
      return this.util.appTranslate('received_by_admin');
    } else if (order.paymentMode == 'offline' && order.orderTo == 'homedelivery' && order.status == 'delivered') {
      return this.util.appTranslate('received_by_deliveryman');
    } else if (order.paymentMode == 'offline' && order.orderTo != 'homedelivery' && order.status == 'delivered') {
      return this.util.appTranslate('received_by_restaurant');
    } else if ((order.paymentMode == 'offline' || order.paymentMode == 'online') && order.status == 'refunded') {
      return this.util.appTranslate('refunded');
    } else if (order.paymentMode == 'offline' && order.status != 'delivered') {
      return this.util.appTranslate('not_received');
    }
    return this.util.appTranslate('received_by_admin');
  }

  onOrderDetailPage(orderId: string) {
    console.log(`Order Id -> ${orderId}`);
    this.router.navigate(['admin/order-management/order-details', orderId]);
  }

  onOrderPrint(orderId: string) {
    console.log(`Order Id -> ${orderId}`);
    this.router.navigate(['admin/order-management/order-invoice', orderId]);
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      console.log('exportCollection Now');
      const spinnerRef = this.util.start();
      let filterStartDate = '';
      let filterEndDate = '';
      if (this.filterDates.controls['start'].value != null && this.filterDates.controls['end'].value != null) {
        const start = this.filterDates.controls['start'].value;
        const end = this.filterDates.controls['end'].value;
        filterStartDate = DateTime.fromJSDate(new Date(start)).toFormat('dd/MM/yyyy');
        filterEndDate = DateTime.fromJSDate(new Date(end)).toFormat('dd/MM/yyyy');
      }
      const param: any = {
        'type': exportOption,
        'filter': this.isFilterApplied,
        'search': this.searchQuery,
        'restaurant': this.restaurant,
        'filterDates': `${filterStartDate}-${filterEndDate}`,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/reports/orders/export?' + httpParams.toString()).subscribe({
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

  onUserInfo(item: AdminRegularOrderReportInterface) {
    console.log(item);
    if (item && item.userInfo && item.userInfo.id && item.userInfo.id != '') {
      this.router.navigate(['admin/customer-management/customer-detail', item.userInfo.id]);
    }
  }

  onRestaurantDetail(item: AdminRegularOrderReportInterface) {
    console.log(item);
    if (item && item.restaurant && item.restaurant.id && item.restaurant.id !== '') {
      this.router.navigate(['admin/restaurant-management/restaurant-detail', item.restaurant.id]);
    }
  }

  getTranslatedCityName(item: AdminCitiesListLimitedInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayCityName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfCities.find(item => item.id == id);
    return selected ? this.getTranslatedCityName(selected) : '';
  };

}
