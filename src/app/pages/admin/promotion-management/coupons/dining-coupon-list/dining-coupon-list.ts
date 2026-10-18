import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminDiningCouponListInterface } from 'src/app/interfaces/admin.dining.coupon.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dining-coupon-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dining-coupon-list.html',
})
export class DiningCouponList {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  coupons = new MatTableDataSource<AdminDiningCouponListInterface>([]);
  displayedColumn = ['city', 'title', 'dates', 'redeem', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  searchQuery: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
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
    this.api.get_private('v1/admin/dining_coupon/get?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.coupons) {
          const mappedList = response.coupons.map(
            (item: AdminDiningCouponListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }

              if (item && item.city && item.city?.id) {
                if (item.city?.translations) {
                  const translation = item.city.translations.find((t) => t.code == this.util.appLocaleName());
                  item.city.displayName = translation?.value || item.city.name;
                } else {
                  item.city.displayName = item.city?.name || '';
                }
              }
              return item;
            }
          );
          this.coupons = new MatTableDataSource<AdminDiningCouponListInterface>(mappedList);
          console.log(this.coupons);
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

  onAddNewDiningCoupon() {
    this.router.navigate(['admin/coupons/add-dining-coupon']);
  }


  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onEdit(coupon: AdminDiningCouponListInterface) {
    console.log(coupon);
    this.router.navigate(['admin/coupons/edit-dining-coupon/', coupon.id]);
  }

  onDelete(coupon: AdminDiningCouponListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_coupon_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/dining_coupon/delete/' + coupon.id).subscribe({
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

  onStatusChange(event: MatSelectChange, coupon: AdminDiningCouponListInterface) {
    console.log(event);
    this.api.patch_private('v1/admin/dining_coupon/updateMeta/' + coupon.id, { status: event.value }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  getFormatedDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  onCity(item: AdminDiningCouponListInterface) {
    if (item && item.city && item.city.id != '') {
      this.router.navigate(['admin/zone-setup/city-detail', item.city.id]);
    }
  }

  onRedeemBooking(item: AdminDiningCouponListInterface) {
    this.router.navigate(['admin/coupons/dining-coupon-redeem-booking/', item.id]);
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      const spinnerRef = this.util.start();
      const param: any = {
        'type': exportOption,
        'search': this.searchQuery,
        'status': false,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/dining_coupon/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'DiningCoupons.xlsx' : 'DiningCoupons.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'diningcoupons.json';
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
    this.router.navigate(['admin/import-export-management/import-collection/', 'dining_coupon']);
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
