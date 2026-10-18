import { Component, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CityzenLocalitiesListInterface } from 'src/app/interfaces/cityzen.localities.list.interface';
import { DialogCityzenLocalities } from './dialog-cityzen-localities/dialog-cityzen-localities';
import { DialogDeliveryZones } from '../../../admin/restaurant-management/cities/dialog-delivery-zones/dialog-delivery-zones';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-localities',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-localities.html',
})
export class CityzenLocalities {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  localities = new MatTableDataSource<CityzenLocalitiesListInterface>([]);
  displayedColumn = ['name', 'restaurants', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  searchQuery: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
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
    this.api.get_private('v1/cityzen/localities/getAll/' + this.util.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: CityzenLocalitiesListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.localities = new MatTableDataSource<CityzenLocalitiesListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.localities);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onAddLocality() {
    const dialogRef = this.dialog.open(DialogCityzenLocalities, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getList();
      }
    });
  }

  onDeliveryZones() {
    this.dialog.open(DialogDeliveryZones, {
      width: '720px',
      data: { master: this.util.getItem('_uid') },
    });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onEdit(localities: CityzenLocalitiesListInterface) {
    console.log(localities);
    const dialogRef = this.dialog.open(DialogCityzenLocalities, {
      data: { action: 'edit', values: localities },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getList();
      }
    });
  }

  onDelete(localities: CityzenLocalitiesListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_locality_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/cityzen/localities/delete_locality/' + localities.id).subscribe({
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

  onStatusChange(event: MatSlideToggleChange, localities: CityzenLocalitiesListInterface) {
    console.log(event);
    console.log(localities);
    localities.status = event.checked;
    this.api.patch_private('v1/cityzen/localities/update_status/' + localities.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
