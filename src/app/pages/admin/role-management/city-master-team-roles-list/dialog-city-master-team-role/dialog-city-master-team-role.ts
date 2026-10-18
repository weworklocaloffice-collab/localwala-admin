import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { map, Observable, startWith } from 'rxjs';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { AdminCitiesListLimitedInterface } from 'src/app/interfaces/admin.cities.list.limited.interface';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-dialog-city-master-team-role',
  imports: [FormsModule, ReactiveFormsModule, MaterialModule, CommonModule, NgIcon],
  templateUrl: './dialog-city-master-team-role.html',
})
export class DialogCityMasterTeamRole {

  action: string = 'create';
  id: string = '';
  roleForm = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])),
    password: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    mobile: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
  });
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();
  cities: Observable<AdminCitiesListLimitedInterface[]>;
  listOfCities: AdminCitiesListLimitedInterface[] = [];
  cityCtrl = new FormControl('');
  tempCity: string = '';
  showPassword: boolean = true;

  constructor(
    public util: UtilService,
    public api: ApiService,
    public dialogRef: MatDialogRef<DialogCityMasterTeamRole>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      this.id = this.data.values;
      this.getInfo();
    } else {
      this.roleForm.controls['countryCode'].setValue(this.api.defaultCountryCode);
      this.getCountryCodes();
      this.getCities();
    }
  }

  getCities() {
    this.api.get_private('v1/admin/cities/listAllCities').subscribe({
      next: (response: any) => {
        console.log(response);
        if (response) {
          this.listOfCities = response;
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterArrayItems(element) : this.listOfCities.slice()))
          );
          if (this.action == 'edit') {
            this.roleForm.controls['city'].setValue(this.tempCity);
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  private _filterArrayItems(value: string): AdminCitiesListLimitedInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCities.filter((element) =>
      this.getTranslatedItemName(element).toLowerCase().includes(filterValue)
    );
  }

  getInfo() {
    console.log('info');
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/auth_roles/city_master_detail/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success && response.detail && response.detail.id) {
          const detail = response.detail;
          console.log(detail);
          this.roleForm.controls['firstName'].setValue(detail.firstName);
          this.roleForm.controls['lastName'].setValue(detail.lastName);
          this.roleForm.controls['email'].setValue(detail.email);
          this.roleForm.controls['image'].setValue(detail.image);
          this.roleForm.controls['mobile'].setValue(detail.mobile);
          this.roleForm.controls['countryCode'].setValue(detail.countryCode);
          this.tempCity = detail.city.id;
          (this.roleForm as any).removeControl('password');
          this.getCountryCodes();
          this.getCities();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  getCountryCodes() {
    this.api.getLocalAssets('countryCodes.json').then((response: any) => {
      if (response) {
        this.listOfCountryCodes = response;
        this.countryCodes = this.countryCodeCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this._filterCountryCode(element) : this.listOfCountryCodes.slice()))
        );
        if (this.action == 'create') {
          const defaultCountryCode = this.listOfCountryCodes.filter(x => x.dial_code == this.api.defaultCountryCode);
          console.log(defaultCountryCode);
          this.countryCodeCtrl.setValue(defaultCountryCode[0].flag + ' ' + defaultCountryCode[0].dial_code + ' ' + defaultCountryCode[0].name);
        } else {
          const defaultCountryCode = this.listOfCountryCodes.filter(x => x.dial_code == this.roleForm.controls['countryCode'].value);
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

  get f() {
    return this.roleForm.controls;
  }

  onCountryCodeSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      const splitString = event.option.value.split(' ');
      console.log(splitString);
      if (splitString && splitString instanceof Array && splitString.length) {
        this.roleForm.controls['countryCode'].setValue(splitString[1]);
      }
    }
  }

  onSubmit() {
    console.log('submit');
    console.log(this.roleForm);
    this.isFormSubmit = true;
    if (this.roleForm.valid) {
      console.log('call api', this.roleForm.getRawValue());
      if (this.action == 'create') {
        this.onCreate();
      } else {
        this.onUpdate();
      }
    }
  }

  onCreate() {
    this.isSubmit = true;
    const sendData = this.roleForm.getRawValue();
    this.api.post_private('v1/admin/auth_roles/new_city_master', sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        if (response && response.user && response.user.id) {
          this.util.onSuccess('ts_cityzen_saved');
          this.dialogRef.close({ event: 'add' });
        }
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onUpdate() {
    console.log('Update--');
    this.isSubmit = true;
    const sendData = this.roleForm.getRawValue();
    this.api.patch_private('v1/admin/auth_roles/update_city_master/' + this.id, sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        if (response && response.success) {
          this.util.onSuccess('ts_cityzen_updated');
          this.dialogRef.close({ event: 'update' });
        }
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      }
    });
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
    this.roleForm.controls['password'].setValue(this.generatePassword(10));
  }

  onImagePicker() {
    console.log('on image picker');
    const dialogRef = this.dialog.open(SelectMediaDialog, {
      data: { value: this.roleForm.controls['image'].value },
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
        this.roleForm.controls['image'].setValue(result.data);
      }
    });
  }

  onCitySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.roleForm.controls['city'].setValue(event.option.value);
    }
  }

  displayItemName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfCities.find(item => item.id == id);
    return selected ? this.getTranslatedItemName(selected) : '';
  };

  getTranslatedItemName(item: AdminCitiesListLimitedInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

}
