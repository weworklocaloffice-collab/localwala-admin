import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AdminVendorDriverListInterface } from 'src/app/interfaces/admin.vendor.driver.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-vendor-driver-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './vendor-driver-list.html',
})
export class VendorDriverList {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  drivers = new MatTableDataSource<AdminVendorDriverListInterface>([]);
  displayedColumn = ['name', 'restaurant', 'contact', 'type', 'location', 'block', 'assigned', 'online', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  searchQuery: string = '';

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
      'search': this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/driver/getAllVendorDeliveryman?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminVendorDriverListInterface) => {
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

              if (item && item.restaurants && item.restaurants?.id) {
                if (item.restaurants?.translations) {
                  const translation = item.restaurants.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurants.displayName = translation?.title || item.restaurants.name;
                } else {
                  item.restaurants.displayName = item.restaurants?.name || '';
                }
              }

              return item;
            }
          );
          this.drivers = new MatTableDataSource<AdminVendorDriverListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.drivers);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onStatusChange(event: MatSlideToggleChange, driver: AdminVendorDriverListInterface) {
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

  onBlockedChange(event: MatSlideToggleChange, driver: AdminVendorDriverListInterface) {
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

  onEdit(driver: AdminVendorDriverListInterface) {
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

  onDeliverymanInfo(item: AdminVendorDriverListInterface) {
    console.log(item);
    if (item && item.driverInfo && item.driverInfo.id && item.driverInfo.id != '') {
      this.router.navigate(['admin/driver-management/deliveryman-details', item.driverInfo.id]);
    }
  }

  onRestaurantDetail(item: AdminVendorDriverListInterface) {
    console.log(item);
    if (item && item.restaurants && item.restaurants.id && item.restaurants.id !== '') {
      this.router.navigate(['admin/restaurant-management/restaurant-detail', item.restaurants.id]);
    }
  }

  onCity(item: AdminVendorDriverListInterface) {
    if (item && item.city && item.city.id != '') {
      this.router.navigate(['admin/zone-setup/city-detail', item.city.id]);
    }
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      console.log('exportCollection Now');
      const spinnerRef = this.util.start();
      const param: any = {
        'type': exportOption,
        'search': this.searchQuery,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/vendor_deliveryman/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'VendorDeliveryman.xlsx' : 'VendorDeliveryman.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'vendordeliverymans.json';
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
    this.router.navigate(['admin/import-export-management/import-collection/', 'vendor_deliveryman']);
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
