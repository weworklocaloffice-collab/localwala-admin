import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AdminVendorDeliverymanListInterface } from 'src/app/interfaces/admin.vendor.deliveryman.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-restaurant-detail-deliveryman-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './restaurant-detail-deliveryman-list.html',
})
export class RestaurantDetailDeliverymanList implements AfterViewInit {

  @Input() restaurantId!: string;
  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  drivers = new MatTableDataSource<AdminVendorDeliverymanListInterface>([]);
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
    this.api.get_private('v1/admin/vendor_detail/deliveryman_list?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminVendorDeliverymanListInterface) => {
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
          this.drivers = new MatTableDataSource<AdminVendorDeliverymanListInterface>(mappedList);
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

  onStatusChange(event: MatSlideToggleChange, driver: AdminVendorDeliverymanListInterface) {
    console.log(event);
    console.log(driver);
    driver.status = event.checked;
    this.api.patch_private('v1/admin/driver/updateStatus/' + driver.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onBlockedChange(event: MatSlideToggleChange, driver: AdminVendorDeliverymanListInterface) {
    console.log(event);
    console.log(driver);
    driver.isBlocked = event.checked;
    this.api.patch_private('v1/admin/driver/updateStatus/' + driver.id, { isBlocked: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onEdit(driver: AdminVendorDeliverymanListInterface) {
    console.log(driver);
    console.log(driver.id);
    this.router.navigate(['admin/driver-management/manage-driver', driver.id]);
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onDeliverymanInfo(item: AdminVendorDeliverymanListInterface) {
    console.log(item);
    if (item && item.driverInfo && item.driverInfo.id && item.driverInfo.id != '') {
      this.router.navigate(['admin/driver-management/deliveryman-details', item.driverInfo.id]);
    }
  }

}
