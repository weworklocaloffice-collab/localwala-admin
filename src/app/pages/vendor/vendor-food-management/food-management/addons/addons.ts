import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogAddon } from './dialog-addon/dialog-addon';
import { VendorAddonListInterface } from 'src/app/interfaces/vendor.addons.list.interface';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-addons',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './addons.html',
})
export class Addons {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  addons = new MatTableDataSource<VendorAddonListInterface>([]);
  displayedColumn = ['name', 'price', 'stock', 'stock_type', 'in_stock', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

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
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/vendor_web/addons/getMyAddons/' + this.util.getItem('_vendorId') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: VendorAddonListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.addons = new MatTableDataSource<VendorAddonListInterface>(mappedList);
          console.log(this.addons);
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

  onAddAddons() {
    const dialogRef = this.dialog.open(DialogAddon, {
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

  onStatusChange(event: MatSlideToggleChange, addon: VendorAddonListInterface) {
    console.log(event);
    console.log(addon);
    addon.status = event.checked;
    this.api.patch_private('v1/vendor_web/addons/update/' + addon.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onStockChange(event: MatSlideToggleChange, addon: VendorAddonListInterface) {
    console.log(event);
    console.log(addon);
    addon.inStock = event.checked;
    this.api.patch_private('v1/vendor_web/addons/update/' + addon.id, { inStock: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onEdit(category: VendorAddonListInterface) {
    console.log(category);
    const dialogRef = this.dialog.open(DialogAddon, {
      data: { action: 'edit', values: category },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getList();
      }
    });
  }

  onDelete(category: VendorAddonListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_addon_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/vendor_web/addons/delete/' + category.id).subscribe({
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
