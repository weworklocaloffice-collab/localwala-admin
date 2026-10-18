import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { Observable, map, startWith } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { DateTime } from 'luxon';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DialogCityzenDeliverymanJoiningRejection } from './dialog-cityzen-deliveryman-joining-rejection/dialog-cityzen-deliveryman-joining-rejection';
import { CityzenMediaImagesDialog } from '../../../cityzen-media-images-dialog/cityzen-media-images-dialog';
import { CityzenLocalityListLimitedInterface } from 'src/app/interfaces/cityzen.locality.list.limited.interface';
import { CityzenVehicleListLimitedInfoInterface } from 'src/app/interfaces/cityzen.vehicle.list.limited.info.interface';
import { CityzenJoiningRequestFormFieldInterface } from 'src/app/interfaces/cityzen.restaurant.request.form.field.interface';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-deliveryman-request-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './cityzen-deliveryman-request-detail.html',
})
export class CityzenDeliverymanRequestDetail {

  id: string = '';
  driverForm = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])),
    password: new FormControl({ value: 'DummyPassword@150797', disabled: true }, [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    mobile: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
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
  haveSubmitClicked: boolean = false;
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();
  vehicles: Observable<CityzenVehicleListLimitedInfoInterface[]>;
  listOfVehicles: CityzenVehicleListLimitedInfoInterface[] = [];
  vehicleCtrl = new FormControl('');
  localities: Observable<CityzenLocalityListLimitedInterface[]>;
  listOfLocalities: CityzenLocalityListLimitedInterface[] = [];
  localityCtrl = new FormControl('');
  tempLocality: string = '';
  formFields: CityzenJoiningRequestFormFieldInterface[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private location: Location,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id != null && this.id != '') {
      this.getCountryCodes();
      this.getDetail();
    } else {
      this.onBack();
      this.util.onError('ts_something_went_wrong', '');
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

      }
    }).catch((error: any) => {
      console.log(error);
      this.util.onError('ts_something_went_wrong', '');
    });
  }

  getDetail() {
    console.log('get detail');
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/deliveryman_joining_detail/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);

        if (response && response.info && response.info.id == this.id) {
          const values = response.info;
          this.tempLocality = values.locality;
          this.getLocalityesWithCityId(values.city);
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
            this.driverForm.controls['email'].setValue(values.email);
            this.driverForm.controls['firstName'].setValue(values.firstName);
            this.driverForm.controls['lastName'].setValue(values.lastName);
            this.driverForm.controls['countryCode'].setValue(`+${values.countryCode}`);
            const selectedCountryCode = this.listOfCountryCodes.filter(x => x.dial_code == `+${values.countryCode}`);
            if (selectedCountryCode && selectedCountryCode.length) {
              this.countryCodeCtrl.setValue(selectedCountryCode[0].flag + ' ' + selectedCountryCode[0].dial_code + ' ' + selectedCountryCode[0].name);
            }
            this.driverForm.controls['mobile'].setValue(values.mobile);
            this.driverForm.controls['image'].setValue(values.cover);
            this.driverForm.controls['age'].setValue(values.age);
            this.driverForm.controls['type'].setValue(values.type);
            this.driverForm.controls['identity'].setValue(values.identity);
            this.driverForm.controls['drivingLicense'].setValue(values.drivingLicense);
            this.driverForm.controls['identityNumber'].setValue(values.identityNumber);
            this.driverForm.controls['identityProof'].setValue(values.identityProof);
            const dob = DateTime.fromJSDate(new Date(values.dob)).toFormat('yyyy-MM-dd');
            this.driverForm.controls['dob'].setValue(dob);
            if (values && values.location && values.location.coordinates && values.location.coordinates.length) {
              this.driverForm.controls['latitude'].setValue(values.location.coordinates[1]);
              this.driverForm.controls['longitude'].setValue(values.location.coordinates[0]);
            }

            this.formFields = values.formElement;
            this.formFields.forEach((element) => {
              const formatDate = (dateStr: string): string => {
                const [year, month, day] = dateStr.split('-').map(Number);
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              };
              if (element.fieldType == 'date') {
                const value = formatDate(element.fieldValue);
                const formatted = DateTime.fromJSDate(new Date(value)).setLocale(this.util.appLocaleName()).toLocaleString(DateTime.DATE_MED);
                element.fieldValue = formatted;
              }
            });
          }
        }

      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  private _filterCountryCode(value: string): CountryCodeInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCountryCodes.filter((element) =>
      element.name.toLowerCase().includes(filterValue)
    );
  }

  private _filterVehicles(value: string): CityzenVehicleListLimitedInfoInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfVehicles.filter((element) =>
      this.getTranslatedVehicleName(element).toLowerCase().includes(filterValue)
    );
  }

  private _filterLocality(value: string): CityzenLocalityListLimitedInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfLocalities.filter((element) =>
      this.getTranslatedLocalityName(element).toLowerCase().includes(filterValue)
    );
  }

  getLocalityesWithCityId(id: string) {
    this.api.get_private('v1/cityzen/localities_from_city/' + id).subscribe({
      next: (response: any) => {
        this.listOfLocalities = response;
        this.localities = this.localityCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this._filterLocality(element) : this.listOfLocalities.slice()))
        );
        this.driverForm.controls['locality'].setValue(this.tempLocality);
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onBack() {
    this.location.back();
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
    const dialogRef = this.dialog.open(CityzenMediaImagesDialog, {
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

  onVehicleSelect(event: any) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.driverForm.controls['vehicle'].setValue(event.option.value);
    }
  }

  saveDriverPosition(lat: number, lng: number) {
    this.driverForm.controls['latitude'].setValue(lat);
    this.driverForm.controls['longitude'].setValue(lng);
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

  get f() {
    return this.driverForm.controls;
  }

  onDocumentClick(value: string) {
    console.log(value);
    window.open(this.api.mediaUrl + value, '_blank');
  }

  onSubmit() {
    console.log('on save');
    console.log(this.driverForm);
    if (this.driverForm.valid) {
      const sendData = this.driverForm.getRawValue();
      const selectedLocality = this.listOfLocalities.filter(x => x.id == this.driverForm.value.locality);
      console.log(selectedLocality);
      if (selectedLocality && selectedLocality.length > 0) {
        sendData.locality = selectedLocality[0].id;
      } else {
        sendData.locality = null;
      }
      console.log(sendData);
      const spinnerRef = this.util.start('ts_saving');
      this.api.post_private('v1/cityzen/approve_deliveryman_register_request/' + this.id + '/' + this.util.getItem('_uid'), sendData).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_deliveryman_added');
          this.router.navigate(['cityzen-team/deliveryman-list']);
        }, error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'cityzen');
        }
      });
    }
  }

  onRejectRequest() {
    console.log('On Reject');
    const dialogRef = this.dialog.open(DialogCityzenDeliverymanJoiningRejection, {
      data: { id: this.id },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'true') {
        this.onBack();
      }
    });
  }

  getTranslatedLocalityName(item: CityzenLocalityListLimitedInterface): string {
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

  getTranslatedVehicleName(item: CityzenVehicleListLimitedInfoInterface): string {
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
