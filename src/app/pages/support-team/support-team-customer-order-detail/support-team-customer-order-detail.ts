import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';
import { OrderCartListInterface } from 'src/app/interfaces/order.cart.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-support-team-customer-order-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './support-team-customer-order-detail.html',
})
export class SupportTeamCustomerOrderDetail {

  id: string = '';
  dropupProof: string = '';
  pickupProof: string = '';
  cartItem = new MatTableDataSource<OrderCartListInterface>([]);
  displayedColumn = ['id', 'detail', 'qty', 'price'];
  userId: string = '';
  userName: string = '';
  userRole: string = '';
  userCover: string = '';
  userContanct: string = '';
  userEmail: string = '';
  userTotalOrders: number = 0;
  orderId: string = '';
  orderStatus: string = 'created';
  cookingInstruction: string = '';
  receiverContact: string = '';
  receiverName: string = '';
  customerPin: string = '';
  deliveryAddress: string = '';
  deliveryInstructionInfo: string = '';
  deliveryCharge: number = 0;
  deliveryTip: number = 0;
  restaurantId: string = '';
  restaurantName: string = '';
  restaurantCover: string = '';
  restaurantAddress: string = '';
  restaurantLogo: string = '';
  restaurantSlug: string = '';
  restaurantEmail: string = '';
  restaurantContact: string = '';
  restaurantOwnerName: string = '';
  restaurantOrderCount: number = 0;
  driverId: string = '';
  driverName: string = '';
  driverCover: string = '';
  driverRole: string = '';
  driverEmail: string = '';
  driverContact: string = '';
  driverOrderPin: string = '';
  driverDeliveredOrder: number = 0;
  extraCharge: number = 0;
  foodServiceCharge: number = 0;
  grandTotal: number = 0;
  couponDiscountCharge: number = 0;
  walletAmount: number = 0;
  instantOrder: boolean = false;
  realTotal: number = 0;
  itemTotal: number = 0;
  itemDiscount: number = 0;
  orderAt: string = '';
  orderTo: string = '';
  packageCharge: number = 0;
  packageChargeTax: number = 0;
  orderDate: string = '';
  scheduleDate: string = '';
  scheduleOrder: boolean = false;
  scheduleTime: string = '';
  serviceCharge: number = 0;
  paymentName: string = '';
  paymentSlug: string = '';
  paymentMode: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private location: Location,
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id != '') {
      this.getInfo();
    } else {
      this.util.onError('ts_something_went_wrong', '');
      this.onBack();
    }
  }

  getInfo() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/support_team/order_detail/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true) {
          console.log('Get The Results');
          if (response && response.success == true && response.info) {
            const orderInfo = response.info;
            console.log(orderInfo.id);

            if (orderInfo && orderInfo.restaurant && orderInfo.restaurant.id) {
              this.restaurantId = orderInfo.restaurant.id;
              this.restaurantName = orderInfo.restaurant.name;
              this.restaurantAddress = orderInfo.restaurant.address;
              this.restaurantCover = orderInfo.restaurant.cover;
              this.restaurantLogo = orderInfo.restaurant.logo;
              this.restaurantSlug = orderInfo.restaurant.slug;

              if (orderInfo && orderInfo.restaurant && orderInfo.restaurant.translations && Array.isArray(orderInfo.restaurant.translations)) {
                if (orderInfo.restaurant.translations) {
                  const translation = orderInfo.restaurant.translations.find((t: any) => t.code == this.util.appLocaleName());
                  this.restaurantName = translation?.title || orderInfo.restaurant.name;
                  this.restaurantAddress = translation?.address || orderInfo.restaurant.address;
                }
              }
            }

            if (orderInfo && orderInfo.paymentInfo && orderInfo.paymentInfo.name) {
              this.paymentName = orderInfo.paymentInfo.name;
              this.paymentSlug = orderInfo.paymentInfo.slug;
              this.paymentMode = orderInfo.paymentInfo.paymentWay;

              if (orderInfo && orderInfo.paymentInfo && orderInfo.paymentInfo.translations && Array.isArray(orderInfo.paymentInfo.translations)) {
                if (orderInfo.paymentInfo.translations) {
                  const translation = orderInfo.paymentInfo.translations.find((t: any) => t.code == this.util.appLocaleName());
                  this.paymentName = translation?.value || orderInfo.paymentInfo.name;
                }
              }
            }

            if (orderInfo && orderInfo.userInfo && orderInfo.userInfo.id) {
              this.userId = orderInfo.userInfo.id;
              this.userName = `${orderInfo.userInfo.firstName} ${orderInfo.userInfo.lastName}`;
              this.userContanct = `+${orderInfo.userInfo.countryCode} ${orderInfo.userInfo.mobile}`;
              this.userRole = orderInfo.userInfo.role;
              this.userCover = orderInfo.userInfo.image;
              this.userEmail = orderInfo.userInfo.email;
            }

            this.orderStatus = orderInfo.status;

            this.cookingInstruction = orderInfo.cookingInstruction;
            this.receiverContact = `+${orderInfo.countryCode}${orderInfo.receiverContact}`;
            this.receiverName = orderInfo.receiverName;
            this.customerPin = orderInfo.customerOrderPin;
            this.couponDiscountCharge = orderInfo.couponDiscountCharge;
            this.walletAmount = orderInfo.walletAmount;
            this.orderDate = DateTime.fromISO(orderInfo.createdAt).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
            if (orderInfo && orderInfo.orderTo == 'homedelivery' && orderInfo.deliveryAddressRaw && orderInfo.deliveryAddressRaw.id) {
              this.deliveryAddress = `${orderInfo.deliveryAddressRaw.flatHouse}, ${orderInfo.deliveryAddressRaw.locality}, ${orderInfo.deliveryAddressRaw.landmark}`;
            }

            if (orderInfo && orderInfo.deliveryInstructionInfo && orderInfo.deliveryInstructionInfo.id) {
              this.deliveryInstructionInfo = orderInfo.deliveryInstructionInfo.name;

              if (orderInfo && orderInfo.deliveryInstructionInfo && orderInfo.deliveryInstructionInfo.translations && Array.isArray(orderInfo.deliveryInstructionInfo.translations)) {
                if (orderInfo.deliveryInstructionInfo.translations) {
                  const translation = orderInfo.deliveryInstructionInfo.translations.find((t: any) => t.code == this.util.appLocaleName());
                  this.deliveryInstructionInfo = translation?.value || orderInfo.deliveryInstructionInfo.name;
                }
              }
            }

            this.deliveryCharge = orderInfo.deliveryCharge;
            this.deliveryTip = orderInfo.deliveryTip;

            if (orderInfo && orderInfo.driverInfo && orderInfo.driverInfo.id) {
              this.driverId = orderInfo.driverInfo.id;
              this.driverName = `${orderInfo.driverInfo.firstName} ${orderInfo.driverInfo.lastName}`;
              this.driverCover = orderInfo.driverInfo.image;
              this.driverRole = orderInfo.driverInfo.role;
              this.driverContact = `+${orderInfo.driverInfo.countryCode} ${orderInfo.driverInfo.mobile}`;
              this.driverEmail = orderInfo.driverInfo.email;
            }

            this.driverOrderPin = orderInfo.driverOrderPin;
            this.extraCharge = orderInfo.extraCharge;
            this.foodServiceCharge = orderInfo.foodServiceCharge;
            this.grandTotal = orderInfo.grandTotal;
            this.instantOrder = orderInfo.instantOrder;
            this.realTotal = orderInfo.realTotal;
            this.itemTotal = orderInfo.itemTotal;
            this.itemDiscount = orderInfo.itemDiscount;
            this.orderAt = orderInfo.orderAt;
            this.orderTo = orderInfo.orderTo;
            this.packageCharge = orderInfo.packageCharge;
            this.packageChargeTax = orderInfo.packageChargeTax;
            if (orderInfo && orderInfo.scheduleDate != '') {
              this.scheduleDate = DateTime.fromISO(orderInfo.scheduleDate).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
            }
            this.scheduleOrder = orderInfo.scheduleOrder;
            this.scheduleTime = orderInfo.scheduleTime;
            this.serviceCharge = orderInfo.serviceCharge;

            if (orderInfo && orderInfo.cartItem && orderInfo.cartItem.length > 0) {
              const mappedList = orderInfo.cartItem.map(
                (item: OrderCartListInterface) => {
                  const optionNameList: string[] = [];
                  if (item.translations) {
                    const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                    item.displayName = translation?.title || item.name;
                    item.displayShortDescription = translation?.shortDescription || item.shortDescription;
                  } else {
                    item.displayName = item?.name || '';
                    item.displayShortDescription = item?.shortDescription || '';
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
                    variationElement?.options?.map((optionElement) => {
                      optionNameList.push(optionElement.name);
                    });
                  });

                  if (item && item.restaurantInfo && item.restaurantInfo?.id) {
                    if (item.restaurantInfo?.translations) {
                      const translation = item.restaurantInfo.translations.find((t) => t.code == this.util.appLocaleName());
                      item.restaurantInfo.displayName = translation?.title || item.restaurantInfo.name;
                    } else {
                      item.restaurantInfo.displayName = item.restaurantInfo?.name || '';
                    }
                  }

                  item.foodtaxations?.taxation?.map((taxItem) => {
                    if (taxItem.translation) {
                      const translation = taxItem.translation.find((t) => t.code == this.util.appLocaleName());
                      taxItem.displayName = translation?.name || taxItem.name;
                    } else {
                      taxItem.displayName = item?.name || '';
                    }
                  });

                  item.optionName = optionNameList.join(',');
                  return item;
                }
              );
              this.cartItem = new MatTableDataSource<OrderCartListInterface>(mappedList);
              console.log(this.cartItem);
            }

          }
          if (response && response.deliveryProof && response.deliveryProof.id) {
            const proof = response.deliveryProof;
            this.dropupProof = proof.dropup;
            this.pickupProof = proof.pickup;
          }

          if (response && response.restUserInfo && response.restUserInfo.id) {
            const restInfo = response.restUserInfo;
            this.restaurantEmail = restInfo.email;
            this.restaurantContact = `+${restInfo.countryCode} ${restInfo.mobile}`;
            this.restaurantOwnerName = `${restInfo.firstName} ${restInfo.lastName}`;
          }

          this.userTotalOrders = response.userTotalOrderCount;
          this.driverDeliveredOrder = response.driverDeliveredOrder;
          this.restaurantOrderCount = response.storeOrderCount;

        } else {
          this.util.onError('ts_something_went_wrong', '');
          this.onBack();
        }
      },
      error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'support-team');
      },
    });
  }

  onBack() {
    this.location.back();
  }

  openImageInNewWindow(path: string) {
    console.log(`Path --> ${path}`);
    window.open(this.api.mediaUrl + path, '_blank');
  }

}
