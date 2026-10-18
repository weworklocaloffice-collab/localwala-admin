import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-firebase-sms-provider',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './firebase-sms-provider.html',
})
export class FirebaseSmsProvider {

  action: string = 'add';
  smsProviderForm = new FormGroup({
    slug: new FormControl('', [Validators.required]),
    isDefault: new FormControl(false, [Validators.required]),
    credentials: new FormGroup({
      apiKey: new FormControl('', [Validators.required]),
      authDomain: new FormControl('', [Validators.required]),
      projectId: new FormControl('', [Validators.required]),
      storageBucket: new FormControl('', [Validators.required]),
      messagingSenderId: new FormControl('', [Validators.required]),
      appId: new FormControl('', [Validators.required]),
      measurementId: new FormControl('', [Validators.required]),
    }),
  });
  haveSubmitClicked: boolean = false;
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
  ) {
    this.getCountryCodes();
    this.demoForm.controls['countryCode'].setValue(this.api.defaultCountryCode);
    this.smsProviderForm.controls['slug'].patchValue('firebase');
    this.getDetail();

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
          console.log(defaultCountryCode);
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
    console.log(event);
    if (event && event.option && event.option.value) {
      const splitString = event.option.value.split(' ');
      console.log(splitString);
      if (splitString && splitString instanceof Array && splitString.length) {
        this.demoForm.controls['countryCode'].setValue(splitString[1]);
      }
    }
  }

  getDetail() {
    console.log(this.smsProviderForm.getRawValue());
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/sms_provider/get/' + this.smsProviderForm.value.slug).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.id) {
          this.action = 'edit';
          this.smsProviderForm.controls['isDefault'].setValue(response.isDefault);
          if (response && response.credentials && response.credentials instanceof Object) {
            const creds = response.credentials;
            console.log(creds);
            this.smsProviderForm.controls['credentials'].controls['apiKey'].setValue(creds && creds.apiKey ? creds.apiKey : '');
            this.smsProviderForm.controls['credentials'].controls['appId'].setValue(creds && creds.appId ? creds.appId : '');
            this.smsProviderForm.controls['credentials'].controls['authDomain'].setValue(creds && creds.authDomain ? creds.authDomain : '');
            this.smsProviderForm.controls['credentials'].controls['measurementId'].setValue(creds && creds.measurementId ? creds.measurementId : '');
            this.smsProviderForm.controls['credentials'].controls['messagingSenderId'].setValue(creds && creds.messagingSenderId ? creds.messagingSenderId : '');
            this.smsProviderForm.controls['credentials'].controls['projectId'].setValue(creds && creds.projectId ? creds.projectId : '');
            this.smsProviderForm.controls['credentials'].controls['storageBucket'].setValue(creds && creds.storageBucket ? creds.storageBucket : '');
          }
        }
      }, error: (error: any) => {
        console.log(error);
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
    console.log('on submit');
    console.log(this.smsProviderForm);
    console.log(this.smsProviderForm.getRawValue());
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
    console.log('On Save');
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/admin/sms_provider/save', this.smsProviderForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
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
    console.log('On Update');
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/admin/sms_provider/update/' + this.smsProviderForm.value.slug, this.smsProviderForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_sms_setting_updated');
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onReset() {
    console.log('On Reset');
    this.smsProviderForm.patchValue({
      slug: '',
      isDefault: false,
      credentials: {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
        measurementId: ''
      }
    });
    this.demoForm.reset();
    this.haveSubmitClicked = false;
    this.haveDemoSubmitClicked = false;
    this.demoForm.controls['countryCode'].setValue(this.api.defaultCountryCode);
    this.smsProviderForm.controls['slug'].patchValue('firebase');
    console.log(this.smsProviderForm.getRawValue());
  }

  async onDemoSubmit() {
    console.log('on submit');
    console.log(this.demoForm);
    console.log(this.demoForm.getRawValue());
    this.haveDemoSubmitClicked = true;
    if (this.demoForm.valid) {
      const locale = this.util.getItem('_appLocale');
      const param: any = {
        'mobile': `${this.demoForm.controls['countryCode'].value}${this.demoForm.controls['mobile'].value}`,
        'locale': locale,
        'redirect': window.location.href,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      const webURL = `${this.api.baseUrl}v1/public/sms_provider/demo_firebase?${httpParams.toString()}`;
      window.location.href = webURL;
    }
  }

}
