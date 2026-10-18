import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { VendorExpenseReportInterface } from 'src/app/interfaces/vendor.expense.report.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ApexAxisChartSeries, ApexChart, ChartComponent, ApexDataLabels, ApexYAxis, ApexLegend, ApexXAxis, ApexTooltip, ApexTheme, ApexGrid, ApexPlotOptions, ApexFill } from 'ng-apexcharts';
import { DialogAddVendorExpense } from './dialog-add-vendor-expense/dialog-add-vendor-expense';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgIcon } from '@ng-icons/core';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: any;
  theme: ApexTheme;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  colors: string[];
  markers: any;
  grid: ApexGrid;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  labels: string[];
};

@Component({
  selector: 'app-vendor-expense-reports',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgApexchartsModule, NgIcon],
  templateUrl: './vendor-expense-reports.html',
})
export class VendorExpenseReports {

  @ViewChild('expenseChart') expenseChart: ChartComponent = Object.create(null);
  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  reports = new MatTableDataSource<VendorExpenseReportInterface>([]);
  displayedColumn = ['id', 'customer', 'type', 'order', 'pos', 'table', 'booking', 'coupon', 'dining_coupon', 'amount', 'date'];
  pageSize: number = 5;
  currentPage: number = 0;
  isInitialLoaded: boolean = false;
  isLoaded: boolean = false;
  exportType: string = 'export';
  expenseType: string = 'all';
  public expenseChartOptions: Partial<ChartOptions> | any;
  totalExpenseDataCount: number = 0;
  totalExpenseDataAmount: number = 0;
  orderProductDiscountExpenseDataCount: number = 0;
  orderProductDiscountExpenseDataAmount: number = 0;
  posOrderProductDiscountExpenseDataCount: number = 0;
  posOrderProductDiscountExpenseDataAmount: number = 0;
  tableOrderProductDiscountExpenseDataCount: number = 0;
  tableOrderProductDiscountExpenseDataAmount: number = 0;
  posOrderExtraDiscountExpenseDataCount: number = 0;
  posOrderExtraDiscountExpenseDataAmount: number = 0;
  tableOrderExtraDiscountExpenseDataCount: number = 0;
  tableOrderExtraDiscountExpenseDataAmount: number = 0;
  couponExpenseDataCount: number = 0;
  couponExpenseDataAmount: number = 0;
  diningCouponExpenseDataCount: number = 0;
  diningCouponExpenseDataAmount: number = 0;
  diningBookingDiscountExpenseDataCount: number = 0;
  diningBookingDiscountExpenseDataAmount: number = 0;
  refundOrderExpenseDataCount: number = 0;
  refundOrderExpenseDataAmount: number = 0;
  otherExpenseDataCount: number = 0;
  otherExpenseDataAmount: number = 0;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.getInitial();
  }

  getInitial() {
    this.isLoaded = false;
    this.isInitialLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'type': this.expenseType,
      'restaurant': this.util.getItem('_vendorId'),
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/vendor_web/reports/expenseInitial?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        this.isInitialLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: VendorExpenseReportInterface) => {
              if (item && item.couponInfo && item.couponInfo?.id) {
                if (item.couponInfo?.translations) {
                  const translation = item.couponInfo.translations.find((t) => t.code == this.util.appLocaleName());
                  item.couponInfo.displayName = translation?.value || item.couponInfo.name;
                } else {
                  item.couponInfo.displayName = item.couponInfo?.name || '';
                }
              }

              if (item && item.diningCouponInfo && item.diningCouponInfo?.id) {
                if (item.diningCouponInfo?.translations) {
                  const translation = item.diningCouponInfo.translations.find((t) => t.code == this.util.appLocaleName());
                  item.diningCouponInfo.displayName = translation?.value || item.diningCouponInfo.name;
                } else {
                  item.diningCouponInfo.displayName = item.diningCouponInfo?.name || '';
                }
              }
              return item;
            }
          );
          this.reports = new MatTableDataSource<VendorExpenseReportInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.reports);
        }

        if (response && response.totalExpenseData) {
          const data = response.totalExpenseData;
          this.totalExpenseDataCount = data.count;
          this.totalExpenseDataAmount = data.amount;
        }

        if (response && response.orderProductDiscountExpenseData) {
          const data = response.orderProductDiscountExpenseData;
          this.orderProductDiscountExpenseDataCount = data.count;
          this.orderProductDiscountExpenseDataAmount = data.amount;
        }
        if (response && response.posOrderProductDiscountExpenseData) {
          const data = response.posOrderProductDiscountExpenseData;
          this.posOrderProductDiscountExpenseDataCount = data.count;
          this.posOrderProductDiscountExpenseDataAmount = data.amount;
        }
        if (response && response.tableOrderProductDiscountExpenseData) {
          const data = response.tableOrderProductDiscountExpenseData;
          this.tableOrderProductDiscountExpenseDataCount = data.count;
          this.tableOrderProductDiscountExpenseDataAmount = data.amount;
        }
        if (response && response.posOrderExtraDiscountExpenseData) {
          const data = response.posOrderExtraDiscountExpenseData;
          this.posOrderExtraDiscountExpenseDataCount = data.count;
          this.posOrderExtraDiscountExpenseDataAmount = data.amount;
        }
        if (response && response.tableOrderExtraDiscountExpenseData) {
          const data = response.tableOrderExtraDiscountExpenseData;
          this.tableOrderExtraDiscountExpenseDataCount = data.count;
          this.tableOrderExtraDiscountExpenseDataAmount = data.amount;
        }
        if (response && response.couponExpenseData) {
          const data = response.couponExpenseData;
          this.couponExpenseDataCount = data.count;
          this.couponExpenseDataAmount = data.amount;
        }
        if (response && response.diningCouponExpenseData) {
          const data = response.diningCouponExpenseData;
          this.diningCouponExpenseDataCount = data.count;
          this.diningCouponExpenseDataAmount = data.amount;
        }
        if (response && response.diningBookingDiscountExpenseData) {
          const data = response.diningBookingDiscountExpenseData;
          this.diningBookingDiscountExpenseDataCount = data.count;
          this.diningBookingDiscountExpenseDataAmount = data.amount;
        }
        if (response && response.refundOrderExpenseData) {
          const data = response.refundOrderExpenseData;
          this.refundOrderExpenseDataCount = data.count;
          this.refundOrderExpenseDataAmount = data.amount;
        }
        if (response && response.otherExpenseData) {
          const data = response.otherExpenseData;
          this.otherExpenseDataCount = data.count;
          this.otherExpenseDataAmount = data.amount;
        }

        this.expenseChartOptions = {
          series: [
            this.orderProductDiscountExpenseDataAmount,
            this.posOrderProductDiscountExpenseDataAmount,
            this.tableOrderProductDiscountExpenseDataAmount,
            this.posOrderExtraDiscountExpenseDataAmount,
            this.tableOrderExtraDiscountExpenseDataAmount,
            this.couponExpenseDataAmount,
            this.diningCouponExpenseDataAmount,
            this.diningBookingDiscountExpenseDataAmount,
            this.refundOrderExpenseDataAmount,
            this.otherExpenseDataAmount,
          ],
          chart: {
            toolbar: {
              show: false,
            },
            foreColor: '#adb0bb',
            fontFamily: "'DM Sans',sans-serif",
            type: 'donut',
            height: 280,
          },
          legend: {
            show: false,
          },
          tooltip: {
            theme: 'dark',
            fillSeriesColor: false,
            x: {
              show: false,
            },
            y: {
              formatter: (value: number) => {
                return this.util.priceFormat(value);
              }
            }
          },
          labels: [
            this.util.appTranslate('order_product_discount_expense'),
            this.util.appTranslate('pos_product_discount_expense'),
            this.util.appTranslate('table_product_discount_expense'),
            this.util.appTranslate('pos_extra_discount_expense'),
            this.util.appTranslate('table_extra_discount_expense'),
            this.util.appTranslate('coupon_expense'),
            this.util.appTranslate('dining_coupon_expense'),
            this.util.appTranslate('dining_booking_discount_expense'),
            this.util.appTranslate('order_refund_expense'),
            this.util.appTranslate('others_expense')
          ],
          colors: [],
          stroke: {
            colors: ['transparent'],
          },
          plotOptions: {
            pie: {
              donut: {
                size: '78%',
                background: 'transparent',
                dataLabels: {
                  enabled: false,
                  name: {
                    show: true,
                  },
                  value: {
                    show: true,
                  }
                },
                labels: {
                  show: false,
                  name: {
                    show: true,
                    fontSize: '18px',
                    color: undefined,
                    offsetY: -10,
                  },
                  value: {
                    show: false,
                    color: '#98aab4',
                  },
                  total: {
                    show: false,
                    label: this.util.appTranslate('our_visitors'),
                    color: '#98aab4',
                  },
                },
              },
            },
          },
        };
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.isInitialLoaded = true;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'type': this.expenseType,
      'restaurant': this.util.getItem('_vendorId'),
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/vendor_web/reports/expense?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: VendorExpenseReportInterface) => {
              if (item && item.couponInfo && item.couponInfo?.id) {
                if (item.couponInfo?.translations) {
                  const translation = item.couponInfo.translations.find((t) => t.code == this.util.appLocaleName());
                  item.couponInfo.displayName = translation?.value || item.couponInfo.name;
                } else {
                  item.couponInfo.displayName = item.couponInfo?.name || '';
                }
              }

              if (item && item.diningCouponInfo && item.diningCouponInfo?.id) {
                if (item.diningCouponInfo?.translations) {
                  const translation = item.diningCouponInfo.translations.find((t) => t.code == this.util.appLocaleName());
                  item.diningCouponInfo.displayName = translation?.value || item.diningCouponInfo.name;
                } else {
                  item.diningCouponInfo.displayName = item.diningCouponInfo?.name || '';
                }
              }

              return item;
            }
          );
          this.reports = new MatTableDataSource<VendorExpenseReportInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.reports);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      console.log('exportCollection Now');
      const spinnerRef = this.util.start();
      const param: any = {
        'exportType': exportOption,
        'type': this.expenseType,
        'restaurant': this.util.getItem('_vendorId'),
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/vendor_web/reports/expense/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          const fileName = exportOption == 'excel' ? 'RestaurantExpenseReport.xlsx' : 'RestaurantExpenseReport.csv';
          this.api.download_export_file(blob, fileName);
          this.exportType = 'export';
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.exportType = 'export';
          this.util.handleError(error, 'vendor');
        }
      });
    }
  }

  onTypeChange(type: string) {
    console.log(type);
    this.expenseType = type;
    this.getList();
  }

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  addExpsense() {
    const dialogRef = this.dialog.open(DialogAddVendorExpense, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getInitial();
      }
    });
  }

  onOrderInfo(order: VendorExpenseReportInterface) {
    console.log(order);
    this.router.navigate(['vendor/order-management/order-detail', order.orderInfo.id]);
  }

  onPosOrderInfo(order: VendorExpenseReportInterface) {
    console.log(order);
    this.router.navigate(['vendor/pos-management/pos-order-detail/', order.posOrderInfo.id]);
  }

  onTableOrderInfo(order: VendorExpenseReportInterface) {
    console.log(order);
    this.router.navigate(['vendor/table-management/completed-table-order-detail/', order.tableOrderInfo.id]);
  }

  onBookingInfo(booking: VendorExpenseReportInterface) {
    console.log(booking);
    this.router.navigate(['vendor/table-prebooking/booking-detail', booking.bookingInfo.id]);
  }

  onCouponInfo(coupon: VendorExpenseReportInterface) {
    console.log(coupon);
  }

  onDiningCouponInfo(coupon: VendorExpenseReportInterface) {
    console.log(coupon);
  }

}
