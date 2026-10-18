import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { OrderCartListInterface } from 'src/app/interfaces/order.cart.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogCityzenCancelRefund } from './dialog-cityzen-cancel-refund/dialog-cityzen-cancel-refund';
import { DialogCityzenGiveRefund } from './dialog-cityzen-give-refund/dialog-cityzen-give-refund';
import { CallNumberDialog } from 'src/app/ui-components/call-number-dialog/call-number-dialog';
import { DialogCityzenChatMessage } from 'src/app/pages/city-master-team/cityzen-order-section/dialog-cityzen-chat-message/dialog-cityzen-chat-message';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-order-refund-request-info',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './cityzen-order-refund-request-info.html',
})
export class CityzenOrderRefundRequestInfo {

  cartItem = new MatTableDataSource<OrderCartListInterface>([]);
  displayedColumn = ['id', 'detail', 'qty', 'price'];
  id: string = '';
  refundStatus: string = 'created';
  requestedDate: string = '';
  refundTo: string = '';
  paymentName: string = '';
  paymentSlug: string = '';
  paymentMode: string = '';
  refundedAmount: number = 0;
  refundReason: string = '';
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
  itemTotal: number = 0;
  orderAt: string = '';
  orderTo: string = '';
  packageCharge: number = 0;
  packageChargeTax: number = 0;
  orderDate: string = '';
  scheduleDate: string = '';
  scheduleOrder: boolean = false;
  scheduleTime: string = '';
  serviceCharge: number = 0;
  deliveryPickupProof: string = '';
  deliveryDropupProof: string = '';
  customerContactUserID: string = '';
  restaurantContactUserId: string = '';
  deliverymanContactUserId: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private dialog: MatDialog,
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.getInfo();
  }

  getInfo() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/order_refund_request_detail/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true) {
          console.log('Get The Results');
          if (response && response.success == true && response.info) {
            const refundInfo = response.info;
            console.log(refundInfo.id);
            this.refundStatus = refundInfo.status;
            this.requestedDate = DateTime.fromISO(refundInfo.createdAt).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
            this.refundTo = refundInfo.refundTo;
            if (refundInfo && refundInfo.paymentInfo && refundInfo.paymentInfo.name) {
              this.paymentName = refundInfo.paymentInfo.name;
              this.paymentSlug = refundInfo.paymentInfo.slug;
              this.paymentMode = refundInfo.paymentInfo.paymentWay;

              if (refundInfo && refundInfo.paymentInfo && refundInfo.paymentInfo.translations && Array.isArray(refundInfo.paymentInfo.translations)) {
                if (refundInfo.paymentInfo.translations) {
                  const translation = refundInfo.paymentInfo.translations.find((t: any) => t.code == this.util.appLocaleName());
                  this.paymentName = translation?.value || refundInfo.paymentInfo.name;
                }
              }
            }
            this.refundedAmount = refundInfo.amount;
            if (refundInfo && refundInfo.reason && refundInfo.reason.name) {
              this.refundReason = refundInfo.reason.name;
              if (refundInfo && refundInfo.reason && refundInfo.reason.translations && Array.isArray(refundInfo.reason.translations)) {
                if (refundInfo.reason.translations) {
                  const translation = refundInfo.reason.translations.find((t: any) => t.code == this.util.appLocaleName());
                  this.refundReason = translation?.value || refundInfo.reason.name;
                }
              }
            }

            if (refundInfo && refundInfo.restaurant && refundInfo.restaurant.id) {
              this.restaurantId = refundInfo.restaurant.id;
              this.restaurantName = refundInfo.restaurant.name;
              this.restaurantAddress = refundInfo.restaurant.address;
              this.restaurantCover = refundInfo.restaurant.cover;
              this.restaurantLogo = refundInfo.restaurant.logo;
              this.restaurantSlug = refundInfo.restaurant.slug;

              if (refundInfo && refundInfo.restaurant && refundInfo.restaurant.translations && Array.isArray(refundInfo.restaurant.translations)) {
                if (refundInfo.restaurant.translations) {
                  const translation = refundInfo.restaurant.translations.find((t: any) => t.code == this.util.appLocaleName());
                  this.restaurantName = translation?.title || refundInfo.restaurant.name;
                  this.restaurantAddress = translation?.address || refundInfo.restaurant.address;
                }
              }
            }

            if (refundInfo && refundInfo.userInfo && refundInfo.userInfo.id) {
              this.userId = refundInfo.userInfo.id;
              this.userName = `${refundInfo.userInfo.firstName} ${refundInfo.userInfo.lastName}`;
              this.userContanct = `+${refundInfo.userInfo.countryCode}${refundInfo.userInfo.contactNumber}`;
              this.userRole = refundInfo.userInfo.role;
              this.userCover = refundInfo.userInfo.image;
              this.userEmail = refundInfo.userInfo.contactEmail;
              this.customerContactUserID = refundInfo.userInfo.id;
            }

          }

          if (response && response.orderInfo && response.orderInfo.id) {
            const orderInfo = response.orderInfo;
            this.orderId = orderInfo.id;
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
              this.driverContact = `+${orderInfo.driverInfo.countryCode}${orderInfo.driverInfo.contactNumber}`;
              this.driverEmail = orderInfo.driverInfo.contactEmail;
              this.deliverymanContactUserId = orderInfo.driverInfo.id;
            }

            this.driverOrderPin = orderInfo.driverOrderPin;

            this.extraCharge = orderInfo.extraCharge;
            this.foodServiceCharge = orderInfo.foodServiceCharge;
            this.grandTotal = orderInfo.grandTotal;
            this.instantOrder = orderInfo.instantOrder;
            this.itemTotal = orderInfo.itemTotal;
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
            const deliveryProof = response.deliveryProof;
            this.deliveryPickupProof = deliveryProof.pickup;
            this.deliveryDropupProof = deliveryProof.dropup;
          }

          if (response && response.restUserInfo && response.restUserInfo.id) {
            const restInfo = response.restUserInfo;
            this.restaurantEmail = restInfo.email;
            this.restaurantContact = `+${restInfo.countryCode}${restInfo.mobile}`;
            this.restaurantOwnerName = `${restInfo.firstName} ${restInfo.lastName}`;
            this.restaurantContactUserId = response.restUserInfo.id;
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
        this.util.handleError(error, 'cityzen');
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

  onOrderPrint() {
    this.router.navigate(['cityzen-team/u/order-invoice', this.orderId]);
  }

  onCustomerDetail() {
    this.router.navigate(['cityzen-team/u/customer-detail', this.userId]);
  }

  onRestaurantDetail() {
    this.router.navigate(['cityzen-team/u/restaurant-detail', this.restaurantId]);
  }

  onDeliverymanDetail() {
    this.router.navigate(['cityzen-team/u/deliveryman-details', this.driverId]);
  }

  onCancelRefundRequest() {
    const dialogRef = this.dialog.open(DialogCityzenCancelRefund, {
      data: { requestId: this.id },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'true') {
        this.onBack();
      }
    });
  }

  onGiveRefund() {
    const dialogRef = this.dialog.open(DialogCityzenGiveRefund, {
      data: { requestId: this.id, orderId: this.orderId, payment: this.paymentSlug, paymentMode: this.paymentMode, grandTotal: this.grandTotal },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'true') {
        this.onBack();
      }
    });
  }

  onFoodDetail(id: string) {
    this.router.navigate(['cityzen-team/u/food-detail', id]);
  }

  onChatOrContact(from: string, kind: string,) {
    let id = '';
    if (from == 'user') {
      id = this.customerContactUserID;
    } else if (from == 'restaurant') {
      id = this.restaurantContactUserId;
    } else if (from == 'deliveryman') {
      id = this.deliverymanContactUserId;
    }
    if (id && id != '') {
      const spinnerRef = this.util.start('ts_fetching');
      this.api.get_private(`v1/cityzen/user_contact_detail/${id}`).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          if (response && response.success) {
            const info = response.user;
            const name = `${info.firstName} ${info.lastName}`;
            const email = info.email;
            const countryCode = info.countryCode;
            const mobile = info.mobile;
            const role = info.role;
            const image = info.image;
            console.log(`${name} ${email} ${countryCode} ${mobile} ${role} ${image}`);
            if (kind == 'call') {
              this.dialog.open(CallNumberDialog, {
                data: { id: `${id}`, name: `${name}`, email: `${email}`, countryCode: `${countryCode}`, mobile: `${mobile}`, role: `${role}`, image: `${image}` },
                disableClose: true
              });
            } else {
              this.dialog.open(DialogCityzenChatMessage, {
                disableClose: true,
                data: { id: `${id}`, name: `${name}`, email: `${email}`, countryCode: `${countryCode}`, mobile: `${mobile}`, role: `${role}`, image: `${image}` },
                position: { bottom: '2%', right: '2%' },
                width: '400px',
                height: '600px',
                maxWidth: '400px',
                maxHeight: '600px',
                panelClass: 'dialog-chat-container'
              });
            }
          } else {
            this.util.onError('ts_something_went_wrong', '');
          }
        },
        error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'cityzen');
        }
      });
    } else {
      this.util.onError('ts_something_went_wrong', '');
    }
  }

}
