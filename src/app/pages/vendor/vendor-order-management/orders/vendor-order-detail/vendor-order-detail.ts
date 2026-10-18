import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { OrderCartListInterface } from 'src/app/interfaces/order.cart.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogRejectOrderReason } from './dialog-reject-order-reason/dialog-reject-order-reason';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { DialogSelectDeliveryman } from './dialog-select-deliveryman/dialog-select-deliveryman';
import { DialogFindDeliveryman } from './dialog-find-deliveryman/dialog-find-deliveryman';
import { DialogVerifyOrderPin } from './dialog-verify-order-pin/dialog-verify-order-pin';
import { CallNumberDialog } from 'src/app/ui-components/call-number-dialog/call-number-dialog';
import { DialogVendorChatMessages } from 'src/app/pages/vendor/vendor-order-management/orders/dialog-vendor-chat-messages/dialog-vendor-chat-messages';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-vendor-order-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './vendor-order-detail.html',
})
export class VendorOrderDetail {

  cartItem = new MatTableDataSource<OrderCartListInterface>([]);
  displayedColumn = ['id', 'detail', 'qty', 'price'];
  id: string = '';
  orderDateTime: string = '';
  restaurantName: string = '';
  paymentName: string = '';
  orderStatus: string = 'created';
  deliveryType: string = '';
  orderType: string = '';
  isInstantOrder: boolean = false;
  cookingInstruction: string = '';
  deliveryInstructionInfo: string = '';
  deliveryAddress: string = '';
  grandTotal: number = 0;
  realTotal: number = 0;
  itemTotal: number = 0;
  itemDiscount: number = 0;
  couponDiscountCharge: number = 0;
  deliveryCharge: number = 0;
  foodServiceCharge: number = 0;
  serviceCharge: number = 0;
  packageCharge: number = 0;
  packageChargeTax: number = 0;
  walletAmount: number = 0;
  deliveryTip: number = 0;
  extraCharge: number = 0;
  preparationTime: number = 0;
  userId: string = '';
  userName: string = '';
  userCover: string = '';
  userMobile: string = '';
  userEmail: string = '';
  receiverName: string = '';
  receiverMobile: string = '';
  userRole: string = '';
  driverId: string = '';
  driverName: string = '';
  driverCover: string = '';
  driverMobile: string = '';
  driverEmail: string = '';
  driverRole: string = '';
  canInitiateCall: boolean = false;
  canInitiateChat: boolean = false;
  deliveryVerification: boolean = false;
  driverCanCancelOrder: boolean = false;
  orderConfirmationModel: boolean = false;
  restaurantCanCancelOrder: boolean = false;
  driverPickup: boolean = false;
  nearDeliveryman: number = 0;
  customerOrderPin: string = '';
  driverOrderPin: string = '';
  paymentMode: string = '';
  customerContactUserID: string = '';
  deliverymanContactUserId: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private navCtrl: Location,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id != null && this.id != '') {
      this.getOrderDetail();
    } else {
      this.util.onError('ts_something_went_wrong', '');
      this.navCtrl.back();
    }
  }

  getOrderDetail() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/orders/vendorOrderDetails/' + this.id + '/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true) {
          const detail = response.detail;
          if (detail && detail.instantOrder == true) {
            this.orderDateTime = `${DateTime.fromISO(detail.createdAt).setLocale(this.util.appLocaleName()).toFormat('EEEE, MMMM d yyyy')} ${detail.orderAt}`;
            this.orderType = this.util.appTranslate('instant_order');
            this.isInstantOrder = true;
          } else {
            this.orderDateTime = `${DateTime.fromISO(detail.scheduleDate).setLocale(this.util.appLocaleName()).toFormat('EEEE, MMMM d yyyy')} ${detail.orderAt}`;
            this.orderType = this.util.appTranslate('schedule_order');
            this.isInstantOrder = false;
          }

          this.nearDeliveryman = response.nearDriver;

          if (detail && detail.orderTo == 'homedelivery' && detail.deliveryAddressRaw && detail.deliveryAddressRaw.id) {
            this.deliveryAddress = `${detail.deliveryAddressRaw.flatHouse}, ${detail.deliveryAddressRaw.locality}, ${detail.deliveryAddressRaw.landmark}`;
          }

          if (detail && detail.userInfo && detail.userInfo.id) {
            const userInfo = detail.userInfo;
            this.userId = userInfo.id;
            this.userName = `${userInfo.firstName} ${userInfo.lastName}`;
            this.userCover = userInfo.image;
            this.userMobile = `+${userInfo.countryCode} ${userInfo.contactNumber}`;
            this.userEmail = userInfo.contactEmail;
            this.userRole = userInfo.role;
            this.customerContactUserID = detail.userInfo.id;
          }
          this.receiverName = detail.receiverName;
          this.receiverMobile = `+${detail.countryCode} ${detail.receiverContact}`;

          if (response && response.restaurantInfo) {
            this.restaurantName = response.restaurantInfo.name;

            if (response && response.restaurantInfo && response.restaurantInfo.translations && Array.isArray(response.restaurantInfo.translations)) {
              if (response.restaurantInfo.translations) {
                const translation = response.restaurantInfo.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.restaurantName = translation?.title || response.restaurantInfo.name;
              }
            }
          }

          if (detail && detail.driverInfo && detail.driverInfo.id) {
            const driverInfo = detail.driverInfo;
            this.driverId = driverInfo.id;
            this.driverName = `${driverInfo.firstName} ${driverInfo.lastName}`;
            this.driverCover = driverInfo.image;
            this.driverMobile = `+${driverInfo.countryCode} ${driverInfo.contactNumber}`;
            this.driverEmail = driverInfo.contactEmail;
            this.driverRole = driverInfo.role;
            this.deliverymanContactUserId = detail.driverInfo.id;
          }
          if (detail && detail.preparationTime) {
            this.preparationTime = detail.preparationTime;
          }

          if (detail && detail.paymentInfo && detail.paymentInfo.id) {
            this.paymentName = `${detail.paymentInfo.name} (${detail.paymentInfo.paymentWay})`
            this.paymentMode = detail.paymentInfo.paymentWay;

            if (detail && detail.paymentInfo && detail.paymentInfo.translations && Array.isArray(detail.paymentInfo.translations)) {
              if (detail.paymentInfo.translations) {
                const translation = detail.paymentInfo.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.paymentName = translation?.value || detail.paymentInfo.name;
              }
            }
          }

          this.orderStatus = detail.status;
          this.deliveryType = detail.orderTo;

          this.grandTotal = detail.grandTotal;
          this.realTotal = detail.realTotal;
          this.itemTotal = detail.itemTotal;
          this.itemDiscount = detail.itemDiscount;
          this.couponDiscountCharge = detail.couponDiscountCharge;
          this.deliveryCharge = detail.deliveryCharge;
          this.foodServiceCharge = detail.foodServiceCharge;
          this.serviceCharge = detail.serviceCharge;
          this.packageCharge = detail.packageCharge;
          this.packageChargeTax = detail.packageChargeTax;
          this.walletAmount = detail.walletAmount;
          this.deliveryTip = detail.deliveryTip;
          this.extraCharge = detail.extraCharge;

          const mappedList = detail.cartItem.map(
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

          this.cookingInstruction = detail.cookingInstruction;
          if (detail && detail.deliveryInstructionInfo && detail.deliveryInstructionInfo.name) {
            this.deliveryInstructionInfo = detail.deliveryInstructionInfo.name;

            if (detail && detail.deliveryInstructionInfo && detail.deliveryInstructionInfo.translations && Array.isArray(detail.deliveryInstructionInfo.translations)) {
              if (detail.deliveryInstructionInfo.translations) {
                const translation = detail.deliveryInstructionInfo.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.deliveryInstructionInfo = translation?.value || detail.deliveryInstructionInfo.name;
              }
            }
          }

          if (response && response.restaurantConfig && response.restaurantConfig.id) {
            const restaurantConfig = response.restaurantConfig;
            this.canInitiateCall = restaurantConfig.canInitiateCall;
            this.canInitiateChat = restaurantConfig.canInitiateChat;
            this.driverPickup = restaurantConfig.driverPickup;
          }

          if (response && response.orderSettings && response.orderSettings.id) {
            const orderSettings = response.orderSettings;
            this.deliveryVerification = orderSettings.deliveryVerification;
            this.driverCanCancelOrder = orderSettings.driverCanCancelOrder;
            this.orderConfirmationModel = orderSettings.orderConfirmationModel;
            this.restaurantCanCancelOrder = orderSettings.restaurantCanCancelOrder;
          }

          this.customerOrderPin = detail.customerOrderPin;
          this.driverOrderPin = detail.driverOrderPin;
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  rejectOrder() {
    console.log('reject order');
    const dialogRef = this.dialog.open(DialogRejectOrderReason, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'selected') {
        console.log(result.data);
        const param = {
          'id': this.id,
          'restaurant': this.util.getItem('_vendorId'),
          'reason': result.data
        };
        console.log(param);
        const spinnerRef = this.util.start('ts_rejecting');
        this.api.post_private('v1/vendor_web/orders/rejectOrder/', param).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            if (response && response.success) {
              this.util.onSuccess('ts_order_rejected');
              this.navCtrl.back();
            }
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'vendor');
          }
        })
      }
    });
  }

  acceptOrder() {
    console.log('accept order');
    console.log('Instant Order', this.isInstantOrder);
    console.log('Driver Pickup', this.driverPickup);
    console.log('Delivery Type', this.deliveryType);
    if (this.isInstantOrder == false) {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        data: { title: 'ts_confirm_schedule_orders', subTitle: "ts_schedule_order_accept_instruction", okTitle: 'ts_yes_accept', closeTitle: 'ts_cancel' },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
        if (result && result.action && result.action == "confirm") {
          console.log('confirmed');
          const param = {
            'id': this.id,
            'vendorId': this.util.getItem('_vendorId'),
            'user': this.userId,
          }
          console.log(param);
          const spinnerRef = this.util.start();
          this.api.post_private('v1/vendor_web/orders/acceptScheduleOrder/', param).subscribe({
            next: (response: any) => {
              console.log(response);
              this.util.stop(spinnerRef);
              if (response && response.success) {
                this.orderStatus = 'accepted';
              } else {
                this.util.onError('ts_something_went_wrong', '');
              }
            }, error: (error: any) => {
              console.log(error);
              this.util.stop(spinnerRef);
              this.util.handleError(error, 'vendor');
            }
          });
        }
      });
    } else if (this.isInstantOrder == true && this.driverPickup == true && this.deliveryType == 'homedelivery') {
      console.log('Open Deliveryman Dialog');
      const dialogRef = this.dialog.open(DialogSelectDeliveryman, {
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
        if (result && result.saved) {
          console.log('Deliveryman Selected');
          const param = {
            'id': this.id,
            'time': this.preparationTime,
            'vendorId': this.util.getItem('_vendorId'),
            'driverId': result.saved,
            'user': this.userId
          };
          console.log(param);
          const spinnerRef = this.util.start();
          this.api.post_private('v1/vendor_web/orders/prepareOrder/', param).subscribe({
            next: (response: any) => {
              console.log(response);
              this.util.stop(spinnerRef);
              if (response && response.success) {
                this.orderStatus = 'preparing';
              } else {
                this.util.onError('ts_something_went_wrong', '');
              }
            }, error: (error: any) => {
              console.log(error);
              this.util.stop(spinnerRef);
              this.util.handleError(error, 'vendor');
            }
          });
        }
      });
    } else {
      console.log('accept order');
      const param = {
        'id': this.id,
        'vendorId': this.util.getItem('_vendorId'),
        'user': this.userId,
      }
      console.log(param);
      const spinnerRef = this.util.start();
      this.api.post_private('v1/vendor_web/orders/acceptScheduleOrder/', param).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          if (response && response.success) {
            this.orderStatus = 'accepted';
          } else {
            this.util.onError('ts_something_went_wrong', '');
          }
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'vendor');
        }
      });
    }
  }

  acceptScheduleOrder() {
    console.log('Accept Schedule Order');
    console.log('driverPickup', this.driverPickup);
    console.log('orderType', this.deliveryType);
    if (this.driverPickup == true && this.deliveryType == 'homedelivery') {
      console.log('Open Deliveryman Dialog');
      const dialogRef = this.dialog.open(DialogSelectDeliveryman, {
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
        if (result && result.saved) {
          console.log('Deliveryman Selected');
          const param = {
            'id': this.id,
            'time': this.preparationTime,
            'vendorId': this.util.getItem('_vendorId'),
            'driverId': result.saved,
            'user': this.userId
          };
          console.log(param);
          const spinnerRef = this.util.start();
          this.api.post_private('v1/vendor_web/orders/prepareOrder/', param).subscribe({
            next: (response: any) => {
              console.log(response);
              this.util.stop(spinnerRef);
              if (response && response.success) {
                this.orderStatus = 'preparing';
              } else {
                this.util.onError('ts_something_went_wrong', '');
              }
            }, error: (error: any) => {
              console.log(error);
              this.util.stop(spinnerRef);
              this.util.handleError(error, 'vendor');
            }
          });
        }
      });
    } else {
      console.log('Accept the orders');
      const param = {
        'id': this.id,
        'time': this.preparationTime,
        'vendorId': this.util.getItem('_vendorId'),
        'driverId': '',
        'user': this.userId
      };
      const spinnerRef = this.util.start();
      this.api.post_private('v1/vendor_web/orders/prepareOrder/', param).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          if (response && response.success) {
            this.orderStatus = 'preparing';
          } else {
            this.util.onError('ts_something_went_wrong', '');
          }
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'vendor');
        }
      });
    }
  }

  changePrepareTime(action: string) {
    console.log(action);
    if (action == 'remove') {
      if (this.preparationTime >= 5) {
        this.preparationTime = this.preparationTime - 1;
      }
    } else {
      this.preparationTime = this.preparationTime + 1;
    }
  }

  orderReady() {
    console.log('Order Ready');
    const param = {
      'id': this.id,
      'vendorId': this.util.getItem('_vendorId'),
      'user': this.userId
    };
    console.log(param);
    const spinnerRef = this.util.start();
    this.api.post_private('v1/vendor_web/orders/orderReady/', param).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success) {
          this.orderStatus = 'ready';
        } else {
          this.util.onError('ts_something_went_wrong', '');
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  findDriver() {
    console.log('find Deliveryman');
    const dialogRef = this.dialog.open(DialogFindDeliveryman, {
      data: { id: this.id },
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
      if (result && result.saved) {
        console.log('Deliveryman Selected');
      }
    });
  }

  handoverToDeliveryman() {
    console.log('Handover to Deliveryman');
    console.log('deliveryVerification -->', this.deliveryVerification);
    console.log('paymentWay', this.paymentMode);
    console.log('deliveryType', this.deliveryType);
    if (this.deliveryVerification == true) {
      console.log('Open Verification Modal');
      const dialogRef = this.dialog.open(DialogVerifyOrderPin, {
        data: {
          'customerPin': this.customerOrderPin,
          'driverPin': this.driverOrderPin,
          'deliveryType': this.deliveryType,
          'paymentMode': this.paymentMode,
          'grandTotal': this.grandTotal,
        },
        disableClose: true
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
        if (result && result.success == true) {
          console.log('Submit-->>');
          const param = {
            'id': this.id,
            'vendorId': this.util.getItem('_vendorId'),
            'user': this.userId
          };
          const spinnerRef = this.util.start();
          this.api.post_private('v1/vendor_web/orders/handover_to_driver/', param).subscribe({
            next: (response: any) => {
              console.log(response);
              this.util.stop(spinnerRef);
              if (response && response.success) {
                this.orderStatus = 'handover';
              } else {
                this.util.onError('ts_something_went_wrong', '');
              }
            }, error: (error: any) => {
              console.log(error);
              this.util.stop(spinnerRef);
              this.util.handleError(error, 'vendor');
            }
          });
        }
      });
    } else {
      console.log('No Verification Handonver');
      const param = {
        'id': this.id,
        'vendorId': this.util.getItem('_vendorId'),
        'user': this.userId
      };
      const spinnerRef = this.util.start();
      this.api.post_private('v1/vendor_web/orders/handover_to_driver/', param).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          if (response && response.success) {
            this.orderStatus = 'handover';
          } else {
            this.util.onError('ts_something_went_wrong', '');
          }
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'vendor');
        }
      });
    }
  }

  handoverToCustomer() {
    console.log('Handover to Customer');
    console.log('deliveryVerification -->', this.deliveryVerification);
    console.log('paymentWay', this.paymentMode);
    console.log('deliveryType', this.deliveryType);
    if (this.deliveryVerification == true) {
      console.log('Open Verification Modal');
      const dialogRef = this.dialog.open(DialogVerifyOrderPin, {
        data: {
          'customerPin': this.customerOrderPin,
          'driverPin': this.driverOrderPin,
          'deliveryType': this.deliveryType,
          'paymentMode': this.paymentMode,
          'grandTotal': this.grandTotal,
        },
        disableClose: true
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
        if (result && result.success == true) {
          console.log('Submit-->>');
          const param = {
            'id': this.id,
            'vendorId': this.util.getItem('_vendorId'),
            'user': this.userId
          };
          const spinnerRef = this.util.start();
          this.api.post_private('v1/vendor_web/orders/handover_to_customer/', param).subscribe({
            next: (response: any) => {
              console.log(response);
              this.util.stop(spinnerRef);
              if (response && response.success) {
                this.orderStatus = 'handover';
              } else {
                this.util.onError('ts_something_went_wrong', '');
              }
            }, error: (error: any) => {
              console.log(error);
              this.util.stop(spinnerRef);
              this.util.handleError(error, 'vendor');
            }
          });
        }
      });
    } else if (this.paymentMode == 'offline' && this.deliveryType == 'selfpickup') {
      console.log('Alert Collect Cash--->>');
      const dialogRef = this.dialog.open(ConfirmDialog, {
        data: { title: `${this.util.appTranslate('ts_please_collect_cash')} -  ${this.util.priceFormat(this.grandTotal)}`, subTitle: 'ts_cod_payment_instruction', okTitle: 'ts_collect_cash', closeTitle: 'ts_cancel' },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
        if (result && result.action && result.action == "confirm") {
          console.log('confirmed');
          const param = {
            'id': this.id,
            'vendorId': this.util.getItem('_vendorId'),
            'user': this.userId
          };
          const spinnerRef = this.util.start();
          this.api.post_private('v1/vendor_web/orders/handover_to_customer/', param).subscribe({
            next: (response: any) => {
              console.log(response);
              this.util.stop(spinnerRef);
              if (response && response.success) {
                this.orderStatus = 'handover';
              } else {
                this.util.onError('ts_something_went_wrong', '');
              }
            }, error: (error: any) => {
              console.log(error);
              this.util.stop(spinnerRef);
              this.util.handleError(error, 'vendor');
            }
          });
        }
      });
    } else {
      console.log('No Verification Handonver');
      const param = {
        'id': this.id,
        'vendorId': this.util.getItem('_vendorId'),
        'user': this.userId
      };
      const spinnerRef = this.util.start();
      this.api.post_private('v1/vendor_web/orders/handover_to_customer/', param).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          if (response && response.success) {
            this.orderStatus = 'handover';
          } else {
            this.util.onError('ts_something_went_wrong', '');
          }
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'vendor');
        }
      });
    }
  }

  onPrintInvoice() {
    this.router.navigate(['vendor/order-management/order-invoice', this.id]);
  }

  onChatOrContact(from: string, kind: string,) {
    let id = '';
    if (from == 'user') {
      id = this.customerContactUserID;
    } else if (from == 'deliveryman') {
      id = this.deliverymanContactUserId;
    }
    if (id && id != '') {
      const spinnerRef = this.util.start('ts_fetching');
      this.api.get_private(`v1/vendor_web/user_contact_detail/${id}`).subscribe({
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
              this.dialog.open(DialogVendorChatMessages, {
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
          this.util.handleError(error, 'vendor');
        }
      });
    } else {
      this.util.onError('ts_something_went_wrong', '');
    }
  }

}
