import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogDiningCancellationReason } from './dialog-dining-cancellation-reason/dialog-dining-cancellation-reason';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { AdminDiningCancellationReasonListInterface } from 'src/app/interfaces/admin.dining.cancellation.reason.list.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { DialogDiningCategory } from './dialog-dining-category/dialog-dining-category';
import { AdminDiningCategoryInterface } from 'src/app/interfaces/admin.dining.category.interface';
import { DialogDiningNotice } from './dialog-dining-notice/dialog-dining-notice';
import { AdminDiningNoticeInterface } from 'src/app/interfaces/admin.dining.notice.interface';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dining-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dining-settings.html',
})
export class DiningSettings {

  @ViewChild('paginatorCategory', { read: MatPaginator, static: false }) paginatorCategory: MatPaginator;
  @ViewChild('paginatorReasons', { read: MatPaginator, static: false }) paginatorReasons: MatPaginator;
  @ViewChild('paginatorNotice', { read: MatPaginator, static: false }) paginatorNotice: MatPaginator;
  reasons = new MatTableDataSource<AdminDiningCancellationReasonListInterface>([]);
  displayedColumnReason = ['name', 'type', 'status', 'action'];
  categories = new MatTableDataSource<AdminDiningCategoryInterface>([]);
  displayedColumnCategory = ['name', 'restaurants', 'status', 'action'];
  notice = new MatTableDataSource<AdminDiningNoticeInterface>([]);
  displayedNoticeColumn = ['name', 'status', 'action'];
  action: string = 'add';
  id: string = '';
  settingForm = new FormGroup({
    restaurantCanCancelRequest: new FormControl(false),
    restaurantCanAddOffers: new FormControl(false),
    preBookingChargeRequired: new FormControl(false),
    guestBooking: new FormControl(false),
    commissionPreBooking: new FormControl('', [Validators.required]),
    minBookingCharge: new FormControl('', [Validators.required]),
  });
  haveSubmitClicked: boolean = false;
  pageSizeCategory: number = 5;
  currentPageCategory: number = 0;
  isCategoryLoaded: boolean = false;
  pageSizeReason: number = 5;
  currentPageReason: number = 0;
  isCancellationLoaded: boolean = false;
  pageSizeNotice: number = 5;
  currentPageNotice: number = 0;
  isNoticeLoaded: boolean = false;
  exportType: string = 'export';
  searchQueryCategory: string = '';
  searchQueryCancellation: string = '';
  searchQueryInstruction: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.getData();
  }

  getData() {
    this.isCancellationLoaded = false;
    this.isCategoryLoaded = false;
    this.isNoticeLoaded = false;
    const spinnerRef = this.util.start('ts_fetching');
    const param: any = {
      'limit': this.pageSizeCategory,
      'page': this.currentPageCategory,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/dining_settings/get?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isCancellationLoaded = true;
        this.isCategoryLoaded = true;
        this.isNoticeLoaded = true;
        this.util.stop(spinnerRef);
        if (response && response.settings && response.settings.id) {
          this.id = response.settings.id;
          this.action = 'edit';
          this.settingForm.controls['commissionPreBooking'].setValue(response.settings.commissionPreBooking);
          this.settingForm.controls['guestBooking'].setValue(response.settings.guestBooking);
          this.settingForm.controls['minBookingCharge'].setValue(response.settings.minBookingCharge);
          this.settingForm.controls['preBookingChargeRequired'].setValue(response.settings.preBookingChargeRequired);
          this.settingForm.controls['restaurantCanAddOffers'].setValue(response.settings.restaurantCanAddOffers);
          this.settingForm.controls['restaurantCanCancelRequest'].setValue(response.settings.restaurantCanCancelRequest);
        }

        if (response && response.reasons && response.reasons.results) {
          const mappedList = response.reasons.results.map(
            (item: AdminDiningCancellationReasonListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.reasons = new MatTableDataSource<AdminDiningCancellationReasonListInterface>(mappedList);
          console.log(this.reasons);
          this.paginatorReasons.length = response.reasons.totalResults;
          this.paginatorReasons.hidePageSize = response.reasons.totalResults <= 0 ? true : false;
        }

        if (response && response.categories && response.categories.results) {
          const mappedList = response.categories.results.map(
            (item: AdminDiningCategoryInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.categories = new MatTableDataSource<AdminDiningCategoryInterface>(mappedList);
          console.log(this.categories);
          this.paginatorCategory.length = response.categories.totalResults;
          this.paginatorCategory.hidePageSize = response.categories.totalResults <= 0 ? true : false;
        }

        if (response && response.notice && response.notice.results) {
          const mappedList = response.notice.results.map(
            (item: AdminDiningNoticeInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.notice = new MatTableDataSource<AdminDiningNoticeInterface>(mappedList);
          console.log(this.notice);
          this.paginatorNotice.length = response.notice.totalResults;
          this.paginatorNotice.hidePageSize = response.notice.totalResults <= 0 ? true : false;
        }

      }, error: (error: any) => {
        console.log(error);
        this.isCancellationLoaded = true;
        this.isCategoryLoaded = true;
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
    this.api.post_private('v1/admin/dining_settings/save', this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_dining_setting_saved');
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
    this.api.patch_private('v1/admin/dining_settings/update/' + this.id, this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_dining_setting_updated');
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onReset() {
    console.log('reset');
    this.settingForm.patchValue({
      restaurantCanCancelRequest: false,
      restaurantCanAddOffers: false,
      preBookingChargeRequired: false,
      guestBooking: false,
      commissionPreBooking: '',
      minBookingCharge: ''
    });
    this.haveSubmitClicked = false;
  }

  get f() {
    return this.settingForm.controls;
  }

  getCancellationList() {
    this.isCancellationLoaded = false;
    const param: any = {
      'limit': this.pageSizeReason,
      'page': this.currentPageReason,
      'search': this.searchQueryCancellation,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/dining_cancel_reason/getAll?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isCancellationLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminDiningCancellationReasonListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.reasons = new MatTableDataSource<AdminDiningCancellationReasonListInterface>(mappedList);
          this.paginatorReasons.length = response.totalResults;
          this.paginatorReasons.hidePageSize = response.totalResults <= 0 ? true : false;
        }

      }, error: (error: any) => {
        console.log(error);
        this.isCancellationLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  getDiningCategoryList() {
    this.isCategoryLoaded = false;
    const param: any = {
      'limit': this.pageSizeCategory,
      'page': this.currentPageCategory,
      'search': this.searchQueryCategory,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/dining_category/getAll?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isCategoryLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminDiningCategoryInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.categories = new MatTableDataSource<AdminDiningCategoryInterface>(mappedList);
          this.paginatorCategory.length = response.totalResults;
          this.paginatorCategory.hidePageSize = response.totalResults <= 0 ? true : false;
        }

      }, error: (error: any) => {
        console.log(error);
        this.isCategoryLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  getDiningNoticeList() {
    this.isNoticeLoaded = false;
    const param: any = {
      'limit': this.pageSizeNotice,
      'page': this.currentPageNotice,
      'search': this.searchQueryInstruction,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/dining/notice/getAll?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isNoticeLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminDiningNoticeInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.notice = new MatTableDataSource<AdminDiningNoticeInterface>(mappedList);
          this.paginatorNotice.length = response.totalResults;
          this.paginatorNotice.hidePageSize = response.totalResults <= 0 ? true : false;
        }

      }, error: (error: any) => {
        console.log(error);
        this.isNoticeLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onAddReason() {
    const dialogRef = this.dialog.open(DialogDiningCancellationReason, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getCancellationList();
      }
    });
  }

  onAddDiningCategory() {
    const dialogRef = this.dialog.open(DialogDiningCategory, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getDiningCategoryList();
      }
    });
  }

  onAddDiningNotice() {
    const dialogRef = this.dialog.open(DialogDiningNotice, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getDiningNoticeList();
      }
    });
  }

  onEditDiningCategory(category: AdminDiningCategoryInterface) {
    console.log(category);
    const dialogRef = this.dialog.open(DialogDiningCategory, {
      data: { action: 'edit', values: category },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getDiningCategoryList();
      }
    });
  }

  onDeleteDiningCategory(category: AdminDiningCategoryInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_category_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/dining_category/delete/' + category.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getDiningCategoryList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'admin');
          }
        });
      }
    });
  }

  onCancellationPageChange(event: PageEvent) {
    console.log(event);
    this.currentPageReason = event.pageIndex + 1;
    this.pageSizeReason = event.pageSize;
    this.getCancellationList();
  }

  onCategoryPageChange(event: PageEvent) {
    console.log(event);
    this.currentPageCategory = event.pageIndex + 1;
    this.pageSizeCategory = event.pageSize;
    this.getDiningCategoryList();
  }

  onNoticePageChange(event: PageEvent) {
    console.log(event);
    this.currentPageNotice = event.pageIndex + 1;
    this.pageSizeNotice = event.pageSize;
    this.getDiningNoticeList();
  }

  onCancellationStatusChange(event: MatSlideToggleChange, reason: AdminDiningCancellationReasonListInterface) {
    console.log(event);
    console.log(reason);
    reason.status = event.checked;
    this.api.patch_private('v1/admin/dining_cancel_reason/update/' + reason.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onCategoryStatusChange(event: MatSlideToggleChange, category: AdminDiningCategoryInterface) {
    console.log(event);
    console.log(category);
    category.status = event.checked;
    this.api.patch_private('v1/admin/dining_category/update/' + category.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onNoticeStatusChange(event: MatSlideToggleChange, notice: AdminDiningNoticeInterface) {
    console.log(event);
    console.log(notice);
    notice.status = event.checked;
    this.api.patch_private('v1/admin/dining/notice/update/' + notice.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onEditNotice(notice: AdminDiningNoticeInterface) {
    console.log(notice);
    const dialogRef = this.dialog.open(DialogDiningNotice, {
      data: { action: 'edit', values: notice },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getDiningNoticeList();
      }
    });
  }

  onEditCancalletion(reason: AdminDiningCancellationReasonListInterface) {
    console.log(reason);
    const dialogRef = this.dialog.open(DialogDiningCancellationReason, {
      data: { action: 'edit', values: reason },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getCancellationList();
      }
    });
  }

  onDeleteCancellation(reason: AdminDiningCancellationReasonListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_reason_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/dining_cancel_reason/delete/' + reason.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getCancellationList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'admin');
          }
        });
      }
    });
  }

  onDeleteNotice(notice: AdminDiningNoticeInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_license_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/dining/notice/delete/' + notice.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getDiningNoticeList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'admin');
          }
        });
      }
    });
  }

  onExportCollection(exportOption: string, kind: string) {
    console.log(exportOption, kind);
    if (exportOption != 'export') {
      if (kind == 'dining_category') {
        const spinnerRef = this.util.start();
        const param: any = {
          'type': exportOption,
          'search': this.searchQueryCategory,
        };
        let httpParams = new HttpParams();
        Object.keys(param).forEach((key: any) => {
          httpParams = httpParams.set(key, param[key]);
        });
        this.api.export_collection('v1/admin/dining_category/export?' + httpParams.toString()).subscribe({
          next: (blob: Blob) => {
            this.util.stop(spinnerRef);
            if (exportOption != 'raw') {
              const fileName = exportOption == 'excel' ? 'DiningCategories.xlsx' : 'DiningCategories.csv';
              this.api.download_export_file(blob, fileName);
            } else {
              const fileName = 'diningcategories.json';
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
      } else if (kind == 'dining_cancellation_reason') {
        const spinnerRef = this.util.start();
        const param: any = {
          'type': exportOption,
          'search': this.searchQueryCancellation,
        };
        let httpParams = new HttpParams();
        Object.keys(param).forEach((key: any) => {
          httpParams = httpParams.set(key, param[key]);
        });
        this.api.export_collection('v1/admin/dining_cancel_reason/export?' + httpParams.toString()).subscribe({
          next: (blob: Blob) => {
            this.util.stop(spinnerRef);
            if (exportOption != 'raw') {
              const fileName = exportOption == 'excel' ? 'DiningCancellationReason.xlsx' : 'DiningCancellationReason.csv';
              this.api.download_export_file(blob, fileName);
            } else {
              const fileName = 'diningcancellationreasons.json';
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
      } else if (kind == 'dining_instructions') {
        const spinnerRef = this.util.start();
        const param: any = {
          'type': exportOption,
          'search': this.searchQueryInstruction,
        };
        let httpParams = new HttpParams();
        Object.keys(param).forEach((key: any) => {
          httpParams = httpParams.set(key, param[key]);
        });
        this.api.export_collection('v1/admin/dining_notice/export?' + httpParams.toString()).subscribe({
          next: (blob: Blob) => {
            this.util.stop(spinnerRef);
            if (exportOption != 'raw') {
              const fileName = exportOption == 'excel' ? 'DiningInstructions.xlsx' : 'DiningInstructions.csv';
              this.api.download_export_file(blob, fileName);
            } else {
              const fileName = 'diningtnotices.json';
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
  }

  importCollection(kind: string) {
    console.log(kind);
    this.router.navigate(['admin/import-export-management/import-collection/', kind]);
  }

  onSearchCategory() {
    console.log(`on search ${this.searchQueryCategory}`);
    this.pageSizeCategory = 5;
    this.currentPageCategory = 0;
    this.paginatorCategory.firstPage();
    this.getDiningCategoryList();
  }

  onSearchCancellation() {
    console.log(`on search ${this.searchQueryCancellation}`);
    this.pageSizeReason = 5;
    this.currentPageReason = 0;
    this.paginatorReasons.firstPage();
    this.getCancellationList();
  }

  onSearchInstruction() {
    console.log(`on search ${this.searchQueryInstruction}`);
    this.pageSizeNotice = 5;
    this.currentPageNotice = 0;
    this.paginatorNotice.firstPage();
    this.getDiningNoticeList();
  }

}
