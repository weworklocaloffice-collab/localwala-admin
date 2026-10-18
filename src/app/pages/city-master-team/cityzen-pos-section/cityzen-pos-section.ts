import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { Observable, map, of, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { PosFoodInfoInterface } from 'src/app/interfaces/pos.food.info.interface';
import { MatDialog } from '@angular/material/dialog';
import { PosCartItemInterface } from 'src/app/interfaces/pos.cart.item.interface';
import { MatTableDataSource } from '@angular/material/table';
import { AdminPOSSectionRestaurantSlotsInterface, TimesConfigInterface } from 'src/app/interfaces/admin.pos.section.restaurant.slots.interface';
import { DateTime } from 'luxon';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CityzenPOSSectionRestaurantInterface } from 'src/app/interfaces/cityzen.pos.section.restaurant.interface';
import { CityzenPOSSectionCategoryInterface } from 'src/app/interfaces/cityzen.pos.section.category.interface';
import { CityzenPOSSectionCustomerDeliveryAddressInterface } from 'src/app/interfaces/cityzen.pos.section.customer.delivery.address.interface';
import { CityzenPOSSectionDateInterface } from 'src/app/interfaces/cityzen.pos.section.date.interface';
import { CityzenPOSSectionCartItemRequestInterface, POSCartVariationConfig } from 'src/app/interfaces/cityzen.pos.section.cart.item.request.interface';
import { CityzenPosSelectCustomerDialog } from './cityzen-pos-select-customer-dialog/cityzen-pos-select-customer-dialog';
import { CityzenPosNewCustomerDialog } from './cityzen-pos-new-customer-dialog/cityzen-pos-new-customer-dialog';
import { CityzenPosCustomerAddressDialog } from './cityzen-pos-customer-address-dialog/cityzen-pos-customer-address-dialog';
import { CityzenPosFoodInfoDialog } from './cityzen-pos-food-info-dialog/cityzen-pos-food-info-dialog';
import { AdminPOSSectionTimeslotInterface } from 'src/app/interfaces/admin.pos.section.timeslot.interface';
import { CityzenPosSectionCustomerDetailSchemaInterface } from 'src/app/interfaces/cityzen.pos.section.customer.detail.schema.interface';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-pos-section',
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, NgIcon],
  templateUrl: './cityzen-pos-section.html',
})
export class CityzenPosSection {

