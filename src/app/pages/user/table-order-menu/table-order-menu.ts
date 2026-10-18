import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { CustomerCuisineInterface } from 'src/app/interfaces/customer.cuisine.interface';
import { CustomerMenuCategoriesInterface } from 'src/app/interfaces/customer.menu.categories.interface';
import { CustomerMenuFoodInterface, CustomerFoodAddonInterface, CustomerFoodVariationInterface, CustomerFoodFoodTaxation, CustomerFoodVariationOptionInterface } from 'src/app/interfaces/customer.menu.food.interface';
import { CustomerMenuItemInterface } from 'src/app/interfaces/customer.menu.item.interface';
import { CustomerRestaurantNoticeInterface } from 'src/app/interfaces/customer.restaurant.notice.interface';
import { CustomerRestaurantSlotInterface, TimesConfigInterface } from 'src/app/interfaces/customer.restaurant.timeslot.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogTableOrderMenu } from './dialog-table-order-menu/dialog-table-order-menu';
import { CustomerTableOrderCartItemInterface, CustomerTableOrderCartAddon, CustomerTableOrderCartVariation, CustomerTableOrderCartOption } from 'src/app/interfaces/customer.table.order.cart.item.interface';
import { DialogTableOrderFoodVariationFresh } from './dialog-table-order-food-variation-fresh/dialog-table-order-food-variation-fresh';
import { DialogTableOrderRepeatItem } from './dialog-table-order-repeat-item/dialog-table-order-repeat-item';
import { CustomerCartItemRepeatModalInterface } from 'src/app/interfaces/customer.cart.item.repeat.modal.interface';
import { CustomerTableOngoingOrderCartItemInterface } from 'src/app/interfaces/customer.table.ongoing.order.cart.item.interface';
import { DialogTableOrderCartItems } from './dialog-table-order-cart-items/dialog-table-order-cart-items';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-table-order-menu',
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, NgIcon],
  templateUrl: './table-order-menu.html',
})
export class TableOrderMenu {

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  vendorId: string = '';
  tableId: string = '';
  isInitialLoaded: boolean = false;
  tableNumber: number = 0;

  restaurantName: string = '';
  restaurantAddress: string = '';
  restaurantLogo: string = '';
  restaurantCover: string = '';
  restaurantCuisine: string = '';
  restaurantRatingPrice: string = '';
  notice: CustomerRestaurantNoticeInterface[] = [];

  canDeliverNow: boolean = false;
  restaurantSlots: CustomerRestaurantSlotInterface[] = [];
  timeIntervalForScheduleDeliveryType: string = 'min';
  timeIntervalForScheduleDeliveryValue: string = '30';

  categories: CustomerMenuCategoriesInterface[] = [];

  cartItemNumber: number = 0;

  itemInCart: CustomerTableOrderCartItemInterface[] = [];
  itemTotal: number = 0;

  ongoingItem: CustomerTableOngoingOrderCartItemInterface[] = [];
  ongoingCartItemNumber: number = 0;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {
    const vendor = this.route.snapshot.paramMap.get('vendor') ? this.route.snapshot.paramMap.get('vendor') : '';
    const id = this.route.snapshot.paramMap.get('id') ? this.route.snapshot.paramMap.get('id') : '';
    console.log(vendor, id);
    if (vendor && vendor != null && vendor != '' && id && id != null && id != '') {
      this.vendorId = vendor;
      this.tableId = id;
      this.getDetail();
    } else {
      this.util.onError('ts_something_went_wrong', '');
      this.onHome();
    }
  }

