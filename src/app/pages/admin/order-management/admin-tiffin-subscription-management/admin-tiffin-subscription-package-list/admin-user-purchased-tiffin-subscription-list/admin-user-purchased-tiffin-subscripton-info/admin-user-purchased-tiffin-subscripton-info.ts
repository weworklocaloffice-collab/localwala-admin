import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { OrderCartListInterface } from 'src/app/interfaces/order.cart.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CallNumberDialog } from 'src/app/ui-components/call-number-dialog/call-number-dialog';
import { DialogAdminChatMessage } from 'src/app/pages/admin/order-management/dialog-admin-chat-message/dialog-admin-chat-message';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-admin-user-purchased-tiffin-subscripton-info',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './admin-user-purchased-tiffin-subscripton-info.html',
})
export class AdminUserPurchasedTiffinSubscriptonInfo {

  cartItem = new MatTableDataSource<OrderCartListInterface>([]);
  displayedColumn = ['id', 'detail', 'qty', 'price'];
  id: string = '';
  paymentName: string = '';
  paymentSlug: string = '';
  paymentMode: string = '';
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
  purchaseStatus: string = 'created';
  cookingInstruction: string = '';
  receiverContact: string = '';
  receiverName: string = '';
  deliveryAddress: string = '';
  deliveryInstructionInfo: string = '';
  extraCharge: number = 0;
  foodServiceCharge: number = 0;
  grandTotal: number = 0;
  itemTotal: number = 0;
  orderAt: string = '';
  orderTo: string = '';
  packageCharge: number = 0;
  packageChargeTax: number = 0;
  serviceCharge: number = 0;
  startDate: string = '';
  offDays: string = '';
  totalDelivery: number = 0;
  totalOrders: number = 0;
  packageId: string = '';
  packageImage: string = '';
  packageName: string = '';
  packageShortDescription: string = '';
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
    this.api.get_private('v1/admin/tiffin_packages/getTiffinSubscriptionPurchaseDetail/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true) {
          console.log('Get The Results');

          if (response && response.success == true && response.details) {
            const purchaseInfo = response.details;
            console.log(purchaseInfo.id);
            this.purchaseStatus = purchaseInfo.status;

            if (purchaseInfo && purchaseInfo.paymentInfo && purchaseInfo.paymentInfo.name) {
              this.paymentName = purchaseInfo.paymentInfo.name;
              this.paymentSlug = purchaseInfo.paymentInfo.slug;
              this.paymentMode = purchaseInfo.paymentInfo.paymentWay;

              if (purchaseInfo && purchaseInfo.paymentInfo && purchaseInfo.paymentInfo.translations && Array.isArray(purchaseInfo.paymentInfo.translations)) {
                if (purchaseInfo.paymentInfo.translations) {
                  const translation = purchaseInfo.paymentInfo.translations.find((t: any) => t.code == this.util.appLocaleName());
                  this.paymentName = translation?.value || purchaseInfo.paymentInfo.name;
                }
              }
            }

            if (purchaseInfo && purchaseInfo.restaurant && purchaseInfo.restaurant.id) {
              this.restaurantId = purchaseInfo.restaurant.id;
              this.restaurantName = purchaseInfo.restaurant.name;
              this.restaurantAddress = purchaseInfo.restaurant.address;
              this.restaurantCover = purchaseInfo.restaurant.cover;
              this.restaurantLogo = purchaseInfo.restaurant.logo;
              this.restaurantSlug = purchaseInfo.restaurant.slug;

              if (purchaseInfo && purchaseInfo.restaurant && purchaseInfo.restaurant.translations && Array.isArray(purchaseInfo.restaurant.translations)) {
                if (purchaseInfo.restaurant.translations) {
                  const translation = purchaseInfo.restaurant.translations.find((t: any) => t.code == this.util.appLocaleName());
                  this.restaurantName = translation?.title || purchaseInfo.restaurant.name;
                  this.restaurantAddress = translation?.address || purchaseInfo.restaurant.address;
                }
              }
            }

            if (purchaseInfo && purchaseInfo.userInfo && purchaseInfo.userInfo.id) {
              this.userId = purchaseInfo.userInfo.id;
              this.userName = `${purchaseInfo.userInfo.firstName} ${purchaseInfo.userInfo.lastName}`;
              this.userContanct = `+${purchaseInfo.userInfo.countryCode}${purchaseInfo.userInfo.contactNumber}`;
              this.userRole = purchaseInfo.userInfo.role;
              this.userCover = purchaseInfo.userInfo.image;
              this.userEmail = purchaseInfo.userInfo.contactEmail;
              this.customerContactUserID = purchaseInfo.userInfo.id;
            }

            if (purchaseInfo && purchaseInfo.package && purchaseInfo.package.id) {
              this.packageId = purchaseInfo.package.id;
              this.packageName = purchaseInfo.package.name;
              this.packageImage = purchaseInfo.package.image;
              this.packageShortDescription = purchaseInfo.package.shortDescription;

              if (purchaseInfo && purchaseInfo.package && purchaseInfo.package.translations && Array.isArray(purchaseInfo.package.translations)) {
                if (purchaseInfo.package.translations) {
                  const translation = purchaseInfo.package.translations.find((t: any) => t.code == this.util.appLocaleName());
                  this.packageName = translation?.title || purchaseInfo.package.name;
                  this.packageShortDescription = translation?.shortDescription || purchaseInfo.package.shortDescription;
                }
              }
            }

            this.cookingInstruction = purchaseInfo.cookingInstruction;
            this.receiverContact = `+${purchaseInfo.countryCode}${purchaseInfo.receiverContact}`;
            this.receiverName = purchaseInfo.receiverName;

            if (purchaseInfo && purchaseInfo.orderTo == 'homedelivery' && purchaseInfo.deliveryAddress && purchaseInfo.deliveryAddress.id) {
              this.deliveryAddress = `${purchaseInfo.deliveryAddress.flatHouse}, ${purchaseInfo.deliveryAddress.locality}, ${purchaseInfo.deliveryAddress.landmark}`;
            }

            if (purchaseInfo && purchaseInfo.deliveryInstructionInfo && purchaseInfo.deliveryInstructionInfo.id) {
              this.deliveryInstructionInfo = purchaseInfo.deliveryInstructionInfo.name;

              if (purchaseInfo && purchaseInfo.deliveryInstructionInfo && purchaseInfo.deliveryInstructionInfo.translations && Array.isArray(purchaseInfo.deliveryInstructionInfo.translations)) {
                if (purchaseInfo.deliveryInstructionInfo.translations) {
                  const translation = purchaseInfo.deliveryInstructionInfo.translations.find((t: any) => t.code == this.util.appLocaleName());
                  this.deliveryInstructionInfo = translation?.value || purchaseInfo.deliveryInstructionInfo.name;
                }
              }
            }

            this.startDate = DateTime.fromISO(purchaseInfo.startDate).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
            if (purchaseInfo && purchaseInfo.offDays && Array.isArray(purchaseInfo.offDays)) {
              const dayArray = purchaseInfo.offDays.map((element: string) => {
                element = this.util.appTranslate(element);
                return element;
              });
              this.offDays = dayArray.join(' • ')
            }
            this.totalDelivery = purchaseInfo.ordersDates.length;
            this.totalOrders = purchaseInfo.totalOrder;

            this.extraCharge = purchaseInfo.extraCharge;
            this.foodServiceCharge = purchaseInfo.foodServiceCharge;
            this.grandTotal = purchaseInfo.grandTotal;
            this.itemTotal = purchaseInfo.itemTotal;
            this.orderAt = purchaseInfo.orderAt;
            this.orderTo = purchaseInfo.orderTo;
            this.packageCharge = purchaseInfo.packageCharge;
            this.packageChargeTax = purchaseInfo.packageChargeTax;
            this.serviceCharge = purchaseInfo.serviceCharge;

            if (purchaseInfo && purchaseInfo.cartItem && purchaseInfo.cartItem.length > 0) {
              const mappedList = purchaseInfo.cartItem.map(
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
          if (response && response.restUserInfo && response.restUserInfo.id) {
            const restInfo = response.restUserInfo;
            this.restaurantEmail = restInfo.email;
            this.restaurantContact = `+${restInfo.countryCode}${restInfo.mobile}`;
            this.restaurantOwnerName = `${restInfo.firstName} ${restInfo.lastName}`;
            this.restaurantContactUserId = response.restUserInfo.id;
          }

        } else {
          this.util.onError('ts_something_went_wrong', '');
          this.onBack();
        }
      },
      error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      },
    });
  }

  onBack() {
    this.location.back();
  }

  printInvoice() {
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

  onFoodDetail(id: string) {
    this.router.navigate(['admin/foods/food-detail', id]);
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