  cityLat: number = 0;
  cityLng: number = 0;
  restaurants: Observable<CityzenPOSSectionRestaurantInterface[]>;
  listOfRestaurants: CityzenPOSSectionRestaurantInterface[] = [];
  restaurantCtrl = new FormControl('');
  restaurantId: string = '';
  additionalServiceAmount: number = 0;
  additionalServiceCharge: boolean = false;
  additionalServiceName: string = '';
  foodTaxAmount: number = 0;
  foodTaxName: string = '';
  foodTaxType: string = '';
  includeTaxOnFood: boolean = false;
  deliveryArea: number = 0;
  deliveryChargeAmount: number = 0;
  deliveryChargeMethod: string = 'distance';
  findMode: string = 'km';
  freeDelivery: number = 0;
  freeDeliveryInDistance: number = 0;
  haveFreeDeliveryInDistance: boolean = false;
  haveFreeDeliveryInTotal: boolean = false;
  categoryIndex: number = 0;
  categories: CityzenPOSSectionCategoryInterface[] = [];
  foodKind: string = '';
  categoryId: string = '';
  products: PosFoodInfoInterface[] = [];
  foodFetch: boolean = true;
  posItems: PosCartItemInterface[] = [];
  cartItemColumn: string[] = ['name', 'quantity', 'totalPrice', 'id'];
  customerId: string = '';
  customerDisplayTag: string = '';
  customerDetailFetched: boolean = false;
  customerImage: string = '';
  customerName: string = '';
  customerEmail: string = '';
  customerMobile: string = '';
  customerWalletFund: number = 0;
  customerPoints: number = 0;
  customerDetail = new MatTableDataSource<CityzenPosSectionCustomerDetailSchemaInterface>([]);
  customerTableColumns: string[] = ['name', 'info'];
  customerDeliveryAddress: CityzenPOSSectionCustomerDeliveryAddressInterface = {
    receiverName: '',
    flatHouse: '',
    locality: '',
    countryCode: '',
    receiverContact: '',
    landmark: '',
    longitude: 0,
    latitude: 0,
  };
  customerDeliveryFullAddress: string = '';
  havePackagingCharges: boolean = false;
  includePackagesChargesInTax: boolean = false;
  packagingCharges: number = 0;
  packagingChargesTax: number = 0;
  realTotal: number = 0;
  itemTotal: number = 0;
  itemDiscount: number = 0;
  serviceCharge: number = 0;
  foodServiceCharge: number = 0;
  deliveryCharge: number = 0;
  grandTotal: number = 0;
  customerCanOrderWithinDays: number = 0;
  customerOrderDate: number = 0;
  homeDelivery: boolean = false;
  instantOrder: boolean = false;
  scheduleDelivery: boolean = false;
  orderTakeAway: boolean = false;
  timeIntervalForScheduleDeliveryType: string = 'min';
  timeIntervalForScheduleDeliveryValue: string = '30';
  canEarnBuyFromWallet: boolean = false;
  canEarnLoyaltyPointOnOrder: boolean = false;
  restaurantLatitude: number = 0;
  restuarantLongitude: number = 0;
  acceptHomeDelivery: boolean = false;
  acceptScheduleDelivery: boolean = false;
  minOrderAmount: number = 0;
  restaurantTakeAway: boolean = false;
  restaurantSlots: AdminPOSSectionRestaurantSlotsInterface[] = [];
  permissionList: string[] = [];
  dateList: CityzenPOSSectionDateInterface[] = [];
  dateIndex: number = 0;
  slotList: AdminPOSSectionTimeslotInterface[] = [];
  orderTo: string = 'homedelivery';
  scheduleDate: string = '';
  scheduleTime: string = '';
  canDeliverNow: boolean = false;
  isInstantOrder: boolean = false;
  isScheduleOrder: boolean = false;
  isMinAmountSatisfied: boolean = false;
  walletUsed: boolean = false;
  walletAmount: number = 0;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
  ) {
    this.initialDetail();
  }

  initialDetail() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/pos_initial/' + this.util.getItem('_uid')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);

        if (response && response.business && response.business.id != '') {
          const business = response.business;
          this.additionalServiceAmount = business.additionalServiceAmount;
          this.additionalServiceCharge = business.additionalServiceCharge;
          this.additionalServiceName = business.additionalServiceName;
          this.foodTaxAmount = business.foodTaxAmount;
          this.foodTaxName = business.foodTaxName;
          this.foodTaxType = business.foodTaxType;
          this.includeTaxOnFood = business.includeTaxOnFood;
          this.deliveryArea = business.deliveryArea;
          this.deliveryChargeAmount = business.deliveryChargeAmount;
          this.deliveryChargeMethod = business.deliveryChargeMethod;
          this.findMode = business.findMode;
          this.freeDelivery = business.freeDelivery;
          this.freeDeliveryInDistance = business.freeDeliveryInDistance;
          this.haveFreeDeliveryInDistance = business.haveFreeDeliveryInDistance;
          this.haveFreeDeliveryInTotal = business.haveFreeDeliveryInTotal;

          if (business.additionalServiceCharge == true) {
            this.serviceCharge = business.additionalServiceAmount;
          }
        }

        if (response && response.packaging && response.packaging.id != '') {
          const packaging = response.packaging;
          this.havePackagingCharges = packaging.havePackagingCharges;
          this.includePackagesChargesInTax = packaging.includePackagesChargesInTax;
          if (this.havePackagingCharges == true) {
            this.packagingCharges = packaging.packagingCharges;
          }
          if (this.havePackagingCharges == true) {
            if (this.includePackagesChargesInTax == true) {
              function percentage(numFirst: number, per: number) {
                return (numFirst / 100) * per;
              }
              const total = (parseFloat(percentage(packaging.packagingCharges, packaging.packagingChargesTax).toString())).toFixed(2);
              this.packagingChargesTax = parseFloat(total);
            }
          }
        }

        if (response && response.customer && response.customer.id != '') {
          const customer = response.customer;
          this.canEarnBuyFromWallet = customer.canEarnBuyFromWallet;
          this.canEarnLoyaltyPointOnOrder = customer.canEarnLoyaltyPointOnOrder;
        }

        if (response && response.orders && response.orders.id != '') {
          const order = response.orders;
          this.customerCanOrderWithinDays = order.customerCanOrderWithinDays;
          this.customerOrderDate = order.customerOrderDate;
          this.homeDelivery = order.homeDelivery;
          this.instantOrder = order.instantOrder;
          this.scheduleDelivery = order.scheduleDelivery;
          this.orderTakeAway = order.takeaway;
          if (response && response.orders && response.orders.timeIntervalForScheduleDelivery) {
            const interval = response.orders.timeIntervalForScheduleDelivery;
            this.timeIntervalForScheduleDeliveryType = interval.type;
            this.timeIntervalForScheduleDeliveryValue = interval.value;
          }
          this.dateList = [];
          const loopThroght = this.customerCanOrderWithinDays != 0 ? this.customerCanOrderWithinDays : 5;
          Array.from({ length: loopThroght }, (_, i) => {
            this.dateList.push(
              {
                label: DateTime.now().plus({ days: i }).setLocale(this.util.appLocaleName()).toFormat('ccc dd LLL'),
                date: DateTime.now().plus({ days: i }).toFormat('yyyy-MM-dd'),
              }
            );
          });
          this.scheduleDate = DateTime.now().toFormat('yyyy-MM-dd');
          console.log(this.dateList);
        }

        if (response && response.restaurants) {
          this.listOfRestaurants = response.restaurants;
          this.restaurants = this.restaurantCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterRestaurant(element) : this.listOfRestaurants.slice()))
          );
        }

        this.calculateItemTotal();
      },
      error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      },
    });
  }

  onRestaurantSelect(restaurant: MatAutocompleteSelectedEvent) {
    console.log(restaurant);
    if (restaurant && restaurant.option && restaurant.option.value && restaurant.option.value) {
      this.restaurantId = restaurant.option.value;
      this.categoryIndex = 0;
      this.categories = [];
      this.foodKind = '';
      this.categoryId = '';
      this.posItems = [];
      this.calculateItemTotal();
      this.getRestaurantData();
    }
  }

  translateFoodList() {
    const mappedList = this.products.map(
      (item: PosFoodInfoInterface) => {
        if (item.translations) {
          const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
          item.displayName = translation?.title || item.name;
          item.displayShortDescription = translation?.shortDescription || item.shortDescription;
        } else {
          item.displayName = item?.name || '';
          item.displayShortDescription = item?.shortDescription || '';
        }
        return item;
      }
    );
    this.products = mappedList;
  }

  getRestaurantData() {
    this.foodFetch = false;
    this.api.get_private('v1/cityzen/pos_categories/' + this.restaurantId).subscribe({
      next: (response: any) => {
        console.log(response);
        this.foodFetch = true;
        this.categories = [];
        const allCategoryObject = {
          name: this.util.appTranslate('dd_all'),
          kind: 'all',
          id: 'all',
        };
        this.categories.push(allCategoryObject);
        if (response && response.success == true) {
          const categories = response.categories;
          if (categories && categories.category && Array.isArray(categories.category) && categories.category.length > 0) {
            const cateList = categories.category.map((item: any) => {
              if (item.category_translations) {
                const mainTranslation = item.category_translations.find((t: any) => t.code == this.util.appLocaleName());
                item.category_name = mainTranslation?.value || item.name;
              }
              return item;
            });
            cateList.forEach((element: any) => {
              const categoryObject = {
                name: element.category_name,
                kind: 'main',
                id: element.category_id,
              };
              this.categories.push(categoryObject);
            });
          }
          if (categories && categories.own && Array.isArray(categories.own) && categories.own.length > 0) {
            const cateList = categories.own.map((item: any) => {
              if (item.category_translations) {
                const mainTranslation = item.category_translations.find((t: any) => t.code == this.util.appLocaleName());
                item.category_name = mainTranslation?.value || item.name;
              }
              return item;
            });
            cateList.forEach((element: any) => {
              const categoryObject = {
                name: element.category_name,
                kind: 'custom',
                id: element.category_id,
              };
              this.categories.push(categoryObject);
            });
          }

          if (response && response.restaurant && response.restaurant.id != '') {
            const restaurant = response.restaurant;
            this.acceptHomeDelivery = restaurant.acceptHomeDelivery;
            this.acceptScheduleDelivery = restaurant.acceptScheduleDelivery;
            this.minOrderAmount = restaurant.minOrderAmount;
            this.restaurantTakeAway = restaurant.takeAway;
            if (restaurant && restaurant.slots && restaurant.slots.length > 0) {
              this.restaurantSlots = restaurant.slots;
              this.getSlotFromDate(DateTime.now().toJSDate()).then((slots) => {
                const translatedSlotList: AdminPOSSectionTimeslotInterface[] = [];
                slots.forEach((slotElement) => {
                  translatedSlotList.push({
                    label: DateTime.fromFormat(slotElement, "h:mm a").setLocale(this.util.appLocaleName()).toLocaleString(DateTime.TIME_SIMPLE),
                    slot: slotElement
                  });
                });
                this.slotList = translatedSlotList;
                if (slots.length == 0) {
                  this.canDeliverNow = false;
                } else {
                  const dayNumberOfDate = (DateTime.now().weekday + 6) % 7;
                  const currentDayIndex = this.restaurantSlots.findIndex((x) => x.day == dayNumberOfDate);
                  if (currentDayIndex != -1) {
                    this.canDeliverNow = this.checkCurrentTimeInSlots(this.restaurantSlots[dayNumberOfDate].times || []);
                    this.isInstantOrder = this.canDeliverNow;
                  } else {
                    this.canDeliverNow = false;
                  }
                }
              }).catch((error) => {
                console.log(error);
                this.slotList = [];
                this.canDeliverNow = false;
              });
            } else {
              this.restaurantSlots = [];
              this.slotList = [];
              this.canDeliverNow = false;
            }

            if (restaurant && restaurant.location && restaurant.location.coordinates && restaurant.location.coordinates.length > 0) {
              const coordinates = restaurant.location.coordinates;
              this.restaurantLatitude = coordinates[1];
              this.restuarantLongitude = coordinates[0];
              console.log(`---- ${this.restaurantLatitude} | ${this.restuarantLongitude} ----`);
            }
          }
          this.permissionList = [];
          if (this.homeDelivery && this.acceptHomeDelivery) {
            this.permissionList.push('homedelivery');
          }
          if (this.orderTakeAway && this.restaurantTakeAway) {
            this.permissionList.push('takeaway');
          }
          if (this.scheduleDelivery && this.acceptScheduleDelivery) {
            this.permissionList.push('schedule');
          }
          if (this.permissionList.includes('homedelivery')) {
            this.orderTo = 'homedelivery';
          } else if (!this.permissionList.includes('homedelivery') && this.permissionList.includes('takeaway')) {
            this.orderTo = 'selfpickup';
          }
          console.log('permission', this.permissionList, this.orderTo);
          this.getDeliverySection();
        }
      },
      error: (error: any) => {
        console.log(error);
        this.foodFetch = true;
        this.util.handleError(error, 'cityzen');
      },
    });
  }

  checkCurrentTimeInSlots(timeSlotsOfDay: TimesConfigInterface[]): boolean {
    const currentTime = DateTime.now().toFormat('hh:mm a');
    const now = this.parseTime(currentTime);

    for (const slot of timeSlotsOfDay) {
      let start = this.parseTime(slot.start);
      let end = this.parseTime(slot.end);

      if (end < start) {
        end.setDate(end.getDate() + 1);
      }

      if (now > start && now < end) {
        return true;
      }
    }
    return false;
  }

  private parseTime(timeStr: string): Date {
    const date = new Date();
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period.toLowerCase() === 'pm' && hours !== 12) {
      hours += 12;
    }
    if (period.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }

    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  async getSlotFromDate(selectedDate: Date): Promise<string[]> {
    const dayNumberOfDate = selectedDate.getDay() == 0 ? 6 : (selectedDate.getDay() - 1);
    const currentDayIndex = this.restaurantSlots.findIndex((x) => x.day == dayNumberOfDate);
    if (currentDayIndex != -1) {
      console.log(this.restaurantSlots[dayNumberOfDate].times);
      const stepIntervalNumber = parseInt(this.timeIntervalForScheduleDeliveryValue, 10);
      const stepIntervalType = this.timeIntervalForScheduleDeliveryType;
      let tempSlots: string[] = [];
      for (const element of this.restaurantSlots[dayNumberOfDate].times || []) {
        let [startHour, startMinute] = element.start.split(':');
        let startMeridian = startMinute.split(' ')[1].toLowerCase();
        startMinute = startMinute.split(' ')[0];

        let [endHour, endMinute] = element.end.split(':');
        let endMeridian = endMinute.split(' ')[1].toLowerCase();
        endMinute = endMinute.split(' ')[0];
        const startHourNumber = this.convertTo24HourFormat(parseInt(startHour), startMeridian);
        const endHourNumber = this.convertTo24HourFormat(parseInt(endHour), endMeridian);

        const startTime = { hour: startHourNumber, minute: parseInt(startMinute) };
        const endTime = { hour: endHourNumber, minute: parseInt(endMinute) };
        const step = stepIntervalType == 'min' ? stepIntervalNumber : stepIntervalNumber * 60;
        const convertedSlots = this.generateTimeSlots(startTime, endTime, step);
        tempSlots = tempSlots.concat(convertedSlots);
      }
      return this.getFutureSlots(tempSlots, selectedDate);
    }
    return [];
  }

  private async getFutureSlots(tempSlots: string[], selectedDate: Date): Promise<string[]> {
    const slotList: string[] = [];
    const currentDate = new Date();

    for (const slot of tempSlots) {
      const [hour, minute] = slot.split(':').map(Number);
      const futureDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hour, minute);

      if (futureDate > currentDate) {
        slotList.push(this.convertTo12HourFormat(slot));
      }
    }
    return slotList;
  }

  private generateTimeSlots(startTime: { hour: number, minute: number }, endTime: { hour: number, minute: number }, step: number): string[] {
    let slots: string[] = [];
    let { hour, minute } = startTime;

    do {
      slots.push(`${hour}:${minute.toString().padStart(2, '0')}`);
      minute += step;
      while (minute >= 60) {
        minute -= 60;
        hour++;
      }
    } while (hour < endTime.hour || (hour === endTime.hour && minute <= endTime.minute));

    return slots;
  }

  private convertTo12HourFormat(time24Hour: string): string {
    const [hour, minute] = time24Hour.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  }

  private convertTo24HourFormat(hour: number, meridian: string): number {
    if (meridian === 'pm' && hour !== 12) {
      return hour + 12;
    }
    if (meridian === 'am' && hour === 12) {
      return 0;
    }
    return hour;
  }

  private _filterRestaurant(value: any): CityzenPOSSectionRestaurantInterface[] {
    let filterValue: string;
    if (value && value.name) {
      filterValue = value.name;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfRestaurants.filter((element) =>
      this.getTranslatedRestaurantName(element).toLowerCase().includes(filterValue)
    );
  }

  searchProducts(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log(filterValue);
    if (filterValue.length >= 3) {
      this.foodFetch = false;
      this.products = [];
      this.api.get_private('v1/cityzen/pos_search/' + this.restaurantId + '/' + filterValue).subscribe({
        next: (response: any) => {
          console.log(response);
          this.foodFetch = true;
          if (response && response.success && response.foods && response.foods.length) {
            response.foods.forEach((element: any) => {
              let price = parseFloat(parseFloat(element.price).toFixed(2));
              let offerPrice = 0;
              if (element && element.taxationEnable && element.taxationEnable == true) {
                let taxPercentage: number = 0;
                if (element && element.foodtaxations && element.foodtaxations.length) {
                  element.foodtaxations.forEach((taxation: any) => {
                    taxPercentage = taxPercentage + parseFloat(parseFloat(taxation.taxAmount).toFixed(2));
                  });
                }
                if (taxPercentage > 0) {
                  const basePrice = price;
                  price = parseFloat((basePrice + (taxPercentage / 100) * basePrice).toFixed(2));
                }
              }
              if (element && element.discount && parseFloat(element.discount) > 0) {
                element.discount = parseFloat(parseFloat(element.discount).toFixed(2));
                if (element.discountType == '%') {
                  const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(element.discount.toString()) / 100)).toFixed(2);
                  offerPrice = parseFloat(discountValue);
                } else {
                  const discountValue = (parseFloat(price.toString()) - parseFloat(element.discount.toString())).toFixed(2);
                  offerPrice = parseFloat(discountValue);
                }
              } else {
                element.discount = 0;
              }
              if (element && element.purchaseLimit != '' && element.purchaseLimit != null) {
                if (element && element.purchaseLimit.toString() != '-1') {
                  element.purchaseLimit = parseInt(element.purchaseLimit);
                } else {
                  element.purchaseLimit = 1000000000000000;
                }
              } else {
                element.purchaseLimit = 5;
              }

              if (element && element.stockNumber != null && element.stockNumber != '') {
                element.stockNumber = parseInt(element.stockNumber);
              } else {
                element.stockNumber = -1;
              }

              const addons: any[] = [];
              if (element && element.addons && element.addons.length > 0) {
                element.addons.forEach((addonElement: any) => {
                  let stockNumber = 5;
                  if (addonElement && addonElement.stockNumber != null && addonElement.stockNumber != '') {
                    if (addonElement.stockNumber.toString() == '-1') {
                      stockNumber = 1000000000000000;
                    } else {
                      stockNumber = parseInt(addonElement.stockNumber);
                    }
                  }
                  const addonParam = {
                    name: addonElement.name,
                    translations: addonElement.translations,
                    id: addonElement.id,
                    price: parseFloat(addonElement.price),
                    inStock: addonElement.inStock,
                    stockNumber: stockNumber,
                    stockType: addonElement && addonElement.stockType && addonElement.stockType != null && addonElement.stockType != '' ? addonElement.stockType : 'unlimited',
                  };
                  addons.push(addonParam);
                });
              }

              const taxations: any[] = [];
              if (element && element.foodtaxations && element.foodtaxations.length > 0) {
                element.foodtaxations.forEach((taxElement: any) => {
                  const taxParam = {
                    taxName: taxElement.taxName,
                    translations: taxElement.translations,
                    id: taxElement.id,
                    taxAmount: parseFloat(taxElement.taxAmount),
                  };
                  taxations.push(taxParam);
                });
              }

              const variations: any[] = [];
              if (element && element.variations && element.variations.length > 0) {
                element.variations.forEach((variationElement: any) => {
                  const isRequired = variationElement.isRequired == 'true' || variationElement.isRequired == true ? true : false;
                  let min = 1;
                  let max = 1;
                  if (variationElement && variationElement.min != null && variationElement.min != '') {
                    min = parseInt(variationElement.min);
                  } else {
                    min = 1;
                  }
                  if (variationElement && variationElement.max != null && variationElement.max != '') {
                    max = parseInt(variationElement.max);
                  } else {
                    max = 1;
                  }
                  if (variationElement.min == 0 || variationElement.min == '0') {
                    min = 1;
                  }
                  if (variationElement.max == 0 || variationElement.max == '0') {
                    max = 1;
                  }
                  const options: any[] = [];
                  if (variationElement && variationElement.options && variationElement.options.length > 0) {
                    variationElement.options.forEach((variationOption: any) => {
                      let priceOfOption = 0;
                      let stock = 5;
                      if (variationOption && variationOption.price != null && variationOption.price != '') {
                        priceOfOption = parseFloat(variationOption.price);
                      }
                      if (variationOption && variationOption.stock != null && variationOption.stock != '') {
                        if (variationOption.stock.toString() != '-1') {
                          stock = parseInt(variationOption.stock);
                        } else if (variationOption.stock.toString() == '-1') {
                          stock = 1000000000000000;
                        }
                      }
                      const optionParam = {
                        name: variationOption.name,
                        price: priceOfOption,
                        stock: stock,
                      }
                      options.push(optionParam);
                    });
                  }
                  const variationParam = {
                    isRequired: isRequired,
                    title: variationElement.title,
                    type: min == 1 && max == 1 ? 'single' : variationElement.type,
                    min: min,
                    max: max,
                    options: options
                  };
                  variations.push(variationParam);
                });
              }

              const foodParam: any = {
                name: element.name,
                shortDescription: element.shortDescription,
                image: element.image,
                foodType: element.foodType,
                addons: addons,
                startTime: element.startTime,
                endTime: element.endTime,
                price: price,
                discountType: element.discountType,
                discount: element.discount,
                offerPrice: offerPrice,
                variations: variations,
                translations: element.translations,
                purchaseLimit: element.purchaseLimit,
                quantity: 0,
                cartEntity: 'single',
                status: element.status,
                inStock: element.inStock,
                taxationEnable: element.taxationEnable,
                foodtaxations: taxations,
                id: element.id,
                stockNumber: element.stockNumber,
                stockType: element.stockType,
              };
              this.products.push(foodParam);
            });
          } else {
            this.products = [];
          }
          this.translateFoodList();
        }, error: (error: any) => {
          console.log(error);
          this.foodFetch = true;
          this.products = [];
          this.util.handleError(error, 'cityzen');
        }
      });
    } else {
      this.getFoodList();
    }
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    console.log('tabChangeEvent => ', tabChangeEvent.index);
    if (tabChangeEvent.index != -1) {
      this.categoryIndex = tabChangeEvent.index;
      console.log(this.categories[this.categoryIndex].id);
      if (this.categoryIndex == 0) {
        this.foodKind = 'all';
        this.categoryId = '';
      } else {
        this.foodKind = this.categories[this.categoryIndex].kind;
        this.categoryId = this.categories[this.categoryIndex].id;
      }
      this.getFoodList();
    }
  }

  getFoodList() {
    this.foodFetch = false;
    const param = {
      vendor: this.restaurantId,
      kind: this.foodKind,
      category: this.categoryId,
    }
    console.log(param);
    this.products = [];
    this.api.post_private('v1/cityzen/pos_food_list/', param).subscribe({
      next: (response: any) => {
        console.log(response);
        this.foodFetch = true;
        if (response && response.success && response.products && response.products.length) {
          response.products.forEach((element: any) => {
            let price = parseFloat(parseFloat(element.price).toFixed(2));
            let offerPrice = 0;
            if (element && element.taxationEnable && element.taxationEnable == true) {
              let taxPercentage: number = 0;
              if (element && element.foodtaxations && element.foodtaxations.length) {
                element.foodtaxations.forEach((taxation: any) => {
                  taxPercentage = taxPercentage + parseFloat(parseFloat(taxation.taxAmount).toFixed(2));
                });
              }
              if (taxPercentage > 0) {
                const basePrice = price;
                price = parseFloat((basePrice + (taxPercentage / 100) * basePrice).toFixed(2));
              }
            }
            if (element && element.discount && parseFloat(element.discount) > 0) {
              element.discount = parseFloat(parseFloat(element.discount).toFixed(2));
              if (element.discountType == '%') {
                const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(element.discount.toString()) / 100)).toFixed(2);
                offerPrice = parseFloat(discountValue);
              } else {
                const discountValue = (parseFloat(price.toString()) - parseFloat(element.discount.toString())).toFixed(2);
                offerPrice = parseFloat(discountValue);
              }
            } else {
              element.discount = 0;
            }
            if (element && element.purchaseLimit != '' && element.purchaseLimit != null) {
              if (element && element.purchaseLimit.toString() != '-1') {
                element.purchaseLimit = parseInt(element.purchaseLimit);
              } else {
                element.purchaseLimit = 1000000000000000;
              }
            } else {
              element.purchaseLimit = 5;
            }

            if (element && element.stockNumber != null && element.stockNumber != '') {
              element.stockNumber = parseInt(element.stockNumber);
            } else {
              element.stockNumber = -1;
            }

            const addons: any[] = [];
            if (element && element.addons && element.addons.length > 0) {
              element.addons.forEach((addonElement: any) => {
                let stockNumber = 0;
                if (addonElement && addonElement.stockNumber != null && addonElement.stockNumber != '') {
                  if (addonElement.stockNumber.toString() == '-1') {
                    stockNumber = 1000000000000000;
                  } else {
                    stockNumber = parseInt(addonElement.stockNumber);
                  }
                } else {
                  stockNumber = 0;
                }
                const addonParam = {
                  name: addonElement.name,
                  translations: addonElement.translations,
                  id: addonElement.id,
                  price: parseFloat(addonElement.price),
                  inStock: addonElement.inStock,
                  stockNumber: stockNumber,
                  stockType: addonElement && addonElement.stockType && addonElement.stockType != null && addonElement.stockType != '' ? addonElement.stockType : 'unlimited',
                };
                addons.push(addonParam);
              });
            }

            const taxations: any[] = [];
            if (element && element.foodtaxations && element.foodtaxations.length > 0) {
              element.foodtaxations.forEach((taxElement: any) => {
                const taxParam = {
                  taxName: taxElement.taxName,
                  translations: taxElement.translations,
                  id: taxElement.id,
                  taxAmount: parseFloat(taxElement.taxAmount),
                };
                taxations.push(taxParam);
              });
            }

            const variations: any[] = [];
            if (element && element.variations && element.variations.length > 0) {
              element.variations.forEach((variationElement: any) => {
                const isRequired = variationElement.isRequired == 'true' || variationElement.isRequired == true ? true : false;
                let min = 1;
                let max = 1;
                if (variationElement && variationElement.min != null && variationElement.min != '') {
                  min = parseInt(variationElement.min);
                } else {
                  min = 1;
                }
                if (variationElement && variationElement.max != null && variationElement.max != '') {
                  max = parseInt(variationElement.max);
                } else {
                  max = 1;
                }
                if (variationElement.min == 0 || variationElement.min == '0') {
                  min = 1;
                }
                if (variationElement.max == 0 || variationElement.max == '0') {
                  max = 1;
                }
                const options: any[] = [];
                if (variationElement && variationElement.options && variationElement.options.length > 0) {
                  variationElement.options.forEach((variationOption: any) => {
                    let priceOfOption = 0;
                    let stock = 5;
                    if (variationOption && variationOption.price != null && variationOption.price != '') {
                      priceOfOption = parseFloat(variationOption.price);
                    }
                    if (variationOption && variationOption.stock != null && variationOption.stock != '') {
                      if (variationOption.stock.toString() != '-1') {
                        stock = parseInt(variationOption.stock);
                      } else if (variationOption.stock.toString() == '-1') {
                        stock = 1000000000000000;
                      }
                    }
                    const optionParam = {
                      name: variationOption.name,
                      price: priceOfOption,
                      stock: stock,
                    }
                    options.push(optionParam);
                  });
                }
                const variationParam = {
                  isRequired: isRequired,
                  title: variationElement.title,
                  type: min == 1 && max == 1 ? 'single' : variationElement.type,
                  min: min,
                  max: max,
                  options: options
                };
                variations.push(variationParam);
              });
            }

            const foodParam: any = {
              name: element.name,
              shortDescription: element.shortDescription,
              image: element.image,
              foodType: element.foodType,
              addons: addons,
              startTime: element.startTime,
              endTime: element.endTime,
              price: price,
              discountType: element.discountType,
              discount: element.discount,
              offerPrice: offerPrice,
              variations: variations,
              translations: element.translations,
              purchaseLimit: element.purchaseLimit,
              quantity: 0,
              cartEntity: 'single',
              status: element.status,
              inStock: element.inStock,
              taxationEnable: element.taxationEnable,
              foodtaxations: taxations,
              id: element.id,
              stockNumber: element.stockNumber,
              stockType: element.stockType,
            };
            this.products.push(foodParam);
          });
        } else {
          this.products = [];
        }
        this.translateFoodList();
      }, error: (error: any) => {
        console.log(error);
        this.foodFetch = true;
        this.products = [];
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onFoodInfo(item: PosFoodInfoInterface) {
    console.log(item);
    const dialogRef = this.dialog.open(CityzenPosFoodInfoDialog, {
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      data: { info: item },
      panelClass: 'pos-food-modal'
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.success && result.success == true) {
        const savedAddon: any[] = [];
        const newAddonIds: string[] = [];
        if (result && result.addons && result.addons.length > 0) {
          result.addons.forEach((element: any) => {
            const addonParam = {
              'name': element.name,
              'translations': element.translations,
              'id': element.id,
              'price': element.price,
              'inStock': element.inStock,
              'stockNumber': element.stockNumber,
              'stockType': element.stockType,
              'haveDiscount': element.haveDiscount,
              'discountPrice': element.discountPrice
            }
            savedAddon.push(addonParam);
            newAddonIds.push(element.id);
          });
        }
        const savedVariations: any[] = [];
        const newVariationIds: string[] = [];
        if (result && result.variations && result.variations.length > 0) {
          result.variations.forEach((element: any) => {
            const options: any[] = [];
            if (element && element.options && element.options.length > 0) {
              element.options.forEach((op: any) => {
                newVariationIds.push(`${element.title}-${op.name}`);
                const optionParam = {
                  'name': op.name,
                  'price': op.price,
                  'haveDiscount': op.haveDiscount,
                  'discountPrice': op.discountPrice,
                  'enable': op.enable,
                  'stock': op.stock,
                };
                options.push(optionParam);
              });
              const variationParam = {
                'isRequired': element.isRequired,
                'title': element.title,
                'type': element.type,
                'min': element.min,
                'max': element.max,
                'options': options,
              };
              savedVariations.push(variationParam);
            }
          });
        }
        newAddonIds.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        newVariationIds.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        let isSameProduct: string = 'false';
        let sameUuid: string = '';
        let isSameQuantity: number = 0;
        ////// Check Repeated List //////
        const repeatedList = this.posItems.filter((x) => x.id == item.id);
        if (repeatedList.length > 0) {
          const existingAddonIds: string[] = [];
          const existingVariationIds: string[] = [];
          repeatedList.forEach((element) => {
            element.addons.forEach((addn) => {
              existingAddonIds.push(addn.id);
            });
            element.variations.forEach((variant) => {
              variant.options.forEach((ops) => {
                existingVariationIds.push(`${variant.title}-${ops.name}`);
              });
            });
            existingAddonIds.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
            existingVariationIds.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
            if (newAddonIds.join('') == existingAddonIds.join('') && newVariationIds.join('') == existingVariationIds.join('')) {
              sameUuid = element.uuid;
              isSameQuantity = element.quantity;
              isSameProduct = 'true';
            }
          });
        }
        ////// Check Repeated List //////

        if (isSameProduct == 'true' && sameUuid != '') {
          const newQuantity = (isSameQuantity + parseInt(result.quantity));
          const quantity = parseInt(newQuantity.toString());
          if (quantity < item.purchaseLimit!) {
            let checkAddonHaveStock: string = 'true';
            let checkVariationHaveStock: string = 'true';
            let addonOutOfStockLimitNumber: number = 0;
            let variationOutOfStockLimitNumber: number = 0;
            savedAddon.forEach((addon) => {
              if (quantity >= addon.stockNumber) {
                checkAddonHaveStock = 'false';
                if (addonOutOfStockLimitNumber == 0) {
                  addonOutOfStockLimitNumber = addon.stockNumber;
                }
              }
            });
            savedVariations.forEach((variation: any) => {
              variation.options.forEach((options: any) => {
                if (quantity >= options.stock) {
                  checkVariationHaveStock = 'false';
                  if (variationOutOfStockLimitNumber == 0) {
                    variationOutOfStockLimitNumber = options.stock;
                  }
                }
              });
            });
            if (item.stockType == 'unlimited' && checkAddonHaveStock == 'true' && checkVariationHaveStock == 'true') {
              const indexOfSameItem = this.posItems.findIndex((x) => x.uuid == sameUuid && x.id == item.id);
              if (indexOfSameItem != -1) {
                this.posItems[indexOfSameItem].quantity = quantity;
                this.calculateItemTotal();
              }
            } else if (quantity < item.stockNumber && checkAddonHaveStock == 'true' && checkVariationHaveStock == 'true') {
              const indexOfSameItem = this.posItems.findIndex((x) => x.uuid == sameUuid && x.id == item.id);
              if (indexOfSameItem != -1) {
                this.posItems[indexOfSameItem].quantity = quantity;
                this.calculateItemTotal();
              }
            } else {
              if (checkAddonHaveStock == 'false' || checkVariationHaveStock == 'false') {
                this.util.onError('ts_variation_limit_error', `${checkAddonHaveStock == 'false' ? addonOutOfStockLimitNumber : variationOutOfStockLimitNumber}`);
              } else {
                const indexOfSameItem = this.posItems.findIndex((x) => x.uuid == sameUuid && x.id == item.id);
                if (indexOfSameItem != -1) {
                  this.posItems[indexOfSameItem].quantity = item.stockNumber;
                  this.util.onError('ts_stock_limit_error', `${item.stockNumber}`);
                  this.calculateItemTotal();
                }
              }
            }
          } else {
            const indexOfSameItem = this.posItems.findIndex((x) => x.uuid == sameUuid && x.id == item.id);
            if (indexOfSameItem != -1) {
              this.posItems[indexOfSameItem].quantity = item.purchaseLimit;
              this.util.onError('ts_purchase_error', `${item.purchaseLimit}`);
              this.calculateItemTotal();
            }
          }
        } else {
          /////////////// Add To Cart //////////////////
          const addToCartParam = {
            'uuid': this.util.generateUUID(),
            'name': item.name,
            'image': item.image,
            'price': item.price,
            'discountType': item.discountType,
            'discount': item.discount,
            'offerPrice': item.offerPrice,
            'purchaseLimit': item.purchaseLimit,
            'stockNumber': item.stockNumber,
            'stockType': item.stockType,
            'quantity': result.quantity,
            'id': item.id,
            'addons': savedAddon,
            'variations': savedVariations,
            'translations': item.translations,
            'inStock': item.inStock,
            'taxationEnable': item.taxationEnable,
            'foodtaxations': item.foodtaxations,
            'optionName': '',
            'totalPrice': 0,
            'realPrice': 0,
            'itemDiscount': 0,
            'instruction': result.instruction,
            'displayName': ''
          }
          this.posItems.push(addToCartParam);
          this.posItems = [...this.posItems];
          this.calculateItemTotal();
          /////////////// Add To Cart //////////////////
        }
      }
      console.log(this.posItems);
    });
  }

  translateCartItem() {
    const mappedList = this.posItems.map(
      (item: PosCartItemInterface) => {
        const optionNameList: string[] = [];
        if (item.translations) {
          const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
          item.displayName = translation?.title || item.name;
        } else {
          item.displayName = item?.name || '';
        }
        item.addons?.map((addonItem) => {
          if (addonItem.translations) {
            const translation = addonItem.translations.find((t) => t.code == this.util.appLocaleName());
            addonItem.displayName = translation?.value || addonItem.name;
          } else {
            addonItem.displayName = addonItem?.name || '';
          }
          optionNameList.push(addonItem.displayName);
        });

        item.variations?.map((variationElement) => {
          variationElement?.options?.map((optionElement) => {
            optionNameList.push(optionElement.name);
          });
        });

        item.foodtaxations?.map((taxItem) => {
          if (taxItem.translations) {
            const translation = taxItem.translations.find((t) => t.code == this.util.appLocaleName());
            taxItem.displayName = translation?.title || taxItem.taxName;
          } else {
            taxItem.displayName = taxItem?.taxName || '';
          }
        });
        item.optionName = optionNameList.join(',');
        return item;
      }
    );
    this.posItems = mappedList;
  }

  calculateItemTotal() {
    this.posItems.forEach((item) => {
      let price: number = 0;
      let addonPrice: number = 0;
      let variationPrice: number = 0;
      // Real Price //
      let realPrice: number = 0.0;
      let addonRealPrice: number = 0.0;
      let variationRealPrice: number = 0.0;
      // Real Price //
      const optionNameList: string[] = [];
      item.variations.forEach((variant) => {
        variant.options.forEach((ops) => {
          optionNameList.push(ops.name);
        });
      });
      item.addons.forEach((addons) => {
        optionNameList.push(addons.name);
        // Real Price //
        const realPriceOfAddon = (parseFloat(addonRealPrice.toString()) + (parseFloat(addons.price.toString()))).toFixed(2);
        addonRealPrice = parseFloat(realPriceOfAddon);
        // Real Price //
        if (addons.haveDiscount) {
          const price = (parseFloat(addonPrice.toString()) + (parseFloat(addons.discountPrice.toString()))).toFixed(2);
          addonPrice = parseFloat(price);
        } else {
          const price = (parseFloat(addonPrice.toString()) + (parseFloat(addons.price.toString()))).toFixed(2);
          addonPrice = parseFloat(price);
        }
      });
      item.variations.forEach((variation) => {
        variation.options.forEach((options) => {
          // Real Price //
          const realPriceOfVariation = (parseFloat(variationRealPrice.toString()) + (parseFloat(options.price.toString()))).toFixed(2);
          variationRealPrice = parseFloat(realPriceOfVariation);
          // Real Price //
          if (options.haveDiscount) {
            const price = (parseFloat(variationPrice.toString()) + (parseFloat(options.discountPrice.toString()))).toFixed(2);
            variationPrice = parseFloat(price);
          } else {
            const price = (parseFloat(variationPrice.toString()) + (parseFloat(options.price.toString()))).toFixed(2);
            variationPrice = parseFloat(price);
          }
        });
      });

      // Real Price //
      const realTotalPrice = (parseFloat(item.price.toString()) + (parseFloat(addonRealPrice.toString())) + (parseFloat(variationRealPrice.toString()))).toFixed(2);
      realPrice = parseFloat(realTotalPrice);
      // Real Price //

      if (item.discount > 0) {
        const totalPrice = (parseFloat(item.offerPrice.toString()) + parseFloat(price.toString()) + (parseFloat(addonPrice.toString())) + (parseFloat(variationPrice.toString()))).toFixed(2);
        price = parseFloat(totalPrice);
      } else {
        const totalPrice = (parseFloat(item.price.toString()) + parseFloat(price.toString()) + (parseFloat(addonPrice.toString())) + (parseFloat(variationPrice.toString()))).toFixed(2);
        price = parseFloat(totalPrice);
      }
      const priceWithQuantity = (parseFloat(price.toString()) * item.quantity).toFixed(2);
      price = parseFloat(priceWithQuantity);
      item.optionName = optionNameList.join(',');
      item.totalPrice = price;
      // Real Price //
      const realPriceWithQuantity = (parseFloat(realPrice.toString()) * item.quantity).toFixed(2);
      realPrice = parseFloat(realPriceWithQuantity);
      item.realPrice = realPrice;
      const restItemDiscountString = (parseFloat(item.realPrice.toString()) - parseFloat(price.toString())).toFixed(2);
      const restItemDiscount = parseFloat(restItemDiscountString);
      item.itemDiscount = restItemDiscount;
      // Real Price //
    });

    let itemTotal: number = 0;
    let realPrice: number = 0;
    let itemDiscount: number = 0;
    this.posItems.forEach((item) => {
      const countTotal = (parseFloat(itemTotal.toString()) + parseFloat(item.totalPrice.toString())).toFixed(2);
      itemTotal = parseFloat(countTotal);
      const realCountTotal = (parseFloat(realPrice.toString()) + parseFloat(item.realPrice.toString())).toFixed(2);
      realPrice = parseFloat(realCountTotal);
      const itemDisountCountTotal = (parseFloat(itemDiscount.toString()) + parseFloat(item.itemDiscount.toString())).toFixed(2);
      itemDiscount = parseFloat(itemDisountCountTotal);
    });
    this.itemTotal = itemTotal;
    this.realTotal = realPrice;
    this.itemDiscount = itemDiscount;
    this.foodServiceCharge = this.calculateFoodTax();
    this.deliveryCharge = this.calculateDeliveryCharge();
    this.grandTotal = this.calculateGrandTotal();
    this.isMinAmountSatisfied = parseFloat(itemTotal.toString()) >= parseFloat(this.minOrderAmount.toString());
    console.log(`minOrderAmount -- ${this.minOrderAmount}`);
    this.translateCartItem();
  }

  calculateDeliveryCharge(): number {

    console.log('Delivery Area');
    let deliveryCharge = 0;
    if (this.restaurantId != '' && this.customerDeliveryAddress.flatHouse != '' && this.orderTo == 'homedelivery') {
      const lat1 = Number(this.restaurantLatitude.toString());
      const lng1 = Number(this.restuarantLongitude.toString());
      const lat2 = Number(this.customerDeliveryAddress.latitude.toString());
      const lng2 = Number(this.customerDeliveryAddress.longitude.toString());
      const distance = this.util.getDistance(lat1, lng1, lat2, lng2, this.findMode == 'km' ? 'K' : 'M');
      const deliveryDistance = parseFloat(distance.toString()).toFixed(2);
      if (this.haveFreeDeliveryInTotal && this.freeDelivery > 0 && this.itemTotal >= this.freeDelivery) {
        console.log('Free Delivery On Price');
        deliveryCharge = 0;
      } else if (this.haveFreeDeliveryInDistance && this.freeDeliveryInDistance > 0 && this.freeDeliveryInDistance > parseFloat(deliveryDistance)) {
        console.log('Free Delivery On Distance');
        deliveryCharge = 0;
      } else {
        console.log('Calculate Charges');
        if (this.deliveryChargeMethod == 'distance') {
          console.log('Charging Distance Amount');
          const total = (parseFloat(deliveryDistance.toString()) * parseFloat(this.deliveryChargeAmount.toString())).toFixed(2);
          deliveryCharge = parseFloat(total);
        } else {
          console.log('Charging Fixed Amount');
          deliveryCharge = parseFloat(this.deliveryChargeAmount.toString());
        }
      }
    }
    return deliveryCharge;
  }

  calculateFoodTax(): number {
    let taxCharge: number = 0;
    if (this.includeTaxOnFood) {
      if (this.foodTaxType == 'per') {
        function percentage(numFirst: number, per: number) {
          return (numFirst / 100) * per;
        }
        const total = (parseFloat(percentage(this.itemTotal, this.foodTaxAmount).toString())).toFixed(2);
        taxCharge = parseFloat(total);
      } else {
        taxCharge = this.foodTaxAmount;
      }
    }
    return taxCharge;
  }

  calculateGrandTotal(): number {
    let grandTotal = 0;
    const itemTotal: number = parseFloat(this.itemTotal.toString());
    const taxCharge: number = parseFloat(this.foodServiceCharge.toString());
    const serviceCharge: number = parseFloat(this.serviceCharge.toString());
    const packagingCharges: number = parseFloat(this.packagingCharges.toString());
    const packagingChargesTax: number = parseFloat(this.packagingChargesTax.toString());
    const deliveryCharge: number = parseFloat(this.deliveryCharge.toString());
    const total = (itemTotal + taxCharge + serviceCharge + packagingCharges + packagingChargesTax + deliveryCharge).toFixed(2);
    const subTotal = parseFloat(total);
    const grandCount = (subTotal - parseFloat(this.walletAmount.toString())).toFixed(2);
    grandTotal = parseFloat(grandCount);
    return grandTotal;
  }

  onUserModal() {
    console.log('On Customer Select');
    const dialogRef = this.dialog.open(CityzenPosSelectCustomerDialog, {
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
      if (result && result.id && result.id != '') {
        this.customerId = result.id;
        this.customerDisplayTag = `${result.name} (${result.contact})`;
        this.getCustomerDetail();
      }
    });
  }

  onNewCustomer() {
    const dialogRef = this.dialog.open(CityzenPosNewCustomerDialog, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.id && result.id != '') {
        this.customerId = result.id;
        this.customerDisplayTag = `${result.name} (${result.contact})`;
        this.getCustomerDetail();
      }
    });
  }

  getCustomerDetail() {
    console.log('customer detail');
    const spinnerRef = this.util.start('ts_fetching');
    this.customerDetailFetched = false;
    this.api.get_private('v1/cityzen/pos_customer_detail/' + this.customerId).subscribe({
      next: (response: any) => {
        console.log(response);
        this.customerDetailFetched = true;
        this.util.stop(spinnerRef);
        if (response && response.success) {
          const user = response.userInfo;
          if (user && user.wallets && user.wallets.id) {
            this.customerWalletFund = user.wallets.balance;
          }
          this.customerImage = user.image;
          this.customerName = `${user.firstName} ${user.lastName}`;
          this.customerEmail = user.contactEmail;
          this.customerMobile = `+${user.countryCode} ${user.contactNumber}`;
          this.customerPoints = user.loyaltyPoints;
          const customerDetail = {
            "image": this.customerImage,
            "name": this.customerName,
            "mobile": this.customerMobile,
            "email": this.customerEmail,
            "fund": this.customerWalletFund,
            "point": this.customerPoints,
            "kind": "info",
            "title": "",
            "address": ""
          };
          const userDetailTable: any[] = [];
          userDetailTable.push(customerDetail);
          this.customerDetail = new MatTableDataSource(userDetailTable);
          this.getDeliverySection();
        }
      },
      error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.customerDetailFetched = true;
        this.util.handleError(error, 'cityzen');
      },
    });
  }

  onSubmit() {
    console.log('Submit');
    const cartItems: CityzenPOSSectionCartItemRequestInterface[] = [];
    this.posItems.forEach((inCartItem) => {
      const newAddonIds: string[] = [];
      const serverVariations: POSCartVariationConfig[] = [];
      inCartItem.addons.forEach((element) => {
        newAddonIds.push(element.id);
      });
      inCartItem.variations.forEach((variation) => {
        const selectedOptions: string[] = [];
        variation.options.forEach((options) => {
          selectedOptions.push(options.name);
        });
        const variationItem: POSCartVariationConfig = {
          variation: variation.title,
          selected: selectedOptions
        }
        serverVariations.push(variationItem);
      });
      const itemInCart = {
        'uuid': inCartItem.uuid,
        'addons': newAddonIds.join(','),
        'food': inCartItem.id,
        'quantity': inCartItem.quantity,
        'variations': serverVariations,
        'instruction': inCartItem.instruction
      };
      cartItems.push(itemInCart);
    });
    const param = {
      'vendor': this.restaurantId,
      'user': this.customerId,
      'cartItem': cartItems,
      'orderTo': this.orderTo,
      'walletUsed': this.walletUsed,
      'instantOrder': this.isInstantOrder,
      'scheduleOrder': this.isScheduleOrder,
      'scheduleDate': this.scheduleDate,
      'scheduleTime': this.scheduleTime,
      'orderAt': DateTime.now().toFormat('hh:mm a'),
      'address': this.customerDeliveryAddress
    };
    console.log(param);
    const spinnerRef = this.util.start('ts_placing_order');
    this.api.post_private('v1/cityzen/pos_place_order/', param).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_order_placed');
        this.clearCart();
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  getDeliverySection() {
    const customerDetail = {
      "image": this.customerImage,
      "name": this.customerName,
      "mobile": this.customerMobile,
      "email": this.customerEmail,
      "fund": this.customerWalletFund,
      "point": this.customerPoints,
      "kind": "info",
      "title": "",
      "address": ""
    };
    const userDetailTable: any[] = [];
    userDetailTable.push(customerDetail);
    if (this.homeDelivery == true && this.acceptHomeDelivery == true && this.permissionList.includes('homedelivery')) {
      const customerAddress = {
        "image": "",
        "name": "",
        "mobile": "",
        "email": "",
        "fund": 0,
        "point": 0,
        "kind": "address",
        "title": "Delivery Address",
        "address": this.customerDeliveryAddress.flatHouse != '' ? this.customerDeliveryFullAddress : "Enter delivery address"
      }
      userDetailTable.push(customerAddress);
    }
    this.customerDetail = new MatTableDataSource(userDetailTable);
    this.calculateItemTotal();
  }

  clearCart() {
    console.log('Clean');
    this.posItems = [];
    this.restaurantCtrl.setValue(null);
    this.restaurantId = '';
    this.categoryIndex = 0;
    this.categories = [];
    this.foodKind = '';
    this.categoryId = '';
    this.products = [];
    this.foodFetch = true;
    this.customerId = '';
    this.customerDisplayTag = '';
    this.customerDetailFetched = false;
    this.customerImage = '';
    this.customerName = '';
    this.customerEmail = '';
    this.customerMobile = '';
    this.customerWalletFund = 0;
    this.customerPoints = 0;
    const userDetailTable: any[] = [];
    this.customerDetail = new MatTableDataSource(userDetailTable);
    this.customerDeliveryAddress.countryCode = '';
    this.customerDeliveryAddress.flatHouse = '';
    this.customerDeliveryAddress.landmark = '';
    this.customerDeliveryAddress.locality = '';
    this.customerDeliveryAddress.latitude = 0;
    this.customerDeliveryAddress.longitude = 0;
    this.customerDeliveryAddress.receiverContact = '';
    this.customerDeliveryAddress.receiverName = '';
    this.restaurantSlots = [];
    this.restaurantLatitude = 0;
    this.restuarantLongitude = 0;
    this.acceptHomeDelivery = false;
    this.acceptScheduleDelivery = false;
    this.minOrderAmount = 0;
    this.restaurantTakeAway = false;
    this.permissionList = [];
    this.dateIndex = 0;
    this.slotList = [];
    this.orderTo = 'homedelivery';
    this.scheduleDate = '';
    this.scheduleTime = '';
    this.canDeliverNow = false;
    this.isInstantOrder = false;
    this.isScheduleOrder = false;
    this.isMinAmountSatisfied = false;
    this.walletUsed = false;
    this.walletAmount = 0;
    this.calculateItemTotal();
  }

  addDeliveryAddress() {
    const dialogRef = this.dialog.open(CityzenPosCustomerAddressDialog, {
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      data: {
        restaurantLat: this.restaurantLatitude,
        restaurantLng: this.restuarantLongitude,
        cityLat: this.cityLat,
        cityLng: this.cityLng,
        address: this.customerDeliveryAddress,
        deliveryArea: this.deliveryArea,
        findMode: this.findMode,
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event && result.data) {
        const address = result.data;
        this.customerDeliveryAddress.countryCode = address.countryCode;
        this.customerDeliveryAddress.flatHouse = address.flatHouse;
        this.customerDeliveryAddress.landmark = address.landmark;
        this.customerDeliveryAddress.locality = address.locality;
        this.customerDeliveryAddress.latitude = address.latitude;
        this.customerDeliveryAddress.longitude = address.longitude;
        this.customerDeliveryAddress.receiverContact = address.receiverContact.toString();
        this.customerDeliveryAddress.receiverName = address.receiverName;
        this.customerDeliveryFullAddress = `${address.flatHouse}, ${address.locality}, ${address.landmark}`;
        console.log(this.customerDeliveryFullAddress, this.customerDeliveryAddress);
        this.getDeliverySection();
      }
    });
  }

  quantityPosCartItemEvent(uuid: string, action: string) {
    console.log(`${uuid} ${action}`);
    const index = this.posItems.findIndex((x) => x.uuid == uuid);
    console.log(index);
    if (index != -1) {
      if (action == 'decrease') {
        console.log(`Quantity -- ${this.posItems[index].quantity} purchase Limit --> ${this.posItems[index].purchaseLimit}`);
        if (this.posItems[index].quantity == 1) {
          console.log('Remove From Cart');
          this.posItems = this.posItems.filter((x) => x.uuid != uuid);
        } else {
          this.posItems[index].quantity = this.posItems[index].quantity - 1;
        }
      } else if (action == 'increase') {
        console.log(`Quantity -- ${this.posItems[index].quantity} purchase Limit --> ${this.posItems[index].purchaseLimit}`);
        if (this.posItems[index].quantity < this.posItems[index].purchaseLimit) {
          let checkAddonHaveStock: string = 'true';
          let checkVariationHaveStock: string = 'true';
          let addonOutOfStockLimitNumber: number = 0;
          let variationOutOfStockLimitNumber: number = 0;
          this.posItems[index].addons.forEach((addon) => {
            if (this.posItems[index].quantity >= addon.stockNumber) {
              checkAddonHaveStock = 'false';
              if (addonOutOfStockLimitNumber == 0) {
                addonOutOfStockLimitNumber = addon.stockNumber;
              }
            }
          });
          this.posItems[index].variations.forEach((variation) => {
            variation.options.forEach((options) => {
              if (this.posItems[index].quantity >= options.stock) {
                checkVariationHaveStock = 'false';
                if (variationOutOfStockLimitNumber == 0) {
                  variationOutOfStockLimitNumber = options.stock;
                }
              }
            });
          });
          if (this.posItems[index].stockType == 'unlimited' && checkAddonHaveStock == 'true' && checkVariationHaveStock == 'true') {
            this.posItems[index].quantity = this.posItems[index].quantity + 1;
          } else if (this.posItems[index].quantity < this.posItems[index].stockNumber && checkAddonHaveStock == 'true' && checkVariationHaveStock == 'true') {
            this.posItems[index].quantity = this.posItems[index].quantity + 1;
          } else {
            if (checkAddonHaveStock == 'false' || checkVariationHaveStock == 'false') {
              this.util.onError('ts_variation_limit_error', `${checkAddonHaveStock == 'false' ? addonOutOfStockLimitNumber : variationOutOfStockLimitNumber}`);
            } else {
              this.util.onError('ts_stock_limit_error', `${this.posItems[index].stockNumber}`);
            }
          }
        } else {
          this.util.onError('ts_purchase_error', `${this.posItems[index].purchaseLimit}`);
        }
      }
      this.calculateItemTotal();
    }
  }

  deleteItemFromCart(uuid: string) {
    console.log(uuid);
    this.posItems = this.posItems.filter((x) => x.uuid != uuid);
    this.calculateItemTotal();
  }

  onOrderDeliveryTypeChange(orderTo: string) {
    console.log(`orderTo -- ${orderTo}`);
    this.orderTo = orderTo;
    this.calculateItemTotal();
  }

  dateTabChangeEvent(tabChangeEvent: MatTabChangeEvent) {
    console.log('tabChangeEvent => ', tabChangeEvent);
    console.log('index => ', tabChangeEvent.index);
    if (tabChangeEvent.index != -1) {
      this.scheduleTime = '';
      this.slotList = [];
      this.canDeliverNow = false;
      this.isInstantOrder = false;
      this.isScheduleOrder = true;
      this.dateIndex = tabChangeEvent.index;
      this.scheduleDate = this.dateList[this.dateIndex].date;
      const selectedDate = DateTime.fromISO(this.dateList[this.dateIndex].date).toJSDate();
      let isInstantOrder: boolean = false;
      const todayDateString = DateTime.now().toFormat('yyyy-MM-dd');
      const selectedDateString = this.dateList[this.dateIndex].date;
      this.getSlotFromDate(selectedDate).then((slots) => {
        const translatedSlotList: AdminPOSSectionTimeslotInterface[] = [];
        slots.forEach((slotElement) => {
          translatedSlotList.push({
            label: DateTime.fromFormat(slotElement, "h:mm a").setLocale(this.util.appLocaleName()).toLocaleString(DateTime.TIME_SIMPLE),
            slot: slotElement
          });
        });
        this.slotList = translatedSlotList;
        if (selectedDateString == todayDateString) {
          const dayNumberOfDate = (DateTime.fromISO(selectedDateString).weekday - 1);
          const currentDayIndex = this.restaurantSlots.findIndex((x) => x.day == dayNumberOfDate);
          if (currentDayIndex != -1) {
            isInstantOrder = this.checkCurrentTimeInSlots(this.restaurantSlots[dayNumberOfDate].times || []);
          }
        }
        this.isInstantOrder = isInstantOrder;
        this.canDeliverNow = isInstantOrder;
        this.isScheduleOrder = !isInstantOrder;
      }).catch((error) => {
        console.log(error);
        this.slotList = [];
        this.canDeliverNow = false;
      })
    }
  }

  onSlotSelect(slot: AdminPOSSectionTimeslotInterface) {
    console.log(slot);
    this.scheduleTime = slot.slot;
    this.canDeliverNow = true;
    this.isScheduleOrder = true;
    this.isInstantOrder = false;
  }

  onWalletUse(event: MatSlideToggleChange) {
    console.log(event);
    if (event.checked) {
      if (this.customerWalletFund <= this.itemTotal) {
        this.walletUsed = true;
        this.walletAmount = this.customerWalletFund;
      } else {
        this.walletUsed = true;
        this.walletAmount = this.itemTotal;
      }
    } else {
      this.walletAmount = 0;
      this.walletUsed = false;
    }
    this.calculateItemTotal();
  }

  getTranslatedRestaurantName(item: CityzenPOSSectionRestaurantInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.title) {
        return found.title;
      }
    }
    return item.name;
  }

  displayRestaurantName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfRestaurants.find(item => item.id == id);
    return selected ? this.getTranslatedRestaurantName(selected) : '';
  };

}