  getDetail() {
    console.log('Detail');
    this.isInitialLoaded = false;
    this.api.get_public(`v1/public/qr_code_menu/${this.vendorId}/${this.tableId}`).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isInitialLoaded = true;
        if (response && response.success) {

          if (response && response.orders && response.orders.timeIntervalForScheduleDelivery) {
            const interval = response.orders.timeIntervalForScheduleDelivery;
            this.timeIntervalForScheduleDeliveryType = interval.type;
            this.timeIntervalForScheduleDeliveryValue = interval.value;
          }

          if (response && response.table && response.table.id && response.table.id == this.tableId) {
            this.tableNumber = response.table.tableNumber;
            console.log(`Table Id --> ${this.tableNumber}`);
          } else {
            this.util.onError('ts_something_went_wrong', '');
            this.onHome();
          }

          const info = response.details;
          this.restaurantName = info.name;
          this.restaurantAddress = info.address;
          this.restaurantLogo = info.logo;
          this.restaurantCover = info.cover;

          const tableOrder = info && info.tableOrder && (info.tableOrder == true || info.tableOrder == 'true');

          if (info && info.translations && Array.isArray(info.translations)) {
            if (info.translations) {
              const translation = info.translations.find((t: any) => t.code == this.util.appLocaleName());
              this.restaurantName = translation?.title || info.name;
              this.restaurantAddress = translation?.address || info.address;
            }
          }

          if (info && info.cuisine && Array.isArray(info.cuisine)) {
            const cuisineArray = info.cuisine.map((item: CustomerCuisineInterface) => {
              let name = item.name;
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                name = translation?.value || item.name;
              } else {
                name = item?.name || '';
              }
              return name;
            });
            this.restaurantCuisine = cuisineArray.join(' • ');
          }

          if (response && response.notice && Array.isArray(response.notice)) {
            const mapped = response.notice.map((item: CustomerRestaurantNoticeInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            });
            this.notice = mapped;
          }

          const ratingPriceArray: string[] = [];
          ratingPriceArray.push(`${info.rating} (${this.util.numberFormat(info.totalRating)} ${this.util.appTranslate('ratings')})`);
          ratingPriceArray.push(`${this.util.priceFormat(info.dishPriceForTwo)} ${this.util.appTranslate('for two')}`);
          this.restaurantRatingPrice = ratingPriceArray.join(' • ');

          if (info && info.slots && Array.isArray(info.slots)) {
            this.restaurantSlots = info.slots;
            this.getSlotFromDate(DateTime.now().toJSDate()).then((slots) => {
              if (slots.length == 0) {
                this.canDeliverNow = false;
              } else {
                const dayNumberOfDate = (DateTime.now().weekday + 6) % 7;
                const currentDayIndex = this.restaurantSlots.findIndex((x) => x.day == dayNumberOfDate);
                if (currentDayIndex != -1) {
                  this.canDeliverNow = this.checkCurrentTimeInSlots(this.restaurantSlots[dayNumberOfDate].times || []) && tableOrder;
                } else {
                  this.canDeliverNow = false;
                }
              }

              console.log(`Can Deliver Now ${this.canDeliverNow}`);
            }).catch((error) => {
              console.log(error);
              this.canDeliverNow = false;
            });
          }

          const categories: CustomerMenuCategoriesInterface[] = [];
          if (response && response.recommended && Array.isArray(response.recommended)) {
            const items = this.mapFoodItems(response.recommended);
            const param: CustomerMenuCategoriesInterface = {
              id: 'recommended',
              displayName: 'recommended',
              items: items,
              inView: true
            };
            categories.push(param);
          }

          if (response && response.custom && Array.isArray(response.custom)) {
            response.custom.forEach((item: CustomerMenuItemInterface) => {
              const items = this.mapFoodItems(item.foods);
              let name = item.category_name;
              if (item && item.category_translations && Array.isArray(item.category_translations)) {
                if (info.translations) {
                  const translation = item.category_translations.find((t: any) => t.code == this.util.appLocaleName());
                  name = translation?.value || info.name;
                }
              }
              const param: CustomerMenuCategoriesInterface = {
                id: item.category_id,
                displayName: name,
                items: items,
                inView: true
              };
              categories.push(param);
            });
          }

          if (response && response.main && Array.isArray(response.main)) {
            response.main.forEach((item: CustomerMenuItemInterface) => {
              const items = this.mapFoodItems(item.foods);
              let name = item.category_name;
              if (item && item.category_translations && Array.isArray(item.category_translations)) {
                if (info.translations) {
                  const translation = item.category_translations.find((t: any) => t.code == this.util.appLocaleName());
                  name = translation?.value || info.name;
                }
              }
              const param: CustomerMenuCategoriesInterface = {
                id: item.category_id,
                displayName: name,
                items: items,
                inView: true
              };
              categories.push(param);
            });
          }

          this.categories = categories;
          console.log(this.categories);

          if (response && response.cart && Array.isArray(response.cart)) {
            console.log('Cart Item---');
            const mappedItem = response.cart.map((item: CustomerTableOngoingOrderCartItemInterface) => {
              const optionNameList: string[] = [];
              if (item && item.foodInfo && item.foodInfo?.id) {
                if (item.foodInfo?.translations) {
                  const translation = item.foodInfo.translations.find((t) => t.code == this.util.appLocaleName());
                  item.foodInfo.displayName = translation?.title || item.foodInfo.name;
                } else {
                  item.foodInfo.displayName = item.foodInfo?.name || '';
                }
              }

              item.addons.map((addonItem) => {
                if (addonItem?.translations) {
                  const translation = addonItem.translations.find((t) => t.code == this.util.appLocaleName());
                  addonItem.displayName = translation?.value || addonItem.name;
                } else {
                  addonItem.displayName = addonItem?.name || '';
                }
                optionNameList.push(addonItem.displayName);
              });

              item.variations?.map((variationElement) => {
                variationElement?.selected?.map((optionElement) => {
                  optionNameList.push(optionElement);
                });
              });

              let price = parseFloat(parseFloat(item.foodInfo.price!.toString()).toFixed(2));
              let offerPrice = 0;
              if (item && item.foodInfo && item.foodInfo.taxationEnable && item.foodInfo.taxationEnable == true) {
                let taxPercentage: number = 0;
                if (item && item.foodtaxations && item.foodtaxations.length) {
                  item.foodtaxations.forEach((taxation: any) => {
                    taxPercentage = taxPercentage + parseFloat(parseFloat(taxation.taxAmount).toFixed(2));
                  });
                }
                if (taxPercentage > 0) {
                  const basePrice = price;
                  price = parseFloat((basePrice + (taxPercentage / 100) * basePrice).toFixed(2));
                }
              }


              if (item && item.addons && item.addons.length) {
                item.addons.forEach((addon: any) => {
                  price = price + parseFloat(parseFloat(addon.price).toFixed(2));
                });
              }

              if (item && item.variations && item.variations.length) {
                item.variations.forEach((savedVariation: any) => {
                  savedVariation.selected.forEach((selectedOption: any) => {
                    if (item && item.foodInfo && item.foodInfo.foodVariations && item.foodInfo.foodVariations.length) {
                      item.foodInfo.foodVariations.forEach((foodVariation: any) => {
                        foodVariation.options.forEach((foodOptions: any) => {
                          if (savedVariation.variation == foodVariation.title && selectedOption == foodOptions.name) {
                            price = price + parseFloat(parseFloat(foodOptions.price).toFixed(2));
                          }
                        });
                      });
                    }
                  });
                });
              }
              if (item && item.foodInfo && item.foodInfo.discount && parseFloat(item.foodInfo.discount!.toString()) > 0) {
                if (item.foodInfo.discountType == '%') {
                  const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(item.foodInfo.discount.toString()) / 100)).toFixed(2);
                  offerPrice = parseFloat(discountValue);
                } else {
                  const discountValue = (parseFloat(price.toString()) - parseFloat(item.foodInfo.discount.toString())).toFixed(2);
                  offerPrice = parseFloat(discountValue);
                }
              } else {
                offerPrice = parseFloat(price.toFixed(2));
              }

              const finalOfferPrice = (offerPrice * parseInt(item.quantity!.toString())).toFixed(2);
              offerPrice = parseFloat(finalOfferPrice);

              const realPrice = (price * parseInt(item.quantity!.toString())).toFixed(2);

              const discountInAmount = (parseFloat(realPrice.toString()) - parseFloat(offerPrice.toString())).toFixed(2);
              item.itemPrice = parseFloat(offerPrice.toString());
              item.realPrice = parseFloat(realPrice.toString());
              item.itemDiscount = parseFloat(discountInAmount.toString());
              item.optionName = optionNameList.join(',');
              return item;
            });
            this.ongoingItem = mappedItem;
            console.log(this.ongoingItem);

