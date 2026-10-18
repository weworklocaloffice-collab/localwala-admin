import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { AngularEditorModule } from '@kolkov/angular-editor';

@Component({
  selector: 'app-dialog-landing-page-content',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, AngularEditorModule],
  templateUrl: './dialog-landing-page-content.html',
})
export class DialogLandingPageContent {

  from: string = '';
  action: string = '';
  serviceForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    subtitle: new FormControl('', [Validators.required]),
    translations: new FormArray([])
  });

  faqsForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    subtitle: new FormControl('', [Validators.required]),
    translations: new FormArray([])
  });

  reviewForm = new FormGroup({
    image: new FormControl('', [Validators.required]),
    userName: new FormControl('', [Validators.required]),
    occupation: new FormControl('', [Validators.required]),
    star: new FormControl(5, [Validators.required]),
    message: new FormControl('', [Validators.required]),
    translations: new FormArray([])
  });

  appFeatureForm = new FormGroup({
    image: new FormControl('', [Validators.required]),
    title: new FormControl('', [Validators.required]),
    subtitle: new FormControl('', [Validators.required]),
    translations: new FormArray([])
  });

  bulletForm = new FormGroup({
    lbl: new FormControl('', [Validators.required]),
    translations: new FormArray([])
  });

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
  languages: any[] = [];
  translations: any[] = [];
  haveSubmitClicked: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogLandingPageContent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.from && this.data.from != '') {
      this.from = this.data.from;
      this.action = this.data.action;
      if (this.from == 'service') {
        const value = this.data.value;
        this.serviceForm.controls['title'].setValue(value && value.title ? value.title : '');
        this.serviceForm.controls['subtitle'].setValue(value && value.subtitle ? value.subtitle : '');
        if (value && value.translations && value.translations instanceof Array) {
          this.translations = value.translations;
        }
      } else if (this.from == 'faqs') {
        const value = this.data.value;
        this.faqsForm.controls['title'].setValue(value && value.title ? value.title : '');
        this.faqsForm.controls['subtitle'].setValue(value && value.subtitle ? this.util.htmlDecode(value.subtitle) : '');
        if (value && value.translations && value.translations instanceof Array) {
          this.translations = value.translations;
        }
      } else if (this.from == 'appfeature') {
        const value = this.data.value;
        this.appFeatureForm.controls['image'].setValue(value && value.image ? value.image : '');
        this.appFeatureForm.controls['title'].setValue(value && value.title ? value.title : '');
        this.appFeatureForm.controls['subtitle'].setValue(value && value.subtitle ? value.subtitle : '');
        if (value && value.translations && value.translations instanceof Array) {
          this.translations = value.translations;
        }
      } else if (this.from == 'review') {
        const value = this.data.value;
        this.reviewForm.controls['image'].setValue(value && value.image ? value.image : '');
        this.reviewForm.controls['message'].setValue(value && value.message ? value.message : '');
        this.reviewForm.controls['occupation'].setValue(value && value.occupation ? value.occupation : '');
        this.reviewForm.controls['star'].setValue(value && value.star ? value.star : 5);
        this.reviewForm.controls['userName'].setValue(value && value.userName ? value.userName : '');
        if (value && value.translations && value.translations instanceof Array) {
          this.translations = value.translations;
        }
      } else if (this.from == 'bullet') {
        const value = this.data.value;
        this.bulletForm.controls['lbl'].setValue(value && value.lbl ? value.lbl : '');
        if (value && value.translations && value.translations instanceof Array) {
          this.translations = value.translations;
        }
      }
    }
    this.locale();
  }

  locale() {
    if (Array.isArray(this.util.locales) && this.util.locales.length > 0) {
      this.languages = [];
      this.util.locales.forEach((element) => {
        if (this.from == 'service' || this.from == 'faqs' || this.from == 'appfeature') {
          const locale = {
            code: element.code,
            name: element.name,
            nativeName: element.nativeName,
            title: '',
            subtitle: ''
          };
          this.languages.push(locale);
        } else if (this.from == 'review' || this.from == 'bullet') {
          const locale = {
            code: element.code,
            name: element.name,
            nativeName: element.nativeName,
            value: '',
          };
          this.languages.push(locale);
        }
      });
      this.languages.forEach((locale) => {
        this.translations.forEach((translate) => {
          if (this.from == 'service' || this.from == 'faqs' || this.from == 'appfeature') {
            if (locale.code == translate.code) {
              locale.title = translate.title;
              locale.subtitle = this.from == 'faqs' ? this.util.htmlDecode(translate.subtitle) : translate.subtitle;
            }
          } else if (this.from == 'review' || this.from == 'bullet') {
            if (locale.code == translate.code) {
              locale.value = translate.value;
            }
          }
        });
      });
    }
  }

  get serviceF() {
    return this.serviceForm.controls;
  }

  get faqsF() {
    return this.serviceForm.controls;
  }

  get reviewF() {
    return this.reviewForm.controls;
  }

  get appFeatureF() {
    return this.appFeatureForm.controls;
  }

  get buttletF() {
    return this.bulletForm.controls;
  }

  onServiceSubmit() {
    this.haveSubmitClicked = true;
    const locale = this.serviceForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({
        name: [element.name],
        code: [element.code],
        nativeName: [element.nativeName],
        title: [element.title],
        subtitle: [element.subtitle],
      }));
    });
    console.log(this.serviceForm);
    console.log(this.serviceForm.getRawValue());
    if (this.serviceForm.valid) {
      console.log('OK');
      this.dialogRef.close({ event: this.action == 'create' ? 'add' : 'edit', data: this.serviceForm.getRawValue() });
    }
  }

  onFaqsSubmit() {
    this.haveSubmitClicked = true;
    const locale = this.faqsForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({
        name: [element.name],
        code: [element.code],
        nativeName: [element.nativeName],
        title: [element.title],
        subtitle: [element.subtitle],
      }));
    });
    console.log(this.faqsForm);
    console.log(this.faqsForm.getRawValue());
    if (this.faqsForm.valid) {
      console.log('OK');
      this.dialogRef.close({ event: this.action == 'create' ? 'add' : 'edit', data: this.faqsForm.getRawValue() });
    }
  }

  onReviewSubmit() {
    this.haveSubmitClicked = true;
    const locale = this.reviewForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({
        name: [element.name],
        code: [element.code],
        nativeName: [element.nativeName],
        value: [element.value],
      }));
    });
    console.log(this.reviewForm);
    console.log(this.reviewForm.getRawValue());
    if (this.reviewForm.valid) {
      console.log('OK');
      this.dialogRef.close({ event: this.action == 'create' ? 'add' : 'edit', data: this.reviewForm.getRawValue() });
    }
  }

  onBulletSubmit() {
    this.haveSubmitClicked = true;
    const locale = this.bulletForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({
        name: [element.name],
        code: [element.code],
        nativeName: [element.nativeName],
        value: [element.value],
      }));
    });
    console.log(this.bulletForm);
    console.log(this.bulletForm.getRawValue());
    if (this.bulletForm.valid) {
      console.log('OK');
      this.dialogRef.close({ event: this.action == 'create' ? 'add' : 'edit', data: this.bulletForm.getRawValue() });
    }
  }

  onAppFeatureSubmit() {
    this.haveSubmitClicked = true;
    const locale = this.appFeatureForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({
        name: [element.name],
        code: [element.code],
        nativeName: [element.nativeName],
        title: [element.title],
        subtitle: [element.subtitle],
      }));
    });
    console.log(this.appFeatureForm);
    console.log(this.appFeatureForm.getRawValue());
    if (this.appFeatureForm.valid) {
      console.log('OK');
      this.dialogRef.close({ event: this.action == 'create' ? 'add' : 'edit', data: this.appFeatureForm.getRawValue() });
    }
  }

  onImagePicker() {
    console.log('on image picker');
    const dialogRef = this.dialog.open(SelectMediaDialog, {
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
        if (this.from == 'review') {
          this.reviewForm.controls['image'].setValue(result.data);
        } else if (this.from == 'appfeature') {
          this.appFeatureForm.controls['image'].setValue(result.data);
        }
      }
    });
  }

}
