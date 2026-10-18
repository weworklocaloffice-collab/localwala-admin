import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { Observable, map, startWith } from 'rxjs';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { VehicleListInterface } from 'src/app/interfaces/vehicle.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectVendorMediaDialog } from 'src/app/pages/vendor/vendor-media-management/select-vendor-media-dialog/select-vendor-media-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-manage-vendor-driver',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './manage-vendor-driver.html',
})
export class ManageVendorDriver {

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
    restaurant: new FormControl(),
    locality: new FormControl(null),
    vehicle: new FormControl('', [Validators.required]),
    latitude: new FormControl({ value: 0, disabled: true },
      Validators.required),
    longitude: new FormControl({ value: 0, disabled: true },
      Validators.required),
    identity: new FormControl('passport', [Validators.required]),
    identityNumber: new FormControl('', [Validators.required]),
    identityProof: new FormControl('', [Validators.required]),
    drivingLicense: new FormControl('', [Validators.required]),
    age: new FormControl('', [Validators.required]),
    dob: new FormControl('', [Validators.required]),
  });
  vehicles: Observable<VehicleListInterface[]>;
  listOfVehicles: VehicleListInterface[] = [];
  vehicleCtrl = new FormControl('');
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();
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
    this.driverForm.controls['restaurant'].setValue(this.util.getItem('_vendorId'))
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
    this.api.get_private('v1/vendor_web/driver/getBasicData/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);

        if (response && response.vehicles) {
          this.listOfVehicles = response.vehicles;
          this.vehicles = this.vehicleCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterVehicles(element) : this.listOfVehicles.slice()))
          );
        }

        if (response && response.info && response.info.id) {
          const info = response.info;
          console.log(info);
          this.driverForm.controls['city'].setValue(info.city);
          this.driverForm.controls['locality'].setValue(info.locality);
          this.saveDriverPosition(info.location.coordinates[1], info.location.coordinates[0]);
        }

      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  getInfo() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/driver/getById/' + this.id).subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        console.log(response);
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
            this.driverForm.controls['identity'].setValue(values.identity);
            this.driverForm.controls['drivingLicense'].setValue(values.drivingLicense);
            this.driverForm.controls['identityNumber'].setValue(values.identityNumber);
            this.driverForm.controls['identityProof'].setValue(values.identityProof);
            this.driverForm.controls['city'].setValue(values.city);
            this.driverForm.controls['locality'].setValue(values.locality);
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
        this.util.handleError(error, 'vendor');
      }
    });
  }

  private _filterVehicles(value: string): VehicleListInterface[] {
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
    console.log(sendData);
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/vendor_web/driver/save', sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_deliveryman_added');
        this.router.navigate(['vendor/driver-management/list']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onUpdate() {
    const sendData = this.driverForm.getRawValue();
    console.log(sendData);
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/vendor_web/driver/update/' + this.id, sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_deliveryman_updated');
        this.router.navigate(['vendor/driver-management/list']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
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
    const dialogRef = this.dialog.open(SelectVendorMediaDialog, {
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
      identity: 'passport',
      identityNumber: '',
      identityProof: '',
      drivingLicense: '',
      age: '',
      dob: '',
    });

    this.driverForm.get('latitude')?.reset(0);
    this.driverForm.get('longitude')?.reset(0);

    this.driverForm.get('latitude')?.disable();
    this.driverForm.get('longitude')?.disable();

    this.haveSubmitClicked = false;
    console.log(this.driverForm.getRawValue());
  }

  getTranslatedVehicleName(item: VehicleListInterface): string {
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

}
