import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Observable, map, startWith } from 'rxjs';
import { CityzenRestaurantListLimitedInfoInterface, RestaurantLocality } from 'src/app/interfaces/cityzen.restaurant.list.limited.info.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-cityzen-addon',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-cityzen-addon.html',
})
export class DialogCityzenAddon {

  action: string = 'create';
  addonForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    price: new FormControl('', [Validators.required]),
    restaurant: new FormControl('', [Validators.required]),
    stockType: new FormControl('unlimited', [Validators.required]),
    stockNumber: new FormControl('-1', [Validators.required]),
    translations: new FormArray([])
  });
  isSubmit: boolean = false;
  id: string = '';
  languages: any[] = [];
  translations: any[] = [];
  haveSubmitClicked: boolean = false;
  restaurants: Observable<CityzenRestaurantListLimitedInfoInterface[]>;
  listOfRestaurants: CityzenRestaurantListLimitedInfoInterface[] = [];
  restaurantCtrl = new FormControl('');

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogCityzenAddon>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      this.id = values.id;
      this.addonForm.controls['name'].setValue(values && values.name ? values.name : '');
      this.addonForm.controls['price'].setValue(values && values.price ? values.price : '');
      this.addonForm.controls['restaurant'].setValue(values && values.restaurant ? values.restaurant : '');
      this.addonForm.controls['stockType'].setValue(values.stockType);
      if (values.stockType == 'unlimited') {
        this.addonForm.controls['stockNumber'].setValue('-1');
        this.addonForm.controls['stockNumber'].disable();
      } else {
        this.addonForm.controls['stockNumber'].setValue(values.stockNumber);
        this.addonForm.controls['stockNumber'].enable();
      }
      if (values && values.translations && values.translations instanceof Array) {

        this.translations = values.translations;
      }
    } else {
      this.addonForm.controls['stockNumber'].clearValidators();
      this.addonForm.controls['stockNumber'].disable();
      this.addonForm.controls['stockNumber'].patchValue('-1');
      this.getRestaurantByCity();
    }
    this.locale();
  }

  getRestaurantByCity() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/restaurant_cityzen/' + this.util.getItem('_uid')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.restaurants) {
          this.listOfRestaurants = response.restaurants;
          this.restaurants = this.restaurantCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterRestaurant(element) : this.listOfRestaurants.slice()))
          );
          console.log(this.restaurants);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  private _filterRestaurant(value: any): CityzenRestaurantListLimitedInfoInterface[] {
    let filterValue: string;
    if (value && value.name) {
      filterValue = value.name;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfRestaurants.filter((element) =>
      this.getTranslateRestaurantName(element).toLowerCase().includes(filterValue)
    );
  }


  getTranslateRestaurantName(item: CityzenRestaurantListLimitedInfoInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.title) {
        return found.title;
      }
    }
    return item.name;
  }

  getLocalityName(item: RestaurantLocality): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find((t) => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayRestaurantName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfRestaurants.find(item => item.id == id);
    const selectedLocality = selected ? this.getLocalityName(selected.locality) : '';
    const restaurantName = selected ? this.getTranslateRestaurantName(selected) : '';
    const ownerName: string = selected && selected.ownerInfo && selected.ownerInfo.firstName ? `${selected.ownerInfo.firstName} ${selected.ownerInfo.lastName}` : '';
    return `${restaurantName} ${selectedLocality ? ' - ' + selectedLocality + ' - ' + ownerName : ''}`
  };

  onRestaurantSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.addonForm.controls['restaurant'].setValue(event.option.value);
    }
  }

  locale() {
    if (Array.isArray(this.util.locales) && this.util.locales.length > 0) {
      this.languages = [];
      this.util.locales.forEach((element) => {
        const locale = {
          code: element.code,
          name: element.name,
          nativeName: element.nativeName,
          value: ''
        };
        this.languages.push(locale);
      });
      this.languages.forEach((locale) => {
        this.translations.forEach((translate) => {
          if (locale.code == translate.code) {
            locale.value = translate.value;
          }
        });
      });
    }
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    console.log('submit', this.action, this.languages);
    const locale = this.addonForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    console.log(this.addonForm);
    if (this.addonForm.valid) {
      if (this.action == 'create') {
        this.saveAddon();
      } else {
        this.updateAddon();
      }
    }
  }

  saveAddon() {
    this.isSubmit = true;
    this.api.post_private('v1/cityzen/create_addon', this.addonForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_addon_added');
        this.dialogRef.close({ event: 'add', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  updateAddon() {
    this.isSubmit = true;
    this.api.patch_private('v1/cityzen/update_addons/' + this.id, this.addonForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_addon_updated');
        this.dialogRef.close({ event: 'update', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  get f() {
    return this.addonForm.controls;
  }

  onStockChangeEvent(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == 'unlimited') {
      this.addonForm.controls['stockNumber'].setValue('-1');
      this.addonForm.controls['stockNumber'].clearValidators();
      this.addonForm.controls['stockNumber'].disable();
    } else {
      this.addonForm.controls['stockNumber'].setValue('');
      this.addonForm.controls['stockNumber'].setValidators(Validators.required);
      this.addonForm.controls['stockNumber'].enable();
    }
  }

}
