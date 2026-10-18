import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-manage-subscription',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './manage-subscription.html',
})
export class ManageSubscription {

  action: string = 'add';
  id: string = '';
  subscriptionForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    shortDescriptions: new FormControl('', [Validators.required]),
    price: new FormControl('', [Validators.required]),
    discount: new FormControl(''),
    validity: new FormControl('', [Validators.required]),
    haveTrial: new FormControl(false, [Validators.required]),
    trialValidity: new FormControl(7),
    pos: new FormControl(false),
    ownDriver: new FormControl(false),
    promote: new FormControl(false),
    customCategory: new FormControl(false),
    multiOutlet: new FormControl(false), // multi outlet manage
    preBooking: new FormControl(false), // advance table booking
    tableOrder: new FormControl(false), // scan the table number and order from table
    tiffinSubscription: new FormControl(false), // Tiffin Subscription Orders
    ownWaiter: new FormControl(false), // waiter app
    ownKitchen: new FormControl(false), // kitchen app
    orderLimit: new FormControl(-1, [Validators.required]),
    productLimit: new FormControl(-1, [Validators.required]),
    icon: new FormControl('', [Validators.required]),
    commission: new FormControl('', [Validators.required]),
    translations: new FormArray([])
  });
  haveSubmitClicked: boolean = false;
  isFormSubmit: boolean = false;
  languages: any[] = [];
  translations: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public util: UtilService,
    public api: ApiService,
    private navCtrl: Location,
    private dialog: MatDialog,
  ) {
    this.action = this.route.snapshot.paramMap.get('action') ?? 'add';
    console.log(this.action);
    if (this.action != 'add') {
      this.id = this.route.snapshot.paramMap.get('id') ?? '';
      this.getById();
    } else {
      this.locale();
    }
    console.log(this.action, this.id);
    console.log(this.subscriptionForm);
  }

  getById() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/subscription/get/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.name && response.name != '' && response.id && response.id == this.id) {
          console.log('bind data');
          this.subscriptionForm.controls['name'].setValue(response.name);
          this.subscriptionForm.controls['shortDescriptions'].setValue(response.shortDescriptions);
          this.subscriptionForm.controls['price'].setValue(response.price);
          this.subscriptionForm.controls['discount'].setValue(response.discount);
          this.subscriptionForm.controls['validity'].setValue(response.validity);
          if (response && response.translations && response.translations instanceof Array) {

            this.translations = response.translations;
          }
          const customCategory = response && response.customCategory ? response.customCategory : false;
          const ownDriver = response && response.ownDriver ? response.ownDriver : false;
          const pos = response && response.pos ? response.pos : false;
          const promote = response && response.promote ? response.promote : false;
          const multiOutlet = response && response.multiOutlet ? response.multiOutlet : false;
          const preBooking = response && response.preBooking ? response.preBooking : false;
          const tableOrder = response && response.tableOrder ? response.tableOrder : false;
          const tiffinSubscription = response && response.tiffinSubscription ? response.tiffinSubscription : false;
          const ownWaiter = response && response.ownWaiter ? response.ownWaiter : false;
          const ownKitchen = response && response.ownKitchen ? response.ownKitchen : false;
          console.log(customCategory, ownDriver, pos, promote, multiOutlet, preBooking, tableOrder);
          this.subscriptionForm.controls['customCategory'].setValue(customCategory == true || customCategory == 'true' ? true : false);
          this.subscriptionForm.controls['ownDriver'].setValue(ownDriver == true || ownDriver == 'true' ? true : false);
          this.subscriptionForm.controls['pos'].setValue(pos == true || pos == 'true' ? true : false);
          this.subscriptionForm.controls['promote'].setValue(promote == true || promote == 'true' ? true : false);
          this.subscriptionForm.controls['multiOutlet'].setValue(multiOutlet == true || multiOutlet == 'true' ? true : false);
          this.subscriptionForm.controls['preBooking'].setValue(preBooking == true || preBooking == 'true' ? true : false);
          this.subscriptionForm.controls['tableOrder'].setValue(tableOrder == true || tableOrder == 'true' ? true : false);
          this.subscriptionForm.controls['tiffinSubscription'].setValue(tiffinSubscription == true || tiffinSubscription == 'true' ? true : false);
          this.subscriptionForm.controls['ownWaiter'].setValue(ownWaiter == true || ownWaiter == 'true' ? true : false);
          this.subscriptionForm.controls['ownKitchen'].setValue(ownKitchen == true || ownKitchen == 'true' ? true : false);
          this.subscriptionForm.controls['haveTrial'].setValue(response.haveTrial);
          this.subscriptionForm.controls['trialValidity'].setValue(response.trialValidity);
          this.subscriptionForm.controls['orderLimit'].setValue(response.orderLimit);
          this.subscriptionForm.controls['productLimit'].setValue(response.productLimit);
          this.subscriptionForm.controls['commission'].setValue(response.commission);

          if (response && response.icon && response.icon != 'NA') {
            this.subscriptionForm.controls['icon'].setValue(response && response.icon ? response.icon : '');
          }

          this.locale();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.navCtrl.back();
        this.util.handleError(error, 'admin');
      }
    });
  }

  locale() {
    if (Array.isArray(this.util.locales) && this.util.locales.length > 0) {
      this.languages = [];
      this.util.locales.forEach((element) => {
        const locale = {
          code: element.code,
          name: element.name,
          nativeName: element.nativeName,
          title: '',
          shortDescriptions: ''
        };
        this.languages.push(locale);
      });
      this.languages.forEach((locale) => {
        this.translations.forEach((translate) => {
          if (locale.code == translate.code) {
            locale.title = translate.title;
            locale.shortDescriptions = translate.shortDescriptions;
          }
        });
      });
    }
  }

  onSubmit() {
    console.log('submit', this.action);
    const locale = this.subscriptionForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], title: [element.title], shortDescriptions: [element.shortDescriptions] }));
    });
    console.log(this.subscriptionForm.value);
    this.isFormSubmit = true;
    if (this.subscriptionForm.invalid) {
      let element = document.getElementById('topContent');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (this.subscriptionForm.valid) {
      if (this.action == 'add') {
        this.saveSubscription();
      } else {
        this.updateSubscription();
      }
    }
  }

  saveSubscription() {
    console.log('on save');
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/admin/subscription/save', this.subscriptionForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_subscription_added');
        this.navCtrl.back();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  updateSubscription() {
    console.log('on update');
    const spinnerRef = this.util.start('ts_updating');
    this.api.patch_private('v1/admin/subscription/update/' + this.id, this.subscriptionForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_subscription_updated');
        this.navCtrl.back();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  get f() {
    return this.subscriptionForm.controls;
  }

  onTrialChange(event: MatSlideToggleChange) {
    console.log(event);
    this.subscriptionForm.controls['haveTrial'].setValue(event.checked);
    if (event.checked == true) {
      this.subscriptionForm.controls['trialValidity'].setValidators([Validators.required]);
    } else {
      this.subscriptionForm.controls['trialValidity'].clearValidators();
      this.subscriptionForm.controls['trialValidity'].setValue(7);
    }
  }

  onOrderLimitChange(type: string) {
    console.log(type);
    if (type != 'unlimited') {
      console.log('custome');
      this.subscriptionForm.controls['orderLimit'].setValue(500);
    } else {
      console.log('unlimited');
      this.subscriptionForm.controls['orderLimit'].setValue(-1);
    }
  }

  onProductLimitChange(type: string) {
    console.log(type);
    if (type != 'unlimited') {
      console.log('custome');
      this.subscriptionForm.controls['productLimit'].setValue(100);
    } else {
      console.log('unlimited');
      this.subscriptionForm.controls['productLimit'].setValue(-1);
    }
  }

  onReset() {
    console.log('reset');
    this.subscriptionForm.reset();
    this.isFormSubmit = false;
    this.subscriptionForm.controls['name'].setValue('');
    this.subscriptionForm.controls['price'].setValue('');
    this.subscriptionForm.controls['shortDescriptions'].setValue('');
    this.subscriptionForm.controls['validity'].setValue('');
    this.subscriptionForm.controls['productLimit'].setValue(-1);
    this.subscriptionForm.controls['orderLimit'].setValue(-1);
    this.subscriptionForm.controls['icon'].setValue('');
    this.subscriptionForm.controls['haveTrial'].setValue(false);
    this.subscriptionForm.controls['pos'].setValue(false);
    this.subscriptionForm.controls['ownDriver'].setValue(false);
    this.subscriptionForm.controls['customCategory'].setValue(false);
    this.subscriptionForm.controls['promote'].setValue(false);
    this.subscriptionForm.controls['multiOutlet'].setValue(false);
    this.subscriptionForm.controls['preBooking'].setValue(false);
    this.subscriptionForm.controls['tableOrder'].setValue(false);
    this.subscriptionForm.controls['tiffinSubscription'].setValue(false);
    this.subscriptionForm.controls['ownWaiter'].setValue(false);
    this.subscriptionForm.controls['ownKitchen'].setValue(false);
    this.subscriptionForm.controls['commission'].setValue('');
    let element = document.getElementById('topContent');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    console.log(this.subscriptionForm);
    console.log(this.subscriptionForm.value);
    const localeMapped = this.languages.map((item) => {
      item.title = '';
      item.shortDescriptions = '';
      return item;
    });
    this.languages = localeMapped;
  }

  onImagePicker() {
    console.log('on image picker');
    const dialogRef = this.dialog.open(SelectMediaDialog, {
      data: { value: this.subscriptionForm.controls['icon'].value },
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
        this.subscriptionForm.controls['icon'].setValue(result.data);
      }
    });
  }

}
