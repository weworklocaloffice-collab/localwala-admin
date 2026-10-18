import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogAddAdminExpense } from './dialog-add-admin-expense/dialog-add-admin-expense';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { HttpParams } from '@angular/common/http';
import { DateTime } from 'luxon';
import { MatTableDataSource } from '@angular/material/table';
import { AdminExpenseReportInterface } from 'src/app/interfaces/admin.expense.report.interface';
import { Router } from '@angular/router';
import { ApexAxisChartSeries, ApexChart, ChartComponent, ApexDataLabels, ApexYAxis, ApexLegend, ApexXAxis, ApexTooltip, ApexTheme, ApexGrid, ApexPlotOptions, ApexFill } from 'ng-apexcharts';
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
  selector: 'app-admin-expense-report',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgApexchartsModule, NgIcon],
  templateUrl: './admin-expense-report.html',
})
export class AdminExpenseReport {

  @ViewChild('expenseChart') expenseChart: ChartComponent = Object.create(null);
  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  reports = new MatTableDataSource<AdminExpenseReportInterface>([]);
  displayedColumn = ['id', 'customer', 'type', 'order', 'booking', 'coupon', 'dining_coupon', 'amount', 'date'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  isInitialLoaded: boolean = false;
  exportType: string = 'export';
  expenseType: string = 'all';
  public expenseChartOptions: Partial<ChartOptions> | any;
  totalExpenseDataCount: number = 0;
  totalExpenseDataAmount: number = 0;
  couponExpenseDataCount: number = 0;
  couponExpenseDataAmount: number = 0;
  deliveryChargeExpenseDataCount: number = 0;
  deliveryChargeExpenseDataAmount: number = 0;
  referralChargeExpenseDataCount: number = 0;
  referralChargeExpenseDataAmount: number = 0;
  walletBonusExpenseDataCount: number = 0;
  walletBonusExpenseDataAmount: number = 0;
  loyaltyPointsExpenseDataCount: number = 0;
  loyaltyPointsExpenseDataAmount: number = 0;
  diningCouponExpenseDataCount: number = 0;
  diningCouponExpenseDataAmount: number = 0;
  walletCreditExpenseDataCount: number = 0;
  walletCreditExpenseDataAmount: number = 0;
  itSupportExpenseDataCount: number = 0;
  itSupportExpenseDataAmount: number = 0;
  adsExpenseDataCount: number = 0;
  adsExpenseDataAmount: number = 0;
  employeeExpenseDataCount: number = 0;
  employeeExpenseDataAmount: number = 0;
  outSourceExpenseDataCount: number = 0;
  outSourceExpenseDataAmount: number = 0;
  paymentGatewayChargeExpenseDataCount: number = 0;
  paymentGatewayChargeExpenseDataAmount: number = 0;
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
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/reports/expenseInitial?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        this.isInitialLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminExpenseReportInterface) => {
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
          this.reports = new MatTableDataSource<AdminExpenseReportInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.reports);
        }

        if (response && response.totalExpenseData) {
          const data = response.totalExpenseData;
          this.totalExpenseDataCount = data.count;
          this.totalExpenseDataAmount = data.amount;
        }

        if (response && response.couponExpenseData) {
          const data = response.couponExpenseData;
          this.couponExpenseDataCount = data.count;
          this.couponExpenseDataAmount = data.amount;
        }

        if (response && response.deliveryChargeExpenseData) {
          const data = response.deliveryChargeExpenseData;
          this.deliveryChargeExpenseDataCount = data.count;
          this.deliveryChargeExpenseDataAmount = data.amount;
        }

        if (response && response.referralChargeExpenseData) {
          const data = response.referralChargeExpenseData;
          this.referralChargeExpenseDataCount = data.count;
          this.referralChargeExpenseDataAmount = data.amount;
        }

        if (response && response.walletBonusExpenseData) {
          const data = response.walletBonusExpenseData;
          this.walletBonusExpenseDataCount = data.count;
          this.walletBonusExpenseDataAmount = data.amount;
        }

        if (response && response.loyaltyPointsExpenseData) {
          const data = response.loyaltyPointsExpenseData;
          this.loyaltyPointsExpenseDataCount = data.count;
          this.loyaltyPointsExpenseDataAmount = data.amount;
        }

        if (response && response.diningCouponExpenseData) {
          const data = response.diningCouponExpenseData;
          this.diningCouponExpenseDataCount = data.count;
          this.diningCouponExpenseDataAmount = data.amount;
        }

        if (response && response.walletCreditExpenseData) {
          const data = response.walletCreditExpenseData;
          this.walletCreditExpenseDataCount = data.count;
          this.walletCreditExpenseDataAmount = data.amount;
        }

        if (response && response.itSupportExpenseData) {
          const data = response.itSupportExpenseData;
          this.itSupportExpenseDataCount = data.count;
          this.itSupportExpenseDataAmount = data.amount;
        }

        if (response && response.adsExpenseData) {
          const data = response.adsExpenseData;
          this.adsExpenseDataCount = data.count;
          this.adsExpenseDataAmount = data.amount;
        }

        if (response && response.employeeExpenseData) {
          const data = response.employeeExpenseData;
          this.employeeExpenseDataCount = data.count;
          this.employeeExpenseDataAmount = data.amount;
        }

        if (response && response.outSourceExpenseData) {
          const data = response.outSourceExpenseData;
          this.outSourceExpenseDataCount = data.count;
          this.outSourceExpenseDataAmount = data.amount;
        }

        if (response && response.paymentGatewayChargeExpenseData) {
          const data = response.paymentGatewayChargeExpenseData;
          this.paymentGatewayChargeExpenseDataCount = data.count;
          this.paymentGatewayChargeExpenseDataAmount = data.amount;
        }

        if (response && response.otherExpenseData) {
          const data = response.otherExpenseData;
          this.otherExpenseDataCount = data.count;
          this.otherExpenseDataAmount = data.amount;
        }

        this.expenseChartOptions = {
          series: [
            this.couponExpenseDataAmount,
            this.deliveryChargeExpenseDataAmount,
            this.referralChargeExpenseDataAmount,
            this.walletBonusExpenseDataAmount,
            this.loyaltyPointsExpenseDataAmount,
            this.diningCouponExpenseDataAmount,
            this.walletCreditExpenseDataAmount,
            this.itSupportExpenseDataAmount,
            this.adsExpenseDataAmount,
            this.employeeExpenseDataAmount,
            this.outSourceExpenseDataAmount,
            this.paymentGatewayChargeExpenseDataAmount,
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
            this.util.appTranslate('coupon_expenses'),
            this.util.appTranslate('delivery_charge_expenses'),
            this.util.appTranslate('referral_expenses'),
            this.util.appTranslate('wallet_bonus_expenses'),
            this.util.appTranslate('loyalty_points_expenses'),
            this.util.appTranslate('dining_coupon_expenses'),
            this.util.appTranslate('wallet_credit_expenses'),
            this.util.appTranslate('it_support_expenses'),
            this.util.appTranslate('ads_promo_expenses'),
            this.util.appTranslate('employee_benifits'),
            this.util.appTranslate('outsource_support_expense'),
            this.util.appTranslate('expense_payment_gateway_charge'),
            this.util.appTranslate('other_expenses'),
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
        this.util.handleError(error, 'admin');
      }
    });
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'type': this.expenseType,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/reports/expense?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminExpenseReportInterface) => {
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
          this.reports = new MatTableDataSource<AdminExpenseReportInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.reports);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  addExpsense() {
    const dialogRef = this.dialog.open(DialogAddAdminExpense, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getList();
      }
    });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  importCollection() {
    this.router.navigate(['admin/import-export-management/import-collection/', 'admin_expense']);
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      const spinnerRef = this.util.start();
      this.api.export_collection('v1/admin/expense/export/' + exportOption + '/' + this.expenseType).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'AdminExpense.xlsx' : 'AdminExpense.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'adminexpenses.json';
            this.api.download_export_file(blob, fileName);
          }
          this.exportType = 'export';
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.exportType = 'export';
          this.util.handleError(error, 'admin');
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

  onOrderInfo(order: AdminExpenseReportInterface) {
    console.log(order);
    this.router.navigate(['admin/order-management/order-details', order.orderInfo.id]);
  }

  onBookingInfo(booking: AdminExpenseReportInterface) {
    console.log(booking);
    this.router.navigate(['admin/order-management/dining-booking-details', booking.bookingInfo.id]);
  }

  onCouponInfo(coupon: AdminExpenseReportInterface) {
    console.log(coupon);
  }

  onDiningCouponInfo(coupon: AdminExpenseReportInterface) {
    console.log(coupon);
  }

  onUserInfo(item: AdminExpenseReportInterface) {
    console.log(item);
    if (item && item.userInfo && item.userInfo.id && item.userInfo.id != '') {
      this.router.navigate(['admin/customer-management/customer-detail', item.userInfo.id]);
    }
  }

}
