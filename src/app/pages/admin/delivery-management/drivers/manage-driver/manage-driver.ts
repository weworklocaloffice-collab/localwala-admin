import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { DateTime } from 'luxon';
import { LocalityListLimitedInterface } from 'src/app/interfaces/locality.list.limited.interface';
import { AdminCitiesListLimitedInterface } from 'src/app/interfaces/admin.cities.list.limited.interface';
import { AdminVehicleListLimitedInfoInterface } from 'src/app/interfaces/admin.vehicle.list.limited.info.interface';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-manage-driver',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './manage-driver.html',
})
export class ManageDriver {

  action: string = 'add';
  id: string = '';
  haveSubmitClicked: boolean = false;
  driverForm = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])),
    password: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    mobile: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    restaurant: new FormControl(null),
    locality: new FormControl<string | null>(null),
    vehicle: new FormControl('', [Validators.required]),
    latitude: new FormControl({ value: 0, disabled: true },
      Validators.required),
    longitude: new FormControl({ value: 0, disabled: true },
      Validators.required),
    locationType: new FormControl('Point', [Validators.required]),
    type: new FormControl('freelancer', [Validators.required]),
    identity: new FormControl('passport', [Validators.required]),
    identityNumber: new FormControl('', [Validators.required]),
    identityProof: new FormControl('', [Validators.required]),
    drivingLicense: new FormControl('', [Validators.required]),
    age: new FormControl('', [Validators.required]),
    dob: new FormControl('', [Validators.required]),
  });
  cities: Observable<AdminCitiesListLimitedInterface[]>;
  listOfCities: AdminCitiesListLimitedInterface[] = [];
  cityCtrl = new FormControl('');
  vehicles: Observable<AdminVehicleListLimitedInfoInterface[]>;
  listOfVehicles: AdminVehicleListLimitedInfoInterface[] = [];
  vehicleCtrl = new FormControl('');
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();
  localities: Observable<LocalityListLimitedInterface[]>;
  listOfLocalities: LocalityListLimitedInterface[] = [];
  localityCtrl = new FormControl('');
  tempLocality: string = '';
  showPassword: boolean = true;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.getCountryCodes();
    this.driverForm.controls['countryCode'].setValue(this.api.defaultCountryCode);
    console.log(this.action, this.id);
    this.action = this.route.snapshot.paramMap.get('id') ? 'edit' : 'add';
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id && this.action == 'edit') {
      this.getInfo();
    } else {
      this.getBasicData();
    }
  }

  getBasicData() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/driver/getBasicData').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.cities && response.cities.length) {
          this.listOfCities = response.cities;
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCities(element) : this.listOfCities.slice()))
          );
        }

        if (response && response.vehicles && response.vehicles.length) {
          this.listOfVehicles = response.vehicles;
          this.vehicles = this.vehicleCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterVehicles(element) : this.listOfVehicles.slice()))
          );
        }

      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  getInfo() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/driver/getById/' + this.id).subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        console.log(response);
        if (response && response.cities && response.cities.length) {
          this.listOfCities = response.cities;
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCities(element) : this.listOfCities.slice()))
          );
          if (response && response.info && response.info.id == this.id) {
            const values = response.info;
            this.tempLocality = values.locality;
            this.getLocalityesWithCityId(values.city);
            this.driverForm.controls['city'].setValue(values.city);
          }
        }

        if (response && response.vehicles && response.vehicles.length) {
          this.listOfVehicles = response.vehicles;
          this.vehicles = this.vehicleCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterVehicles(element) : this.listOfVehicles.slice()))
          );
          if (response && response.info && response.info.id == this.id) {
            this.driverForm.controls['vehicle'].setValue(response.info.vehicle);
          }
          const values = response.info;
          if (values && values.id === this.id) {
            (this.driverForm as any).removeControl('email');
            (this.driverForm as any).removeControl('firstName');
            (this.driverForm as any).removeControl('lastName');
            (this.driverForm as any).removeControl('password');
            (this.driverForm as any).removeControl('countryCode');
            (this.driverForm as any).removeControl('mobile');
            (this.driverForm as any).removeControl('image');
            this.driverForm.controls['age'].setValue(values.age);
            this.driverForm.controls['type'].setValue(values.type);
            this.driverForm.controls['identity'].setValue(values.identity);
            this.driverForm.controls['drivingLicense'].setValue(values.drivingLicense);
            this.driverForm.controls['identityNumber'].setValue(values.identityNumber);
            this.driverForm.controls['identityProof'].setValue(values.identityProof);
            const dob = DateTime.fromJSDate(new Date(values.dob)).toFormat('yyyy-MM-dd');
            console.log(dob);
            this.driverForm.controls['dob'].setValue(dob);
            if (values && values.location && values.location.coordinates && values.location.coordinates.length) {
              this.driverForm.controls['latitude'].setValue(values.location.coordinates[1]);
              this.driverForm.controls['longitude'].setValue(values.location.coordinates[0]);
            }
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  private _filterCities(value: string): AdminCitiesListLimitedInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCities.filter((element) =>
      this.getTranslatedCityName(element).toLowerCase().includes(filterValue)
    );
  }

  private _filterVehicles(value: string): AdminVehicleListLimitedInfoInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfVehicles.filter((element) =>
      this.getTranslatedVehicleName(element).toLowerCase().includes(filterValue)
    );
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

  onSubmit() {
    console.log('on save', this.action);
    console.log(this.driverForm);
    this.haveSubmitClicked = true;
    if (this.driverForm.valid) {
      if (this.action == 'add') {
        this.onSave();
      } else {
        this.onUpdate();
      }
    }
  }

  onSave() {
    const sendData = this.driverForm.getRawValue();
    const localityValue = this.driverForm.value?.locality;
    const selectedLocality = localityValue ? this.listOfLocalities.filter(x => x.id == localityValue) : [];
    console.log(selectedLocality);
    if (selectedLocality && selectedLocality.length > 0) {
      sendData.locality = selectedLocality[0].id;
    } else {
      sendData.locality = null;
    }
    console.log(sendData);
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/admin/driver/save', sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_deliveryman_added');
        this.router.navigate(['admin/driver-management/delivery-partners']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onUpdate() {
    const sendData = this.driverForm.getRawValue();
    const localityValue = this.driverForm.value?.locality;
    const selectedLocality = localityValue ? this.listOfLocalities.filter(x => x.id == localityValue) : [];
    console.log(selectedLocality);
    if (selectedLocality && selectedLocality.length > 0) {
      sendData.locality = selectedLocality[0].id;
    } else {
      sendData.locality = null;
    }
    console.log(sendData);
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/admin/driver/update/' + this.id, sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_deliveryman_updated');
        this.router.navigate(['admin/driver-management/delivery-partners']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  get f() {
    return this.driverForm.controls;
  }

  onCountryCodeSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      const splitString = event.option.value.split(' ');
      console.log(splitString);
      if (splitString && splitString instanceof Array && splitString.length) {
        this.driverForm.controls['countryCode'].setValue(splitString[1]);
      }
    }
  }

  onImageClick(formName: string) {
    console.log('on image click for ', formName);
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
        if (formName == 'image') {
          this.driverForm.controls['image'].setValue(result.data);
        } else if (formName == 'drivingLicense') {
          this.driverForm.controls['drivingLicense'].setValue(result.data);
        } else {
          this.driverForm.controls['identityProof'].setValue(result.data);
        }
      }
    });
  }

  onCitySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.driverForm.controls['city'].setValue(event.option.value);
      this.driverForm.controls['locality'].setValue('');
      const selectedCity = this.listOfCities.filter(x => x.id == this.driverForm.value.city);
      if (selectedCity && selectedCity.length && selectedCity.length > 0) {
        this.saveDriverPosition(selectedCity[0].location.coordinates[1], selectedCity[0].location.coordinates[0]);
        this.getLocalityesWithCityId(selectedCity[0].id);
      }
    }
  }

  getLocalityesWithCityId(id: string) {
    this.api.get_private('v1/admin/localities/getByCityId/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.listOfLocalities = response;
        this.localities = this.localityCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this._filterLocality(element) : this.listOfLocalities.slice()))
        );
        if (this.action == 'edit' && this.tempLocality && this.tempLocality != null) {
          this.driverForm.controls['locality'].setValue(this.tempLocality);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  private _filterLocality(value: string): LocalityListLimitedInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfLocalities.filter((element) =>
      this.getTranslatedLocalityName(element).toLowerCase().includes(filterValue)
    );
  }

  onLocalitySelect(event: any) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.driverForm.controls['locality'].setValue(event.option.value);
      const selectedLocality = this.listOfLocalities.filter(x => x.id == event.option.value);
      if (selectedLocality && selectedLocality.length && selectedLocality.length > 0) {
        this.saveDriverPosition(selectedLocality[0].location.coordinates[1], selectedLocality[0].location.coordinates[0]);
      }
    }
  }

  saveDriverPosition(lat: number, lng: number) {
    this.driverForm.controls['latitude'].setValue(lat);
    this.driverForm.controls['longitude'].setValue(lng);
  }

  onVehicleSelect(event: any) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.driverForm.controls['vehicle'].setValue(event.option.value);
    }
  }

  onReset() {
    console.log('reset form');
    this.driverForm.patchValue({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      countryCode: '',
      mobile: '',
      image: '',
      city: '',
      restaurant: null,
      locality: null,
      vehicle: '',
      latitude: 0,
      longitude: 0,
      locationType: 'Point',
      type: 'freelancer',
      identity: 'passport',
      identityNumber: '',
      identityProof: '',
      drivingLicense: '',
      age: '',
      dob: ''
    });
    this.driverForm.get('latitude')?.disable();
    this.driverForm.get('longitude')?.disable();
    this.haveSubmitClicked = false;
  }

  getTranslatedCityName(item: AdminCitiesListLimitedInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayCityName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfCities.find(item => item.id == id);
    return selected ? this.getTranslatedCityName(selected) : '';
  };

  getTranslatedVehicleName(item: AdminVehicleListLimitedInfoInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayVehicleName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfVehicles.find(item => item.id == id);
    return selected ? this.getTranslatedVehicleName(selected) : '';
  };

  getTranslatedLocalityName(item: LocalityListLimitedInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayLocalityName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfLocalities.find(item => item.id == id);
    return selected ? this.getTranslatedLocalityName(selected) : '';
  };

}
