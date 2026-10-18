import { Component, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ApexChart, ChartComponent, ApexDataLabels, ApexLegend, ApexStroke, ApexTooltip, ApexAxisChartSeries, ApexXAxis, ApexYAxis, ApexGrid, ApexPlotOptions, ApexFill } from 'ng-apexcharts';
import { DateTime } from 'luxon';
import { AccountantDashboardEarningStatsInterface } from 'src/app/interfaces/accountant.dashboard.earning.stats.interface';
import { MaterialModule } from 'src/app/material.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgIcon } from '@ng-icons/core';

export interface ChartOption {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  grid: ApexGrid;
}

@Component({
  selector: 'app-accountant-team-dashboard',
  imports: [MaterialModule, NgApexchartsModule, NgIcon],
  templateUrl: './accountant-team-dashboard.html',
})
export class AccountantTeamDashboard {

  @ViewChild('expenseChart') expenseChart: ChartComponent = Object.create(null);
  @ViewChild('orderEarningChart') orderEarningChart: ChartComponent = Object.create(null);
  @ViewChild('posEarningChart') posEarningChart: ChartComponent = Object.create(null);
  @ViewChild('tableOrderEarningChart') tableOrderEarningChart: ChartComponent = Object.create(null);
  @ViewChild('bookingEarningChart') bookingEarningChart: ChartComponent = Object.create(null);
  isLoaded: boolean = false;
  public expenseChartOptions: Partial<ChartOption> | any;
  public orderEarningChartOption!: Partial<ChartOption> | any;
  public posEarningChartOption!: Partial<ChartOption> | any;
  public tableOrderEarningChartOption!: Partial<ChartOption> | any;
  public bookingEarningChartOption!: Partial<ChartOption> | any;
  orderGrandTotal: number = 0;
  orderTotalCommission: number = 0;
  orderTotalSold: number = 0;
  posGrandTotal: number = 0;
  posTotalCommission: number = 0;
  posTotalSold: number = 0;
  tableOrderGrandTotal: number = 0;
  tableOrderTotalCommission: number = 0;
  tableOrderTotalSold: number = 0;
  bookingGrandTotal: number = 0;
  bookingTotalCommission: number = 0;
  bookingTotalSold: number = 0;

  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    const currentYear = DateTime.now().setLocale(this.util.appLocaleName()).toFormat('yyyy');
    this.orderEarningChartOption = {
      series: [
        {
          name: this.util.appTranslate('order_total'),
          data: [0],
        },
        {
          name: this.util.appTranslate('th_admin_commission'),
          data: [0],
        },
      ],
      chart: {
        fontFamily: 'inherit',
        foreColor: '#a1aab2',
        height: 300,
        type: 'area',
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 3,
      },
      stroke: {
        curve: 'smooth',
        width: '2',
      },
      colors: [
        '#398bf7',
        '#06d79c',
      ],
      legend: {
        show: false,
      },
      grid: {
        show: true,
        strokeDashArray: 0,
        borderColor: 'rgba(0,0,0,0.1)',
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      xaxis: {
        type: 'category',
        categories: [currentYear],
      },
      tooltip: {
        theme: 'dark',
        x: {
          show: false,
        },
        y: {
          formatter: (value: number) => {
            return this.util.priceFormat(value);
          }
        }
      },
    };
    this.posEarningChartOption = {
      series: [
        {
          name: this.util.appTranslate('order_total'),
          data: [0],
        },
        {
          name: this.util.appTranslate('th_admin_commission'),
          data: [0],
        },
      ],
      chart: {
        fontFamily: 'inherit',
        foreColor: '#a1aab2',
        height: 300,
        type: 'area',
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 3,
      },
      stroke: {
        curve: 'smooth',
        width: '2',
      },
      colors: [
        '#398bf7',
        '#06d79c',
      ],
      legend: {
        show: false,
      },
      grid: {
        show: true,
        strokeDashArray: 0,
        borderColor: 'rgba(0,0,0,0.1)',
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      xaxis: {
        type: 'category',
        categories: [currentYear],
      },
      tooltip: {
        theme: 'dark',
        x: {
          show: false,
        },
        y: {
          formatter: (value: number) => {
            return this.util.priceFormat(value);
          }
        }
      },
    };
    this.tableOrderEarningChartOption = {
      series: [
        {
          name: this.util.appTranslate('order_total'),
          data: [0],
        },
        {
          name: this.util.appTranslate('th_admin_commission'),
          data: [0],
        },
      ],
      chart: {
        fontFamily: 'inherit',
        foreColor: '#a1aab2',
        height: 300,
        type: 'area',
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 3,
      },
      stroke: {
        curve: 'smooth',
        width: '2',
      },
      colors: [
        '#398bf7',
        '#06d79c',
      ],
      legend: {
        show: false,
      },
      grid: {
        show: true,
        strokeDashArray: 0,
        borderColor: 'rgba(0,0,0,0.1)',
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      xaxis: {
        type: 'category',
        categories: [currentYear],
      },
      tooltip: {
        theme: 'dark',
        x: {
          show: false,
        },
        y: {
          formatter: (value: number) => {
            return this.util.priceFormat(value);
          }
        }
      },
    };
    this.bookingEarningChartOption = {
      series: [
        {
          name: this.util.appTranslate('booking_total'),
          data: [0],
        },
        {
          name: this.util.appTranslate('th_admin_commission'),
          data: [0],
        },
      ],
      chart: {
        fontFamily: 'inherit',
        foreColor: '#a1aab2',
        height: 300,
        type: 'area',
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 3,
      },
      stroke: {
        curve: 'smooth',
        width: '2',
      },
      colors: [
        '#398bf7',
        '#06d79c',
      ],
      legend: {
        show: false,
      },
      grid: {
        show: true,
        strokeDashArray: 0,
        borderColor: 'rgba(0,0,0,0.1)',
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      xaxis: {
        type: 'category',
        categories: [currentYear],
      },
      tooltip: {
        theme: 'dark',
        x: {
          show: false,
        },
        y: {
          formatter: (value: number) => {
            return this.util.priceFormat(value);
          }
        }
      },
    };
    this.expenseChartOptions = {
      series: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
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
    this.getInfo();
  }

  getInfo() {
    this.isLoaded = false;
    this.api.get_private('v1/accountant/dashboard/').subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.success == true) {
          if (response && response.orderEarningStats) {
            const orderEarning: AccountantDashboardEarningStatsInterface[] = response.orderEarningStats;

            const orderGrandTotal = parseFloat(orderEarning.reduce((sum, item) => sum + item.grandTotal, 0).toString()).toFixed(2);
            const orderTotalCommission = parseFloat(orderEarning.reduce((sum, item) => sum + item.commission, 0).toString()).toFixed(2);

            this.orderGrandTotal = parseFloat(orderGrandTotal);
            this.orderTotalCommission = parseFloat(orderTotalCommission);
            this.orderTotalSold = orderEarning.reduce((sum, item) => sum + item.count, 0);

            const labels = orderEarning.map((item) => this.util.appTranslate(item.label.toString()));
            const grandTotal = orderEarning.map((item) => item.grandTotal);
            const commission = orderEarning.map((item) => item.commission);
            this.orderEarningChartOption = {
              series: [
                {
                  name: this.util.appTranslate('order_total'),
                  data: grandTotal,
                },
                {
                  name: this.util.appTranslate('th_admin_commission'),
                  data: commission,
                },
              ],
              chart: {
                fontFamily: 'inherit',
                foreColor: '#a1aab2',
                height: 300,
                type: 'area',
                toolbar: {
                  show: false,
                },
              },
              dataLabels: {
                enabled: false,
              },
              markers: {
                size: 3,
              },
              stroke: {
                curve: 'smooth',
                width: '2',
              },
              colors: [
                '#398bf7',
                '#06d79c',
              ],
              legend: {
                show: false,
              },
              grid: {
                show: true,
                strokeDashArray: 0,
                borderColor: 'rgba(0,0,0,0.1)',
                xaxis: {
                  lines: {
                    show: true,
                  },
                },
                yaxis: {
                  lines: {
                    show: true,
                  },
                },
              },
              xaxis: {
                type: 'category',
                categories: labels,
              },
              tooltip: {
                theme: 'dark',
                x: {
                  show: false,
                },
                y: {
                  formatter: (value: number) => {
                    return this.util.priceFormat(value);
                  }
                }
              },
            };
          }

          if (response && response.posOrderEarningStats) {
            const orderEarning: AccountantDashboardEarningStatsInterface[] = response.posOrderEarningStats;
            const posGrandTotal = parseFloat(orderEarning.reduce((sum, item) => sum + item.grandTotal, 0).toString()).toFixed(2);
            const posTotalCommission = parseFloat(orderEarning.reduce((sum, item) => sum + item.commission, 0).toString()).toFixed(2);

            this.posGrandTotal = parseFloat(posGrandTotal);
            this.posTotalCommission = parseFloat(posTotalCommission);
            this.posTotalSold = orderEarning.reduce((sum, item) => sum + item.count, 0);

            const labels = orderEarning.map((item) => this.util.appTranslate(item.label.toString()));
            const grandTotal = orderEarning.map((item) => item.grandTotal);
            const commission = orderEarning.map((item) => item.commission);
            this.posEarningChartOption = {
              series: [
                {
                  name: this.util.appTranslate('order_total'),
                  data: grandTotal,
                },
                {
                  name: this.util.appTranslate('th_admin_commission'),
                  data: commission,
                },
              ],
              chart: {
                fontFamily: 'inherit',
                foreColor: '#a1aab2',
                height: 300,
                type: 'area',
                toolbar: {
                  show: false,
                },
              },
              dataLabels: {
                enabled: false,
              },
              markers: {
                size: 3,
              },
              stroke: {
                curve: 'smooth',
                width: '2',
              },
              colors: [
                '#398bf7',
                '#06d79c',
              ],
              legend: {
                show: false,
              },
              grid: {
                show: true,
                strokeDashArray: 0,
                borderColor: 'rgba(0,0,0,0.1)',
                xaxis: {
                  lines: {
                    show: true,
                  },
                },
                yaxis: {
                  lines: {
                    show: true,
                  },
                },
              },
              xaxis: {
                type: 'category',
                categories: labels,
              },
              tooltip: {
                theme: 'dark',
                x: {
                  show: false,
                },
                y: {
                  formatter: (value: number) => {
                    return this.util.priceFormat(value);
                  }
                }
              },
            };
          }

          if (response && response.tableOrderEarningStats) {
            const orderEarning: AccountantDashboardEarningStatsInterface[] = response.tableOrderEarningStats;
            const tableOrderGrandTotal = parseFloat(orderEarning.reduce((sum, item) => sum + item.grandTotal, 0).toString()).toFixed(2);
            const tableOrderTotalCommission = parseFloat(orderEarning.reduce((sum, item) => sum + item.commission, 0).toString()).toFixed(2);

            this.tableOrderGrandTotal = parseFloat(tableOrderGrandTotal);
            this.tableOrderTotalCommission = parseFloat(tableOrderTotalCommission);
            this.tableOrderTotalSold = orderEarning.reduce((sum, item) => sum + item.count, 0);

            const labels = orderEarning.map((item) => this.util.appTranslate(item.label.toString()));
            const grandTotal = orderEarning.map((item) => item.grandTotal);
            const commission = orderEarning.map((item) => item.commission);

            this.tableOrderEarningChartOption = {
              series: [
                {
                  name: this.util.appTranslate('order_total'),
                  data: grandTotal,
                },
                {
                  name: this.util.appTranslate('th_admin_commission'),
                  data: commission,
                },
              ],
              chart: {
                fontFamily: 'inherit',
                foreColor: '#a1aab2',
                height: 300,
                type: 'area',
                toolbar: {
                  show: false,
                },
              },
              dataLabels: {
                enabled: false,
              },
              markers: {
                size: 3,
              },
              stroke: {
                curve: 'smooth',
                width: '2',
              },
              colors: [
                '#398bf7',
                '#06d79c',
              ],
              legend: {
                show: false,
              },
              grid: {
                show: true,
                strokeDashArray: 0,
                borderColor: 'rgba(0,0,0,0.1)',
                xaxis: {
                  lines: {
                    show: true,
                  },
                },
                yaxis: {
                  lines: {
                    show: true,
                  },
                },
              },
              xaxis: {
                type: 'category',
                categories: labels,
              },
              tooltip: {
                theme: 'dark',
                x: {
                  show: false,
                },
                y: {
                  formatter: (value: number) => {
                    return this.util.priceFormat(value);
                  }
                }
              },
            };
          }

          if (response && response.diningBookingEarningStats) {
            const orderEarning: AccountantDashboardEarningStatsInterface[] = response.diningBookingEarningStats;
            const bookingGrandTotal = parseFloat(orderEarning.reduce((sum, item) => sum + item.grandTotal, 0).toString()).toFixed(2);
            const bookingTotalCommission = parseFloat(orderEarning.reduce((sum, item) => sum + item.commission, 0).toString()).toFixed(2);

            this.bookingGrandTotal = parseFloat(bookingGrandTotal);
            this.bookingTotalCommission = parseFloat(bookingTotalCommission);
            this.bookingTotalSold = orderEarning.reduce((sum, item) => sum + item.count, 0);

            const labels = orderEarning.map((item) => this.util.appTranslate(item.label.toString()));
            const grandTotal = orderEarning.map((item) => item.grandTotal);
            const commission = orderEarning.map((item) => item.commission);

            this.bookingEarningChartOption = {
              series: [
                {
                  name: this.util.appTranslate('booking_total'),
                  data: grandTotal,
                },
                {
                  name: this.util.appTranslate('th_admin_commission'),
                  data: commission,
                },
              ],
              chart: {
                fontFamily: 'inherit',
                foreColor: '#a1aab2',
                height: 300,
                type: 'area',
                toolbar: {
                  show: false,
                },
              },
              dataLabels: {
                enabled: false,
              },
              markers: {
                size: 3,
              },
              stroke: {
                curve: 'smooth',
                width: '2',
              },
              colors: [
                '#398bf7',
                '#06d79c',
              ],
              legend: {
                show: false,
              },
              grid: {
                show: true,
                strokeDashArray: 0,
                borderColor: 'rgba(0,0,0,0.1)',
                xaxis: {
                  lines: {
                    show: true,
                  },
                },
                yaxis: {
                  lines: {
                    show: true,
                  },
                },
              },
              xaxis: {
                type: 'category',
                categories: labels,
              },
              tooltip: {
                theme: 'dark',
                x: {
                  show: false,
                },
                y: {
                  formatter: (value: number) => {
                    return this.util.priceFormat(value);
                  }
                }
              },
            };
          }

          if (response && response.expenses) {
            const count = response.expenses;
            const couponExpense = count.couponExpense;
            const deliveryChargeExpense = count.deliveryChargeExpense;
            const referralChargeExpense = count.referralChargeExpense;
            const walletBonusExpense = count.walletBonusExpense;
            const loyaltyPointsExpense = count.loyaltyPointsExpense;
            const diningCouponExpense = count.diningCouponExpense;
            const walletCreditExpense = count.walletCreditExpense;
            const itSupportExpense = count.itSupportExpense;
            const adsExpense = count.adsExpense;
            const employeeExpense = count.employeeExpense;
            const outSourceExpense = count.outSourceExpense;
            const paymentGatewayChargeExpense = count.paymentGatewayChargeExpense;
            const otherExpense = count.otherExpense;

            this.expenseChartOptions = {
              series: [
                couponExpense,
                deliveryChargeExpense,
                referralChargeExpense,
                walletBonusExpense,
                loyaltyPointsExpense,
                diningCouponExpense,
                walletCreditExpense,
                itSupportExpense,
                adsExpense,
                employeeExpense,
                outSourceExpense,
                paymentGatewayChargeExpense,
                otherExpense,
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
                show: true,
                position: 'bottom',
                width: '50px',
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
          }
        }
      },
      error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'accountant');
      },
    });
  }

}
