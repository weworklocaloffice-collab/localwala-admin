import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, map, startWith } from 'rxjs';
import { VendorCategoriesListLimitedInterface } from 'src/app/interfaces/vendor.categories.list.limited.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-vendor-sub-category',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-vendor-sub-category.html',
})
export class DialogVendorSubCategory {

  action: string = 'create';
  categoryForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
    restaurant: new FormControl(''),
    translations: new FormArray([])
  });
  isSubmit: boolean = false;
  id: string = '';
  languages: any[] = [];
  translations: any[] = [];
  haveSubmitClicked: boolean = false;
  categories: Observable<VendorCategoriesListLimitedInterface[]>;
  listOfCategories: VendorCategoriesListLimitedInterface[] = [];
  categoriesCtrl = new FormControl('');
  tempCategory: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogVendorSubCategory>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.categoryForm.controls['restaurant'].setValue(this.util.getItem('_vendorId'));
    console.log(this.data);
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      this.id = values.id;
      this.categoryForm.controls['name'].setValue(values && values.name ? values.name : '');
      if (values && values.category && values.category.id && values.category.id != '') {
        this.tempCategory = values.category.id;
      }
      if (values && values.translations && values.translations instanceof Array) {
        this.translations = values.translations;
      }
    }
    this.getCategories();
    this.locale();
  }

  getCategories() {
    console.log('get categories');
    this.api.get_private('v1/vendor_web/vendor_category/getAllMyCategory/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        if (response) {
          this.listOfCategories = response;
          this.categories = this.categoriesCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterArrayItems(element) : this.listOfCategories.slice()))
          );
          if (this.action == 'edit') {
            this.categoryForm.controls['category'].setValue(this.tempCategory);
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  private _filterArrayItems(value: string): VendorCategoriesListLimitedInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCategories.filter((element) =>
      element.name.toLowerCase().includes(filterValue)
    );
  }

  onCategorySelect(event: any) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.categoryForm.controls['category'].setValue(event.option.value);
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
    const locale = this.categoryForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    console.log(this.categoryForm);
    if (this.categoryForm.valid) {
      if (this.action == 'create') {
        this.onSave();
      } else {
        this.onUpdate();
      }
    }
  }

  onSave() {
    this.isSubmit = true;
    this.api.post_private('v1/vendor_web/vendor_sub_category/save', this.categoryForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_category_added');
        this.dialogRef.close({ event: 'add', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onUpdate() {
    this.isSubmit = true;
    this.api.patch_private('v1/vendor_web/vendor_sub_category/update/' + this.id, this.categoryForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_category_updated');
        this.dialogRef.close({ event: 'update', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  get f() {
    return this.categoryForm.controls;
  }

  displayItemyName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfCategories.find(item => item.id == id);
    return selected ? this.getTranslatedItemName(selected) : '';
  };

  getTranslatedItemName(item: VendorCategoriesListLimitedInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

}
