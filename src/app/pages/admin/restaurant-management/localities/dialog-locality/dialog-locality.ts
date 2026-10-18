import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, map, startWith } from 'rxjs';
import { AdminCitiesListLimitedInterface } from 'src/app/interfaces/admin.cities.list.limited.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-locality',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-locality.html',
})
export class DialogLocality {

  action: string = 'create';
  localityForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    latitude: new FormControl('', [Validators.required]),
    longitude: new FormControl('', [Validators.required]),
    type: new FormControl('Point', [Validators.required]),
    translations: new FormArray([])
  });
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;
  id: string = '';
  languages: any[] = [];
  translations: any[] = [];
  cities: Observable<AdminCitiesListLimitedInterface[]>;
  listOfCities: AdminCitiesListLimitedInterface[] = [];
  localityCtrl = new FormControl('');
  tempCity: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogLocality>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      this.id = values.id;
      this.localityForm.controls['name'].setValue(values && values.name ? values.name : '');
      if (values && values.location && values.location.coordinates && values.location.coordinates.length) {
        this.localityForm.controls['latitude'].setValue(values && values.location && values.location.coordinates && values.location.coordinates.length ? values.location.coordinates[1] : '');
        this.localityForm.controls['longitude'].setValue(values && values.location && values.location.coordinates && values.location.coordinates.length ? values.location.coordinates[0] : '');
      }
      if (values && values.city && values.city.id && values.city.id != '') {
        this.tempCity = values.city.id;
      }
      console.log(this.localityForm.value);
      if (values && values.translations && values.translations instanceof Array) {
        this.translations = values.translations;
      }
    }
    this.getCities();
    this.locale();
  }

  getCities() {
    this.api.get_private('v1/admin/cities/listAllCities').subscribe({
      next: (response: any) => {
        console.log(response);
        if (response) {
          this.listOfCities = response;
          this.cities = this.localityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterArrayItems(element) : this.listOfCities.slice()))
          );
          if (this.action == 'edit') {
            this.localityForm.controls['city'].setValue(this.tempCity);
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
    console.log('submit', this.action, this.localityForm);
    const locale = this.localityForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    console.log(this.localityForm);
    this.isFormSubmit = true;
    if (this.localityForm.valid) {
      console.log('send form', this.localityForm.value);
      if (this.action == 'create') {
        this.isSubmit = true;
        this.api.post_private('v1/admin/localities/save', this.localityForm.value).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false
            this.util.onSuccess('ts_locality_added');
            this.dialogRef.close({ event: 'add', data: response });
          }, error: (error: any) => {
            this.isSubmit = false;
            this.util.handleError(error, 'admin');
          }
        });
      } else {
        this.isSubmit = true;
        this.api.patch_private('v1/admin/localities/update/' + this.id, this.localityForm.value).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false;
            this.util.onSuccess('ts_locality_updated');
            this.dialogRef.close({ event: 'update', data: response });
          }, error: (error: any) => {
            console.log(error);
            this.isSubmit = false;
            this.util.handleError(error, 'admin');
          }
        });
      }
    }
  }

  get f() {
    return this.localityForm.controls;
  }

  onCitySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.localityForm.controls['city'].setValue(event.option.value);
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
