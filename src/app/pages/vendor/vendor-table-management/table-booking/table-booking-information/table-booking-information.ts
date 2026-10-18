import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogRejectTableBookingReason } from './dialog-reject-table-booking-reason/dialog-reject-table-booking-reason';
import { DialogVendorCompleteDiningBooking } from './dialog-vendor-complete-dining-booking/dialog-vendor-complete-dining-booking';
import { CallNumberDialog } from 'src/app/ui-components/call-number-dialog/call-number-dialog';
import { DialogVendorChatMessages } from 'src/app/pages/vendor/vendor-order-management/orders/dialog-vendor-chat-messages/dialog-vendor-chat-messages';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-table-booking-information',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './table-booking-information.html',
})
export class TableBookingInformation {

  id: string = '';
  bookingDate: string = '';
  bookingSlot: string = '';
  couponId: string = '';
  couponName: string = '';
  couponType: string = 'default';
  couponCode: string = '';
  couponMinDiscount: number = 0;
  couponMaxDiscount: number = 0;
  couponCoverCharge: number = 0;
  preBookingCharge: number = 0;
  grandTotal: number = 0;
  guest: number = 0;
  paymentName: string = 'No Pre Payment';
  specialRequest: string = '';
  status: string = 'created';
  userContact: string = '';
  userEmail: string = '';
  userName: string = '';
  userInfoName: string = '';
  userInfoEmail: string = '';
  userInfoContact: string = '';
  userInfoImage: string = '';
  userInfoRole: string = '';
  canInitiateChat: boolean = false;
  canInitiateCall: boolean = false;
  restaurantCanCancelRequest: boolean = false;
  customerContactUserID: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private route: ActivatedRoute,
    private navCtrl: Location,
    private dialog: MatDialog,
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id != null && this.id != '') {
      this.getBookingDetail();
    } else {
      this.util.onError('ts_something_went_wrong', '');
      this.navCtrl.back();
    }
  }

  getBookingDetail() {
    console.log('id', this.id);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/dining_booking/detail/' + this.id + '/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.details && response.details.id) {
          const info = response.details;
          this.bookingDate = DateTime.fromISO(info.bookingDate).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
          this.bookingSlot = info.bookingSlot;
          if (info && info.coupon && info.coupon.id) {
            const coupon = info.coupon;
            this.couponId = coupon.id;
            this.couponCode = coupon.code;
            this.couponName = coupon.name;
            this.couponType = coupon.discountType;
            this.couponMaxDiscount = coupon.maxDiscount;
            this.couponMinDiscount = coupon.minDiscount;

            if (info && info.coupon && info.coupon.translations && Array.isArray(info.coupon.translations)) {
              if (info.coupon.translations) {
                const translation = info.coupon.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.couponName = translation?.value || info.coupon.name;
              }
            }
          }

          this.couponCoverCharge = info.couponCoverCharge;
          this.grandTotal = info.grandTotal;
          this.preBookingCharge = info.preBookingCharge;
          if (info && info.paymentInfo && info.paymentInfo.id) {
            this.paymentName = info.paymentInfo.name;

            if (info && info.paymentInfo && info.paymentInfo.translations && Array.isArray(info.paymentInfo.translations)) {
              if (info.paymentInfo.translations) {
                const translation = info.paymentInfo.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.paymentName = translation?.value || info.paymentInfo.name;
              }
            }

          } else {
            this.paymentName = this.util.appTranslate('no_pre_payment');
          }

          if (info.specialRequest != null && info.specialRequest != '') {
            this.specialRequest = info.specialRequest;
          }
          this.status = info.status;
          this.guest = info.guest;

          this.userContact = `+${info.userCountryCode} ${info.userContact}`;
          this.userEmail = info.userEmail;
          this.userName = info.userName;

          if (info && info.userInfo && info.userInfo.id) {
            const userInfo = info.userInfo;
            this.userInfoContact = `+${userInfo.countryCode} ${userInfo.contactNumber}`;
            this.userInfoEmail = userInfo.contactEmail;
            this.userInfoImage = userInfo.image;
            this.userInfoName = `${userInfo.firstName} ${userInfo.lastName}`;
            this.userInfoRole = userInfo.role;
            this.customerContactUserID = info.userInfo.id;
          }

          if (response && response.restaurantConfig && response.restaurantConfig.id) {
            this.canInitiateCall = response.restaurantConfig.canInitiateCall;
            this.canInitiateChat = response.restaurantConfig.canInitiateChat;
          }

          if (response && response.diningSettings && response.diningSettings.id) {
            this.restaurantCanCancelRequest = response.diningSettings.restaurantCanCancelRequest;
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  rejectBooking() {
    console.log('Reject Booking');
    const dialogRef = this.dialog.open(DialogRejectTableBookingReason, {
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'selected') {
        console.log(result.data);
        const param = {
          'bookingId': this.id,
          'vendorId': this.util.getItem('_vendorId'),
          'reasonId': result.data
        };
        console.log(param);
        const spinnerRef = this.util.start('ts_rejecting');
        this.api.post_private('v1/vendor_web/dining_booking/reject/', param).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            if (response && response.success) {
              this.util.onSuccess('ts_booking_rejected');
              this.navCtrl.back();
            }
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'vendor');
          }
        });
      }
    });
  }

  acceptBooking() {
    console.log('Accept Booking');
    const param = {
      'bookingId': this.id,
      'vendorId': this.util.getItem('_vendorId'),
    };
    console.log(param);
    const spinnerRef = this.util.start('ts_accepting');
    this.api.post_private('v1/vendor_web/dining_booking/accept/', param).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success) {
          this.util.onSuccess('ts_booking_accepted');
          this.navCtrl.back();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  completeBooking() {
    console.log('Complete Booking');
    const dialogData = {
      bookingId: this.id,
      userName: this.userInfoName,
      bookingDate: this.bookingDate,
      contactNumber: this.userInfoContact,
      couponCoverCharge: this.couponCoverCharge,
      grandTotal: this.grandTotal,
      couponId: this.couponId,
      couponCode: this.couponCode,
      couponDiscountType: this.couponType,
      couponMinDiscount: this.couponMinDiscount,
      couponMaxDiscount: this.couponMaxDiscount,
    }
    console.log(dialogData)
    const dialogRef = this.dialog.open(DialogVendorCompleteDiningBooking, {
      data: dialogData,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'complete') {
        this.util.onSuccess('ts_booking_completed');
        this.navCtrl.back();
      }
    });
  }

  onChatOrContact(from: string, kind: string,) {
    let id = '';
    if (from == 'user') {
      id = this.customerContactUserID;
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
