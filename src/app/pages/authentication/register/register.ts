import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BrandingComponent } from 'src/app/layouts/full/vertical/sidebar/branding.component';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { Observable, startWith, map } from 'rxjs';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandingComponent],
  templateUrl: './register.html',
})
export class Register {

  form = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])),
    password: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    mobile: new FormControl('', [Validators.required]),
    userAgent: new FormControl('browser')
  });
  showPassword: boolean = true;
  isSubmit: boolean = false;
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();

  constructor(
    private router: Router,
    public util: UtilService,
    public api: ApiService
  ) {
    this.getCountryCodes();
    this.form.controls['countryCode'].setValue(this.api.defaultCountryCode);
  }

  getCountryCodes() {
    this.api.getLocalAssets('countryCodes.json').then((response: any) => {
      if (response) {
        this.listOfCountryCodes = response;
        this.countryCodes = this.countryCodeCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this._filterCountryCode(element) : this.listOfCountryCodes.slice()))
        );
        const defaultCountryCode = this.listOfCountryCodes.filter(x => x.dial_code == this.api.defaultCountryCode);
        console.log(defaultCountryCode);
        this.countryCodeCtrl.setValue(defaultCountryCode[0].flag + ' ' + defaultCountryCode[0].dial_code + ' ' + defaultCountryCode[0].name);
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

  get f() {
    return this.form.controls;
  }

  submit() {
    console.log(this.form);
    console.log(this.form.getRawValue());
    if (this.form.valid) {
      console.log('on login', this.form.value);
      try {
        this.isSubmit = true;
        this.api.post_public('v1/auth/register-admin-account', this.form.value).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false;
            if (response && response.auth && response.auth.id) {
              this.util.setItem('_uid', response.auth.id);
              this.util.setItem('_authEmail', response.auth.email);
              this.util.setItem('_authFirstName', response.auth.firstName);
              this.util.setItem('_authLastName', response.auth.lastName);
              this.util.setItem('_authCoverImage', response.auth.image);
              this.util.setItem('_authRole', 'admin');
              this.router.navigate(['/admin/bussiness-setup/']);
            } else {
              this.util.onError('ts_something_went_wrong', '');
            }
          }, error: (error: any) => {
            console.log(error);
            this.isSubmit = false;
            if (error && error.error && error.error.message != '') {
              const extra = error && error.error && error.error.extra && error.error.extra != null && error.error.extra != '' ? error.error.extra : '';
              this.util.onError(error.error.message, extra);
            } else {
              this.util.onError('ts_something_went_wrong', '');
            }
          }
        });
      } catch (error) {
        console.log('catch error', error);
        this.util.onError('ts_something_went_wrong', '');
      }
    }
  }

  onCountryCodeSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      const splitString = event.option.value.split(' ');
      console.log(splitString);
      if (splitString && splitString instanceof Array && splitString.length) {
        this.form.controls['countryCode'].setValue(splitString[1]);
      }
    }
  }

}
