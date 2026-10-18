import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectMediaDialog } from 'src/app/pages/admin//media/select-media-dialog/select-media-dialog';
import { MatSelectChange } from '@angular/material/select';
import { DateTime } from 'luxon';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-add-wallet-bonus',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-add-wallet-bonus.html',
})
export class DialogAddWalletBonus {

  action: string = 'create';
  bonusForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    shortDescription: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    start: new FormControl('', [Validators.required]),
    expires: new FormControl('', [Validators.required]),
    bonusType: new FormControl('percentage', [Validators.required]),
    bonusAmount: new FormControl('', [Validators.required]),
    minWalletAmount: new FormControl('', [Validators.required]),
    maxBonusAmount: new FormControl('', [Validators.required]),
    translations: new FormArray([])
  });
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;
  id: string = '';
  languages: any[] = [];
  translations: any[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogAddWalletBonus>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      this.id = values.id;
      this.bonusForm.controls['name'].setValue(values && values.name ? values.name : '');
      this.bonusForm.controls['shortDescription'].setValue(values && values.shortDescription ? values.shortDescription : '');
      this.bonusForm.controls['image'].setValue(values && values.image ? values.image : '');
      const startDate = DateTime.fromISO(values.start).toFormat('yyyy-MM-dd');
      const endDate = DateTime.fromISO(values.expires).toFormat('yyyy-MM-dd');
      console.log(startDate, endDate);
      this.bonusForm.controls['start'].setValue(startDate);
      this.bonusForm.controls['expires'].setValue(endDate);
      this.bonusForm.controls['bonusType'].setValue(values && values.bonusType ? values.bonusType : '');
      this.bonusForm.controls['bonusAmount'].setValue(values && values.bonusAmount ? values.bonusAmount : '');
      this.bonusForm.controls['minWalletAmount'].setValue(values && values.minWalletAmount ? values.minWalletAmount : '');
      this.bonusForm.controls['maxBonusAmount'].setValue(values && values.maxBonusAmount ? values.maxBonusAmount : '');
      if (values.bonusType == 'amount') {
        this.bonusForm.controls['maxBonusAmount'].clearValidators();
        this.bonusForm.controls['maxBonusAmount'].disable();
      } else {
        this.bonusForm.controls['maxBonusAmount'].setValidators([Validators.required]);
        this.bonusForm.controls['maxBonusAmount'].enable();
      }
      if (values && values.translations && values.translations instanceof Array) {
        this.translations = values.translations;
      }
    }
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
          shortDescription: '',
        };
        this.languages.push(locale);
      });
      this.languages.forEach((locale) => {
        this.translations.forEach((translate) => {
          if (locale.code == translate.code) {
            locale.title = translate.title;
            locale.shortDescription = translate.shortDescription;
          }
        });
      });
    }
  }

  get f() {
    return this.bonusForm.controls;
  }

  onSubmit() {
    console.log('submit', this.action, this.languages, this.bonusForm);
    const locale = this.bonusForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({
        name: [element.name],
        code: [element.code],
        nativeName: [element.nativeName],
        title: [element.title],
        shortDescription: [element.shortDescription],
      }));
    });
    this.isFormSubmit = true;
    if (this.bonusForm.valid) {
      if (this.action == 'create') {
        this.isSubmit = true;
        this.api.post_private('v1/admin/wallet/bonus/save', this.bonusForm.getRawValue()).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false
            this.util.onSuccess('ts_bonus_added');
            this.dialogRef.close({ event: 'add', data: response });
          }, error: (error: any) => {
            this.isSubmit = false;
            this.util.handleError(error, 'admin');
          }
        });
      } else {
        this.isSubmit = true;
        this.api.patch_private('v1/admin/wallet/bonus/update/' + this.id, this.bonusForm.getRawValue()).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false
            this.util.onSuccess('ts_bonus_updated');
            this.dialogRef.close({ event: 'update', data: response });
          }, error: (error: any) => {
            this.isSubmit = false;
            this.util.handleError(error, 'admin');
          }
        });
      }
    }
  }

  onImagePicker() {
    console.log('on image picker');
    const dialogRef = this.dialog.open(SelectMediaDialog, {
      data: { value: this.bonusForm.controls['image'].value },
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
        this.bonusForm.controls['image'].setValue(result.data);
      }
    });
  }

  discountChanged(event: MatSelectChange) {
    console.log(event);
    if (event.value == 'amount') {
      this.bonusForm.controls['maxBonusAmount'].clearValidators();
      this.bonusForm.controls['maxBonusAmount'].disable();
    } else {
      this.bonusForm.controls['maxBonusAmount'].setValidators([Validators.required]);
      this.bonusForm.controls['maxBonusAmount'].enable();
    }
  }

}
