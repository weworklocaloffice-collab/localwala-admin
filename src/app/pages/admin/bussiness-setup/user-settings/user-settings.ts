import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogUserAccountDeleteReason } from './dialog-user-account-delete-reason/dialog-user-account-delete-reason';
import { AdminAccountDeleteReasonInterface } from 'src/app/interfaces/admin.account.delete.reason.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-user-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './user-settings.html',
})
export class UserSettings {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  reason = new MatTableDataSource<AdminAccountDeleteReasonInterface>([]);
  displayedReasonColumn = ['name', 'type', 'status', 'action'];
  action: string = 'add';
  id: string = '';
  settingForm = new FormGroup({
    canEarnBuyFromWallet: new FormControl(false),
    refundToWallet: new FormControl(false),
    canAddFundToWallet: new FormControl(false),
    canEarnBuyFromReferral: new FormControl(false),
    earnPerReferral: new FormControl({ value: 0, disabled: true }),
    referralLimit: new FormControl({ value: 0, disabled: true }),
    whoEarnReferral: new FormControl({ value: 'both', disabled: true }),
    referralTitle: new FormControl({ value: '', disabled: true }),
    referralMessage: new FormControl({ value: '', disabled: true }),
    referralTranslations: new FormArray([]),
    userLoginWith: new FormControl('email_password'),
    userResetPasswordWith: new FormControl('email_otp'),
    signUpVerification: new FormControl(false),
    signUpVerifyWith: new FormControl({ value: 'email_otp', disabled: true }),
    canEarnLoyaltyPointOnOrder: new FormControl(false),
    loyaltyMinOrderTotal: new FormControl({ value: 0, disabled: true }),
    loyaltyPointValue: new FormControl({ value: 0, disabled: true }),
    minLoyaltyPointToRedeem: new FormControl({ value: 0, disabled: true }),
    priceOfOneLoyaltyPoint: new FormControl({ value: 0, disabled: true }),
  });
  haveSubmitClicked: boolean = false;
  languages: any[] = [];
  translations: any[] = [];
  pageSizeReason: number = 5;
  currentPageReason: number = 0;
  isReasonLoaded: boolean = false;
  exportType: string = 'export';
  searchQuery: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.getData();
    this.locale();
  }

  locale() {
    if (Array.isArray(this.util.locales) && this.util.locales.length > 0) {
      this.languages = [];
      this.util.locales.forEach((element) => {
        const locale = {
          code: element.code,
          name: element.name,
          nativeName: element.nativeName,
          title: '',
          message: '',
        };
        this.languages.push(locale);
      });
      this.languages.forEach((locale) => {
        this.translations.forEach((translate) => {
          if (locale.code == translate.code) {
            locale.title = translate.title;
            locale.message = translate.message;
          }
        });
      });
    }
  }

  getData() {
    this.isReasonLoaded = false;
    const spinnerRef = this.util.start('ts_fetching');
    const param: any = {
      'limit': this.pageSizeReason,
      'page': this.currentPageReason,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/user_settings/get?' + httpParams.toString()).subscribe({
      next: (detail: any) => {
        console.log(detail);
        this.isReasonLoaded = true;
        this.util.stop(spinnerRef);
        const response = detail.settings;
        if (response && response.id) {
          this.id = response.id;
          this.action = 'edit';
          this.settingForm.controls['canAddFundToWallet'].setValue(response.canAddFundToWallet);
          this.settingForm.controls['canEarnBuyFromReferral'].setValue(response.canEarnBuyFromReferral);
          this.settingForm.controls['canEarnBuyFromWallet'].setValue(response.canEarnBuyFromWallet);
          this.settingForm.controls['canEarnLoyaltyPointOnOrder'].setValue(response.canEarnLoyaltyPointOnOrder);
          this.settingForm.controls['earnPerReferral'].setValue(response.earnPerReferral);
          this.settingForm.controls['referralLimit'].setValue(response.referralLimit);
          this.settingForm.controls['whoEarnReferral'].setValue(response.whoEarnReferral);
          this.settingForm.controls['referralTitle'].setValue(response.referralTitle);
          this.settingForm.controls['referralMessage'].setValue(response.referralMessage);
          this.settingForm.controls['loyaltyMinOrderTotal'].setValue(response.loyaltyMinOrderTotal);
          this.settingForm.controls['loyaltyPointValue'].setValue(response.loyaltyPointValue);
          this.settingForm.controls['minLoyaltyPointToRedeem'].setValue(response.minLoyaltyPointToRedeem);
          this.settingForm.controls['priceOfOneLoyaltyPoint'].setValue(response.priceOfOneLoyaltyPoint);
          this.settingForm.controls['refundToWallet'].setValue(response.refundToWallet);
          this.settingForm.controls['signUpVerification'].setValue(response.signUpVerification);
          this.settingForm.controls['signUpVerifyWith'].setValue(response.signUpVerifyWith);
          this.settingForm.controls['userLoginWith'].setValue(response.userLoginWith);
          this.settingForm.controls['userResetPasswordWith'].setValue(response.userResetPasswordWith);

          if (response && response.signUpVerification == true) {
            this.settingForm.controls['signUpVerifyWith'].enable();
            this.settingForm.controls['signUpVerifyWith'].setValidators([Validators.required]);
          } else {
            this.settingForm.controls['signUpVerifyWith'].disable();
            this.settingForm.controls['signUpVerifyWith'].clearValidators();
          }

          if (response && response.canEarnLoyaltyPointOnOrder === true) {
            this.settingForm.controls['loyaltyMinOrderTotal'].enable();
            this.settingForm.controls['loyaltyMinOrderTotal'].setValidators([Validators.required]);
            this.settingForm.controls['loyaltyPointValue'].enable();
            this.settingForm.controls['loyaltyPointValue'].setValidators([Validators.required]);
            this.settingForm.controls['minLoyaltyPointToRedeem'].enable();
            this.settingForm.controls['minLoyaltyPointToRedeem'].setValidators([Validators.required]);
            this.settingForm.controls['priceOfOneLoyaltyPoint'].enable();
            this.settingForm.controls['priceOfOneLoyaltyPoint'].setValidators([Validators.required]);
          } else {
            this.settingForm.controls['loyaltyMinOrderTotal'].disable();
            this.settingForm.controls['loyaltyMinOrderTotal'].clearValidators();
            this.settingForm.controls['loyaltyPointValue'].disable();
            this.settingForm.controls['loyaltyPointValue'].clearValidators();
            this.settingForm.controls['minLoyaltyPointToRedeem'].disable();
            this.settingForm.controls['minLoyaltyPointToRedeem'].clearValidators();
            this.settingForm.controls['priceOfOneLoyaltyPoint'].disable();
            this.settingForm.controls['priceOfOneLoyaltyPoint'].clearValidators();
          }
          if (response && response.canEarnBuyFromReferral == true) {
            this.settingForm.controls['earnPerReferral'].enable();
            this.settingForm.controls['earnPerReferral'].setValidators([Validators.required]);
            this.settingForm.controls['referralLimit'].enable();
            this.settingForm.controls['referralLimit'].setValidators([Validators.required]);
            this.settingForm.controls['referralTitle'].enable();
            this.settingForm.controls['referralTitle'].setValidators([Validators.required]);
            this.settingForm.controls['referralMessage'].enable();
            this.settingForm.controls['referralMessage'].setValidators([Validators.required]);
            this.settingForm.controls['whoEarnReferral'].enable();
            this.settingForm.controls['whoEarnReferral'].setValidators([Validators.required]);
          } else {
            this.settingForm.controls['earnPerReferral'].disable();
            this.settingForm.controls['earnPerReferral'].clearValidators();
            this.settingForm.controls['referralLimit'].disable();
            this.settingForm.controls['referralLimit'].clearValidators();
            this.settingForm.controls['referralTitle'].disable();
            this.settingForm.controls['referralTitle'].clearValidators();
            this.settingForm.controls['referralMessage'].disable();
            this.settingForm.controls['referralMessage'].clearValidators();
            this.settingForm.controls['whoEarnReferral'].disable();
            this.settingForm.controls['whoEarnReferral'].clearValidators();
          }

          if (
            response &&
            response.referralTranslations &&
            response.referralTranslations instanceof Array
          ) {

            this.translations = response.referralTranslations;
            this.locale();
          }
        }

        if (detail && detail.reasons && detail.reasons.results) {
          const mappedList = detail.reasons.results.map(
            (item: AdminAccountDeleteReasonInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.reason = new MatTableDataSource<AdminAccountDeleteReasonInterface>(mappedList);
          console.log(this.reason);
          this.paginator.length = detail.reasons.totalResults;
          this.paginator.hidePageSize = detail.reasons.totalResults <= 0 ? true : false;
        }
      },
      error: (error: any) => {
        console.log(error);
        this.isReasonLoaded = true;
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      },
    });
  }

  onSubmit() {
    console.log('on submit');
    console.log(this.settingForm);
    console.log(this.settingForm.getRawValue());
    this.haveSubmitClicked = true;
    const locale = this.settingForm.get('referralTranslations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(
        this.fb.group({
          name: [element.name],
          code: [element.code],
          nativeName: [element.nativeName],
          title: [element.title],
          message: [element.message],
        })
      );
    });
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
    this.api.post_private('v1/admin/user_settings/save', this.settingForm.getRawValue())
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_user_setting_saved');
          if (response && response.id) {
            this.id = response.id;
            this.action = 'edit';
          }
        },
        error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        },
      });
  }

  onUpdate() {
    console.log('on update');
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/admin/user_settings/update/' + this.id, this.settingForm.getRawValue())
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_user_setting_updated');
        },
        error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        },
      });
  }

  onReset() {
    console.log('reset');
    const referralArray = this.settingForm.get('referralTranslations') as FormArray;
    referralArray.clear();
    this.settingForm.patchValue({
      canEarnBuyFromWallet: false,
      refundToWallet: false,
      canAddFundToWallet: false,
      canEarnBuyFromReferral: false,
      earnPerReferral: 0,
      referralLimit: 0,
      whoEarnReferral: 'both',
      referralTitle: '',
      referralMessage: '',
      userLoginWith: 'email_password',
      userResetPasswordWith: 'email_otp',
      signUpVerification: false,
      signUpVerifyWith: 'email_otp',
      canEarnLoyaltyPointOnOrder: false,
      loyaltyMinOrderTotal: 0,
      loyaltyPointValue: 0,
      minLoyaltyPointToRedeem: 0,
      priceOfOneLoyaltyPoint: 0,
    });
    this.settingForm.get('earnPerReferral')?.disable();
    this.settingForm.get('referralLimit')?.disable();
    this.settingForm.get('whoEarnReferral')?.disable();
    this.settingForm.get('referralTitle')?.disable();
    this.settingForm.get('referralMessage')?.disable();
    this.settingForm.get('signUpVerifyWith')?.disable();
    this.settingForm.get('loyaltyMinOrderTotal')?.disable();
    this.settingForm.get('loyaltyPointValue')?.disable();
    this.settingForm.get('minLoyaltyPointToRedeem')?.disable();
    this.settingForm.get('priceOfOneLoyaltyPoint')?.disable();
    this.haveSubmitClicked = false;
    const localeMapped = this.languages.map((item) => {
      item.title = '';
      item.message = '';
      return item;
    });
    this.languages = localeMapped;
  }

  get f() {
    return this.settingForm.controls;
  }

  onSignupVerifyChange(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == true) {
      this.settingForm.controls['signUpVerifyWith'].enable();
      this.settingForm.controls['signUpVerifyWith'].setValidators([Validators.required]);
    } else {
      this.settingForm.controls['signUpVerifyWith'].disable();
      this.settingForm.controls['signUpVerifyWith'].clearValidators();
    }
  }

  onLoyaltyPointChange(event: MatSelectChange) {
    console.log(event);
    if (event && event.value === true) {
      this.settingForm.controls['loyaltyMinOrderTotal'].enable();
      this.settingForm.controls['loyaltyMinOrderTotal'].setValidators([Validators.required]);
      this.settingForm.controls['loyaltyPointValue'].enable();
      this.settingForm.controls['loyaltyPointValue'].setValidators([Validators.required]);
      this.settingForm.controls['minLoyaltyPointToRedeem'].enable();
      this.settingForm.controls['minLoyaltyPointToRedeem'].setValidators([Validators.required]);
      this.settingForm.controls['priceOfOneLoyaltyPoint'].enable();
      this.settingForm.controls['priceOfOneLoyaltyPoint'].setValidators([Validators.required]);
    } else {
      this.settingForm.controls['loyaltyMinOrderTotal'].disable();
      this.settingForm.controls['loyaltyMinOrderTotal'].clearValidators();
      this.settingForm.controls['loyaltyPointValue'].disable();
      this.settingForm.controls['loyaltyPointValue'].clearValidators();
      this.settingForm.controls['minLoyaltyPointToRedeem'].disable();
      this.settingForm.controls['minLoyaltyPointToRedeem'].clearValidators();
      this.settingForm.controls['priceOfOneLoyaltyPoint'].disable();
      this.settingForm.controls['priceOfOneLoyaltyPoint'].clearValidators();
    }
  }

  onReferralChange(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == true) {
      this.settingForm.controls['earnPerReferral'].enable();
      this.settingForm.controls['earnPerReferral'].setValidators([Validators.required]);
      this.settingForm.controls['referralLimit'].enable();
      this.settingForm.controls['referralLimit'].setValidators([Validators.required]);
      this.settingForm.controls['referralTitle'].enable();
      this.settingForm.controls['referralTitle'].setValidators([Validators.required]);
      this.settingForm.controls['referralMessage'].enable();
      this.settingForm.controls['referralMessage'].setValidators([Validators.required]);
      this.settingForm.controls['whoEarnReferral'].enable();
      this.settingForm.controls['whoEarnReferral'].setValidators([Validators.required]);
    } else {
      this.settingForm.controls['earnPerReferral'].disable();
      this.settingForm.controls['earnPerReferral'].clearValidators();
      this.settingForm.controls['referralLimit'].disable();
      this.settingForm.controls['referralLimit'].clearValidators();
      this.settingForm.controls['referralTitle'].disable();
      this.settingForm.controls['referralTitle'].clearValidators();
      this.settingForm.controls['referralMessage'].disable();
      this.settingForm.controls['referralMessage'].clearValidators();
      this.settingForm.controls['whoEarnReferral'].disable();
      this.settingForm.controls['whoEarnReferral'].clearValidators();
    }
  }

  getUserDeleteAccountReasonList() {
    this.isReasonLoaded = false;
    const param: any = {
      'limit': this.pageSizeReason,
      'page': this.currentPageReason,
      'search': this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/delete_account_reason_list?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isReasonLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminAccountDeleteReasonInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.reason = new MatTableDataSource<AdminAccountDeleteReasonInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isReasonLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPageReason = event.pageIndex + 1;
    this.pageSizeReason = event.pageSize;
    this.getUserDeleteAccountReasonList();
  }


  onUserDeleteAccountReason() {
    const dialogRef = this.dialog.open(DialogUserAccountDeleteReason, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getUserDeleteAccountReasonList();
      }
    });
  }


  onDeleteReasonStatusChange(event: MatSlideToggleChange, reason: AdminAccountDeleteReasonInterface) {
    console.log(event);
    console.log(reason);
    reason.status = event.checked;
    this.api.patch_private('v1/admin/update_delete_account_reason/' + reason.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onEditReason(reason: AdminAccountDeleteReasonInterface) {
    console.log(reason);
    const dialogRef = this.dialog.open(DialogUserAccountDeleteReason, {
      data: { action: 'edit', values: reason },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getUserDeleteAccountReasonList();
      }
    });
  }

  onDeleteReason(reason: AdminAccountDeleteReasonInterface) {
    console.log(reason);
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_reason_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/drop_delete_account_reason/' + reason.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getUserDeleteAccountReasonList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'admin');
          }
        });
      }
    });
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      const spinnerRef = this.util.start();
      const param: any = {
        'type': exportOption,
        'search': this.searchQuery,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/delete_account_reason_list/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'DeleteAccountReasons.xlsx' : 'DeleteAccountReasons.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'userdeleteaccountreasons.json';
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

  importCollection() {
    this.router.navigate(['admin/import-export-management/import-collection/', 'delete_account_reason']);
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSizeReason = 5;
    this.currentPageReason = 0;
    this.paginator.firstPage();
    this.getUserDeleteAccountReasonList();
  }

}
