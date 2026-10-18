import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CityzenFoodListInterface } from 'src/app/interfaces/cityzen.food.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-food-section',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './cityzen-food-section.html',
})
export class CityzenFoodSection {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  foods = new MatTableDataSource<CityzenFoodListInterface>([]);
  displayedColumn = ['name', 'category', 'restaurant', 'price', 'instock', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  searchQuery: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
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
      'search': this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/food_list/' + this.util.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: CityzenFoodListInterface) => {
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
          this.foods = new MatTableDataSource<CityzenFoodListInterface>(mappedList);
          console.log(this.foods);
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


  onAddFood() {
    this.router.navigate(['cityzen-team/u/add-food']);
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onStockChange(event: MatSlideToggleChange, food: CityzenFoodListInterface) {
    console.log(event);
    console.log(food);
    food.inStock = event.checked;
    this.api.patch_private('v1/cityzen/update_food_meta_detail/' + food.id, { inStock: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_food_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onEdit(food: CityzenFoodListInterface) {
    this.router.navigate(['cityzen-team/u/edit-food', food.id]);
  }

  onDelete(food: CityzenFoodListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_food_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/cityzen/delete_food/' + food.id).subscribe({
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

  onStatusChange(event: MatSelectChange, food: CityzenFoodListInterface) {
    console.log(event);
    this.api.patch_private('v1/cityzen/update_food_meta_detail/' + food.id, { status: event.value }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onRestaurantDetail(item: CityzenFoodListInterface) {
    console.log(item);
    if (item && item.restaurants && item.restaurants.id && item.restaurants.id !== '') {
      this.router.navigate(['cityzen-team/u/restaurant-detail', item.restaurants.id]);
    }
  }

  onFoodDetail(food: CityzenFoodListInterface) {
    this.router.navigate(['cityzen-team/u/food-detail', food.id]);
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
