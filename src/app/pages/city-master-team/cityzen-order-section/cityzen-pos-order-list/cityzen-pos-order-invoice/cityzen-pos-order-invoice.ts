import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';
import { InvoiceCartItemInterface } from 'src/app/interfaces/invoice.cart.item.interface';
import { OrderCartListInterface } from 'src/app/interfaces/order.cart.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-cityzen-pos-order-invoice',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './cityzen-pos-order-invoice.html',
})
export class CityzenPosOrderInvoice {

  id: string = '';
  isLoaded: boolean = false;
  appName: string = '';
  restaurantName: string = '';
  restaurantAddress: string = '';
  cartItems: OrderCartListInterface[] = [];
  invoiceCartItem: InvoiceCartItemInterface[] = [];
  orderNo: number = 0;
  orderDateTime: string = '';
  receiverName: string = '';
  receiverContact: string = '';
  grandTotal: string = '';
  priceList: InvoiceCartItemInterface[] = [];
  paymentName: string = '';
  contentWidth: string = '58mm';
  currentYear: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private location: Location,
    private sanitizer: DomSanitizer,
  ) {

    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id != '') {
      this.currentYear = DateTime.now().setLocale(this.util.appLocaleName()).toFormat('yyyy');
      this.getInfo();
    } else {
      this.util.onError('ts_something_went_wrong', '');
      this.onBack();
    }

  }

  getInfo() {
    this.isLoaded = false;
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/cityzen_pos_order_invoice/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        if (response && response.success == true) {
          const details = response.details;
          const business = response.businessSettings;
          if (business && business.id && business.id != '') {
            this.appName = business.companyName;
          }
          if (details && details.restaurant && details.restaurant.id && details.restaurant.id != '') {
            this.restaurantName = details.restaurant.name;
            this.restaurantAddress = details.restaurant.address;

            if (details && details.restaurant && details.restaurant.translations && Array.isArray(details.restaurant.translations)) {
              if (details.restaurant.translations) {
                const translation = details.restaurant.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.restaurantName = translation?.title || details.restaurant.name;
                this.restaurantAddress = translation?.address || details.restaurant.address;
              }
            }
          }
          this.orderNo = details.orderNo;
          this.orderDateTime = DateTime.fromISO(details.createdAt).setLocale(this.util.appLocaleName()).toFormat('yyyy-MM-dd hh:mm a');

          this.paymentName = details.paymentMode == 'offline' ? this.util.appTranslate('cash') : this.util.appTranslate('online');

          this.receiverName = details.customerType == 'guest' ? this.util.appTranslate('dd_guest_customer') : details.customerName;
          this.receiverContact = details.customerType == 'guest' ? '+X XXXXXXXXXX' : `+${details.customerCountryCode} ${details.customerMobileNumber}`;

          this.priceList = [];
          if (details && details.realTotal && details.realTotal > 0) {
            const obj = {
              "name": this.util.appTranslate('th_item_total'),
              "option": [''],
              "price": this.util.priceFormat(details.realTotal),
            };
            this.priceList.push(obj);
          }
          if (details && details.itemDiscount && details.itemDiscount > 0) {
            const obj = {
              "name": this.util.appTranslate('th_item_discount'),
              "option": [''],
              "price": ` - ${this.util.priceFormat(details.itemDiscount)}`,
            };
            this.priceList.push(obj);
          }
          if (details && details.itemTotal && details.itemTotal > 0) {
            const obj = {
              "name": this.util.appTranslate('th_sub_total'),
              "option": [''],
              "price": this.util.priceFormat(details.itemTotal),
            };
            this.priceList.push(obj);
          }
          if (details && details.foodServiceCharge && details.foodServiceCharge > 0) {
            const taxName = business && business.foodTaxName && business.foodTaxName !== '' ? business.foodTaxName : this.util.appTranslate('food_tax');
            const obj = {
              "name": taxName,
              "option": [''],
              "price": ` + ${this.util.priceFormat(details.foodServiceCharge)}`,
            };
            this.priceList.push(obj);
          }
          if (details && details.serviceCharge && details.serviceCharge > 0) {
            const taxName = business && business.additionalServiceName && business.additionalServiceName !== '' ? business.additionalServiceName : this.util.appTranslate('platform_fee');
            const obj = {
              "name": taxName,
              "option": [''],
              "price": ` + ${this.util.priceFormat(details.serviceCharge)}`,
            };
            this.priceList.push(obj);
          }
          if (details && details.packageCharge && details.packageCharge > 0) {
            const obj = {
              "name": this.util.appTranslate('th_package_charge'),
              "option": [''],
              "price": ` + ${this.util.priceFormat(details.packageCharge)}`,
            };
            this.priceList.push(obj);
          }
          if (details && details.packageChargeTax && details.packageChargeTax > 0) {
            const obj = {
              "name": this.util.appTranslate('th_package_charge_tax'),
              "option": [''],
              "price": ` + ${this.util.priceFormat(details.packageChargeTax)}`,
            };
            this.priceList.push(obj);
          }
          if (details && details.discountCharge && details.discountCharge > 0) {
            const obj = {
              "name": this.util.appTranslate('th_discount'),
              "option": [''],
              "price": ` - ${this.util.priceFormat(details.discountCharge)}`,
            };
            this.priceList.push(obj);
          }
          if (details && details.waiterTip && details.waiterTip > 0) {
            const obj = {
              "name": this.util.appTranslate('th_waiter_tip'),
              "option": [''],
              "price": ` + ${this.util.priceFormat(details.waiterTip)}`,
            };
            this.priceList.push(obj);
          }
          if (details && details.extraCharge && details.extraCharge > 0) {
            const obj = {
              "name": this.util.appTranslate('th_extra_charge'),
              "option": [''],
              "price": ` + ${this.util.priceFormat(details.extraCharge)}`,
            };
            this.priceList.push(obj);
          }

          this.grandTotal = this.util.priceFormat(details.grandTotal);

          this.invoiceCartItem = [];
          const mappedList = details.cartItem.map(
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
              const obj = {
                "name": `${item.quantity} X ${this.util.trimText(item.displayName, 25)}`,
                "option": optionNameList,
                "price": this.util.priceFormat(item.totalPrice),
              };
              this.invoiceCartItem.push(obj);
              return item;
            }
          );
          this.cartItems = mappedList;
        } else {
          this.util.onError('ts_something_went_wrong', '');
          this.onBack();
        }
      },
      error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      },
    });
  }

  onBack() {
    this.location.back();
  }

  onPrint() {
    console.log('Print');
    const itemList: string[] = [];
    this.invoiceCartItem.forEach((element) => {
      const optionList: string[] = [];
      element.option.forEach((option) => {
        optionList.push(`<p class="small-text">${option}</p>`);
      });
      const optionListString = optionList.join();
      const cleanOptionListString = optionListString.replace(/,\s*/g, '');
      const obj = `<tr><td><span class="item-name">${element.name}</span> ${cleanOptionListString} </td><td class="right">${element.price}</td></tr>`;
      itemList.push(obj);
    });
    const itemListString = itemList.join();
    const cleanItemListString = itemListString.replace(/,\s*/g, '');

    const priceList: string[] = [];
    this.priceList.forEach((element) => {
      const obj = `<tr><td>${element.name}</td><td class="right">${element.price}</td></tr>`;
      priceList.push(obj);
    });
    const priceListString = priceList.join();
    const cleanPriceListString = priceListString.replace(/,\s*/g, '');

    const printPaddingWidth = this.contentWidth == '58mm' ? '46mm' : '70mm';

    const hardcodedHTML = `
      <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Food Delivery Invoice</title>
          <style>
            * {
              font-family: monospace;
              font-size: 12px;
            }
            @media print {
              @page {
                margin: 0;
              }

              body {
                margin: 0;
              }
            }
            body {
              width: ${printPaddingWidth};
              margin: 0;
              padding: 5px;
            }

            .logo-container {
              margin: 10px 0px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }

            .logo-img {
              height: 50px;
              width: 50px;
            }

            .small-text-center{
              font-size: 10px;
              text-align: center;
              margin: 0px;
              word-break: break-word;
            }

            .lbl {
              margin: 0px;
              word-break: break-word;
            }

            .lbl-center {
              margin: 0px;
              text-align: center;
              word-break: break-word;
            }

            .lbl-bold {
              margin: 0px;
              font-weight: bold;
              word-break: break-word;
            }

            .item-name {
              font-size: 10px;
              margin: 0px;
              font-weight: 700;
              word-break: break-word;
            }

            .small-text {
              font-size: 8px;
              margin: 0px;
              word-break: break-word;
            }


            h2, h3 {
              text-align: center;
              margin: 5px 0;
              word-break: break-word;
            }
            .line {
              border-top: 1px dashed #000;
              margin: 5px 0;
              width: 100%;
            }
            .details, .totals {
              width: 100%;
            }
            .details td, .totals td {
              padding: 5px 0;
              vertical-align: top;
            }
            .right {
              text-align: right;
            }
            .bold {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="logo-container">
            <img src="assets/images/invoice-logo.png" alt="LOGO" class="logo-img">
          </div>
          <h2 style="width:${printPaddingWidth}">${this.appName}</h2>
          <h3 style="width:${printPaddingWidth}">${this.restaurantName}</h3>
          <p class="small-text-center" style="width:${printPaddingWidth}"">${this.restaurantAddress}</p>
          <div class="line"></div>

          <p class="lbl" style="width:${printPaddingWidth}">${this.util.appTranslate('order_no')}: #${this.orderNo}</p>
          <p class="lbl" style="width:${printPaddingWidth}">${this.util.appTranslate('th_date')}: ${this.orderDateTime}</p>
          <p class="lbl" style="width:${printPaddingWidth}">${this.util.appTranslate('th_customer')}: ${this.receiverName}</p>
          <p class="lbl" style="width:${printPaddingWidth}">${this.util.appTranslate('phone')}: ${this.receiverContact}</p>

          <div class="line"></div>

          <table class="details">
            <tr class="bold">
              <td>${this.util.appTranslate('items')}</td>
              <td class="right">${this.util.appTranslate('th_price')}</td>
            </tr>
           ${cleanItemListString}
          </table>

          <div class="line"></div>

          <table class="totals">
            ${cleanPriceListString}
            <tr>
              <td class="bold">${this.util.appTranslate('total')}</td>
              <td class="right bold">${this.grandTotal}</td>
            </tr>
          </table>

          <div class="line"></div>

          <p class="lbl-bold" style="width:${printPaddingWidth}">${this.util.appTranslate('paid_by')}: ${this.paymentName}</p>

          <div class="line"></div>

          <h2 style="width:${printPaddingWidth};text-transform:uppercase">${this.util.appTranslate('thank_you')}</h2>
          <p class="lbl-center" style="width:${printPaddingWidth}">${this.util.appTranslate('visit_again')}</p>

          <div class="line"></div>

          <p class="lbl-center" style="width:${printPaddingWidth}"><span>&#169;</span> ${this.currentYear} ${this.appName}, ${this.util.appTranslate('all_right_reserved')}</p>

        </body>
        </html>
  `;
    const htmlContent = hardcodedHTML;
    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(htmlContent, 'text/html');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.head.innerHTML = parsedDocument.head.innerHTML;
      printWindow.document.body.innerHTML = parsedDocument.body.innerHTML;
      printWindow.document.title = parsedDocument.title;
      printWindow.document.close();
      const firePrint = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
      if (printWindow.document.readyState === 'complete') {
        firePrint();
      } else {
        printWindow.addEventListener('load', firePrint);
      }
    } else {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.left = '-99999px';
      iframe.srcdoc = this.sanitizer.bypassSecurityTrustHtml(htmlContent) as string;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        document.body.removeChild(iframe);
      };
    }
  }

}
