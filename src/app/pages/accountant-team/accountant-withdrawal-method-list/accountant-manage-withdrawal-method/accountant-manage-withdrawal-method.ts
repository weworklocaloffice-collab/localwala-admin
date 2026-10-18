import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { Location } from '@angular/common';
import { AccountantMediaImagesDialog } from 'src/app/pages/accountant-team/accountant-media-images-dialog/accountant-media-images-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-accountant-manage-withdrawal-method',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './accountant-manage-withdrawal-method.html',
})
export class AccountantManageWithdrawalMethod {

  action: string = 'add';
  id: string = '';
  methodForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    formElement: new FormArray<FormGroup>([]),
    isDefault: new FormControl(false, [Validators.required]),
    translations: new FormArray([]),
  });
  haveSubmitClicked: boolean = false;
  languages: any[] = [];
  translations: any[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private location: Location
  ) {
    this.action = this.route.snapshot.paramMap.get('id') ? 'edit' : 'add';
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id && this.action == 'edit') {
      this.getDetail();
    } else {
      this.locale();
      this.addFormField();
    }
  }

  addFormField() {
    const formElementArray = this.methodForm.get('formElement') as FormArray;
    formElementArray.push(this.fb.group({ isRequired: new FormControl(true), fieldType: new FormControl('text'), fieldName: new FormControl('', Validators.required), placeholder: new FormControl('', Validators.required) }));
  }

  removeFormField(index: number) {
    console.log(index);
    this.methodForm.controls['formElement'].removeAt(index);
  }

  getDetail() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/accountant/withdrawal_method_detail/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success === true && response.method && response.method.id == this.id) {
          console.log('OK');
          const info = response.method;
          this.methodForm.controls['name'].setValue(info.name);
          this.methodForm.controls['image'].setValue(info.image);
          this.methodForm.controls['isDefault'].setValue(info.isDefault);
          if (info && info.translations && info.translations instanceof Array) {

            this.translations = info.translations;
            this.locale();
          }

          if (info && info.formElement && info.formElement instanceof Array) {
            console.log('yes have formElement');
            const formElement = info.formElement;
            const formElementArray = this.methodForm.get('formElement') as FormArray;
            formElement.forEach((element: any) => {
              formElementArray.push(this.fb.group({
                isRequired: new FormControl(element.isRequired == true || element.isRequired == 'true' ? true : false),
                fieldType: new FormControl(element.fieldType),
                fieldName: new FormControl(`${element.fieldName}`, Validators.required),
                placeholder: new FormControl(`${element.placeholder}`, Validators.required),
              }));
            });
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'accountant');
      }
    });
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
        };
        this.languages.push(locale);
      });
      this.languages.forEach((locale) => {
        this.translations.forEach((translate) => {
          if (locale.code == translate.code) {
            locale.title = translate.title;
          }
        });
      });
    }
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    const locale = this.methodForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], title: [element.title] }));
    });
    console.log(this.methodForm);
    console.log(this.methodForm.getRawValue());
    if (this.methodForm.valid) {
      console.log('on submit');
      if (this.action == 'add') {
        this.saveMethod();
      } else {
        this.updateMethod();
      }
    }
  }

  saveMethod() {
    console.log('on save');
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/accountant/create_withdrawal_method', this.methodForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_withdrawal_method_added');
        this.location.back();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'accountant');
      }
    });
  }

  updateMethod() {
    console.log('on update');
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/accountant/update_withdrawal_method/' + this.id, this.methodForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_withdrawal_method_updated');
        this.location.back();
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'accountant');
      }
    });
  }

  onReset() {
    console.log('reset');
    this.methodForm.reset();
    this.formElement.clear();
    this.translationsFormEelement.clear();
    this.haveSubmitClicked = false;
    const clearLocaleMap = this.languages.map((item) => {
      item.title = '';
      return item;
    });
    this.methodForm.controls['isDefault'].setValue(false);
    this.languages = clearLocaleMap;
    this.addFormField();
  }

  get f() {
    return this.methodForm.controls;
  }

  get formElement(): FormArray {
    return this.methodForm.get('formElement') as FormArray;
  }

  get translationsFormEelement(): FormArray {
    return this.methodForm.get('translations') as FormArray;
  }

  onImageClick() {
    const dialogRef = this.dialog.open(AccountantMediaImagesDialog, {
      data: { value: this.methodForm.controls['image'].value },
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
        this.methodForm.controls['image'].setValue(result.data);
      }
    });
  }

  get formFields(): FormArray<FormGroup> {
    return this.methodForm.controls.formElement as FormArray<FormGroup>;
  }
}
