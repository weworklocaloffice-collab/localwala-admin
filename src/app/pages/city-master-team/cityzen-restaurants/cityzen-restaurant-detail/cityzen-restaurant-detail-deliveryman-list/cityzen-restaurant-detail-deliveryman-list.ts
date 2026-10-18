import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CityzenVendorDeliverymanListInterface } from 'src/app/interfaces/cityzen.vendor.deliveryman.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-restaurant-detail-deliveryman-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './cityzen-restaurant-detail-deliveryman-list.html',
})
export class CityzenRestaurantDetailDeliverymanList implements AfterViewInit {

  @Input() restaurantId!: string;
  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  drivers = new MatTableDataSource<CityzenVendorDeliverymanListInterface>([]);
  displayedColumn = ['name', 'contact', 'type', 'location', 'block', 'assigned', 'online', 'status', 'action'];
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
    this.api.get_private('v1/cityzen/restaurant_detail_deliveryman_list?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: CityzenVendorDeliverymanListInterface) => {
              if (item && item.locality && item.locality?.id) {
                if (item.locality?.translations) {
                  const translation = item.locality.translations.find((t) => t.code == this.util.appLocaleName());
                  item.locality.displayName = translation?.value || item.locality.name;
                } else {
                  item.locality.displayName = item.locality?.name || '';
                }
              }

              if (item && item.offline && item.offline?.id) {
                if (item.offline?.translations) {
                  const translation = item.offline.translations.find((t) => t.code == this.util.appLocaleName());
                  item.offline.displayName = translation?.value || item.offline.name;
                } else {
                  item.offline.displayName = item.offline?.name || '';
                }
              }
              return item;
            }
          );
          this.drivers = new MatTableDataSource<CityzenVendorDeliverymanListInterface>(mappedList);
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

  onStatusChange(event: MatSlideToggleChange, driver: CityzenVendorDeliverymanListInterface) {
    console.log(event);
    console.log(driver);
    driver.status = event.checked;
    this.api.patch_private('v1/cityzen/update_status_deliveryman/' + driver.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onBlockedChange(event: MatSlideToggleChange, driver: CityzenVendorDeliverymanListInterface) {
    console.log(event);
    console.log(driver);
    driver.isBlocked = event.checked;
    this.api.patch_private('v1/cityzen/update_status_deliveryman/' + driver.id, { isBlocked: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onEdit(driver: CityzenVendorDeliverymanListInterface) {
    console.log(driver);
    console.log(driver.id);
    this.router.navigate(['cityzen-team/u/manage-driver', driver.id]);
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onDeliverymanInfo(item: CityzenVendorDeliverymanListInterface) {
    console.log(item);
    if (item && item.driverInfo && item.driverInfo.id && item.driverInfo.id != '') {
      this.router.navigate(['cityzen-team/u/deliveryman-details', item.driverInfo.id]);
    }
  }

}
