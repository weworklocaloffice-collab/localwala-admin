import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogCityzenGiveDiningBookingRefundRequest } from './dialog-cityzen-give-dining-booking-refund-request/dialog-cityzen-give-dining-booking-refund-request';
import { DialogCityzenCancelDiningBookingRefundRequest } from './dialog-cityzen-cancel-dining-booking-refund-request/dialog-cityzen-cancel-dining-booking-refund-request';
import { CallNumberDialog } from 'src/app/ui-components/call-number-dialog/call-number-dialog';
import { DialogCityzenChatMessage } from 'src/app/pages/city-master-team/cityzen-order-section/dialog-cityzen-chat-message/dialog-cityzen-chat-message';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-dining-booking-refund-request-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './cityzen-dining-booking-refund-request-detail.html',
})
export class CityzenDiningBookingRefundRequestDetail {

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
  userId: string = '';
  userName: string = '';
  userRole: string = '';
  userCover: string = '';
  userContanct: string = '';
  userEmail: string = '';
  bookingId: string = '';
  bookingStatus: string = 'created';
  bookingDate: string = '';
  bookingSlot: string = '';
  couponCoverCharge: number = 0;
  grandTotal: number = 0;
  guest: number = 0;
  preBookingCharge: number = 0;
  specialRequest: string = '';
  status: string = 'created';
  userRegisterContact: string = '';
  userRegisterCountryCode: string = '';
  userRegisterEmail: string = '';
  userRegisterName: string = '';
  couponId: string = '';
  couponDiscountType: string = '';
  couponMaxDiscount: number = 0;
  couponMinDiscount: number = 0;
  couponName: string = '';
  couponPreBookingChargeAmount: number = 0;
  couponPreBookingChargeRequired: boolean = false;
  customerContactUserID: string = '';
  restaurantContactUserId: string = '';

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
    this.api.get_private('v1/cityzen/dining_booking_refund_request/info/' + this.id).subscribe({
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

          if (response && response.restUserInfo && response.restUserInfo.id) {
            const restInfo = response.restUserInfo;
            this.restaurantEmail = restInfo.email;
            this.restaurantContact = `+${restInfo.countryCode}${restInfo.mobile}`;
            this.restaurantOwnerName = `${restInfo.firstName} ${restInfo.lastName}`;
            this.restaurantContactUserId = response.restUserInfo.id;
          }

          if (response && response.diningInfo && response.diningInfo.id) {
            const info = response.diningInfo;
            this.bookingId = info.id;
            this.bookingStatus = info.status;
            this.bookingDate = DateTime.fromISO(info.bookingDate).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
            this.bookingSlot = info.bookingSlot;
            this.couponCoverCharge = info.couponCoverCharge;
            this.grandTotal = info.grandTotal;
            this.guest = info.guest;
            this.preBookingCharge = info.preBookingCharge;
            this.specialRequest = info && info.specialRequest != null && info.specialRequest != '' ? info.specialRequest : '';
            this.userRegisterContact = info.userContact;
            this.userRegisterCountryCode = info.userCountryCode;
            this.userRegisterEmail = info.userEmail;
            this.userRegisterName = info.userName;
            this.status = info.status;
            if (info && info.diningcoupons && info.diningcoupons.id) {
              const coupon = info.diningcoupons;
              this.couponId = coupon.id;
              this.couponDiscountType = coupon.discountType;
              this.couponMaxDiscount = coupon.maxDiscount;
              this.couponMinDiscount = coupon.minDiscount;
              this.couponName = coupon.name;
              this.couponPreBookingChargeAmount = coupon.preBookingChargeAmount;
              this.couponPreBookingChargeRequired = coupon.preBookingChargeRequired;

              if (info && info.diningcoupons && info.diningcoupons.translations && Array.isArray(info.diningcoupons.translations)) {
                if (info.diningcoupons.translations) {
                  const translation = info.diningcoupons.translations.find((t: any) => t.code == this.util.appLocaleName());
                  this.couponName = translation?.value || info.diningcoupons.name;
                }
              }
            }
          }

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

  onUserInfo() {
    this.router.navigate(['cityzen-team/u/customer-detail', this.userId]);
  }

  onRestaurantDetail() {
    this.router.navigate(['cityzen-team/u/restaurant-detail', this.restaurantId]);
  }

  onBack() {
    this.location.back();
  }

  onCancelRefundRequest() {
    const dialogRef = this.dialog.open(DialogCityzenCancelDiningBookingRefundRequest, {
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
    const dialogRef = this.dialog.open(DialogCityzenGiveDiningBookingRefundRequest, {
      data: { requestId: this.id, bookingId: this.bookingId, payment: this.paymentSlug, paymentMode: this.paymentMode, grandTotal: this.grandTotal },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'true') {
        this.onBack();
      }
    });
  }

  onChatOrContact(from: string, kind: string,) {
    let id = '';
    if (from == 'user') {
      id = this.customerContactUserID;
    } else if (from == 'restaurant') {
      id = this.restaurantContactUserId;
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
