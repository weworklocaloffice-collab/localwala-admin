import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { CityzenDiningCouponRequestListInterface } from 'src/app/interfaces/cityzen.dining.coupon.request.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-dining-coupon-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-dining-coupon-request.html',
})
export class CityzenDiningCouponRequest {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  coupons = new MatTableDataSource<CityzenDiningCouponRequestListInterface>([]);
  displayedColumn = ['restaurant', 'title', 'dates', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  searchQuery: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router,
    private dialog: MatDialog,
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
    this.api.get_private('v1/cityzen/new_dining_coupon_request/' + this.util.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.coupons) {
          const mappedList = response.coupons.map(
            (item: CityzenDiningCouponRequestListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }

              if (item && item.restaurantInfo && item.restaurantInfo?.id) {
                if (item.restaurantInfo?.translations) {
                  const translation = item.restaurantInfo.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurantInfo.displayName = translation?.title || item.restaurantInfo.name;
                  item.restaurantInfo.displayAddress = translation?.address || item.restaurantInfo.address;
                } else {
                  item.restaurantInfo.displayName = item.restaurantInfo?.name || '';
                  item.restaurantInfo.displayAddress = item.restaurantInfo?.address || '';
                }
              }
              return item;
            }
          );
          this.coupons = new MatTableDataSource<CityzenDiningCouponRequestListInterface>(mappedList);
          console.log(this.coupons);
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

  onEdit(coupon: CityzenDiningCouponRequestListInterface) {
    console.log(coupon);
    this.router.navigate(['cityzen-team/u/edit-dining-coupon/', coupon.id]);
  }

  getFormatedDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  onAccept(coupon: CityzenDiningCouponRequestListInterface) {
    console.log('Accept');
    const spinnerRef = this.util.start();
    this.api.patch_private('v1/cityzen/update_dining_coupon_meta/' + coupon.id, { status: 'live' }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.getList();
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onReject(coupon: CityzenDiningCouponRequestListInterface) {
    console.log('Reject & Delete');
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_coupon_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/cityzen/delete_dining_coupon/' + coupon.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'cityzen');
          }
        });
      }
    });
  }

  onRestaurantDetail(item: CityzenDiningCouponRequestListInterface) {
    console.log(item);
    if (item && item.restaurantInfo && item.restaurantInfo.id && item.restaurantInfo.id != '') {
      this.router.navigate(['cityzen-team/u/restaurant-detail', item.restaurantInfo.id]);
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
