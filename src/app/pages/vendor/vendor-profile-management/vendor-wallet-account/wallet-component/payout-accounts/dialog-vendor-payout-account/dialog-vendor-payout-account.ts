import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Observable, startWith, map } from 'rxjs';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { VendorAllPayoutMethodListInterface } from 'src/app/interfaces/vendor.all.payout.method.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatNativeDateModule } from '@angular/material/core';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-dialog-vendor-payout-account',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, MatNativeDateModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './dialog-vendor-payout-account.html',
})
export class DialogVendorPayoutAccount {

  action: string = '';
  methods: VendorAllPayoutMethodListInterface[] = [];
  selectedMethod: string = '';
  inputElements: FormInputElementInterface[] = [];
  haveSubmitClicked: boolean = false;
  isSubmit: boolean = false;
  countryCode: string = '';
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogVendorPayoutAccount>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    this.countryCode = this.api.defaultCountryCode;
    this.getCountryCodes();
    if (this.data && this.data.action == 'add') {
      this.action = 'add';
      this.getMethodList();
    } else if (this.data && this.data.action == 'edit' && this.data.id && this.data.id != '') {
      console.log('get info');
      this.selectedMethod = this.data.id;
      this.action = 'edit';
      this.getMethodDetail();
    } else {
      this.util.onError('ts_no_payout_method_found', '');
      this.dialogRef.close({ event: 'close' });
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

  getMethodDetail() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/payoutMethod/detail/' + this.selectedMethod + '/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success && response.methodData && response.methodData.id) {
          this.inputElements = [];
          if (response && response.methodData && response.methodData.methodDetail && response.methodData.methodDetail.methodFormElement && response.methodData.methodDetail.methodFormElement.length > 0) {
            response.methodData.methodDetail.methodFormElement.forEach((element: any) => {
              const formInputElementObj = {
                'isRequired': element && element.isRequired == 'true' ? true : false,
                'fieldType': element.fieldType,
                'fieldName': element.fieldName,
                'placeholder': element.placeholder,
                'value': '',
                'extraValue': ''
              };
              this.inputElements.push(formInputElementObj);
            });
          }
          if (response && response.methodData && response.methodData.formElement && response.methodData.formElement.length) {
            response.methodData.formElement.forEach((formElement: any) => {
              this.inputElements.forEach((element) => {
                const formElementName = `${formElement.fieldName}-${formElement.fieldType}`;
                const methodFormElementName = `${element.fieldName}-${element.fieldType}`;
                if (formElementName == methodFormElementName) {
                  if (element.fieldType != 'phone') {
                    element.value = formElement.fieldValue;
                  } else {
                    if (formElement.fieldValue != '') {
                      const splitNumber = formElement.fieldValue.split(' ');
                      console.log(splitNumber.length);
                      if (splitNumber.length == 2) {
                        const selectedCountryCode = this.listOfCountryCodes.filter(x => x.dial_code == splitNumber[0]);
                        this.countryCodeCtrl.setValue(selectedCountryCode[0].flag + ' ' + selectedCountryCode[0].dial_code + ' ' + selectedCountryCode[0].name);
                        element.extraValue = selectedCountryCode[0].flag + ' ' + selectedCountryCode[0].dial_code + ' ' + selectedCountryCode[0].name;
                        element.value = splitNumber[1];
                      } else {
                        const defaultCountryCode = this.listOfCountryCodes.filter(x => x.dial_code == this.api.defaultCountryCode);
                        console.log(defaultCountryCode);
                        this.countryCodeCtrl.setValue(defaultCountryCode[0].flag + ' ' + defaultCountryCode[0].dial_code + ' ' + defaultCountryCode[0].name);
                        element.extraValue = defaultCountryCode[0].flag + ' ' + defaultCountryCode[0].dial_code + ' ' + defaultCountryCode[0].name;
                        element.value = formElement.fieldValue;
                      }
                    }
                  }

                }
              });
            });
          }
          console.log(this.inputElements);
        } else {
          this.util.onError('ts_no_payout_method_found', '');
          this.dialogRef.close({ event: 'close' });
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  getMethodList() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/payoutMethod/list').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success && response.methods && response.methods.length > 0) {
          const mappedList = response.methods.map(
            (item: VendorAllPayoutMethodListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.methods = mappedList;
          this.selectedMethod = this.methods[0].id;
          this.inputElements = [];
          this.methods[0].formElement.forEach((element) => {
            const formInputElementObj = {
              'isRequired': element && element.isRequired == 'true' ? true : false,
              'fieldType': element.fieldType,
              'fieldName': element.fieldName,
              'placeholder': element.placeholder,
              'value': '',
              'extraValue': element.fieldType == 'phone' ? this.countryCode : ''
            };
            this.inputElements.push(formInputElementObj);
          });
          console.log(this.inputElements);
        } else {
          this.util.onError('ts_no_payout_method_found', '');
          this.dialogRef.close({ event: 'close' });
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  convertToDateString(inputDate: string): string {
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) {
      return '2024-11-28';
    }
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const newDate = `${date.getFullYear()}-${month}-${date.getDate()}`;
    return newDate.toString();
  }

  onSubmit() {
    console.log('Submit');
    this.haveSubmitClicked = true;
    console.log(this.inputElements);
    const indexOfRequiredAndEmptyItem = this.inputElements.findIndex((x) => x.isRequired == true && x.value == '');
    console.log(indexOfRequiredAndEmptyItem);
    if (indexOfRequiredAndEmptyItem == -1) {
      if (this.action == 'add') {
        console.log('create');
        const formElement: any[] = [];
        this.inputElements.forEach((element) => {
          if (element.fieldType == 'date') {
            element.value = this.convertToDateString(element.value);
          }
          if (element.fieldType == 'phone') {
            element.value = `${element.extraValue} ${element.value}`;
          }
          const inputElementObj = {
            'fieldName': element.fieldName,
            'fieldType': element.fieldType,
            'fieldValue': element.value,
          };
          formElement.push(inputElementObj);
        });
        console.log(formElement);
        const methodParam = {
          'method': this.selectedMethod,
          'restaurant': this.util.getItem('_vendorId'),
          'formElement': formElement
        };
        console.log(methodParam);
        this.isSubmit = true;
        this.api.post_private('v1/vendor_web/payoutMethod/createPayoutMethod', methodParam).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false;
            this.util.onSuccess('ts_payout_method_saved');
            this.dialogRef.close({ event: 'update' });
          }, error: (error: any) => {
            console.log(error);
            this.isSubmit = false;
            this.util.handleError(error, 'vendor');
          }
        });
      } else {
        console.log('update');
        const formElement: any[] = [];
        this.inputElements.forEach((element) => {
          if (element.fieldType == 'date') {
            element.value = this.convertToDateString(element.value);
          }
          if (element.fieldType == 'phone') {
            element.value = `${element.extraValue} ${element.value}`;
          }
          const inputElementObj = {
            'fieldName': element.fieldName,
            'fieldType': element.fieldType,
            'fieldValue': element.value,
          };
          formElement.push(inputElementObj);
        });
        console.log(formElement);
        const methodParam = {
          'id': this.selectedMethod,
          'restaurant': this.util.getItem('_vendorId'),
          'formElement': formElement
        };
        console.log(methodParam);
        this.isSubmit = true;
        this.api.patch_private('v1/vendor_web/payoutMethod/updatePayoutMethod', methodParam).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false;
            this.util.onSuccess('ts_payout_method_updated');
            this.dialogRef.close({ event: 'update' });
          }, error: (error: any) => {
            console.log(error);
            this.isSubmit = false;
            this.util.handleError(error, 'vendor');
          }
        });
      }
    }
  }

  onMethodChangeEvent(event: MatSelectChange) {
    console.log(event);
    if (event.value != '') {
      const indexOfMethod = this.methods.findIndex((x) => x.id == event.value);
      console.log(indexOfMethod);
      if (indexOfMethod != -1) {
        this.haveSubmitClicked = false;
        this.inputElements = [];
        this.methods[indexOfMethod].formElement.forEach((element) => {
          const formInputElementObj = {
            'isRequired': element && element.isRequired == 'true' ? true : false,
            'fieldType': element.fieldType,
            'fieldName': element.fieldName,
            'placeholder': element.placeholder,
            'value': '',
            'extraValue': '',
          };
          this.inputElements.push(formInputElementObj);
        });
        console.log(this.inputElements);
      }
    }
  }

  onCountryCodeSelect(event: MatAutocompleteSelectedEvent, index: number) {
    console.log(event);
    console.log(index);
    if (event && event.option && event.option.value) {
      const splitString = event.option.value.split(' ');
      console.log(splitString);
      if (splitString && splitString instanceof Array && splitString.length) {
        this.inputElements[index].extraValue = splitString[1];
      }
    }
  }
}

export interface FormInputElementInterface {
  isRequired: boolean
  fieldType: string
  fieldName: string
  placeholder: string
  value: string
  extraValue: string
}
