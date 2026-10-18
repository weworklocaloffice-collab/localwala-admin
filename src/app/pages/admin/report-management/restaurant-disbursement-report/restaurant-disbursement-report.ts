import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DateTime } from 'luxon';
import { Observable, map, startWith } from 'rxjs';
import { AdminCitiesListLimitedInterface } from 'src/app/interfaces/admin.cities.list.limited.interface';
import { AdminPayoutMethodLimitedDataInterface } from 'src/app/interfaces/admin.payout.method.limited.data.interface';
import { AdminRestaurantDisbursementReportListInterface } from 'src/app/interfaces/admin.restaurant.disbursements.report.interface';
import { AdminRestaurantListLimitedInfoInterface, RestaurantLocality } from 'src/app/interfaces/admin.restaurant.list.limited.info.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogRestaurantDisbursementDetail } from 'src/app/pages/admin/transactions/restaurant-disbursements/restaurant-disbursement-list/dialog-restaurant-disbursement-detail/dialog-restaurant-disbursement-detail';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-restaurant-disbursement-report',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, MatNativeDateModule, NgIcon],
  templateUrl: './restaurant-disbursement-report.html',
})
export class RestaurantDisbursementReport {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  reports = new MatTableDataSource<AdminRestaurantDisbursementReportListInterface>([]);
  displayedColumn = ['id', 'restaurant', 'amount', 'creds', 'status', 'date', 'action'];
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
  payoutMethod: string = 'all';
  statusName: string = 'all';
  searchQuery: string = '';
  cities: Observable<AdminCitiesListLimitedInterface[]>;
  listOfCities: AdminCitiesListLimitedInterface[] = [];
  cityCtrl = new FormControl('');
  restaurants: Observable<AdminRestaurantListLimitedInfoInterface[]>;
  listOfRestaurants: AdminRestaurantListLimitedInfoInterface[] = [];
  restaurantCtrl = new FormControl('');
  payoutMethodList: AdminPayoutMethodLimitedDataInterface[] = [];
  pendingAmount: number = 0;
  pendingCount: number = 0;
  approvedAmount: number = 0;
  approvedCount: number = 0;
  rejectedAmount: number = 0;
  rejectedCount: number = 0;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.getInitial();
    this.getList();
  }

  getInitial() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/reports/disbursementReportInitial').subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        console.log(response);
        if (response && response.cities && response.cities.length) {
          this.listOfCities = response.cities;
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterArrayItems(element) : this.listOfCities.slice()))
          );
        }
        if (response && response.methods && response.methods.length) {
          const mappedList = response.methods.map(
            (item: AdminPayoutMethodLimitedDataInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.payoutMethodList = mappedList;
        }

        if (response && response.stats) {
          if (response && response.stats && response.stats.pending) {
            const stats = response.stats.pending;
            this.pendingAmount = stats.amount;
            this.pendingCount = stats.count;
          }

          if (response && response.stats && response.stats.approved) {
            const stats = response.stats.approved;
            this.approvedAmount = stats.amount;
            this.approvedCount = stats.count;
          }

          if (response && response.stats && response.stats.cancelled) {
            const stats = response.stats.cancelled;
            this.rejectedAmount = stats.amount;
            this.rejectedCount = stats.count;
          }
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
    this.searchQuery = '';
    this.getList();
  }

  clearFilter() {
    this.isFilterApplied = false;
    this.pageSize = 5;
    this.currentPage = 0;
    this.restaurant = '';
    this.payoutMethod = 'all';
    this.statusName = 'all';
    this.filterDates.controls['start'].setValue(null);
    this.filterDates.controls['end'].setValue(null);
    this.searchQuery = '';
    this.getList();
  }

  onSearch() {
    this.isFilterApplied = false;
    this.pageSize = 5;
    this.currentPage = 0;
    this.restaurant = '';
    this.statusName = 'all';
    this.payoutMethod = 'all';
    this.filterDates.controls['start'].setValue(null);
    this.filterDates.controls['end'].setValue(null);
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
      'payment': this.payoutMethod,
      'status': this.statusName,
      'filterDates': `${filterStartDate}-${filterEndDate}`,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/admin/reports/restaurantDisbursement?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminRestaurantDisbursementReportListInterface) => {
              if (item && item.restaurant && item.restaurant?.id) {
                if (item.restaurant?.translations) {
                  const translation = item.restaurant.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurant.displayName = translation?.title || item.restaurant.name;
                } else {
                  item.restaurant.displayName = item.restaurant?.name || '';
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
          this.reports = new MatTableDataSource<AdminRestaurantDisbursementReportListInterface>(mappedList);
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
        'payment': this.payoutMethod,
        'status': this.statusName,
        'filterDates': `${filterStartDate}-${filterEndDate}`,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/reports/restaurant_disbursement/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'RestaurantDisbursementReport.xlsx' : 'RestaurantDisbursementReport.csv';
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

  viewDisbursement(report: AdminRestaurantDisbursementReportListInterface) {
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

  onRestaurantDetail(item: AdminRestaurantDisbursementReportListInterface) {
    if (item && item.restaurant && item.restaurant.id && item.restaurant.id != '') {
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
