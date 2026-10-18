import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogFoodLicense } from './dialog-food-license/dialog-food-license';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { RestaurantFoodLicenseListInterface } from 'src/app/interfaces/restaurant.food.license.list.interface';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { DialogRestaurantNotice } from './dialog-restaurant-notice/dialog-restaurant-notice';
import { AdminRestaurantNoticeListInterface } from 'src/app/interfaces/admin.restaurant.notice.list.interface';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-restaurant-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './restaurant-settings.html',
})
export class RestaurantSettings {
  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  @ViewChild('noticePaginator', { read: MatPaginator, static: false }) noticePaginator: MatPaginator;
  licenses = new MatTableDataSource<RestaurantFoodLicenseListInterface>([]);
  notice = new MatTableDataSource<AdminRestaurantNoticeListInterface>([]);
  displayedColumn = ['name', 'website', 'status', 'action'];
  displayedNoticeColumn = ['name', 'status', 'action'];
  action: string = 'add';
  id: string = '';
  settingForm = new FormGroup({
    restaurantLoginWith: new FormControl('email_password'),
    restaurantResetPasswordWith: new FormControl('email_otp'),
    selfRegistration: new FormControl(false),
    cashInHand: new FormControl(false),
    minCashInHand: new FormControl({ value: 0, disabled: true }),
    maxCashInHand: new FormControl({ value: 0, disabled: true }),
    driverPickup: new FormControl(false),
    canInitiateChat: new FormControl(false),
    canInitiateCall: new FormControl(false),
    havePackagingCharges: new FormControl(false),
    packagingCharges: new FormControl({ value: 0, disabled: true }),
    includePackagesChargesInTax: new FormControl(false),
    packagingChargesTax: new FormControl({ value: 0, disabled: true }),
  });
  haveSubmitClicked: boolean = false;
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  pageSizeNotice: number = 5;
  currentPageNotice: number = 0;
  isNoticeLoaded: boolean = false;
  exportType: string = 'export';
  searchQueryLicense: string = '';
  searchQueryNotice: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.getData();
  }

  getData() {
    this.isLoaded = false;
    this.isNoticeLoaded = false;
    const spinnerRef = this.util.start('ts_fetching');
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/restaurant_settings/get?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        this.isNoticeLoaded = true;
        this.util.stop(spinnerRef);
        if (response && response.settings && response.settings.id) {
          this.id = response.settings.id;
          this.action = 'edit';
          this.settingForm.controls['canInitiateCall'].setValue(response.settings.canInitiateCall);
          this.settingForm.controls['canInitiateChat'].setValue(response.settings.canInitiateChat);
          this.settingForm.controls['cashInHand'].setValue(response.settings.cashInHand);
          this.settingForm.controls['driverPickup'].setValue(response.settings.driverPickup);
          this.settingForm.controls['maxCashInHand'].setValue(response.settings.maxCashInHand);
          this.settingForm.controls['minCashInHand'].setValue(response.settings.minCashInHand);
          this.settingForm.controls['restaurantLoginWith'].setValue(response.settings.restaurantLoginWith);
          this.settingForm.controls['restaurantResetPasswordWith'].setValue(response.settings.restaurantResetPasswordWith);
          this.settingForm.controls['selfRegistration'].setValue(response.settings.selfRegistration);

          this.settingForm.controls['havePackagingCharges'].setValue(response.settings.havePackagingCharges);
          this.settingForm.controls['packagingCharges'].setValue(response.settings.packagingCharges);
          this.settingForm.controls['includePackagesChargesInTax'].setValue(response.settings.includePackagesChargesInTax);
          this.settingForm.controls['packagingChargesTax'].setValue(response.settings.packagingChargesTax);

          if (response && response.settings.cashInHand == true) {
            this.settingForm.controls['minCashInHand'].enable();
            this.settingForm.controls['minCashInHand'].setValidators([Validators.required]);
            this.settingForm.controls['maxCashInHand'].enable();
            this.settingForm.controls['maxCashInHand'].setValidators([Validators.required]);
          } else {
            this.settingForm.controls['minCashInHand'].disable();
            this.settingForm.controls['minCashInHand'].clearValidators();
            this.settingForm.controls['maxCashInHand'].disable();
            this.settingForm.controls['maxCashInHand'].clearValidators();
          }

          if (response && response.settings.havePackagingCharges == true) {
            this.settingForm.controls['packagingCharges'].enable();
            this.settingForm.controls['packagingCharges'].setValidators([Validators.required]);
          } else {
            this.settingForm.controls['packagingCharges'].disable();
            this.settingForm.controls['packagingCharges'].clearValidators();
          }

          if (response && response.settings.includePackagesChargesInTax == true) {
            this.settingForm.controls['packagingChargesTax'].enable();
            this.settingForm.controls['packagingChargesTax'].setValidators([Validators.required]);
          } else {
            this.settingForm.controls['packagingChargesTax'].disable();
            this.settingForm.controls['packagingChargesTax'].clearValidators();
          }

        }

        if (response && response.license && response.license.results) {
          const mappedList = response.license.results.map(
            (item: RestaurantFoodLicenseListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.licenses = new MatTableDataSource<RestaurantFoodLicenseListInterface>(mappedList);
          console.log(this.licenses);
          this.paginator.length = response.license.totalResults;
          this.paginator.hidePageSize = response.license.totalResults <= 0 ? true : false;
        }

        if (response && response.notice && response.notice.results) {
          const mappedList = response.notice.results.map(
            (item: AdminRestaurantNoticeListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.notice = new MatTableDataSource<AdminRestaurantNoticeListInterface>(mappedList);
          console.log(this.notice);
          this.noticePaginator.length = response.notice.totalResults;
          this.noticePaginator.hidePageSize = response.notice.totalResults <= 0 ? true : false;
        }

      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.isNoticeLoaded = true;
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onSubmit() {
    console.log('on submit');
    console.log(this.settingForm);
    console.log(this.settingForm.getRawValue());
    this.haveSubmitClicked = true;
    if (this.settingForm.valid) {
      if (this.action == 'add') {
        this.onSave();
      } else {
        this.onUpdate();
      }
    }
  }

  onSave() {
    console.log('on save');
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/admin/restaurant_settings/save', this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_restaurant_setting_saved');
        if (response && response.id) {
          this.id = response.id;
          this.action = 'edit';
        }
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onUpdate() {
    console.log('on update');
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/admin/restaurant_settings/update/' + this.id, this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_restaurant_setting_updated');
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onReset() {
    console.log('reset');
    this.settingForm.patchValue({
      restaurantLoginWith: 'email_password',
      restaurantResetPasswordWith: 'email_otp',
      selfRegistration: false,
      cashInHand: false,
      minCashInHand: 0,
      maxCashInHand: 0,
      driverPickup: false,
      canInitiateChat: false,
      canInitiateCall: false,
      havePackagingCharges: false,
      packagingCharges: 0,
      includePackagesChargesInTax: false,
      packagingChargesTax: 0,
    });

    this.settingForm.get('minCashInHand')?.disable();
    this.settingForm.get('maxCashInHand')?.disable();
    this.settingForm.get('packagingCharges')?.disable();
    this.settingForm.get('packagingChargesTax')?.disable();
    this.haveSubmitClicked = false;
  }

  get f() {
    return this.settingForm.controls;
  }

  onHavePackagingCharges(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == true) {
      this.settingForm.controls['packagingCharges'].enable();
      this.settingForm.controls['packagingCharges'].setValidators([Validators.required]);
    } else {
      this.settingForm.controls['packagingCharges'].disable();
      this.settingForm.controls['packagingCharges'].clearValidators();
    }
  }

  onIncludePackagesChargesInTax(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == true) {
      this.settingForm.controls['packagingChargesTax'].enable();
      this.settingForm.controls['packagingChargesTax'].setValidators([Validators.required]);
    } else {
      this.settingForm.controls['packagingChargesTax'].disable();
      this.settingForm.controls['packagingChargesTax'].clearValidators();
    }
  }

  onCashInHandChangeEvent(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == true) {
      this.settingForm.controls['minCashInHand'].enable();
      this.settingForm.controls['minCashInHand'].setValidators([Validators.required]);
      this.settingForm.controls['maxCashInHand'].enable();
      this.settingForm.controls['maxCashInHand'].setValidators([Validators.required]);
    } else {
      this.settingForm.controls['minCashInHand'].disable();
      this.settingForm.controls['minCashInHand'].clearValidators();
      this.settingForm.controls['maxCashInHand'].disable();
      this.settingForm.controls['maxCashInHand'].clearValidators();
    }
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'search': this.searchQueryLicense,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/restaurant_food_license/getAll?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: RestaurantFoodLicenseListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.licenses = new MatTableDataSource<RestaurantFoodLicenseListInterface>(mappedList);
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

  onAddLicense() {
    const dialogRef = this.dialog.open(DialogFoodLicense, {
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

  onPageNoticeChange(event: PageEvent) {
    console.log(event);
    this.currentPageNotice = event.pageIndex + 1;
    this.pageSizeNotice = event.pageSize;
    this.getRestaurantNoticeList();
  }

  onStatusChange(event: MatSlideToggleChange, license: RestaurantFoodLicenseListInterface) {
    console.log(event);
    console.log(license);
    license.status = event.checked;
    this.api.patch_private('v1/admin/restaurant_food_license/update/' + license.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onNoticeStatusChange(event: MatSlideToggleChange, notice: AdminRestaurantNoticeListInterface) {
    console.log(event);
    console.log(notice);
    notice.status = event.checked;
    this.api.patch_private('v1/admin/restaurant/notice/update/' + notice.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onEdit(license: RestaurantFoodLicenseListInterface) {
    console.log(license);
    const dialogRef = this.dialog.open(DialogFoodLicense, {
      data: { action: 'edit', values: license },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getList();
      }
    });
  }

  onEditNotice(notice: AdminRestaurantNoticeListInterface) {
    console.log(notice);
    const dialogRef = this.dialog.open(DialogRestaurantNotice, {
      data: { action: 'edit', values: notice },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getRestaurantNoticeList();
      }
    });
  }

  onDelete(license: RestaurantFoodLicenseListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_license_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/restaurant_food_license/delete/' + license.id).subscribe({
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

  onDeleteNotice(notice: AdminRestaurantNoticeListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_license_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/restaurant/notice/delete/' + notice.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getRestaurantNoticeList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'admin');
          }
        });
      }
    });
  }

  onAddRestaurantNotice() {
    const dialogRef = this.dialog.open(DialogRestaurantNotice, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getRestaurantNoticeList();
      }
    });
  }

  getRestaurantNoticeList() {
    this.isNoticeLoaded = false;
    const param: any = {
      'limit': this.pageSizeNotice,
      'page': this.currentPageNotice,
      'search': this.searchQueryNotice,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/restaurant/notice/getAll?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isNoticeLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminRestaurantNoticeListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.notice = new MatTableDataSource<AdminRestaurantNoticeListInterface>(mappedList);
          this.noticePaginator.length = response.totalResults;
          this.noticePaginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isNoticeLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onExportCollection(exportOption: string, kind: string) {
    console.log(exportOption, kind);
    if (kind == 'restaurant_food_license') {
      const spinnerRef = this.util.start();
      const param: any = {
        'type': exportOption,
        'search': this.searchQueryLicense,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/restaurant_food_license/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'RestaurantFoodLicense.xlsx' : 'RestaurantFoodLicense.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'restaurantfoodlicenses.json';
            this.api.download_export_file(blob, fileName);
          }
          this.exportType = 'export';
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.exportType = 'export';
          this.util.handleError(error, 'admin');
        }
      });
    } else if (kind == 'restaurant_notice') {
      const spinnerRef = this.util.start();
      const param: any = {
        'type': exportOption,
        'search': this.searchQueryNotice,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/restaurant_notice/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'RestaurantNotice.xlsx' : 'RestaurantNotice.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'restaurantnotices.json';
            this.api.download_export_file(blob, fileName);
          }
          this.exportType = 'export';
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.exportType = 'export';
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  importCollection(kind: string) {
    console.log(kind);
    this.router.navigate(['admin/import-export-management/import-collection/', kind]);
  }

  onSearchLicense() {
    console.log(`on search ${this.searchQueryLicense}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

  onSearchNotice() {
    console.log(`on search ${this.searchQueryNotice}`);
    this.pageSizeNotice = 5;
    this.currentPageNotice = 0;
    this.noticePaginator.firstPage();
    this.getRestaurantNoticeList();
  }
}
