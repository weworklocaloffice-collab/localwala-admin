import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { AngularEditorModule } from '@kolkov/angular-editor';

@Component({
  selector: 'app-project-page-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, AngularEditorModule],
  templateUrl: './project-page-form.html',
})
export class ProjectPageForm {

  @Input() slug: string;
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: "15rem",
    minHeight: "5rem",
    placeholder: "Enter text here...",
    translate: "no",
    defaultParagraphSeparator: "p",
    defaultFontName: "Arial",
    sanitize: true,
    toolbarHiddenButtons: [
      ['insertImage', 'insertVideo']
    ]
  };

  action: string = 'add';
  pageForm = new FormGroup({
    description: new FormControl('', [Validators.required]),
    slug: new FormControl('', [Validators.required]),
    translations: new FormArray([])
  });
  pageTitle: string = '';
  haveSubmitClicked: boolean = false;
  languages: any[] = [];
  translations: any[] = [];
  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
  ) {
    this.config.placeholder = this.util.appTranslate('enter_text_here');
  }

  ngOnInit() {
    console.log('slug->', this.slug);
    if (this.slug == 'about-us') {
      this.pageTitle = this.util.appTranslate('about_us');
    } else if (this.slug == 'privacy-policy') {
      this.pageTitle = this.util.appTranslate('privacy_policy');
    } else if (this.slug == 'terms-and-conditions') {
      this.pageTitle = this.util.appTranslate('terms_and_conditions');
    } else if (this.slug == 'refund-policy') {
      this.pageTitle = this.util.appTranslate('refund_policy');
    } else if (this.slug == 'shipping-policy') {
      this.pageTitle = this.util.appTranslate('shipping_policy');
    } else if (this.slug == 'cancellation-policy') {
      this.pageTitle = this.util.appTranslate('cancellation_policy');
    } else if (this.slug == 'cookies') {
      this.pageTitle = this.util.appTranslate('cookies');
    } else if (this.slug == 'help') {
      this.pageTitle = this.util.appTranslate('help');
    } else if (this.slug == 'frequently-asked-questions') {
      this.pageTitle = this.util.appTranslate('faqs');
    } else if (this.slug == 'dining-frequently-asked-questions') {
      this.pageTitle = this.util.appTranslate('dining_faqs');
    }
    this.pageForm.controls['slug'].patchValue(this.slug);
    this.getDetails();
  }


  locale() {
    if (Array.isArray(this.util.locales) && this.util.locales.length > 0) {
      this.languages = [];
      this.util.locales.forEach((element) => {
        const locale = {
          code: element.code,
          name: element.name,
          nativeName: element.nativeName,
          value: ''
        };
        this.languages.push(locale);
      });
      this.languages.forEach((locale) => {
        this.translations.forEach((translate) => {
          if (locale.code == translate.code) {
            locale.value = this.util.htmlDecode(translate.value)
          }
        });
      });
    }
  }

  getDetails() {
    console.log('get details', this.slug);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/app_pages/get/' + this.slug).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.id) {
          this.action = 'edit';
          this.pageForm.controls['description'].setValue(this.util.htmlDecode(response.description));
          if (response && response.translations && response.translations instanceof Array) {
            this.translations = response.translations;
          }
        }
        this.locale();
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onSubmit() {
    console.log('on submit');
    console.log(this.pageForm);
    console.log(this.pageForm.getRawValue());
    this.haveSubmitClicked = true;
    if (this.pageForm.valid) {
      if (this.action == 'add') {
        this.onSave();
      } else {
        this.onUpdate();
      }
    }
  }

  onSave() {
    console.log('on save');
    const locale = this.pageForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/admin/app_pages/save', this.pageForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_content_saved');
        if (response && response.id) {
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
    const locale = this.pageForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/admin/app_pages/update/' + this.slug, this.pageForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_content_updated');
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onReset() {
    console.log('on reset');
    const translationsArray = this.pageForm.get('translations') as FormArray;
    translationsArray.clear();
    this.pageForm.patchValue({
      description: '',
    });
    this.pageForm.controls['slug'].patchValue(this.slug);
    const localeMapped = this.languages.map((item) => {
      item.value = '';
      return item;
    });
    this.languages = localeMapped;
    console.log(this.pageForm.getRawValue());
  }

}
