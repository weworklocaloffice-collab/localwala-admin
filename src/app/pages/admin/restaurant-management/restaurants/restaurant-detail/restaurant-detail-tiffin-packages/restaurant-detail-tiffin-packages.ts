import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AdminVendorTiffinSubscriptionPackageListInterface } from 'src/app/interfaces/admin.vendor.tiffin.subscription.package.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-restaurant-detail-tiffin-packages',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './restaurant-detail-tiffin-packages.html',
})
export class RestaurantDetailTiffinPackages implements AfterViewInit {

  @Input() restaurantId!: string;
  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  packages = new MatTableDataSource<AdminVendorTiffinSubscriptionPackageListInterface>([]);
  displayedColumn = ['name', 'price', 'discount', 'foods', 'purchase', 'interval', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router,
    private dialog: MatDialog,
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
    this.api.get_private('v1/admin/vendor_detail/tiffin_package_list?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminVendorTiffinSubscriptionPackageListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }

              if (item && item.restaurant && item.restaurant?.id) {
                if (item.restaurant?.translations) {
                  const translation = item.restaurant.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurant.displayName = translation?.title || item.restaurant.name;
                } else {
                  item.restaurant.displayName = item.restaurant?.name || '';
                }
              }
              return item;
            }
          );
          this.packages = new MatTableDataSource<AdminVendorTiffinSubscriptionPackageListInterface>(mappedList);
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

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onEdit(packageItem: AdminVendorTiffinSubscriptionPackageListInterface) {
    console.log(packageItem);
    this.router.navigate(['admin/order-management/manage-subscription-tiffin-package/', packageItem.id, packageItem.restaurant.id]);
  }

  onPurchasedList(packageItem: AdminVendorTiffinSubscriptionPackageListInterface) {
    console.log(packageItem);
    this.router.navigate(['admin/order-management/user-purchased-tiffin-subscription-list/', packageItem.id]);
  }

  onStatusChange(event: MatSelectChange, packageItem: AdminVendorTiffinSubscriptionPackageListInterface) {
    console.log(event);
    this.api.patch_private('v1/admin/tiffin_packages/updateStatus/' + packageItem.id, { status: event.value }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onDelete(packageItem: AdminVendorTiffinSubscriptionPackageListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_food_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/tiffin_packages/delete/' + packageItem.id).subscribe({
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

}