            const cartItemNumber = this.ongoingItem.map(item => item.quantity).reduce((sum, quantity) => sum + quantity, 0);
            this.ongoingCartItemNumber = cartItemNumber;
          }
        } else {
          this.util.onError('ts_something_went_wrong', '');
        }
      }, error: (error: any) => {
        console.log(error);
        this.isInitialLoaded = true;
        this.util.handleError(error, 'public');
      }
    });
  }

  mapFoodItems(foodList: CustomerMenuFoodInterface[]): CustomerMenuFoodInterface[] {
    const mapped = foodList.map((item: CustomerMenuFoodInterface) => {
      let name = item.name;
      let shortDescription = item.shortDescription;
      if (item && item.translations && Array.isArray(item.translations)) {
        if (item.translations) {
          const translation = item.translations.find((t: any) => t.code == this.util.appLocaleName());
          name = translation?.title || item.name;
          shortDescription = translation?.shortDescription || item.shortDescription;
        }
      }

      let price = parseFloat(parseFloat(item.price.toString()).toFixed(2));
      let offerPrice = 0;
      if (item && item.taxationEnable && item.taxationEnable == true) {
        let taxPercentage: number = 0;
        if (item && item.foodtaxations && item.foodtaxations.length) {
          item.foodtaxations.forEach((taxation: any) => {
            taxPercentage = taxPercentage + parseFloat(parseFloat(taxation.taxAmount).toFixed(2));
          });
        }
        if (taxPercentage > 0) {
          const basePrice = price;
          price = parseFloat((basePrice + (taxPercentage / 100) * basePrice).toFixed(2));
        }
      }

      if (item && item.discount && parseFloat(item.discount.toString()) > 0) {
        item.discount = parseFloat(parseFloat(item.discount.toString()).toFixed(2));
        if (item.discountType == '%') {
          const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(item.discount.toString()) / 100)).toFixed(2);
          offerPrice = parseFloat(discountValue);
        } else {
          const discountValue = (parseFloat(price.toString()) - parseFloat(item.discount.toString())).toFixed(2);
          offerPrice = parseFloat(discountValue);
        }
      } else {
        item.discount = 0;
      }

      if (item && item.purchaseLimit.toString() != '' && item.purchaseLimit != null) {
        if (item && item.purchaseLimit.toString() != '-1') {
          item.purchaseLimit = parseInt(item.purchaseLimit.toString());
        } else {
          item.purchaseLimit = 1000000000000000;
        }
      } else {
        item.purchaseLimit = 5;
      }

      if (item && item.stockNumber != null && item.stockNumber.toString() != '') {
        item.stockNumber = parseInt(item.stockNumber.toString());
      } else {
        item.stockNumber = -1;
      }

      if (item && item.addons && Array.isArray(item.addons)) {
        const addonMap = item.addons.map((addon: CustomerFoodAddonInterface) => {
          let stockNumber = 5;
          if (addon && addon.stockNumber != null && addon.stockNumber.toString() != '') {
            if (addon.stockNumber.toString() == '-1') {
              stockNumber = 1000000000000000;
            } else {
              stockNumber = parseInt(addon.stockNumber.toString());
            }
          }
          addon.stockNumber = stockNumber;
          addon.price = parseFloat(addon.price.toString());
          addon.stockType = addon && addon.stockType && addon.stockType != null && addon.stockType != '' ? addon.stockType : 'unlimited';
          return addon;
        });
        item.addons = addonMap;
      } else {
        item.addons = [];
      }

      if (item && item.foodtaxations && Array.isArray(item.foodtaxations)) {
        const taxMap = item.foodtaxations.map((taxItem: CustomerFoodFoodTaxation) => {
          taxItem.taxAmount = parseFloat(taxItem.taxAmount.toString());
          return taxItem;
        });
        item.foodtaxations = taxMap;
      } else {
        item.foodtaxations = [];
      }

      if (item && item.variations && Array.isArray(item.variations)) {
        const variationMap = item.variations.map((variationItem: CustomerFoodVariationInterface) => {
          const isRequired = variationItem.isRequired.toString() == 'true' || variationItem.isRequired == true ? true : false;
          let min = 1;
          let max = 1;
          if (variationItem && variationItem.min != null && variationItem.min.toString() != '') {
            min = parseInt(variationItem.min.toString());
          } else {
            min = 1;
          }
          if (variationItem && variationItem.max != null && variationItem.max.toString() != '') {
            max = parseInt(variationItem.max.toString());
          } else {
            max = 1;
          }
          if (!variationItem || !variationItem.min) {
            variationItem.min = 0;
          }
          if (!variationItem || !variationItem.max) {
            variationItem.max = 0;
          }
          if (variationItem.min == 0 || variationItem.min.toString() == '0') {
            min = 1;
          }
          if (variationItem.max == 0 || variationItem.max.toString() == '0') {
            max = 1;
          }

          if (variationItem && variationItem.options && Array.isArray(variationItem.options)) {
            const optionMap = variationItem.options.map((optionItem: CustomerFoodVariationOptionInterface) => {
              let priceOfOption = 0;
              let stock = 5;
              if (optionItem && optionItem.price != null && optionItem.price.toString() != '') {
                priceOfOption = parseFloat(optionItem.price.toString());
              }
              if (optionItem && optionItem.stock != null && optionItem.stock.toString() != '') {
                if (optionItem.stock.toString() != '-1') {
                  stock = parseInt(optionItem.stock.toString());
                } else if (optionItem.stock.toString() == '-1') {
                  stock = 1000000000000000;
                }
              }
              optionItem.price = priceOfOption;
              optionItem.stock = stock;
              return optionItem;
            });
            variationItem.options = optionMap;
          } else {
            variationItem.options = [];
          }

          variationItem.isRequired = isRequired;
          variationItem.type = min == 1 && max == 1 ? 'single' : variationItem.type;
          variationItem.min = min;
          variationItem.max = max;
          return variationItem;
        });


        item.variations = variationMap;

      } else {
        item.variations = [];
      }

      item.displayName = name;
      item.displayShortDescription = shortDescription;

      item.price = price;
      item.offerPrice = offerPrice;
      item.quantity = 0;
      item.cartEntity = 'single';
      return item;
    });
    return mapped;
  }

  onHome() {
    this.router.navigateByUrl('/');
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

  async getSlotFromDate(selectedDate: Date): Promise<string[]> {
    const dayNumberOfDate = selectedDate.getDay() == 0 ? 6 : (selectedDate.getDay() - 1);
    const currentDayIndex = this.restaurantSlots.findIndex((x) => x.day == dayNumberOfDate);
    if (currentDayIndex != -1) {
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

  scrollToCategory(categoryId: string): void {
    const element = document.getElementById(categoryId);
    if (!element) return;

    const container = this.scrollContainer.nativeElement as HTMLElement;
    const headerOffset = 60;
    const elementTop = element.offsetTop;
    const scrollPosition = elementTop - headerOffset;

    container.scrollTo({
      top: scrollPosition,
      behavior: 'smooth'
    });
  }

  async onMenuModal() {
    console.log('Open Menu Modal 1');
    const dialogRef = this.dialog.open(DialogTableOrderMenu, {
      disableClose: false,
      data: { data: this.categories },
      position: { bottom: '80px' },
    });
    console.log('2');

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'select' && result.data) {
        console.log(result.data);
        setTimeout(() => {
          this.scrollToCategory(result.data);
        }, 300);
      }
    });
  }

  async onAddCart(item: CustomerMenuFoodInterface) {
    console.log(item);
    if (item.addons.length >= 1 || item.variations.length >= 1) {
      console.log('Variatoin Modal');
      const dialogRef = this.dialog.open(DialogTableOrderFoodVariationFresh, {
        disableClose: true,
        autoFocus: false,
        restoreFocus: false,
        data: { info: item },
        panelClass: 'pos-food-modal',
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
        if (result && result.success && result.success == true) {
          const savedAddon: CustomerTableOrderCartAddon[] = [];
          const newAddonIds: string[] = [];
          if (result && result.addons && Array.isArray(result.addons)) {
            result.addons.forEach((element: any) => {
              const addonParam: CustomerTableOrderCartAddon = {
                'name': element.name,
                'translations': element.translations,
                'id': element.id,
                'price': element.price,
                'inStock': element.inStock,
                'stockNumber': element.stockNumber,
                'stockType': element.stockType,
                'haveDiscount': element.haveDiscount,
                'discountPrice': element.discountPrice,
                'displayName': ''
              }
              savedAddon.push(addonParam);
              newAddonIds.push(element.id);
            });
          }

          const savedVariations: CustomerTableOrderCartVariation[] = [];
          const newVariationIds: string[] = [];
          if (result && result.variations && Array.isArray(result.variations)) {
            result.variations.forEach((element: CustomerTableOrderCartVariation) => {
              const options: any[] = [];
              if (element && element.options && Array.isArray(element.options)) {
                element.options.forEach((op: CustomerTableOrderCartOption) => {
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
          const repeatedList = this.itemInCart.filter((x) => x.id == item.id);
          if (repeatedList && Array.isArray(repeatedList) && repeatedList.length > 0) {
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
            console.log('Same Product Update QTY');
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
                const indexOfSameItem = this.itemInCart.findIndex((x) => x.uuid == sameUuid && x.id == item.id);
                if (indexOfSameItem != -1) {
                  this.itemInCart[indexOfSameItem].quantity = quantity;
                  this.calculateItemTotal();
                }
              } else if (quantity < item.stockNumber && checkAddonHaveStock == 'true' && checkVariationHaveStock == 'true') {
                const indexOfSameItem = this.itemInCart.findIndex((x) => x.uuid == sameUuid && x.id == item.id);
                if (indexOfSameItem != -1) {
                  this.itemInCart[indexOfSameItem].quantity = quantity;
                  this.calculateItemTotal();
                }
              } else {
                if (checkAddonHaveStock == 'false' || checkVariationHaveStock == 'false') {
                  this.util.onError('ts_variation_limit_error', `${checkAddonHaveStock == 'false' ? addonOutOfStockLimitNumber : variationOutOfStockLimitNumber}`);
                } else {
                  const indexOfSameItem = this.itemInCart.findIndex((x) => x.uuid == sameUuid && x.id == item.id);
                  if (indexOfSameItem != -1) {
                    this.itemInCart[indexOfSameItem].quantity = item.stockNumber;
                    this.util.onError('ts_stock_limit_error', `${item.stockNumber}`);
                    this.calculateItemTotal();
                  }
                }
              }
            } else {
              const indexOfSameItem = this.itemInCart.findIndex((x) => x.uuid == sameUuid && x.id == item.id);
              if (indexOfSameItem != -1) {
                this.itemInCart[indexOfSameItem].quantity = item.purchaseLimit;
                this.util.onError('ts_purchase_error', `${item.purchaseLimit}`);
                this.calculateItemTotal();
              }
            }
          } else {
            console.log('Add To Cart');
            const addToCartParam: CustomerTableOrderCartItemInterface = {
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
              'instruction': '',
              'displayName': ''
            };
            this.itemInCart.push(addToCartParam);
            this.itemInCart = [...this.itemInCart];
            this.calculateItemTotal();
          }
        }
      });
    } else {
      console.log('Direct Add');
      const addToCartParam: CustomerTableOrderCartItemInterface = {
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
        'quantity': 1,
        'id': item.id,
        'addons': [],
        'variations': [],
        'translations': item.translations,
        'inStock': item.inStock,
        'taxationEnable': item.taxationEnable,
        'foodtaxations': item.foodtaxations,
        'optionName': '',
        'totalPrice': 0,
        'realPrice': 0,
        'itemDiscount': 0,
        'instruction': '',
        'displayName': ''
      };
      this.itemInCart.push(addToCartParam);
      this.itemInCart = [...this.itemInCart];
      this.calculateItemTotal();
    }
  }

  translateCartItem() {
    const mappedList = this.itemInCart.map(
      (item: CustomerTableOrderCartItemInterface) => {
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
    this.itemInCart = mappedList;
  }

  calculateItemTotal() {
    console.log('Calculate Price');
    const mappedItem = this.itemInCart.map((item: CustomerTableOrderCartItemInterface) => {
      let price: number = 0;
      let addonPrice: number = 0;
      let variationPrice: number = 0;
      // Real Price //
      let realPrice: number = 0.0;
      let addonRealPrice: number = 0.0;
      let variationRealPrice: number = 0.0;
      // Real Price //

      item.addons.forEach((addons) => {
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
      item.totalPrice = price;
      // Real Price //
      const realPriceWithQuantity = (parseFloat(realPrice.toString()) * item.quantity).toFixed(2);
      realPrice = parseFloat(realPriceWithQuantity);
      item.realPrice = realPrice;
      const restItemDiscountString = (parseFloat(item.realPrice.toString()) - parseFloat(price.toString())).toFixed(2);
      const restItemDiscount = parseFloat(restItemDiscountString);
      item.itemDiscount = restItemDiscount;

      let name = item.name;
      if (item && item.translations && Array.isArray(item.translations)) {
        if (item.translations) {
          const translation = item.translations.find((t: any) => t.code == this.util.appLocaleName());
          name = translation?.title || item.name;
        }
      }
      item.displayName = name;

      return item;
    });
    this.itemInCart = mappedItem;
    let itemTotal: number = 0;
    this.itemInCart.forEach((item) => {
      const countTotal = (parseFloat(itemTotal.toString()) + parseFloat(item.totalPrice.toString())).toFixed(2);
      itemTotal = parseFloat(countTotal);
    });
    this.itemTotal = itemTotal;
    const cartItemNumber = this.itemInCart.map(item => item.quantity).reduce((sum, quantity) => sum + quantity, 0);
    this.cartItemNumber = cartItemNumber;
    const foodArrayMap = this.categories.map((item) => {
      const itemMap = item.items.map((food) => {
        const itemInCartQty = this.itemInCart.filter((x) => x.id == food.id).map(item => item.quantity).reduce((sum, quantity) => sum + quantity, 0);
        const cartEntity = this.itemInCart.filter((x) => x.id == food.id);
        food.quantity = itemInCartQty || 0;
        food.cartEntity = cartEntity.length > 1 ? 'multiple' : 'single';
        return food;
      });
      item.items = itemMap;
      return item;
    });
    this.categories = [...foodArrayMap];
    console.log(this.categories);
    this.translateCartItem();
  }

  async increaseCartItem(item: CustomerMenuFoodInterface) {
    console.log('Increase', item);
    if (item.addons.length >= 1 || item.variations.length >= 1) {
      console.log('Variatoin Modal');
      this.dialog.closeAll();
      const foodItemList: CustomerTableOrderCartItemInterface[] = this.itemInCart.filter((x) => x.id == item.id);
      console.log(foodItemList);
      const dialogRef = this.dialog.open(DialogTableOrderRepeatItem, {
        disableClose: true,
        autoFocus: false,
        restoreFocus: false,
        data: { info: JSON.stringify(foodItemList) },
        panelClass: 'pos-food-modal',
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
        if (result && result.success && result.success == true && result.kind == 'new') {
          this.onAddCart(item);
        } else if (result && result.success && result.success == true && result.kind == 'update') {
          const cartItem: CustomerCartItemRepeatModalInterface[] = result.items;
          const mappedItem = this.itemInCart.map((item) => {
            const newQty = cartItem.find((x) => x.uuid == item.uuid);
            if (newQty && newQty.uuid != '') {
              item.quantity = newQty.qty;
            }
            return item;
          });
          const newItem: CustomerTableOrderCartItemInterface[] = mappedItem.filter((x) => x.quantity != 0);
          this.itemInCart = [...newItem];
          this.calculateItemTotal();
        }
      });
    } else {
      console.log('Direct Add');
      if (item.quantity < item.purchaseLimit) {
        const cartItem = this.itemInCart.map((item) => {
          const newQty = item.quantity + 1;
          item.quantity = newQty;
          return item;
        });
        this.itemInCart = [...cartItem];
        this.calculateItemTotal();
      } else {
        this.util.onError('ts_purchase_error', `${item.purchaseLimit}`);
      }
    }
  }

  async decreaseCartItem(item: CustomerMenuFoodInterface) {
    console.log('Decrease', item);
    if (item.addons.length >= 1 || item.variations.length >= 1) {
      console.log('Variatoin Modal');
      if (item.cartEntity == 'single') {
        console.log('Remove');
        if (item.quantity == 1) {
          console.log('Remove');
          const cartItem = this.itemInCart.filter((food) => food.id != item.id);
          this.itemInCart = [...cartItem];
          this.calculateItemTotal();
        } else {
          console.log('Decrease');
          const cartItem = this.itemInCart.map((item) => {
            const newQty = item.quantity - 1;
            item.quantity = newQty;
            return item;
          });
          this.itemInCart = [...cartItem];
          this.calculateItemTotal();
        }
      } else {
        console.log('Modal');
        this.increaseCartItem(item);
      }
    } else {
      console.log('Direct Remove');
      if (item.quantity == 1) {
        console.log('Remove');
        const cartItem = this.itemInCart.filter((food) => food.id != item.id);
        this.itemInCart = [...cartItem];
        this.calculateItemTotal();
      } else {
        console.log('Decrease');
        const cartItem = this.itemInCart.map((item) => {
          const newQty = item.quantity - 1;
          item.quantity = newQty;
          return item;
        });
        this.itemInCart = [...cartItem];
        this.calculateItemTotal();
      }
    }
  }

  async openCartModal() {
    const dialogRef = this.dialog.open(DialogTableOrderCartItems, {
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'pos-food-modal',
      data: { 'ordered': JSON.stringify(this.ongoingItem), 'cart': JSON.stringify(this.itemInCart), tableId: this.tableId, restauarant: this.vendorId, tableNumber: this.tableNumber },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.success && result.success == true && result.kind == 'refresh') {
        this.itemInCart = [];
        this.cartItemNumber = 0;
        this.getDetail();
      }
    });
  }

}
