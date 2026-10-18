import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AdminRestaurantRegisterRequestListInterface } from 'src/app/interfaces/admin.restaurant.register.request.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-restaurant-joining-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './restaurant-joining-request.html',
})
export class RestaurantJoiningRequest {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  restaurants = new MatTableDataSource<AdminRestaurantRegisterRequestListInterface>([]);
  displayedColumn = ['name', 'owner', 'location', 'cuisine', 'plan', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  requestType: string = 'all';
  exportType: string = 'export';
  searchQuery: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'search': this.searchQuery
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/restaurant_request/list/' + this.requestType + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminRestaurantRegisterRequestListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
                item.displayAddress = translation?.address || item.address;
              } else {
                item.displayName = item?.name || '';
                item.displayAddress = item?.address || '';
              }

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

              if (item && item.subscriptionInfo && item.subscriptionInfo?.id) {
                if (item.subscriptionInfo?.translations) {
                  const translation = item.subscriptionInfo.translations.find((t) => t.code == this.util.appLocaleName());
                  item.subscriptionInfo.displayName = translation?.title || item.subscriptionInfo.name;
                } else {
                  item.subscriptionInfo.displayName = item.subscriptionInfo?.name || '';
                }
              }

              item.cuisine?.map((cuisineItem) => {
                if (cuisineItem?.translations) {
                  const translation = cuisineItem.translations.find((t) => t.code == this.util.appLocaleName());
                  cuisineItem.displayName = translation?.value || cuisineItem.name;
                } else {
                  cuisineItem.displayName = cuisineItem?.name || '';
                }
              });
              return item;
            }
          );
          this.restaurants = new MatTableDataSource<AdminRestaurantRegisterRequestListInterface>(mappedList);
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

  onRequestTypeChange(requestType: string) {
    console.log(requestType);
    this.requestType = requestType;
    this.getList();
  }


  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onInfo(request: AdminRestaurantRegisterRequestListInterface) {
    console.log(request);
    this.router.navigate(['admin/restaurant-management/restaurant-joining-request-detail', request.id]);
  }

  onDeleteRequest(request: AdminRestaurantRegisterRequestListInterface) {
    console.log(request);
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_request_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/restaurant_request/delete/' + request.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'admin');
          }
        });
      }
    });
  }

  onCity(item: AdminRestaurantRegisterRequestListInterface) {
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
        'status': this.requestType
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/restaurant_request/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'RestaurantJoiningRequest.xlsx' : 'RestaurantJoiningRequest.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'restaurantjoiningrequests.json';
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

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
