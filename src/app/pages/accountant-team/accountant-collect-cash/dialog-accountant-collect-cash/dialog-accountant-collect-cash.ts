import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Observable, startWith, map } from 'rxjs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { AccountantCityListInterface } from 'src/app/interfaces/accountant.city.list.interface';
import { AccountantRestaurantListLimitedInfoInterface } from 'src/app/interfaces/accountant.restaurant.list.limited.detail.interface';
import { AccountantDeliverymanInfoInterface } from 'src/app/interfaces/accountant.deliveryman.info.interface';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-accountant-collect-cash',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-accountant-collect-cash.html',
})
export class DialogAccountantCollectCash {

  cashForm = new FormGroup({
    city: new FormControl('', [Validators.required]),
    from: new FormControl('restaurant', [Validators.required]),
    value: new FormControl('', [Validators.required]),
    method: new FormControl('', [Validators.required]),
    reference: new FormControl('', [Validators.required]),
    cashInHand: new FormControl({ value: 0, disabled: true }, Validators.required),
    amountToWallet: new FormControl({ value: 0, disabled: true }, Validators.required),
  });
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;

  cities: Observable<AccountantCityListInterface[]>;
  listOfCities: AccountantCityListInterface[] = [];
  cityCtrl = new FormControl('');

  restaurants: Observable<AccountantRestaurantListLimitedInfoInterface[]>;
  listOfRestaurants: AccountantRestaurantListLimitedInfoInterface[] = [];
  restaurantCtrl = new FormControl('');

  deliverymans: Observable<AccountantDeliverymanInfoInterface[]>;
  listOfDeliveryman: AccountantDeliverymanInfoInterface[] = [];
  deliverymanCtrl = new FormControl('');

  constructor(
    public util: UtilService,
    public api: ApiService,
    public dialogRef: MatDialogRef<DialogAccountantCollectCash>,
  ) {
    this.getCities();
  }

