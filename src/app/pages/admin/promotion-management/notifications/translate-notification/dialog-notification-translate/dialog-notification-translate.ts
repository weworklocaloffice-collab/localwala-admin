import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-notification-translate',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-notification-translate.html',
})
export class DialogNotificationTranslate {

  translationForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    slug: new FormControl('', [Validators.required]),
    translations: new FormArray([])
  });
  notificationTitle: string = '';
  helperText: string = '';
  helperClean: string = '';
  isSubmit: boolean = false;
  languages: any[] = [];
  translations: any[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogNotificationTranslate>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    const values = this.data.values;
    this.translationForm.controls['slug'].setValue(values && values.slug ? values.slug : '');
    this.notificationTitle = values && values.title ? values.title : '';
    this.helperText = values && values.helper ? values.helper : '';
    if (this.helperText == '{{user}}') {
      this.helperClean = this.util.appTranslate('username_lbl');
    } else if (this.helperText == '{{restaurant}}') {
      this.helperClean = this.util.appTranslate('restaurant_name');
    } else if (this.helperText == '{{driver}}') {
      this.helperClean = this.util.appTranslate('deliveryman_name');
    } else if (this.helperText == '{{admin}}') {
      this.helperClean = this.util.appTranslate('admin_name');
    } else if (this.helperText == '{{restaurant}}{{time}}') {
      this.helperClean = this.util.appTranslate('restaurant_name_and_prepare_time');
    } else if (this.helperText == '{{restaurant}}{{driver}}') {
      this.helperClean = this.util.appTranslate('restaurant_name_and_deliveryman_name');
    }
    this.getBySlug();
    this.locale();
  }

  getBySlug() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/order_notification_translation/getBySlug/' + this.translationForm.controls['slug'].value).subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        console.log(response);
        if (response && response.success == true && response.info && response.info.slug && response.info.slug == this.translationForm.controls['slug'].value) {
          const info = response.info;
          console.log('OK');
          this.translationForm.controls['title'].setValue(info.title);
          this.translationForm.controls['description'].setValue(info.description);
          if (info && info.translations && info.translations instanceof Array) {

            this.translations = info.translations;
            this.locale();
          }
        }
      }, error: ((error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      })
    });
  }

  get f() {
    return this.translationForm.controls;
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
          description: ''
        };
        this.languages.push(locale);
      });
      this.languages.forEach((locale) => {
        this.translations.forEach((translate) => {
          if (locale.code == translate.code) {
            locale.title = translate.title;
            locale.description = translate.description;
          }
        });
      });
    }
  }

  onSubmit() {
    console.log('submit', this.languages);
    const locale = this.translationForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], title: [element.title], description: [element.description] }));
    });
    console.log(this.translationForm);
    if (this.translationForm.valid) {
      this.isSubmit = true;
      this.api.post_private('v1/admin/order_notification_translation/save', this.translationForm.value).subscribe({
        next: (response: any) => {
          console.log(response);
          this.isSubmit = false
          this.util.onSuccess('ts_translation_added');
          this.dialogRef.close({ event: 'add', data: response });
        }, error: (error: any) => {
          this.isSubmit = false;
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

}
