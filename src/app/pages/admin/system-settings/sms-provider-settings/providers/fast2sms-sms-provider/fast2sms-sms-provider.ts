import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, startWith, map } from 'rxjs';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-fast2sms-sms-provider',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './fast2sms-sms-provider.html',
})
export class Fast2smsSmsProvider {

  action: string = 'add';
  smsProviderForm = new FormGroup({
    slug: new FormControl('', [Validators.required]),
    isDefault: new FormControl(false, [Validators.required]),
    credentials: new FormGroup({
      apiKey: new FormControl('', [Validators.required]),
      senderId: new FormControl('', [Validators.required]),
      entityId: new FormControl(''),
      templateId: new FormControl(''),
      messageId: new FormControl(''),
      route: new FormControl('q'),
    }),
    template: new FormArray([])
  });
  haveSubmitClicked: boolean = false;
  languages: any[] = [];
  template: any[] = [];
  demoForm = new FormGroup({
    countryCode: new FormControl('', [Validators.required]),
    mobile: new FormControl('', [Validators.required]),
  });
  haveDemoSubmitClicked: boolean = false;
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
  ) {
    this.getCountryCodes();
    this.demoForm.controls['countryCode'].setValue(this.api.defaultCountryCode);
    this.smsProviderForm.controls['slug'].patchValue('fast2sms');
    this.locale();
    this.getDetail();
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
        this.template.forEach((translate) => {
          if (locale.code == translate.code) {
            locale.value = translate.value;
          }
        });
      });
    }
  }

  getCountryCodes() {
    this.api.getLocalAssets('countryCodes.json').then((response: any) => {
      if (response) {
        this.listOfCountryCodes = response;
        this.countryCodes = this.countryCodeCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this._filterCountryCode(element) : this.listOfCountryCodes.slice()))
        );

        if (this.action == 'add') {
          const defaultCountryCode = this.listOfCountryCodes.filter(x => x.dial_code == this.api.defaultCountryCode);
          this.countryCodeCtrl.setValue(defaultCountryCode[0].flag + ' ' + defaultCountryCode[0].dial_code + ' ' + defaultCountryCode[0].name);
        }
      }
    }).catch((error: any) => {
      console.log(error);
      this.util.onError('ts_something_went_wrong', '');
    });
  }

  private _filterCountryCode(value: string): CountryCodeInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCountryCodes.filter((element) =>
      element.name.toLowerCase().includes(filterValue)
    );
  }

  onCountryCodeSelect(event: MatAutocompleteSelectedEvent) {
    if (event && event.option && event.option.value) {
      const splitString = event.option.value.split(' ');
      if (splitString && splitString instanceof Array && splitString.length) {
        this.demoForm.controls['countryCode'].setValue(splitString[1]);
      }
    }
  }

  getDetail() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/sms_provider/get/' + this.smsProviderForm.value.slug).subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        if (response && response.id) {
          this.action = 'edit';
          this.smsProviderForm.controls['isDefault'].setValue(response.isDefault);
          if (response && response.credentials && response.credentials instanceof Object) {
            const creds = response.credentials;
          this.smsProviderForm.controls['credentials'].controls['apiKey'].setValue(creds && creds.apiKey ? creds.apiKey : '');
          this.smsProviderForm.controls['credentials'].controls['senderId'].setValue(creds && creds.senderId ? creds.senderId : '');
          this.smsProviderForm.controls['credentials'].controls['entityId'].setValue(creds && creds.entityId ? creds.entityId : '');
          this.smsProviderForm.controls['credentials'].controls['templateId'].setValue(creds && creds.templateId ? creds.templateId : '');
          this.smsProviderForm.controls['credentials'].controls['messageId'].setValue(creds && creds.messageId ? creds.messageId : '');
          this.smsProviderForm.controls['credentials'].controls['route'].setValue(creds && creds.route ? creds.route : 'q');
            if (response && response.template && response.template instanceof Array) {
              this.template = response.template;
              this.locale();
            }
          }
        }
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  get f() {
    return this.smsProviderForm.controls;
  }

  get fCredentials() {
    return this.smsProviderForm.controls['credentials'].controls;
  }

  get demoF() {
    return this.demoForm.controls;
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (this.smsProviderForm.valid) {
      if (this.action == 'add') {
        this.onSave();
      } else {
        this.onUpdate();
      }
    }
  }

  onSave() {
    const locale = this.smsProviderForm.get('template') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/admin/sms_provider/save', this.smsProviderForm.getRawValue()).subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_sms_setting_saved');
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
    const locale = this.smsProviderForm.get('template') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/admin/sms_provider/update/' + this.smsProviderForm.value.slug, this.smsProviderForm.getRawValue()).subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_sms_setting_updated');
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onReset() {
    this.smsProviderForm.patchValue({
      slug: '',
      isDefault: false,
      credentials: {
        apiKey: '',
        senderId: '',
        entityId: '',
        templateId: '',
        messageId: '',
        route: 'q'
      }
    });

    const templateArray = this.smsProviderForm.get('template') as FormArray;
    templateArray.clear();

    this.demoForm.reset();
    this.demoForm.controls['countryCode'].setValue(this.api.defaultCountryCode);
    this.smsProviderForm.controls['slug'].patchValue('fast2sms');
    this.haveDemoSubmitClicked = false;
    this.haveSubmitClicked = false;
    const localeMapped = this.languages.map((item) => {
      item.value = '';
      return item;
    });
    this.languages = localeMapped;
  }

  onDemoSubmit() {
    this.haveDemoSubmitClicked = true;
    if (this.demoForm.valid) {
      const toNumber = `${this.demoForm.controls.countryCode.value}${this.demoForm.controls.mobile.value}`;
      const locale = localStorage.getItem('_locale') && localStorage.getItem('_locale') != null && localStorage.getItem('_locale') != '' ? localStorage.getItem('_locale') : 'en';
      const param = {
        mobile: toNumber,
        locale: locale
      };
      const spinnerRef = this.util.start('ts_sending');
      this.api.post_private('v1/admin/sms_provider/demo_fast2sms/', param).subscribe({
        next: (response: any) => {
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_sms_sent');
          this.demoForm.reset();
          this.haveDemoSubmitClicked = false;
        }, error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        }
      });
    }
  }
}
