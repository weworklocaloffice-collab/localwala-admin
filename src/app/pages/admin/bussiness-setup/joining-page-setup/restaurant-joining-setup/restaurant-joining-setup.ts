import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-restaurant-joining-setup',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './restaurant-joining-setup.html',
})
export class RestaurantJoiningSetup {

  defaultField: string[] = [];
  fieldForm = new FormGroup({
    formField: new FormArray<FormGroup>([]),
  })
  haveSubmitClicked: boolean = false;
  isSubmit: boolean = false;
  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
  ) {
    this.defaultField = [
      this.util.appTranslate('restaurant_name'),
      this.util.appTranslate('restaurant_address'),
      this.util.appTranslate('restaurant_description'),
      this.util.appTranslate('restaurant_city'),
      this.util.appTranslate('restaurant_locality'),
      this.util.appTranslate('owner_firstname'),
      this.util.appTranslate('owner_lastname'),
      this.util.appTranslate('owner_phone_number'),
      this.util.appTranslate('owner_email'),
      this.util.appTranslate('login_password'),
      this.util.appTranslate('restaurant_logo'),
      this.util.appTranslate('restaurant_cover'),
      this.util.appTranslate('cuisine'),
      this.util.appTranslate('restaurant_type'),
      this.util.appTranslate('restaurant_facilities'),
      this.util.appTranslate('accept_home_delivery'),
      this.util.appTranslate('accept_takeaway'),
      this.util.appTranslate('accept_schedule_order'),
      this.util.appTranslate('min_order_amount_lbl'),
      this.util.appTranslate('dish_for_two'),
      this.util.appTranslate('appx_delivery_time'),
      this.util.appTranslate('restaurant_license'),
    ];
    this.getDetail();
  }

  getDetail() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/restaurant_joining_form').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success && response.result && response.result.id && response.result.restaurantForm) {
          const form = response.result.restaurantForm;
          const formFields = this.fieldForm.get('formField') as FormArray;
          form.forEach((element: any) => {
            const savedItems = new FormArray<FormGroup>([]);
            if (element && element.items && element.items instanceof Array) {
              element.items.forEach((item: any) => {
                savedItems.push(this.fb.group({ name: [item.name, Validators.required] }));
              });
            }
            formFields.push(this.fb.group({
              uuid: new FormControl(element.uuid),
              isRequired: new FormControl(element.isRequired == 'true' || element.isRequired == true ? true : false),
              type: new FormControl(element.type),
              title: new FormControl(element.title, Validators.required),
              placeholder: element.type == 'choose' || element.type == 'file' ? new FormControl(element.placeholder) : new FormControl(element.placeholder, Validators.required),
              items: savedItems,
            }));
          });
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onAddFormField() {
    console.log('Add');
    const formFields = this.fieldForm.get('formField') as FormArray;
    formFields.push(this.fb.group({
      uuid: new FormControl(this.util.generateUUID()),
      isRequired: new FormControl(false),
      type: new FormControl('text'),
      title: new FormControl('', Validators.required),
      placeholder: new FormControl('', Validators.required),
      items: new FormArray([]),
    }));
    console.log(this.fieldForm);
  }

  onRemoveFormField(index: number) {
    console.log(index);
    this.fieldForm.controls['formField'].removeAt(index);
  }

  get formFields(): FormArray<FormGroup> {
    return this.fieldForm.controls.formField as FormArray<FormGroup>;
  }

  get f() {
    return this.fieldForm.controls;
  }

  onFieldTypeChangeEvent(event: MatSelectChange, index: number) {
    if (event.value == 'choose') {
      const formFields = this.fieldForm.get('formField') as FormArray;
      const placeholderField = formFields.controls[index].get('placeholder') as FormGroup;
      placeholderField.clearValidators();
      placeholderField.disable();
      placeholderField.updateValueAndValidity();
      const items = formFields.controls[index].get('items') as FormArray;
      items.push(this.fb.group({ name: new FormControl('', Validators.required) }));
      items.updateValueAndValidity();
    } else if (event.value == 'file') {
      const formFields = this.fieldForm.get('formField') as FormArray;
      const placeholderField = formFields.controls[index].get('placeholder') as FormGroup;
      placeholderField.clearValidators();
      placeholderField.disable();
      placeholderField.updateValueAndValidity();
    } else {
      const formFields = this.fieldForm.get('formField') as FormArray;
      const placeholderField = formFields.controls[index].get('placeholder') as FormGroup;
      placeholderField.setValidators(Validators.required);
      placeholderField.enable();
      placeholderField.updateValueAndValidity();
      const items = formFields.controls[index].get('items') as FormArray;
      items.clear();
      items.updateValueAndValidity();
    }
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    console.log(this.fieldForm);
    console.log(this.fieldForm.getRawValue());
    if (this.fieldForm.valid) {
      this.isSubmit = true;
      this.api.post_private('v1/admin/joining_form/restaurant', this.fieldForm.getRawValue()).subscribe({
        next: (response: any) => {
          console.log(response);
          this.isSubmit = false;
          this.util.onSuccess('ts_form_saved');
        }, error: (error: any) => {
          this.isSubmit = false;
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  getItems(index: number) {
    const formFields = this.fieldForm.get('formField') as FormArray;
    const items = formFields.at(index).get('items') as FormArray;
    return items?.controls ?? [];
  }

  onAddItemOnField(index: number) {
    console.log(index);
    const formFields = this.fieldForm.get('formField') as FormArray;
    const items = formFields.controls[index].get('items') as FormArray;
    items.push(this.fb.group({ name: new FormControl('', Validators.required) }));
    items.updateValueAndValidity();
  }

  onDeleteItemOnField(index: number, jIndex: number) {
    console.log(index, jIndex);
    const formFields = this.fieldForm.get('formField') as FormArray;
    const items = formFields.controls[index].get('items') as FormArray;
    items.removeAt(jIndex);
    items.updateValueAndValidity();
  }

  onReset() {
    console.log('reset');
    const formArray = this.fieldForm.get('formField') as FormArray;
    formArray.clear();
    this.fieldForm.reset();
    this.haveSubmitClicked = false;
    this.isSubmit = false;
  }

}
