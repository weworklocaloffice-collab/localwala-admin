import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { Router } from '@angular/router';
import { CityzenAddonsListInterface } from 'src/app/interfaces/cityzen.addons.list.interface';
import { DialogCityzenAddon } from './dialog-cityzen-addon/dialog-cityzen-addon';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-addons-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-addons-list.html',
})
export class CityzenAddonsList {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  addons = new MatTableDataSource<CityzenAddonsListInterface>([]);
  displayedColumn = ['name', 'price', 'stock', 'stock_type', 'in_stock', 'restaurant', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
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
      'search': this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/addons_list/' + this.util.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: CityzenAddonsListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
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
          this.addons = new MatTableDataSource<CityzenAddonsListInterface>(mappedList);
          console.log(this.addons);
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

  onAddAddon() {
    const dialogRef = this.dialog.open(DialogCityzenAddon, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getList();
      }
    });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onStatusChange(event: MatSlideToggleChange, addons: CityzenAddonsListInterface) {
    console.log(event);
    console.log(addons);
    addons.status = event.checked;
    this.api.patch_private('v1/cityzen/update_addons/' + addons.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onStockChange(event: MatSlideToggleChange, addons: CityzenAddonsListInterface) {
    console.log(event);
    console.log(addons);
    addons.inStock = event.checked;
    this.api.patch_private('v1/cityzen/update_addons/' + addons.id, { inStock: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onEdit(addons: CityzenAddonsListInterface) {
    console.log(addons);
    const dialogRef = this.dialog.open(DialogCityzenAddon, {
      data: { action: 'edit', values: addons },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getList();
      }
    });
  }

  onDelete(addons: CityzenAddonsListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_addon_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/cityzen/delete_addons/' + addons.id).subscribe({
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

  onRestaurantDetail(item: CityzenAddonsListInterface) {
    console.log(item);
    if (item && item.restaurants && item.restaurants.id && item.restaurants.id !== '') {
      this.router.navigate(['cityzen-team/u/restaurant-detail', item.restaurants.id]);
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
