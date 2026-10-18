import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VendorMenuPhotosInterface, MenuDetail } from 'src/app/interfaces/vendor.menu.photos.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectVendorMediaDialog } from 'src/app/pages/vendor/vendor-media-management/select-vendor-media-dialog/select-vendor-media-dialog';
import { DialogDiningMenu } from './dialog-dining-menu/dialog-dining-menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-edit-menu-photos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './edit-menu-photos.html',
})
export class EditMenuPhotos {

  @ViewChild('paginatorMenu', { read: MatPaginator, static: false }) paginatorMenu: MatPaginator;
  @ViewChild('paginatorPhotos', { read: MatPaginator, static: false }) paginatorPhotos: MatPaginator;
  menu: VendorMenuPhotosInterface;
  menuColumn = ['name', 'action'];
  isLoaded: boolean = false;
  menuItems = new MatTableDataSource<MenuDetailInterface>([]);
  menuPhotos = new MatTableDataSource<MenuPhotosInterface>([]);

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {
    this.getMenuAndPhotos();
  }

  getMenuAndPhotos() {
    this.isLoaded = false;
    this.api.get_private('v1/vendor_web/restaurant_extra_detail/menu/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        let menuItems: MenuDetail[] = [];
        if (response && response.menuDetail && Array.isArray(response.menuDetail)) {
          const mappedList = response.menuDetail.map((item: MenuDetail) => {
            if (item.translations) {
              const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
              item.displayName = translation?.value || item.name;
            } else {
              item.displayName = item?.name || '';
            }
            return item;
          });
          menuItems = mappedList;
        }
        this.menu = response;
        this.menuItems.data = menuItems;
        this.menuPhotos.data = response.diningPhotos;
        this.menuItems.paginator = this.paginatorMenu;
        this.menuPhotos.paginator = this.paginatorPhotos;
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onDeleteDiningImage(name: string) {
    const updatedData = this.menuPhotos.data.filter((x: any) => x != name);
    this.menuPhotos.data = updatedData;
    this.menu.diningPhotos = this.menu.diningPhotos.filter((x) => x != name);
  }

  onSubmit() {
    console.log('on submit');
    console.log(this.menu);
    const param = {
      'photos': this.menu.diningPhotos,
      'menu': this.menu.menuDetail,
    };
    console.log(param);
    const spinnerRef = this.util.start();
    this.api.patch_private('v1/vendor_web/restaurant_extra_detail/updateMenu/' + this.util.getItem('_vendorId'), param).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onAddDiningPhoto() {
    const dialogRef = this.dialog.open(SelectVendorMediaDialog, {
      data: { value: '' },
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      height: "calc(100% - 30px)",
      width: "calc(100% - 30px)",
      maxWidth: "100%",
      maxHeight: "100%",
      panelClass: 'full-width-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event && result.event == 'select' && result.data && result.data != '') {
        this.menu.diningPhotos.push(result.data);
        const updatedData = [...this.menuPhotos.data, result.data];
        this.menuPhotos.data = updatedData;
      }
    });
  }

  onDeleteMenu(name: string) {
    console.log(name);
    const updatedData = this.menuItems.data.filter((item) => item.name != name);
    this.menuItems.data = updatedData;
    this.menu.menuDetail = this.menu.menuDetail.filter((x) => x.name != name);
  }

  onAddMenu() {
    const dialogRef = this.dialog.open(DialogDiningMenu, {
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'success') {
        console.log(result.data);
        const param = {
          name: result.data.name,
          photos: result.data.photos,
          translations: result.data.translations,
          displayName: '',
        };
        this.menu.menuDetail.push(param);
        this.menuItems.data = this.menu.menuDetail;
        this.translateMenu();
      }
    });
  }

  translateMenu() {
    const mappedList = this.menu.menuDetail.map((item: MenuDetail) => {
      if (item.translations) {
        const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
        item.displayName = translation?.value || item.name;
      } else {
        item.displayName = item?.name || '';
      }
      return item;
    });
    this.menuItems.data = mappedList;
  }

  onEditMenu(index: number) {
    console.log(index);
    console.log(this.menu.menuDetail[index]);
    const dialogRef = this.dialog.open(DialogDiningMenu, {
      data: { action: 'edit', values: this.menu.menuDetail[index] },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'success') {
        this.menu.menuDetail[index].name = result.data.name;
        this.menu.menuDetail[index].photos = result.data.photos;
        this.menu.menuDetail[index].translations = result.data.translations;
        this.menuItems.data = this.menu.menuDetail;
        this.translateMenu();
      }
    });
  }
}

export interface MenuDetailInterface {
  name: string
  translations: Translation[]
  photos: string[]
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

export type MenuPhotosInterface = string[]
