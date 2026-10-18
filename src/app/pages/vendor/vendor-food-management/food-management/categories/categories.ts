import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogCustomCategory } from './dialog-custom-category/dialog-custom-category';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { VendorCategoryListInterface } from 'src/app/interfaces/vendor.category.list.interface';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { VendorAppCategoryListInterface } from 'src/app/interfaces/vendor.app.category.list.interface';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './categories.html',
})
export class Categories {

  @ViewChild('customCategoryPaginator', { read: MatPaginator }) customPaginator: MatPaginator;
  @ViewChild('mainCategoryPaginator', { read: MatPaginator }) mainPaginator: MatPaginator;
  vendorCategories = new MatTableDataSource<VendorCategoryListInterface>([]);
  categories = new MatTableDataSource<VendorAppCategoryListInterface>([]);
  vendorDisplayedColumn = ['name', 'status', 'action'];
  mainDisplayedColumn = ['name'];
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
    this.api.get_private('v1/vendor_web/vendor_category/getMyCategories/' + this.util.getItem('_vendorId') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(this.haveCustomCatetgoryFeature);
        console.log(response);
        if (response && response.vendorCategory && response.vendorCategory.results && this.haveCustomCatetgoryFeature) {
          const mappedList = response.vendorCategory.results.map(
            (item: VendorCategoryListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.vendorCategories = new MatTableDataSource<VendorCategoryListInterface>(mappedList);
          this.customPaginator.length = response.vendorCategory.totalResults;
          this.customPaginator.hidePageSize = response.vendorCategory.totalResults <= 0 ? true : false;
        }
        if (response && response.mainCategory && response.mainCategory.results) {
          const mappedList = response.mainCategory.results.map(
            (item: VendorAppCategoryListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.categories = new MatTableDataSource<VendorAppCategoryListInterface>(mappedList);
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

  onAddCategory() {
    const dialogRef = this.dialog.open(DialogCustomCategory, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getCategories();
      }
    });
  }

  onCustomPageChange(event: PageEvent) {
    console.log(event);
    this.customCurrentPage = event.pageIndex + 1;
    this.customCategoryPageSize = event.pageSize;
    this.getCategories();
  }

  onMainPageChange(event: PageEvent) {
    console.log(event);
    this.mainCategoryCurrentPage = event.pageIndex + 1;
    this.mainCategoryPageSize = event.pageSize;
    this.getCategories();
  }

  onStatusChange(event: MatSlideToggleChange, category: VendorCategoryListInterface) {
    console.log(event);
    console.log(category);
    category.status = event.checked;
    this.api.patch_private('v1/vendor_web/vendor_category/update/' + category.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onEdit(category: VendorCategoryListInterface) {
    console.log(category);
    const dialogRef = this.dialog.open(DialogCustomCategory, {
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

  onDelete(category: VendorCategoryListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_category_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/vendor_web/vendor_category/delete/' + category.id).subscribe({
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
