import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VendorMenuPhotosInterface } from 'src/app/interfaces/vendor.menu.photos.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectVendorMediaDialog } from 'src/app/pages/vendor/vendor-media-management/select-vendor-media-dialog/select-vendor-media-dialog';
import { DialogDiningMenu } from 'src/app/pages/vendor/vendor-profile-management/edit-menu-photos/dialog-dining-menu/dialog-dining-menu';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, startWith, map } from 'rxjs';
import { VendorDiningCategoryInterface } from 'src/app/interfaces/vendor.dining.category.interface';
import { MatOptionSelectionChange } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-vendor-dining-menu-photos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './vendor-dining-menu-photos.html',
})
export class VendorDiningMenuPhotos {

  isLoaded: boolean = false;
  menu: VendorMenuPhotosInterface;
  categoryList: Observable<VendorDiningCategoryInterface[]>;
  listOfCategory: VendorDiningCategoryInterface[] = [];
  categoryCtrl = new FormControl('');
  menuForm = new FormGroup({
    category: new FormControl('', [Validators.required]),
  });
  haveSubmitClicked: boolean = false;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {
    this.getMenuAndPhotos();
  }

  getMenuAndPhotos() {
    this.isLoaded = false;
    this.api.get_private('v1/vendor_web/dining/getVendorDiningInformationWeb/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        this.menu = response;
        console.log(this.menu.menuDetail);

        if (response && response.categories && response.categories.length) {
          const mappedList = response.categories.map(
            (item: VendorDiningCategoryInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.listOfCategory = mappedList;
          this.categoryList = this.categoryCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCategory(element) : this.listOfCategory.slice()))
          );

          if (response && response.restaurant && response.restaurant.diningCategory) {
            const values = response.restaurant
            if (values && values.diningCategory && values.diningCategory instanceof Array) {
              console.log('have categories array');
              const savedCategory: string[] = [];
              values.diningCategory.forEach((element: any) => {
                savedCategory.push(element.id);
              });
              const tempCategory: any = [];
              this.listOfCategory.forEach((element) => {
                if (savedCategory.includes(element.id)) {
                  tempCategory.push(element.displayName);
                }
              });
              this.menuForm.controls['category'].patchValue(tempCategory);
            }
          }
          console.log(this.categoryList);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  private _filterCategory(value: string): VendorDiningCategoryInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCategory.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  get f() {
    return this.menuForm.controls;
  }

  openedChange(e: any) {
    this.categoryCtrl.patchValue('');
  }


  selectionChange(event: MatOptionSelectionChange) { }

  onDeleteDiningImage(name: string) {
    this.menu.diningPhotos = this.menu.diningPhotos.filter((x) => x != name);
  }

  onSubmit() {
    console.log('on submit');
    const sendData = this.menuForm.getRawValue();
    const categoryIds: any[] = [];
    this.listOfCategory.forEach((element) => {
      if (sendData.category && sendData.category.includes(element.displayName)) {
        categoryIds.push(element.id);
      }
    });
    if (categoryIds.length == 0) {
      this.util.onError('ts_please_select_dining_category', '');
    } else {
      sendData.category = categoryIds.join();
      console.log(sendData.category);
      const param = {
        'photos': this.menu.diningPhotos,
        'menu': this.menu.menuDetail,
        'categories': sendData.category
      };
      console.log(param);
      const spinnerRef = this.util.start();
      this.api.patch_private('v1/vendor_web/dining/updateDiningInformation/' + this.util.getItem('_vendorId'), param).subscribe({
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
      }
    });
  }

  onDeleteMenu(name: string) {
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
      }
    });
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
      }
    });
  }

}
