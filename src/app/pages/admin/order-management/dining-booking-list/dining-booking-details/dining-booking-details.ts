import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CallNumberDialog } from 'src/app/ui-components/call-number-dialog/call-number-dialog';
import { DialogAdminChatMessage } from 'src/app/pages/admin/order-management/dialog-admin-chat-message/dialog-admin-chat-message';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-dining-booking-details',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './dining-booking-details.html',
})
export class DiningBookingDetails {

  id: string = '';
  bookingDate: string = '';
  bookingSlot: string = '';
  couponName: string = '';
  couponType: string = 'default';
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
  userId: string = '';
  userInfoName: string = '';
  userInfoEmail: string = '';
  userInfoContact: string = '';
  userInfoImage: string = '';
  userInfoRole: string = '';
  restaurantName: string = '';
  restaurantCover: string = '';
  restaurantAddress: string = '';
  restaurantId: string = '';
  restaurantEmail: string = '';
  restaurantContact: string = '';
  restaurantOwnerName: string = '';
  customerContactUserID: string = '';
  restaurantContactUserId: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private route: ActivatedRoute,
    private navCtrl: Location,
    private router: Router,
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
    this.api.get_private('v1/admin/dining_booking/bookingInformation/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.details && response.details.id) {
          const info = response.details;
          this.bookingDate = DateTime.fromISO(info.bookingDate).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
          this.bookingSlot = info.bookingSlot;
          if (info && info.coupon && info.coupon.id) {
            const coupon = info.coupon;
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
            this.userId = userInfo.id;
            this.userInfoContact = `+${userInfo.countryCode} ${userInfo.contactNumber}`;
            this.userInfoEmail = userInfo.contactEmail;
            this.userInfoImage = userInfo.image;
            this.userInfoName = `${userInfo.firstName} ${userInfo.lastName}`;
            this.userInfoRole = userInfo.role;
            this.customerContactUserID = userInfo.id;
          }

          if (info && info.restaurant && info.restaurant.id) {
            const restaurantInfo = info.restaurant;
            this.restaurantName = restaurantInfo.name;
            this.restaurantCover = restaurantInfo.cover;
            this.restaurantAddress = restaurantInfo.address;
            this.restaurantId = restaurantInfo.id;

            if (info && info.restaurant && info.restaurant.translations && Array.isArray(info.restaurant.translations)) {
              if (info.restaurant.translations) {
                const translation = info.restaurant.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.restaurantName = translation?.title || info.restaurant.name;
                this.restaurantAddress = translation?.address || info.restaurant.address;
              }
            }
          }

          if (response && response.restUserInfo && response.restUserInfo.id) {
            const restInfo = response.restUserInfo;
            this.restaurantEmail = restInfo.email;
            this.restaurantContact = `+${restInfo.countryCode}${restInfo.mobile}`;
            this.restaurantOwnerName = `${restInfo.firstName} ${restInfo.lastName}`;
            this.restaurantContactUserId = response.restUserInfo.id;
          }

        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onUserInfo() {
    if (this.userId && this.userId != '') {
      this.router.navigate(['admin/customer-management/customer-detail', this.userId]);
    }
  }

  onRestaurantDetail() {
    if (this.restaurantId && this.restaurantId != '') {
      this.router.navigate(['admin/restaurant-management/restaurant-detail', this.restaurantId]);
    }
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
      this.api.get_private(`v1/admin/user_contact_detail/${id}`).subscribe({
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
              this.dialog.open(DialogAdminChatMessage, {
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
          this.util.handleError(error, 'admin');
        }
      });
    } else {
      this.util.onError('ts_something_went_wrong', '');
    }
  }

}
