import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { VendorSubscriptionTiffinListInterface } from 'src/app/interfaces/vendor.subscription.tiffin.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-tiffin-subscription-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './tiffin-subscription-list.html',
})
export class TiffinSubscriptionList {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  subscriptions = new MatTableDataSource<VendorSubscriptionTiffinListInterface>([]);
  displayedColumn = ['name', 'price', 'discount', 'foods', 'purchase', 'status', 'action'];
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
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/vendor_web/tiffin_packages/getMyPackages/' + this.util.getItem('_vendorId') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: VendorSubscriptionTiffinListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.subscriptions = new MatTableDataSource<VendorSubscriptionTiffinListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.subscriptions);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onAddPackage() {
    this.router.navigate(['vendor/subscription-tiffin-management/add-subscription-tiffin-package']);
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onEdit(packageItem: VendorSubscriptionTiffinListInterface) {
    console.log(packageItem);
    this.router.navigate(['vendor/subscription-tiffin-management/edit-subscription-tiffin-package/', packageItem.id]);
  }

  onPurchaseList(packageItem: VendorSubscriptionTiffinListInterface) {
    console.log(packageItem);
    this.router.navigate(['vendor/subscription-tiffin-management/tiffin-subscription-purchase-list', packageItem.id]);
  }

  onStatusChange(event: MatSelectChange, packageItem: VendorSubscriptionTiffinListInterface) {
    console.log(event);
    this.api.patch_private('v1/vendor_web/tiffin_packages/updateStatus/' + packageItem.id, { status: event.value }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onDelete(packageItem: VendorSubscriptionTiffinListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_food_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/vendor_web/tiffin_packages/delete/' + packageItem.id).subscribe({
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

}
