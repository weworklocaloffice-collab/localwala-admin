import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable, startWith, map } from 'rxjs';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectVendorMediaDialog } from 'src/app/pages/vendor/vendor-media-management/select-vendor-media-dialog/select-vendor-media-dialog';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-vendor-kitchen-owner',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-vendor-kitchen-owner.html',
})
export class DialogVendorKitchenOwner {

  action: string = 'add';
  id: string = '';
  userId: string = '';
  haveSubmitClicked: boolean = false;
  ownerForm = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])),
    password: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    mobile: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    restaurant: new FormControl(),
    gender: new FormControl('male', [Validators.required]),
  });
  showPassword: boolean = true;
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private location: Location
  ) {
    this.getCountryCodes();
    this.ownerForm.controls['restaurant'].setValue(this.util.getItem('_vendorId'));
    this.ownerForm.controls['countryCode'].setValue(this.api.defaultCountryCode);
    console.log(this.action, this.id);
    this.action = this.route.snapshot.paramMap.get('id') ? 'edit' : 'add';
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id && this.action == 'edit') {
      this.getInfo();
    }
  }

  getInfo() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/kitchen_owner/info/' + this.id).subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        console.log(response);
        if (response && response.info && response.info.id) {
          const info = response.info;
          console.log(info);
          this.userId = info.id;
          (this.ownerForm as any).removeControl('password');
          (this.ownerForm as any).removeControl('countryCode');
          (this.ownerForm as any).removeControl('mobile');
          (this.ownerForm as any).removeControl('email');
          (this.ownerForm as any).removeControl('restaurant');
          this.ownerForm.controls['firstName'].setValue(info.firstName);
          this.ownerForm.controls['lastName'].setValue(info.lastName);
          this.ownerForm.controls['gender'].setValue(info.gender);
          this.ownerForm.controls['image'].setValue(info.image);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
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

  get f() {
    return this.ownerForm.controls;
  }

  onCountryCodeSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      const splitString = event.option.value.split(' ');
      console.log(splitString);
      if (splitString && splitString instanceof Array && splitString.length) {
        this.ownerForm.controls['countryCode'].setValue(splitString[1]);
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
        this.ownerForm.controls['image'].setValue(result.data);
      }
    });
  }

  onSubmit() {
    console.log('on save', this.action);
    console.log(this.ownerForm);
    this.haveSubmitClicked = true;
    if (this.ownerForm.valid) {
      if (this.action == 'add') {
        this.onSave();
      } else {
        this.onUpdate();
      }
    }
  }

  onSave() {
    console.log('Save');
    const spinnerRef = this.util.start('ts_saving');
    const sendData = this.ownerForm.getRawValue();
    this.api.post_private('v1/vendor_web/kitchen_owner/save', sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_kitchen_owner_added');
        this.location.back();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onUpdate() {
    console.log('update');
    const sendData = this.ownerForm.getRawValue();
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/vendor_web/kitchen_owner/update_detail/' + this.userId, sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_kitchen_owner_updated');
        this.location.back();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onReset() {
    console.log('reset form');
    this.haveSubmitClicked = false;
    this.ownerForm.patchValue({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      countryCode: '',
      mobile: '',
      image: '',
      restaurant: '',
      gender: 'male',
    });

    console.log(this.ownerForm.getRawValue());
  }

}
