import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DateTime } from 'luxon';
import { Observable, map, startWith } from 'rxjs';
import { SupportTeamCitiesListLimitedInterface } from 'src/app/interfaces/support.team.city.list.interface';
import { SupportTeamDeliverymanListInterface } from 'src/app/interfaces/support.team.deliveryman.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogSupportTeamDeliverymanDetail } from './dialog-support-team-deliveryman-detail/dialog-support-team-deliveryman-detail';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-support-team-deliveryman-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './support-team-deliveryman-list.html',
})
export class SupportTeamDeliverymanList {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  deliveryman = new MatTableDataSource<SupportTeamDeliverymanListInterface>([]);
  displayedColumn = ['name', 'city', 'orders', 'stats', 'rating', 'date', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  city: string = '';
  driverRole: string = 'all';
  driverType: string = 'all';
  searchQuery: string = '';
  cities: Observable<SupportTeamCitiesListLimitedInterface[]>;
  listOfCities: SupportTeamCitiesListLimitedInterface[] = [];
  cityCtrl = new FormControl('');

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
  ) {
    this.getCities();
    this.getList();
  }

  getCities() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/support_team/all_cities').subscribe({
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
        this.util.handleError(error, 'support-team');
      }
    });
  }

  private _filterArrayItems(value: string): SupportTeamCitiesListLimitedInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCities.filter((element) =>
      this.getTranslatedCityName(element).toLowerCase().includes(filterValue)
    );
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

    this.api.get_private('v1/support_team/deliveryman_list?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: SupportTeamDeliverymanListInterface) => {
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
                  const translation = item.locality.translations.find((t) => t.code == this.util.appLocaleName());
                  item.locality.displayName = translation?.value || item.locality.name;
                } else {
                  item.locality.displayName = item.locality?.name || '';
                }
              }
              return item;
            }
          );
          this.deliveryman = new MatTableDataSource<SupportTeamDeliverymanListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.deliveryman);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'support-team');
      }
    });
  }

  onCitySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.city = event.option.value;
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

  onDetail(item: SupportTeamDeliverymanListInterface) {
    console.log(item);
    this.dialog.open(DialogSupportTeamDeliverymanDetail, {
      data: { id: item.id },
      disableClose: true
    });
  }

  getTranslatedCityName(item: SupportTeamCitiesListLimitedInterface): string {
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
