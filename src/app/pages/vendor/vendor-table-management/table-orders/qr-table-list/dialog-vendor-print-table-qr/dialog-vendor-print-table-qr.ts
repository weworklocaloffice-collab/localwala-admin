import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { QRCodeComponent } from 'angularx-qrcode';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-vendor-print-table-qr',
  imports: [FormsModule, ReactiveFormsModule, MaterialModule, CommonModule, QRCodeComponent],
  templateUrl: './dialog-vendor-print-table-qr.html',
})
export class DialogVendorPrintTableQr {

  restaurantName: string = '';
  restaurantLogo: string = '';
  tableId: string = '';
  tableNo: number = 0;
  isLoaded: boolean = false;
  contentWidth: string = '80mm';
  deepLink: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogVendorPrintTableQr>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.values && this.data.values.id && this.data.values.id != '') {
      this.tableId = this.data.values.id;
      this.tableNo = this.data.values.tableNumber;
      this.getDetail();
    }
  }

  getDetail() {
    const spinnerRef = this.util.start();
    this.isLoaded = false;
    this.api.get_private('v1/vendor_web/restaurant_table/qr_table_detail/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        if (response && response.success && response.detail) {
          const detail = response.detail;
          this.restaurantName = detail.name;
          this.restaurantLogo = detail.logo;

          if (response && response.detail && response.detail.translations && Array.isArray(response.detail.translations)) {
            if (response.detail.translations) {
              const translation = response.detail.translations.find((t: any) => t.code == this.util.appLocaleName());
              this.restaurantName = translation?.title || response.detail.name;
            }
          }
          console.log(this.restaurantName);
          console.log(this.restaurantLogo);
          console.log(this.tableNo);
          const business = response.business;
          this.deepLink = business.websiteUrl + 'table-order/' + this.util.getItem('_vendorId') + '/' + this.tableId;
          console.log(this.deepLink);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onPrint() {
    const canvas = document.querySelector('#qr-code canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }
    const svgBase64 = canvas.toDataURL('image/png');
    const printPaddingWidth = this.contentWidth == '58mm' ? '46mm' : '70mm';
    const safeRestaurantName = this.escapeHtml(this.restaurantName);
    const safeTableLabel = this.escapeHtml(`${this.util.appTranslate('table_no')}: ${this.tableNo}`);
    const safeScanLabel = this.escapeHtml(this.util.appTranslate('scan_qr_code_lbl'));
    const logoUrl = this.buildLogoUrl(this.restaurantLogo);
    const hardcodedHTML = `
      <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Print QR</title>
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
            <img src="${logoUrl}" alt="LOGO" class="logo-img">
          </div>
          <h3 style="width:${printPaddingWidth};">${safeRestaurantName}</h3>
          <h2 style="width:${printPaddingWidth};text-transform:uppercase">${safeTableLabel}</h2>

          <img src="${svgBase64}" alt="QR Code" style="width:256px;height:256px;" />

          <div class="line"></div>

          <p class="lbl-center" style="width:${printPaddingWidth}">${safeScanLabel}</p>

        </body>
        </html>
          `;
    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(hardcodedHTML, 'text/html');
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
      const startPrint = () => {
        this.waitForImages(printWindow.document, firePrint);
      };
      if (printWindow.document.readyState === 'complete') {
        startPrint();
      } else {
        printWindow.addEventListener('load', startPrint);
      }
    } else {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.left = '-99999px';
      iframe.srcdoc = hardcodedHTML;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        const startPrint = () => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          document.body.removeChild(iframe);
        };
        if (iframe.contentDocument) {
          this.waitForImages(iframe.contentDocument, startPrint);
        } else {
          startPrint();
        }
      };
    }
  }

  private waitForImages(doc: Document, callback: () => void) {
    const images = Array.from(doc.images);
    if (images.length === 0) {
      callback();
      return;
    }
    let loaded = 0;
    const done = () => {
      loaded += 1;
      if (loaded === images.length) {
        callback();
      }
    };
    images.forEach((img) => {
      if (img.complete && img.naturalWidth !== 0) {
        done();
      } else {
        img.addEventListener('load', done);
        img.addEventListener('error', done);
      }
    });
  }

  private escapeHtml(value: unknown): string {
    if (value == null) {
      return '';
    }
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private buildLogoUrl(path: string): string {
    if (!path) {
      return '';
    }
    return `${this.api.mediaUrl}/${this.encodePath(path)}`;
  }

  private encodePath(path: string): string {
    return path.split('/').map(segment => encodeURIComponent(segment)).join('/');
  }

}
