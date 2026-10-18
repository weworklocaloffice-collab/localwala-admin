import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { VendorCouponListInterface } from 'src/app/interfaces/vendor.coupon.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-orders-coupon-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './orders-coupon-list.html',
})
export class OrdersCouponList {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  coupons = new MatTableDataSource<VendorCouponListInterface>([]);
  displayedColumn = ['city', 'title', 'dates', 'type', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

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
    const vendorId = this.util.getItem('_vendorId');
    const userId = this.util.getItem('_uid');
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'vendorId': vendorId,
      'userId': userId
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/vendor_web/coupons/get?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.coupons) {
          const mappedList = response.coupons.map(
            (item: VendorCouponListInterface) => {
              if (item && item.city && item.city?.id) {
                if (item.city?.translations) {
                  const translation = item.city.translations.find((t) => t.code == this.util.appLocaleName());
                  item.city.displayName = translation?.value || item.city.name;
                } else {
                  item.city.displayName = item.city?.name || '';
                }
              }

              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }

              return item;
            }
          );
          this.coupons = new MatTableDataSource<VendorCouponListInterface>(mappedList);
          console.log(this.coupons);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onAddNewCoupon() {
    this.router.navigate(['vendor/coupon-management/add-coupon']);
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onEdit(coupon: VendorCouponListInterface) {
    console.log(coupon);
    this.router.navigate(['vendor/coupon-management/edit-coupon/', coupon.id]);
  }

  getFormatedDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  onDelete(coupon: VendorCouponListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_coupon_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const userId = this.util.getItem('_uid');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/vendor_web/coupons/delete/' + coupon.id + '/' + userId).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'vendor');
          }
        });
      }
    });
  }

  onStatusChange(event: MatSelectChange, coupon: VendorCouponListInterface) {
    console.log(event);
    this.api.patch_private('v1/vendor_web/coupons/updateMeta/' + coupon.id, { status: event.value }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'vendor');
      }
    });
  }

}
