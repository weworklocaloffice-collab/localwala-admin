import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormArray, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { Clipboard } from '@angular/cdk/clipboard';
import { DialogAdminTiffinSubscriptionTimeslot } from 'src/app/pages/admin/order-management/admin-tiffin-subscription-management/admin-tiffin-subscription-package-list/manage-admin-tiffin-subscription-package/dialog-admin-tiffin-subscription-timeslot/dialog-admin-tiffin-subscription-timeslot';
import { MatDialog } from '@angular/material/dialog';
import { AdminSlotListForSubscriptionTiffinInterface } from 'src/app/interfaces/admin.slot.list.for.subscription.tiffin.interface';
import { AdminSubscriptionTiffinNoticeInterface } from 'src/app/interfaces/admin.subscription.tiffin.notice.interface';
import { DialogAdminTiffinSubscriptionNotice } from 'src/app/pages/admin/order-management/admin-tiffin-subscription-management/admin-tiffin-subscription-package-list/manage-admin-tiffin-subscription-package/dialog-admin-tiffin-subscription-notice/dialog-admin-tiffin-subscription-notice';
import { MatRadioChange } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-import-collections',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './import-collections.html',
})
export class ImportCollections {

  displayedNoticeColumn = ['name', 'action'];
  displayName: string = '';
  collectionName: string = '';
  downloadFile: string = '-';
  sampleExcel: string = '';
  emptyExcel: string = '';
  sampleCSV: string = '';
  emptyCSV: string = '';
  helper: string = 'NA';
  uploadURL: string = '';
  uploadType: string = 'excel';
  uploadFileName: string = '';
  fileTarget: any;
  withdrawalMethodForm = new FormGroup({
    formElement: new FormArray<FormGroup>([]),
  });
  withdrawalMethodFormElement: string = '';
  haveWithdrawalMethodSubmitClicked: boolean = false;
  tiffinTimeSlot: AdminSlotListForSubscriptionTiffinInterface[] = [];
  tiffinTimeSlotString: string = '';
  tiffinNotice: AdminSubscriptionTiffinNoticeInterface[] = [];
  tiffinNoticeString: string = '';
  foodForm = new FormGroup({
    variations: new FormArray<FormGroup>([]),
  });
  foodFormString: string = '';
  haveFoodSubmitClicked: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    private clipboard: Clipboard,
    private dialog: MatDialog,
  ) {
    this.collectionName = this.route.snapshot.paramMap.get('collection') ?? '';
    const indexOfCollection = this.util.collectionNames.findIndex((x) => x.key == this.collectionName);
    if (indexOfCollection != -1) {
      this.displayName = this.util.appTranslate(this.collectionName);
      this.sampleExcel = this.util.collectionNames[indexOfCollection].sampleExcel;
      this.emptyExcel = this.util.collectionNames[indexOfCollection].emptyExcel;
      this.sampleCSV = this.util.collectionNames[indexOfCollection].sampleCSV;
      this.emptyCSV = this.util.collectionNames[indexOfCollection].emptyCSV;
      this.helper = this.util.collectionNames[indexOfCollection].helper;
      this.uploadURL = this.util.collectionNames[indexOfCollection].uploadLink;
      this.addFormField();
    } else {
      this.util.onError('ts_something_went_wrong', '');
      this.onBack();
    }
  }

  onBack() {
    this.location.back();
  }

  onDownload() {
    if (this.downloadFile != '-' && this.downloadFile != '') {
      const param: any = {
        'link': this.downloadFile,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      const spinnerRef = this.util.start();
      this.api.export_collection('v1/admin/download_import_sample?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          const downloadType = this.downloadFile.includes('xlsx') ? 'excel' : 'csv';
          const downloadKind = this.downloadFile.includes('sample') ? 'sample' : 'empty';
          console.log(`Type --> ${downloadType} Kind --> ${downloadKind}`);
          const fileName = downloadType == 'excel' ? `${this.collectionName}_${downloadKind}.xlsx` : `${this.collectionName}_${downloadKind}.csv`;
          this.api.download_export_file(blob, fileName);
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  onFileSelected(event: any) {
    console.log(event);
    if (event.target.files && event.target.files[0]) {
      this.fileTarget = event.target.files[0];
      this.uploadFileName = this.fileTarget && this.fileTarget != null && this.fileTarget != '' ? this.fileTarget.name : '';
    }
  }

  uploadCollection() {
    if (this.fileTarget) {
      const spinnerRef = this.util.start('ts_uploading');
      this.api.importCollection(this.fileTarget, this.uploadType, this.uploadURL).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          if (response && response.success) {
            this.util.onSuccess(`${this.displayName} ${this.util.appTranslate('ts_imported')}`);
            this.onBack();
          }
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  addFormField() {
    const formElementArray = this.withdrawalMethodForm.get('formElement') as FormArray;
    formElementArray.push(this.fb.group({ isRequired: new FormControl(true), fieldType: new FormControl('text'), fieldName: new FormControl('', Validators.required), placeholder: new FormControl('', Validators.required) }));
  }

  removeFormField(index: number) {
    console.log(index);
    this.withdrawalMethodForm.controls['formElement'].removeAt(index);
  }

  copyclipboardWithdrawalMethodForms() {
    this.clipboard.copy(this.withdrawalMethodFormElement);
    this.util.onSuccess('ts_copied_to_clipboard');
  }

  copyclipboardTiffinTimeSlot() {
    this.clipboard.copy(this.tiffinTimeSlotString);
    this.util.onSuccess('ts_copied_to_clipboard');
  }

  copyclipboardTiffinNotice() {
    this.clipboard.copy(this.tiffinNoticeString);
    this.util.onSuccess('ts_copied_to_clipboard');
  }

  copyclipboardFoodVariation() {
    this.clipboard.copy(this.foodFormString);
    this.util.onSuccess('ts_copied_to_clipboard');
  }

  generateWithdrawalMethod() {
    this.haveWithdrawalMethodSubmitClicked = true;
    if (this.withdrawalMethodForm.valid) {
      this.withdrawalMethodFormElement = JSON.stringify(this.withdrawalMethodForm.controls['formElement'].value);
      console.log(this.withdrawalMethodFormElement);
    }
  }

  generateTiffinTimeSlot() {
    this.tiffinTimeSlotString = JSON.stringify(this.tiffinTimeSlot);
    console.log(this.tiffinTimeSlot);
  }

  generateTiffinNotice() {
    this.tiffinNoticeString = JSON.stringify(this.tiffinNotice);
    console.log(this.tiffinNoticeString);
  }

  generateFoodVariation() {
    this.haveFoodSubmitClicked = true;
    if (this.foodForm.valid) {
      this.foodFormString = JSON.stringify(this.foodForm.controls['variations'].value);
      console.log(this.foodFormString);
    }
  }

  onAddSlot() {
    console.log('add slot');
    const dialogRef = this.dialog.open(DialogAdminTiffinSubscriptionTimeslot, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add' && result.data && result.data.startTime && result.data.endTime) {
        const obj = {
          startTime: result.data.startTime,
          endTime: result.data.endTime
        };
        console.log(obj);
        this.tiffinTimeSlot.push(obj);
        this.tiffinTimeSlot = [...this.tiffinTimeSlot];
        console.log(this.tiffinTimeSlot);
      }
    });
  }

  onEditSlot(slot: AdminSlotListForSubscriptionTiffinInterface) {
    console.log('Edit Slot');
    console.log(slot);
    const dialogRef = this.dialog.open(DialogAdminTiffinSubscriptionTimeslot, {
      data: { action: 'edit', values: slot },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update' && result.data && result.data.startTime && result.data.endTime) {
        const index = this.tiffinTimeSlot.findIndex((x) => x.startTime == slot.startTime && x.endTime == slot.endTime);
        if (index != -1) {
          this.tiffinTimeSlot[index].startTime = result.data.startTime;
          this.tiffinTimeSlot[index].endTime = result.data.endTime;
          this.tiffinTimeSlot = [...this.tiffinTimeSlot];
        }
      }
    });
  }

  onDeleteSlot(slot: AdminSlotListForSubscriptionTiffinInterface) {
    console.log('Delete Slot');
    console.log(slot);
    this.tiffinTimeSlot = this.tiffinTimeSlot.filter((x) => x.startTime != slot.startTime && x.endTime != slot.endTime);
    this.tiffinTimeSlot = [...this.tiffinTimeSlot];
  }

  onAddNotice() {
    console.log('On Add Notice');
    const dialogRef = this.dialog.open(DialogAdminTiffinSubscriptionNotice, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.tiffinNotice.push(result.data);
        this.tiffinNotice = [...this.tiffinNotice];
        console.log(this.tiffinNotice);
      }
    });
  }

  onDeleteNotice(notice: AdminSubscriptionTiffinNoticeInterface) {
    console.log(notice);
    this.tiffinNotice = this.tiffinNotice.filter(x => x.name != notice.name);
    this.tiffinNotice = [...this.tiffinNotice];
  }

  onEditNotice(notice: AdminSubscriptionTiffinNoticeInterface) {
    const dialogRef = this.dialog.open(DialogAdminTiffinSubscriptionNotice, {
      data: { action: 'edit', values: notice },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        const index = this.tiffinNotice.findIndex((element) => element.name == notice.name);
        console.log(`Index --> ${index}`);
        if (index != -1) {
          this.tiffinNotice[index] = result.data;
          this.tiffinNotice = [...this.tiffinNotice];
        }
      }
    });
  }

  onAddVariation() {
    const variant = this.foodForm.get('variations') as FormArray;
    variant.push(this.fb.group({
      isRequired: new FormControl(false),
      title: new FormControl('', Validators.required),
      type: new FormControl('multi'),
      min: new FormControl('', Validators.required),
      max: new FormControl('', Validators.required),
      options: new FormArray([this.fb.group({ name: new FormControl('', Validators.required), price: new FormControl('', Validators.required), stock: new FormControl('', Validators.required) }),])
    }));
    console.log(this.foodForm);
  }

  onVariationTypeChange(event: MatRadioChange, index: number) {
    console.log(event, index);
    const variations = this.foodForm.get('variations') as FormArray;
    const minControl = variations.controls[index].get('min') as FormGroup;
    const maxControl = variations.controls[index].get('max') as FormGroup;
    console.log(minControl);
    console.log(maxControl);
    if (event && event.value == 'single') {
      minControl.clearValidators();
      maxControl.clearValidators();
      minControl.disable();
      maxControl.disable();
      minControl.updateValueAndValidity();
      maxControl.updateValueAndValidity();
    } else {
      minControl.setValidators(Validators.required);
      maxControl.setValidators(Validators.required);
      minControl.enable();
      maxControl.enable();
      minControl.updateValueAndValidity();
      maxControl.updateValueAndValidity();
    }
  }

  removeVariation(index: number) {
    console.log(index);
    this.foodForm.controls['variations'].removeAt(index);
  }

  getOptionsControl(index: number) {
    const variations = this.foodForm.get('variations') as FormArray;

    const variation = variations.at(index);
    if (!variation) return [];

    const options = variation.get('options') as FormArray | null;
    if (!options) return [];

    return options.controls;
  }

  deleteOptionFromVariations(index: number, jIndex: number) {
    console.log(index, jIndex);
    const variations = this.foodForm.get('variations') as FormArray;
    const options = variations.controls[index].get('options') as FormArray;
    options.removeAt(jIndex);
    options.updateValueAndValidity();
  }

  addOptionInVariation(index: number) {
    console.log(index);
    const variations = this.foodForm.get('variations') as FormArray;
    const options = variations.controls[index].get('options') as FormArray;
    options.push(this.fb.group({ name: ['', Validators.required], price: ['', Validators.required], stock: [{ value: '', disabled: false }, Validators.required] }))
    options.updateValueAndValidity();
  }

  getTranslatedNoticeName(item: AdminSubscriptionTiffinNoticeInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayNoticeName = (notice: string): string => {
    if (!notice) return '';
    const selected = this.tiffinNotice.find(item => item.name == notice);
    return selected ? this.getTranslatedNoticeName(selected) : '';
  };

  get variationFormFields(): FormArray<FormGroup> {
    return this.foodForm.controls.variations as FormArray<FormGroup>;
  }

  get withdrawalMethodFormFields(): FormArray<FormGroup> {
    return this.withdrawalMethodForm.controls.formElement as FormArray<FormGroup>;
  }
}
