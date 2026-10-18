import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Observable, startWith, map } from 'rxjs';
import { AdminCitiesListLimitedInterface } from 'src/app/interfaces/admin.cities.list.limited.interface';
import { AdminDeliverymanListInterface } from 'src/app/interfaces/admin.deliveryman.list.interface';
import { AdminRestaurantListLimitedInfoInterface, RestaurantLocality } from 'src/app/interfaces/admin.restaurant.list.limited.info.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-collect-cash-dialog',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './collect-cash-dialog.html',
})
export class CollectCashDialog {

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
  cities: Observable<AdminCitiesListLimitedInterface[]>;
  listOfCities: AdminCitiesListLimitedInterface[] = [];
  cityCtrl = new FormControl('');
  restaurants: Observable<AdminRestaurantListLimitedInfoInterface[]>;
  listOfRestaurants: AdminRestaurantListLimitedInfoInterface[] = [];
  restaurantCtrl = new FormControl('');
  deliverymans: Observable<AdminDeliverymanListInterface[]>;
  listOfDeliveryman: AdminDeliverymanListInterface[] = [];
  deliverymanCtrl = new FormControl('');

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<CollectCashDialog>,
  ) {
    this.getCities();
  }

  getCities() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/cities/listAllCities').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response) {
          this.listOfCities = response;
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCities(element) : this.listOfCities.slice()))
          );
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  private _filterCities(value: any): AdminCitiesListLimitedInterface[] {
    let filterValue: string;
    if (value && value.name) {
      filterValue = value.name;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfCities.filter((element) =>
      this.getTranslatedCityName(element).toLowerCase().includes(filterValue)
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
      this.cashForm.controls['city'].setValue(event.option.value);
      if (this.cashForm.controls['from'].value == 'restaurant') {
        this.getRestaurantByCity(event.option.value);
      } else {
        this.getDeliverymanByCity(event.option.value);
      }
    }
  }

  getDeliverymanByCity(id: string) {
    console.log('get deliveryman', id);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/driver/getByCity/' + id).subscribe({
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
        this.util.handleError(error, 'admin');
      }
    });
  }

  getRestaurantByCity(id: string) {
    console.log('get restaurants', id);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/restaurant/getRestaurantByCityCollectCash/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.restaurants && response.restaurants) {
          const mappedList = response.restaurants.map(
            (item: AdminRestaurantListLimitedInfoInterface) => {
              if (item && item.locality && item.locality?.id) {
                if (item.locality?.translations) {
                  const translation = item.locality.translations.find((t) => t.code == this.util.appLocaleName());
                  item.locality.displayName = translation?.value || item.locality.name;
                } else {
                  item.locality.displayName = item.locality?.name || '';
                }
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
        this.util.handleError(error, 'admin');
      }
    });
  }

  private _filterRestaurant(value: any): AdminRestaurantListLimitedInfoInterface[] {
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

  private _filterDeliverman(value: any): AdminDeliverymanListInterface[] {
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

  getTranslateRestaurantName(item: AdminRestaurantListLimitedInfoInterface): string {
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

  displayDeliverymanName(deliverman: AdminDeliverymanListInterface) {
    const name: string = deliverman && deliverman.driverInfo && deliverman.driverInfo.firstName ? `${deliverman.driverInfo.firstName} ${deliverman.driverInfo.lastName} - ${deliverman.driverInfo.contactEmail}` : '';
    return name;
  }

  onRestaurantSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.cashForm.controls['value'].setValue(event.option.value);
      this.restaurantCashInHandAmount();
    }
  }

  restaurantCashInHandAmount() {
    console.log('Get Restaurant Cash In Hand Amount');
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/restaurant/cashInHand/' + this.cashForm.controls['value'].value).subscribe({
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
        this.util.handleError(error, 'admin');
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
    this.api.get_private('v1/admin/deliveryman/cashInHand/' + this.cashForm.controls['value'].value).subscribe({
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
        this.util.handleError(error, 'admin');
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
        this.api.post_private('v1/admin/restaurant/clearCashInHand/', param).subscribe({
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
            this.util.handleError(error, 'admin');
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
        this.api.post_private('v1/admin/deliveryman/clearCashInHand/', param).subscribe({
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
            this.util.handleError(error, 'admin');
          }
        });
      }
    }
  }

  getTranslatedCityName(item: AdminCitiesListLimitedInterface): string {
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
