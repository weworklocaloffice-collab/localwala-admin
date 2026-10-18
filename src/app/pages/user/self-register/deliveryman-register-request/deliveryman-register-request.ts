import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { CustomerCitiesListInterface } from 'src/app/interfaces/customer.cities.list.interface';
import { CustomerJoiningFormRequestInterface, CustomerJoiningFormChecboxItemInterface } from 'src/app/interfaces/customer.joining.form.request.interface';
import { CustomerJoiningFormResponseInterface } from 'src/app/interfaces/customer.joining.form.response.interface';
import { CustomerLocalityListInterface } from 'src/app/interfaces/customer.locality.list.interface';
import { CustomerVehicleListInterface } from 'src/app/interfaces/customer.vehicle.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-deliveryman-register-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './deliveryman-register-request.html',
})
export class DeliverymanRegisterRequest {

  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef<HTMLInputElement>>;
  isLoading: boolean = false;
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
    locality: new FormControl<string | null>(null),
    vehicle: new FormControl('', [Validators.required]),
    latitude: new FormControl({ value: 0, disabled: true }, Validators.required),
    longitude: new FormControl({ value: 0, disabled: true }, Validators.required),
    locationType: new FormControl('Point', [Validators.required]),
    type: new FormControl('freelancer', [Validators.required]),
    identity: new FormControl('passport', [Validators.required]),
    identityNumber: new FormControl('', [Validators.required]),
    identityProof: new FormControl('', [Validators.required]),
    drivingLicense: new FormControl('', [Validators.required]),
    age: new FormControl('', [Validators.required]),
    dob: new FormControl('', [Validators.required]),
  });
  cities: Observable<CustomerCitiesListInterface[]>;
  listOfCities: CustomerCitiesListInterface[] = [];
  cityCtrl = new FormControl('');
  vehicles: Observable<CustomerVehicleListInterface[]>;
  listOfVehicles: CustomerVehicleListInterface[] = [];
  vehicleCtrl = new FormControl('');
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();
  localities: Observable<CustomerLocalityListInterface[]>;
  listOfLocalities: CustomerLocalityListInterface[] = [];
  localityCtrl = new FormControl('');
  showPassword: boolean = true;
  joininFormField: CustomerJoiningFormRequestInterface[] = [];
  coverFileURL: any = 'assets/images/placeholder.png';
  coverFileTarget: any;
  identityProofFileURL: any = 'assets/images/placeholder.png';
  identityProofFileTarget: any;
  drivingLicenseFileURL: any = 'assets/images/placeholder.png';
  drivingLicenseFileTarget: any;

  constructor(public api: ApiService, public util: UtilService, private router: Router) {
    this.getCountryCodes();
    this.driverForm.controls['countryCode'].setValue(this.api.defaultCountryCode);
    this.getBasicDetail();
  }

  getBasicDetail() {
    this.isLoading = true;
    this.api.get_private('v1/public/deliveryman_joining/getBasicDataDeliverymanRequest/').subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoading = false;

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

        if (response && response.joiningForm && response.joiningForm.result && response.joiningForm.result.deliverymanForm && Array.isArray(response.joiningForm.result.deliverymanForm) && response.joiningForm.result.deliverymanForm.length > 0) {
          const mappedList = response.joiningForm.result.deliverymanForm.map((item: CustomerJoiningFormResponseInterface) => {
            const mappedCheckbox = item.items?.map((checkbox) => {
              const obj: CustomerJoiningFormChecboxItemInterface = {
                name: checkbox.name,
                value: false
              }
              return obj;
            });

            const obj: CustomerJoiningFormRequestInterface = {
              uuid: item.uuid,
              isRequired: item.isRequired,
              type: item.type,
              title: item.title,
              placeholder: item.placeholder,
              value: '',
              extraValue: '',
              fileURL: item.type == 'file' ? 'assets/images/placeholder.png' : '',
              fileTarget: undefined,
              items: mappedCheckbox && Array.isArray(mappedCheckbox) && mappedCheckbox.length > 0 ? mappedCheckbox : []
            }
            return obj;
          });
          const sortMapped = mappedList.sort((a: CustomerJoiningFormRequestInterface, b: CustomerJoiningFormRequestInterface) => {
            const order: Record<string, number> = {
              choose: 1,
              file: 2,
            };

            const aOrder = order[a.type] ?? 0;
            const bOrder = order[b.type] ?? 0;

            return aOrder - bOrder;
          });
          this.joininFormField = sortMapped;
          console.log(this.joininFormField);
        }

      }, error: (error: any) => {
        this.isLoading = false;
        console.log(error);
        this.util.handleError(error, 'public');
      }
    });
  }

  get f() {
    return this.driverForm.controls;
  }

  private _filterCities(value: string): CustomerCitiesListInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCities.filter((element) =>
      this.getTranslatedCityName(element).toLowerCase().includes(filterValue)
    );
  }

  private _filterVehicles(value: string): CustomerVehicleListInterface[] {
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

  onFileChoose(fileEvent: any, fileType: string) {
    console.log(fileEvent);
    if (fileEvent.target.files && fileEvent.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(fileEvent.target.files[0]);
      reader.onload = (buffer: any) => {
        if (fileType == 'image') {
          this.coverFileURL = buffer.target.result;
          this.coverFileTarget = fileEvent.target.files[0];
        } else if (fileType == 'identityProof') {
          this.identityProofFileURL = buffer.target.result;
          this.identityProofFileTarget = fileEvent.target.files[0];
        } else if (fileType == 'drivingLicense') {
          this.drivingLicenseFileURL = buffer.target.result;
          this.drivingLicenseFileTarget = fileEvent.target.files[0];
        }
      }
    }
  }

  onRemoveImageFile(fileType: string) {
    console.log(fileType);
    if (fileType == 'image') {
      this.coverFileTarget = null;
      this.coverFileURL = 'assets/images/placeholder.png';
    } else if (fileType == 'identityProof') {
      this.identityProofFileTarget = null;
      this.identityProofFileURL = 'assets/images/placeholder.png';
    } else if (fileType == 'drivingLicense') {
      this.drivingLicenseFileTarget = null;
      this.drivingLicenseFileURL = 'assets/images/placeholder.png';
    }
  }

  onUploadImageFile(fileType: string) {
    console.log(fileType);

    if (fileType == 'image') {
      if (this.coverFileTarget) {
        const mimeType = this.coverFileTarget.type;
        if (mimeType.match(/image\/*/) == null) {
          this.util.onError('ts_please_upload_image_files', '');
          return;
        }
        const spinnerRef = this.util.start('ts_uploading');
        this.api.uploadFilePublic(this.coverFileTarget).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            if (response && response.path) {
              this.driverForm.controls['image'].setValue(response.path);
            }
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'public');
          }
        });
      }
    } else if (fileType == 'identityProof') {
      if (this.identityProofFileTarget) {
        const mimeType = this.identityProofFileTarget.type;
        if (mimeType.match(/image\/*/) == null) {
          this.util.onError('ts_please_upload_image_files', '');
          return;
        }
        const spinnerRef = this.util.start('ts_uploading');
        this.api.uploadFilePublic(this.identityProofFileTarget).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            if (response && response.path) {
              this.driverForm.controls['identityProof'].setValue(response.path);
            }
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'public');
          }
        });
      }
    } else if (fileType == 'drivingLicense') {
      if (this.drivingLicenseFileTarget) {
        const mimeType = this.drivingLicenseFileTarget.type;
        if (mimeType.match(/image\/*/) == null) {
          this.util.onError('ts_please_upload_image_files', '');
          return;
        }
        const spinnerRef = this.util.start('ts_uploading');
        this.api.uploadFilePublic(this.drivingLicenseFileTarget).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            if (response && response.path) {
              this.driverForm.controls['drivingLicense'].setValue(response.path);
            }
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'public');
          }
        });
      }
    }
  }

  onFileChangeForm(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (buffer: any) => {
        console.log(buffer);
        this.joininFormField[index].fileURL = buffer.target.result;
        this.joininFormField[index].fileTarget = event.target.files[0];
      };
    }
  }

  onRemoveImageFileForm(index: number) {
    this.joininFormField[index].fileURL = 'assets/images/placeholder.png';
    this.joininFormField[index].fileTarget = '';
  }

  onUploadImageFileForm(index: number) {
    console.log(this.joininFormField[index]);
    if (this.joininFormField[index].fileTarget) {
      const mimeType = this.joininFormField[index].fileTarget.type;
      if (mimeType.match(/image\/*/) == null) {
        this.util.onError('ts_please_upload_image_files', '');
        return;
      }
      const spinnerRef = this.util.start('ts_uploading');
      this.api.uploadFilePublic(this.joininFormField[index].fileTarget).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          if (response && response.path) {
            this.joininFormField[index].value = response.path;
          }
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'public');
        }
      });
    }
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
    this.api.get_public('v1/public/localities_from_city/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        if (response && response.localities && response.localities.length > 0) {
          this.listOfLocalities = response.localities;
          this.localities = this.localityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterLocality(element) : this.listOfLocalities.slice()))
          );
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'public');
      }
    });
  }

  private _filterLocality(value: string): CustomerLocalityListInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfLocalities.filter((element) =>
      this.getTranslatedLocalityName(element).toLowerCase().includes(filterValue)
    );
  }

  onVehicleSelect(event: any) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.driverForm.controls['vehicle'].setValue(event.option.value);
    }
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

  onSubmit() {
    console.log('on save');
    console.log(this.driverForm);
    console.log(this.joininFormField);
    console.log(this.driverForm.getRawValue());

    this.haveSubmitClicked = true;
    const indexOfRequiredField = this.joininFormField.findIndex((element) => element.isRequired == true && element.value == '' && element.type != 'choose');
    console.log(indexOfRequiredField);
    if (this.driverForm.valid && indexOfRequiredField == -1) {
      console.log('Submit');
      const selectedLocality = this.listOfLocalities.filter(x => x.id == this.driverForm.value.locality);
      const mappedItems = this.joininFormField.map((item) => {
        if (item.type == 'choose') {
          item.value = item.title;
        }
        const obj: any = {
          'fieldName': item.title,
          'fieldType': item.type,
          'fieldValue': item.type == 'phone' ? `${item.extraValue} ${item.value}` : item.value,
          'fieldItems': item.items,
        }
        return obj;
      });
      const formInputFields: any[] = mappedItems;
      const param: any = {
        'email': this.driverForm.controls['email'].value,
        'password': this.driverForm.controls['password'].value,
        'firstName': this.driverForm.controls['firstName'].value,
        'lastName': this.driverForm.controls['lastName'].value,
        'countryCode': this.driverForm.controls['countryCode'].value,
        'mobile': this.driverForm.controls['mobile'].value,
        'city': this.driverForm.controls['city'].value,
        'locality': selectedLocality && Array.isArray(selectedLocality) && selectedLocality.length > 0 ? selectedLocality[0].id : null,
        'latitude': this.driverForm.controls['latitude'].value,
        'longitude': this.driverForm.controls['longitude'].value,
        'vehicle': this.driverForm.controls['vehicle'].value,
        'cover': this.driverForm.controls['image'].value,
        'age': this.driverForm.controls['age'].value,
        'dob': this.driverForm.controls['dob'].value,
        'type': this.driverForm.controls['type'].value,
        'identity': this.driverForm.controls['identity'].value,
        'identityNumber': this.driverForm.controls['identityNumber'].value,
        'identityProof': this.driverForm.controls['identityProof'].value,
        'drivingLicense': this.driverForm.controls['drivingLicense'].value,
        'locationType': 'Point',
        'formElement': formInputFields,
        'locale': this.util.appLocaleName()
      }
      console.log(param);
      const spinnerRef = this.util.start('ts_saving');
      this.api.post_private('v1/public/deliveryman_joining/request/', param).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_request_sent');
          this.router.navigateByUrl('/register-request-saved', { replaceUrl: true });
        }, error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'public');
        }
      });
    }
  }

  getTranslatedLocalityName(item: CustomerLocalityListInterface): string {
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

  getTranslatedVehicleName(item: CustomerVehicleListInterface): string {
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

  getTranslatedCityName(item: CustomerCitiesListInterface): string {
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

}