  getCities() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/accountant/city_list').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response) {
          this.listOfCities = response.map((city: AccountantCityListInterface) => {
            const translation = city.translations.find(t => t.code == this.util.appLocaleName());
            return {
              ...city,
              displayName: translation && translation.value ? translation.value : city.name
            };
          });
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCities(element) : this.listOfCities.slice()))
          );
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'accountant');
      }
    });
  }

  private _filterCities(value: any): AccountantCityListInterface[] {
    let filterValue: string;
    if (value && value.displayName) {
      filterValue = value.displayName;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfCities.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  onCitySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.cashForm.controls['method'].setValue('');
      this.cashForm.controls['value'].setValue('');
      this.cashForm.controls['reference'].setValue('');
      this.cashForm.controls['cashInHand'].setValue(0);
      this.cashForm.controls['amountToWallet'].setValue(0);
      console.log(this.cityCtrl.value);
      let selectedCitytId: any = this.cityCtrl.value;
      this.cashForm.controls['city'].setValue(selectedCitytId);
      if (this.cashForm.controls['from'].value == 'restaurant') {
        this.getRestaurantByCity(selectedCitytId.id);
      } else {
        this.getDeliverymanByCity(selectedCitytId.id);
      }
    }
  }

  getDeliverymanByCity(id: string) {
    console.log('get deliveryman', id);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/accountant/deliveryman_with_city/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.deliveryman) {
          this.listOfDeliveryman = response.deliveryman;
          this.deliverymans = this.deliverymanCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterDeliverman(element) : this.listOfDeliveryman.slice()))
          );
          console.log(this.deliverymans);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'accountant');
      }
    });
  }

  getRestaurantByCity(id: string) {
    console.log('get restaurants', id);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/accountant/restaurant_with_city/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.restaurants && response.restaurants) {
          const mappedList = response.restaurants.map(
            (item: AccountantRestaurantListLimitedInfoInterface) => {
              const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
              item.displayName = translation?.title || item.name;
              if (item && item.locality && item.locality?.translations) {
                const translation2 = item.locality.translations.find((t) => t.code == this.util.appLocaleName());
                item.locality.displayName = translation2?.value || item.locality.name;
              } else {
                item.locality.displayName = item.locality?.name || '';
              }
              return item;
            }
          );
          this.listOfRestaurants = mappedList;
          this.restaurants = this.restaurantCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterRestaurant(element) : this.listOfRestaurants.slice()))
          );
          console.log(this.restaurants);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'accountant');
      }
    });
  }

  private _filterRestaurant(value: any): AccountantRestaurantListLimitedInfoInterface[] {
    let filterValue: string;
    if (value && value.displayName) {
      filterValue = value.displayName;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfRestaurants.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  private _filterDeliverman(value: any): AccountantDeliverymanInfoInterface[] {
    let filterValue: string;
    console.log(value);
    if (value && value.driverInfo && value.driverInfo.firstName) {
      filterValue = value.driverInfo.firstName;
    } else {
      filterValue = value.toLowerCase();
    }
    console.log(filterValue);
    return this.listOfDeliveryman.filter((element) => element.driverInfo.firstName.toLocaleLowerCase().includes(filterValue));
  }

  onSelectCashFrom(event: MatSelectChange) {
    console.log(event);
    this.cashForm.controls['from'].setValue(event.value);
    this.cashForm.controls['method'].setValue('');
    this.cashForm.controls['value'].setValue('');
    this.cashForm.controls['reference'].setValue('');
    this.cashForm.controls['cashInHand'].setValue(0);
    this.cashForm.controls['amountToWallet'].setValue(0);
    this.cityCtrl.reset();
    this.restaurantCtrl.reset();
    this.deliverymanCtrl.reset();
  }

  displayCityName(city: AccountantCityListInterface) {
    return city && city.displayName ? city.displayName : '';
  }

  displayRestaurantName(restaurant: AccountantRestaurantListLimitedInfoInterface) {
    const restaurantName: string = restaurant && restaurant.displayName ? restaurant.displayName : '';
    const localityName: string = restaurant && restaurant.locality && restaurant.locality.displayName ? restaurant.locality.displayName : '';
    const ownerName: string = restaurant && restaurant.ownerInfo && restaurant.ownerInfo.firstName ? `${restaurant.ownerInfo.firstName} ${restaurant.ownerInfo.lastName}` : '';
    return restaurant && restaurant.name ? `${restaurantName} ${localityName != '' ? ' - ' + localityName : ''} ${ownerName != '' ? ' - ' + ownerName : ''}` : '';
  }

  displayDeliverymanName(deliverman: AccountantDeliverymanInfoInterface) {
    const name: string = deliverman && deliverman.driverInfo && deliverman.driverInfo.firstName ? `${deliverman.driverInfo.firstName} ${deliverman.driverInfo.lastName} - ${deliverman.driverInfo.contactEmail}` : '';
    return name;
  }

  onRestaurantSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      let selectedRestaurant: any = this.restaurantCtrl.value;
      if (selectedRestaurant && selectedRestaurant.id) {
        this.cashForm.controls['value'].setValue(selectedRestaurant.id);
        this.restaurantCashInHandAmount();
      }
    }
  }

  restaurantCashInHandAmount() {
    console.log('Get Restaurant Cash In Hand Amount');
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/accountant/restaurant_cash_in_hand/' + this.cashForm.controls['value'].value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success) {
          this.cashForm.controls['amountToWallet'].setValue(response.creditAmount);
          this.cashForm.controls['cashInHand'].setValue(response.cashInHandAmount);
        } else {
          this.cashForm.controls['amountToWallet'].setValue(0);
          this.cashForm.controls['cashInHand'].setValue(0);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'accountant');
      }
    });
  }

  onDeliverymanSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      let selectedDeliveryman: any = this.deliverymanCtrl.value;
      if (selectedDeliveryman && selectedDeliveryman.driverInfo && selectedDeliveryman.driverInfo.id) {
        console.log(selectedDeliveryman.driverInfo.id);
        this.cashForm.controls['value'].setValue(selectedDeliveryman.driverInfo.id);
        this.deliverymanCashInHandAmount();
      }
    }
  }

  deliverymanCashInHandAmount() {
    console.log('Get Deliveryman Cash In Hand Amount');
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/accountant/deliveryman_cash_in_hand/' + this.cashForm.controls['value'].value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success) {
          this.cashForm.controls['cashInHand'].setValue(response.cashInHandAmount);
        } else {
          this.cashForm.controls['cashInHand'].setValue(0);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'accountant');
      }
    });
  }

  get f() {
    return this.cashForm.controls;
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    console.log(this.cashForm.getRawValue());
    const cashInHand = this.cashForm.controls['cashInHand'].value ?? 0;
    if (this.cashForm.valid && cashInHand > 0) {
      console.log('Submit');
      if (this.cashForm.controls['from'].value == 'restaurant') {
        console.log('Collect from restaurant');
        const param = {
          'vendor': this.cashForm.controls['value'].value,
          'method': this.cashForm.controls['method'].value,
          'reference': this.cashForm.controls['reference'].value
        };
        const spinnerRef = this.util.start('ts_fetching');
        this.api.post_private('v1/accountant/restaurant_clear_cash_in_hand/', param).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            if (response && response.success) {
              this.util.onSuccess('ts_collected');
              this.dialogRef.close({ event: 'add', data: response });
            } else {
              this.util.onError('ts_something_went_wrong', '');
            }
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'accountant');
          }
        });
      } else {
        console.log('Collect from deliveryman');
        const param = {
          'deliveryman': this.cashForm.controls['value'].value,
          'method': this.cashForm.controls['method'].value,
          'reference': this.cashForm.controls['reference'].value
        };
        const spinnerRef = this.util.start('ts_fetching');
        this.api.post_private('v1/accountant/deliveryman_clear_cash_in_hand/', param).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            if (response && response.success) {
              this.util.onSuccess('ts_collected');
              this.dialogRef.close({ event: 'add', data: response });
            } else {
              this.util.onError('ts_something_went_wrong', '');
            }
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'accountant');
          }
        });
      }
    }
  }

}
