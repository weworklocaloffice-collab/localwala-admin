import { Component, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { Observable, map, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';
import { AccountantCityListInterface } from 'src/app/interfaces/accountant.city.list.interface';
import { AccountantDeliverymanReportInterface } from 'src/app/interfaces/accountant.deliveryman.report.interface';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-accountant-deliveryman-report',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './accountant-deliveryman-report.html',
})
export class AccountantDeliverymanReport {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  reports = new MatTableDataSource<AccountantDeliverymanReportInterface>([]);
  displayedColumn = ['name', 'city', 'wallet', 'orders', 'stats', 'rating', 'date'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  city: string = '';
  driverRole: string = 'all';
  driverType: string = 'all';
  searchQuery: string = '';
  cities: Observable<AccountantCityListInterface[]>;
  listOfCities: AccountantCityListInterface[] = [];
  cityCtrl = new FormControl('');

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router
  ) {
    this.getCities();
    this.getList();
  }

  onFilter() {
    this.pageSize = 5;
    this.currentPage = 0;
    this.searchQuery = '';
    this.getList();
  }

  onSearch() {
    this.pageSize = 5;
    this.currentPage = 0;
    this.driverRole = 'all';
    this.driverType = 'all';
    this.paginator.firstPage();
    this.getList();
  }

  clearFilter() {
    this.pageSize = 5;
    this.currentPage = 0;
    this.driverRole = 'all';
    this.driverType = 'all';
    this.searchQuery = '';
    this.city = '';
    this.cityCtrl.setValue(null);
    this.getList();
  }

  getCities() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/accountant/city_list').subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        console.log(response);
        if (response) {
          this.listOfCities = response.map((city: AccountantCityListInterface) => {
            const translation = city.translations.find(t => t.code == this.util.appLocaleName());
            return {
              ...city,
              displayName: translation && translation.value ? translation.value : city.name
            };
          });
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterArrayItems(element) : this.listOfCities.slice()))
          );
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'accountant');
      }
    });
  }

  private _filterArrayItems(value: any): AccountantCityListInterface[] {
    let filterValue: string;
    if (value && value.displayName) {
      filterValue = value.displayName;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfCities.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'search': this.searchQuery,
      'kind': this.driverRole,
      'type': this.driverType,
      'city': this.city,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/accountant/deliveryman_report?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AccountantDeliverymanReportInterface) => {
              if (item && item.city && item.city?.id) {
                if (item.city?.translations) {
                  const translation = item.city.translations.find((t) => t.code == this.util.appLocaleName());
                  item.city.displayName = translation?.value || item.city.name;
                } else {
                  item.city.displayName = item.city?.name || '';
                }
              }

              if (item && item.locality && item.locality?.id) {
                if (item.locality?.translations) {
                  const translation2 = item.locality.translations.find((t) => t.code == this.util.appLocaleName());
                  item.locality.displayName = translation2?.value || item.locality.name;
                } else {
                  item.locality.displayName = item.locality?.name || '';
                }
              }

              return item;
            }
          );
          this.reports = new MatTableDataSource<AccountantDeliverymanReportInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.reports);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'accountant');
      }
    });
  }

  displayCityName(city: AccountantCityListInterface) {
    return city && city.displayName ? city.displayName : '';
  }

  onCitySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value && event.option.value.id) {
      this.city = event.option.value.id;
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
      const param: any = {
        'exportType': exportOption,
        'search': this.searchQuery,
        'kind': this.driverRole,
        'type': this.driverType,
        'city': this.city,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/accountant/reports/deliveryman/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          const fileName = exportOption == 'excel' ? 'DeliverymanReport.xlsx' : 'DeliverymanReport.csv';
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

  onDeliverymanDetail(item: AccountantDeliverymanReportInterface) {
    console.log(item);
    if (item.id && item.id != '') {
      this.router.navigate(['/accountant-team/u/deliveryman-detail', item.id]);
    }
  }

}
