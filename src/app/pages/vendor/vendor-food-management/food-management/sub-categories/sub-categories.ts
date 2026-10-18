import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SubCategoryListInterface } from 'src/app/interfaces/sub.category.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogVendorSubCategory } from './dialog-vendor-sub-category/dialog-vendor-sub-category';
import { VendorSubCategoryListInterface } from 'src/app/interfaces/vendor.sub.category.list.interface';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-sub-categories',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './sub-categories.html',
})
export class SubCategories {

  @ViewChild('customCategoryPaginator', { read: MatPaginator }) customPaginator: MatPaginator;
  @ViewChild('mainCategoryPaginator', { read: MatPaginator }) mainPaginator: MatPaginator;
  vendorCategories = new MatTableDataSource<VendorSubCategoryListInterface>([]);
  categories = new MatTableDataSource<SubCategoryListInterface>([]);
  vendorDisplayedColumn = ['name', 'category', 'status', 'action'];
  mainDisplayedColumn = ['name', 'category'];
  haveCustomCatetgoryFeature: boolean = false;
  customCategoryPageSize: number = 5;
  customCurrentPage: number = 0;
  mainCategoryPageSize: number = 5;
  mainCategoryCurrentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
  ) {
    const _vendorCustomCategory = this.util.getItem('_vendorCustomCategory');
    if (_vendorCustomCategory == 'true') {
      this.haveCustomCatetgoryFeature = true;
    }
    this.getCategories();
  }

  getCategories() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.customCategoryPageSize,
      'page': this.customCurrentPage,
      'mainLimit': this.mainCategoryPageSize,
      'mainPage': this.mainCategoryCurrentPage
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/vendor_web/vendor_sub_category/getMyCategories/' + this.util.getItem('_vendorId') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(response);
        if (response && response.vendorCategory && response.vendorCategory.results && this.haveCustomCatetgoryFeature) {
          const mappedList = response.vendorCategory.results.map(
            (item: VendorSubCategoryListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }

              if (item && item.category && item.category?.id) {
                if (item.category?.translations) {
                  const translation = item.category.translations.find((t) => t.code == this.util.appLocaleName());
                  item.category.displayName = translation?.value || item.category.name;
                } else {
                  item.category.displayName = item.category?.name || '';
                }
              }
              return item;
            }
          );
          this.vendorCategories = new MatTableDataSource<VendorSubCategoryListInterface>(mappedList);
          this.customPaginator.length = response.vendorCategory.totalResults;
          this.customPaginator.hidePageSize = response.vendorCategory.totalResults <= 0 ? true : false;
        }
        if (response && response.mainCategory && response.mainCategory.results) {
          const mappedList = response.mainCategory.results.map(
            (item: SubCategoryListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }

              if (item && item.category && item.category?.id) {
                if (item.category?.translations) {
                  const translation = item.category.translations.find((t) => t.code == this.util.appLocaleName());
                  item.category.displayName = translation?.value || item.category.name;
                } else {
                  item.category.displayName = item.category?.name || '';
                }
              }
              return item;
            }
          );
          this.categories = new MatTableDataSource<SubCategoryListInterface>(mappedList);
          this.mainPaginator.length = response.mainCategory.totalResults;
          this.mainPaginator.hidePageSize = response.mainCategory.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onAddSubCategory() {
    const dialogRef = this.dialog.open(DialogVendorSubCategory, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getCategories();
      }
    });
  }

  onMainPageChange(event: PageEvent) {
    console.log(event);
    this.mainCategoryCurrentPage = event.pageIndex + 1;
    this.mainCategoryPageSize = event.pageSize;
    this.getCategories();
  }

  onCustomPageChange(event: PageEvent) {
    console.log(event);
    this.customCurrentPage = event.pageIndex + 1;
    this.customCategoryPageSize = event.pageSize;
    this.getCategories();
  }

  onStatusChange(event: MatSlideToggleChange, category: VendorSubCategoryListInterface) {
    console.log(event);
    console.log(category);
    category.status = event.checked;
    this.api.patch_private('v1/vendor_web/vendor_sub_category/update/' + category.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onEdit(category: VendorSubCategoryListInterface) {
    console.log(category);
    const dialogRef = this.dialog.open(DialogVendorSubCategory, {
      data: { action: 'edit', values: category },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getCategories();
      }
    });
  }

  onDelete(category: VendorSubCategoryListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_category_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/vendor_web/vendor_sub_category/delete/' + category.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getCategories();
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
