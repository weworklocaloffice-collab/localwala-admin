import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, map, startWith } from 'rxjs';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-pos-new-customer-dialog',
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, NgIcon],
  templateUrl: './cityzen-pos-new-customer-dialog.html',
})
export class CityzenPosNewCustomerDialog {

  customerForm = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])),
    password: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    mobile: new FormControl('', [Validators.required]),
  });
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();
  showPassword: boolean = true;

  constructor(
    public util: UtilService,
    public api: ApiService,
    public dialogRef: MatDialogRef<CityzenPosNewCustomerDialog>,
  ) {
    this.getCountryCodes();
    this.customerForm.controls['countryCode'].setValue(this.api.defaultCountryCode);
    this.customerForm.controls['password'].setValue(this.generatePassword(10));
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
    return this.customerForm.controls;
  }

  onCountryCodeSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      const splitString = event.option.value.split(' ');
      console.log(splitString);
      if (splitString && splitString instanceof Array && splitString.length) {
        this.customerForm.controls['countryCode'].setValue(splitString[1]);
      }
    }
  }

  onSubmit() {
    console.log('submit');
    console.log(this.customerForm);
    this.isFormSubmit = true;
    if (this.customerForm.valid) {
      console.log('call api', this.customerForm.getRawValue());
      this.isSubmit = true;
      this.api.post_private('v1/cityzen/pos_create_customer', this.customerForm.getRawValue()).subscribe({
        next: (response: any) => {
          console.log(response);
          this.isSubmit = false
          if (response && response.user && response.user.id) {
            this.util.onSuccess('ts_customer_saved');
            const firstName = this.customerForm.controls['firstName'].value;
            const lastName = this.customerForm.controls['lastName'].value;
            const countryCode = this.customerForm.controls['countryCode'].value;
            const mobileValue = this.customerForm.controls['mobile'].value;
            const contactNumber = this.maskNumber(mobileValue ? mobileValue.toString() : '');
            console.log(`firstName ${firstName}`);
            console.log(`lastName ${lastName}`);
            console.log(`countryCode ${countryCode}`);
            console.log(`contactNumber ${contactNumber}`);
            this.dialogRef.close({ 'id': response.user.id, 'name': `${firstName} ${lastName}`, 'contact': `${countryCode} ${contactNumber}` });
          }

        }, error: (error: any) => {
          this.isSubmit = false;
          this.util.handleError(error, 'cityzen');
        }
      });
    }
  }

  maskNumber(number: string): string {
    if (number.length < 4) return number;

    return number.substring(0, 2) + 'X'.repeat(number.length - 4) + number.slice(-2);
  }

  generatePassword(length: number): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+';
    const allChars = letters + numbers + specialChars;

    let password = '';

    password += letters[Math.floor(Math.random() * letters.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];

    for (let i = 2; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  onRefreshPassword() {
    this.customerForm.controls['password'].setValue(this.generatePassword(10));
  }

}
