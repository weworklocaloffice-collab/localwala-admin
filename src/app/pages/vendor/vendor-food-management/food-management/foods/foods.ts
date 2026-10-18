import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { RestaurantFoodListInterface } from 'src/app/interfaces/vendor.food.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-foods',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './foods.html',
})
export class Foods {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  foods = new MatTableDataSource<RestaurantFoodListInterface>([]);
  displayedColumn = ['name', 'category', 'price', 'discount', 'recommended', 'instock', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

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
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/vendor_web/foods/getMyFoods/' + this.util.getItem('_vendorId') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: RestaurantFoodListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
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

              if (item && item.subCategory && item.subCategory?.id) {
                if (item.subCategory?.translations) {
                  const translation = item.subCategory.translations.find((t) => t.code == this.util.appLocaleName());
                  item.subCategory.displayName = translation?.value || item.subCategory.name;
                } else {
                  item.subCategory.displayName = item.subCategory?.name || '';
                }
              }

              if (item && item.customCategory && item.customCategory?.id) {
                if (item.customCategory?.translations) {
                  const translation = item.customCategory.translations.find((t) => t.code == this.util.appLocaleName());
                  item.customCategory.displayName = translation?.value || item.customCategory.name;
                } else {
                  item.customCategory.displayName = item.customCategory?.name || '';
                }
              }

              if (item && item.customSubCategory && item.customSubCategory?.id) {
                if (item.customSubCategory?.translations) {
                  const translation = item.customSubCategory.translations.find((t) => t.code == this.util.appLocaleName());
                  item.customSubCategory.displayName = translation?.value || item.customSubCategory.name;
                } else {
                  item.customSubCategory.displayName = item.customSubCategory?.name || '';
                }
              }

              return item;
            }
          );
          this.foods = new MatTableDataSource<RestaurantFoodListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.foods);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onAddFood() {
    this.router.navigate(['vendor/food-management/food-add']);
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onStockChange(event: MatSlideToggleChange, food: RestaurantFoodListInterface) {
    console.log(event);
    console.log(food);
    food.inStock = event.checked;
    this.api.patch_private('v1/vendor_web/foods/updateMetaInfo/' + food.id, { inStock: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_stock_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onStatusChange(event: MatSelectChange, food: RestaurantFoodListInterface) {
    console.log(event);
    this.api.patch_private('v1/vendor_web/foods/updateMetaInfo/' + food.id, { status: event.value }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onRecommendedChange(event: MatSlideToggleChange, food: RestaurantFoodListInterface) {
    console.log(event);
    console.log(food);
    food.recommended = event.checked;
    this.api.patch_private('v1/vendor_web/foods/updateMetaInfo/' + food.id, { recommended: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onEdit(food: RestaurantFoodListInterface) {
    console.log(food);
    this.router.navigate(['vendor/food-management/edit-food/', food.id]);
  }

  onDelete(food: RestaurantFoodListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_food_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/vendor_web/foods/delete/' + food.id).subscribe({
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
