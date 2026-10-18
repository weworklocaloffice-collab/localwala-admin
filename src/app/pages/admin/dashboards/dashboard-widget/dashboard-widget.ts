import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AdminOrderCountArrayInterface } from 'src/app/interfaces/admin.order.count.array.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ApexChart, ChartComponent, ApexDataLabels, ApexLegend, ApexStroke, ApexTooltip, ApexAxisChartSeries, ApexXAxis, ApexYAxis, ApexGrid, ApexPlotOptions, ApexFill } from 'ng-apexcharts';
import { DateTime } from 'luxon';
import { AdminDashboardEarningStatsInterface } from 'src/app/interfaces/admin.dashboard.earning.stats.interface';
import { AdminDashboardTopRatedRestaurantInterface } from 'src/app/interfaces/admin.dashboard.top.rated.restaurant.interface';
import { AdminDashboardTrendingRestaurantInterface } from 'src/app/interfaces/admin.dashboard.trending.restaurant.interface';
import { AdminDashboardTopRatedDeliverymanInterface } from 'src/app/interfaces/admin.dashboard.top.rated.deliveryman.interface';
import { AdminDashboardMostHandleOrderDeliveryInterface } from 'src/app/interfaces/admin.dashboard.most.handle.order.deliveryman.interface';
import { AdminDashboardTopRatedFoodInterface } from 'src/app/interfaces/admin.dashboard.top.rated.food.interface';
import { AdminDashboardMostOrderedFoodInterface } from 'src/app/interfaces/admin.dashboard.most.ordered.food.interface';
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
  selector: 'app-dashboard-widget',
  imports: [MaterialModule, NgApexchartsModule, NgIcon],
  templateUrl: './dashboard-widget.html',
})
export class DashboardWidget {
  isLoaded: boolean = false;
  @ViewChild('roleChart') roleChart: ChartComponent = Object.create(null);
  @ViewChild('expenseChart') expenseChart: ChartComponent = Object.create(null);
  @ViewChild('orderEarningChart') orderEarningChart: ChartComponent = Object.create(null);
  @ViewChild('posEarningChart') posEarningChart: ChartComponent = Object.create(null);
  @ViewChild('tableOrderEarningChart') tableOrderEarningChart: ChartComponent = Object.create(null);
  @ViewChild('bookingEarningChart') bookingEarningChart: ChartComponent = Object.create(null);
  public roleChartOption!: Partial<ChartOption> | any;
  public expenseChartOptions: Partial<ChartOption> | any;
  public orderEarningChartOption!: Partial<ChartOption> | any;
  public posEarningChartOption!: Partial<ChartOption> | any;
  public tableOrderEarningChartOption!: Partial<ChartOption> | any;
  public bookingEarningChartOption!: Partial<ChartOption> | any;
  orderCount: AdminOrderCountArrayInterface[] = [];
  topRatedRestaurant: AdminDashboardTopRatedRestaurantInterface[] = [];
  trendingRestaurant: AdminDashboardTrendingRestaurantInterface[] = [];
  topRatedDeliveryman: AdminDashboardTopRatedDeliverymanInterface[] = [];
  mostHandleOrderDeliveryman: AdminDashboardMostHandleOrderDeliveryInterface[] = [];
  topRatedFood: AdminDashboardTopRatedFoodInterface[] = [];
  topOrderedFood: AdminDashboardMostOrderedFoodInterface[] = [];
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
    public api: ApiService,
    private router: Router
  ) {
    this.getInfo();
    const orderCount: AdminOrderCountArrayInterface[] = [
      {
        "img": "assets/orders/fresh_order.png",
        "color": "primary",
        "title": this.util.appTranslate('new_orders'),
        "desc": this.util.numberFormat(0),
        "key": "fresh"
      },
      {
        "img": "assets/orders/accepted_orders.png",
        "color": "warning",
        "title": this.util.appTranslate('accepted_orders'),
        "desc": this.util.numberFormat(0),
        "key": "accepted"
      },
      {
        "img": "assets/orders/preparing_order.png",
        "color": "secondary",
        "title": this.util.appTranslate('preparing_orders'),
        "desc": this.util.numberFormat(0),
        "key": "preparing"
      },
      {
        "img": "assets/orders/ready_order.png",
        "color": "error",
        "title": this.util.appTranslate('ready_orders'),
        "desc": this.util.numberFormat(0),
        "key": "ready"
      },
      {
        "img": "assets/orders/handover_order.png",
        "color": "success",
        "title": this.util.appTranslate('handover_orders'),
        "desc": this.util.numberFormat(0),
        "key": "handover"
      },
      {
        "img": "assets/orders/ongoing.png",
        "color": "secondary",
        "title": this.util.appTranslate('ongoing_orders'),
        "desc": this.util.numberFormat(0),
        "key": "ongoing"
      },
      {
        "img": "assets/orders/delivered_order.png",
        "color": "secondary",
        "title": this.util.appTranslate('delivered_orders'),
        "desc": this.util.numberFormat(0),
        "key": "delivered"
      },
      {
        "img": "assets/orders/cancelled_order.png",
        "color": "success",
        "title": this.util.appTranslate('cancelled_orders'),
        "desc": this.util.numberFormat(0),
        "key": "cancelled"
      },
      {
        "img": "assets/orders/rejected_order.png",
        "color": "error",
        "title": this.util.appTranslate('rejected_orders'),
        "desc": this.util.numberFormat(0),
        "key": "rejected"
      },
      {
        "img": "assets/orders/refunded_order.png",
        "color": "secondary",
        "title": this.util.appTranslate('refunded_orders'),
        "desc": this.util.numberFormat(0),
        "key": "refunded"
      },
      {
        "img": "assets/orders/partially_order.png",
        "color": "warning",
        "title": this.util.appTranslate('partially_refunded'),
        "desc": this.util.numberFormat(0),
        "key": "partially"
      },
      {
        "img": "assets/orders/pending_payment.png",
        "color": "primary",
        "title": this.util.appTranslate('payment_pending'),
        "desc": this.util.numberFormat(0),
        "key": "pending"
      },
    ];
    this.orderCount = orderCount;

    this.roleChartOption = {
      series: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      chart: {
        id: 'donut-chart',
        type: 'donut',
        height: 350,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: '#adb0bb',
      },
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70px',
          },
        },
      },
      legend: {
        show: true,
        position: 'bottom',
        width: '50px',
      },
      colors: ['#0066cc', '#cc00cc', '#ff0066', '#00cc00', '#cc3300', '#666633', '#336699', '#6600cc', '#006666', '#003300', '#6ee313'],
      tooltip: {
        theme: 'dark',
        fillSeriesColor: false,
      },
      labels: [
        this.util.appTranslate('customers'),
        this.util.appTranslate('deliveryman'),
        this.util.appTranslate('restaurants'),
        this.util.appTranslate('vendor_deliveryman'),
        this.util.appTranslate('outlets'),
        this.util.appTranslate('city_master'),
        this.util.appTranslate('support_team'),
        this.util.appTranslate('dd_guest'),
        this.util.appTranslate('waiters'),
        this.util.appTranslate('accountant'),
        this.util.appTranslate('kitchen_owners')
      ],
    };
    const currentYear = DateTime.now().setLocale(this.util.appLocaleName()).toFormat('yyyy')
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
  }

  getInfo() {
    this.isLoaded = false;
    this.api.get_private('v1/admin/dashboard/').subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.success == true) {
          if (response && response.count) {
            const count = response.count;
            const fresh = count.fresh;
            const accepted = count.accepted;
            const preparing = count.preparing;
            const ready = count.ready;
            const handover = count.handover;
            const ongoing = count.ongoing;
            const delivered = count.delivered;
            const cancelled = count.cancelled;
            const rejected = count.rejected;
            const refunded = count.refunded;
            const partially = count.partially;
            const pending = count.pending;
            const orderCount: AdminOrderCountArrayInterface[] = [
              {
                "img": "assets/orders/fresh_order.png",
                "color": "primary",
                "title": this.util.appTranslate('new_orders'),
                "desc": this.util.numberFormat(fresh),
                "key": "fresh"
              },
              {
                "img": "assets/orders/accepted_orders.png",
                "color": "warning",
                "title": this.util.appTranslate('accepted_orders'),
                "desc": this.util.numberFormat(accepted),
                "key": "accepted"
              },
              {
                "img": "assets/orders/preparing_order.png",
                "color": "secondary",
                "title": this.util.appTranslate('preparing_orders'),
                "desc": this.util.numberFormat(preparing),
                "key": "preparing"
              },
              {
                "img": "assets/orders/ready_order.png",
                "color": "error",
                "title": this.util.appTranslate('ready_orders'),
                "desc": this.util.numberFormat(ready),
                "key": "ready"
              },
              {
                "img": "assets/orders/handover_order.png",
                "color": "success",
                "title": this.util.appTranslate('handover_orders'),
                "desc": this.util.numberFormat(handover),
                "key": "handover"
              },
              {
                "img": "assets/orders/ongoing.png",
                "color": "secondary",
                "title": this.util.appTranslate('ongoing_orders'),
                "desc": this.util.numberFormat(ongoing),
                "key": "ongoing"
              },
              {
                "img": "assets/orders/delivered_order.png",
                "color": "secondary",
                "title": this.util.appTranslate('delivered_orders'),
                "desc": this.util.numberFormat(delivered),
                "key": "delivered"
              },
              {
                "img": "assets/orders/cancelled_order.png",
                "color": "success",
                "title": this.util.appTranslate('cancelled_orders'),
                "desc": this.util.numberFormat(cancelled),
                "key": "cancelled"
              },
              {
                "img": "assets/orders/rejected_order.png",
                "color": "error",
                "title": this.util.appTranslate('rejected_orders'),
                "desc": this.util.numberFormat(rejected),
                "key": "rejected"
              },
              {
                "img": "assets/orders/refunded_order.png",
                "color": "secondary",
                "title": this.util.appTranslate('refunded_orders'),
                "desc": this.util.numberFormat(refunded),
                "key": "refunded"
              },
              {
                "img": "assets/orders/partially_order.png",
                "color": "warning",
                "title": this.util.appTranslate('partially_refunded'),
                "desc": this.util.numberFormat(partially),
                "key": "partially"
              },
              {
                "img": "assets/orders/pending_payment.png",
                "color": "primary",
                "title": this.util.appTranslate('payment_pending'),
                "desc": this.util.numberFormat(pending),
                "key": "pending"
              },
            ];
            this.orderCount = orderCount;
          }

          if (response && response.roles) {
            const roles = response.roles;
            const totalUsers = roles.totalUsers;
            const totalDeliveryman = roles.totalDeliveryman;
            const totalVendor = roles.totalVendor;
            const totalVendorDeliveryman = roles.totalVendorDeliveryman;
            const totalOutlet = roles.totalOutlet;
            const totalCityMaster = roles.totalCityMaster;
            const totalSupportTeam = roles.totalSupportTeam;
            const totalGuest = roles.totalGuest;
            const totalWaiter = roles.totalWaiter;
            const totalAccountant = roles.totalAccountant;
            const totalKitchenOwner = roles.totalKitchenOwner;
            this.roleChartOption = {
              series: [totalUsers, totalDeliveryman, totalVendor, totalVendorDeliveryman, totalOutlet, totalCityMaster, totalSupportTeam, totalGuest, totalWaiter, totalAccountant, totalKitchenOwner],
              chart: {
                id: 'donut-chart',
                type: 'donut',
                height: 350,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                foreColor: '#adb0bb',
              },
              dataLabels: {
                enabled: false,
              },
              plotOptions: {
                pie: {
                  donut: {
                    size: '70px',
                  },
                },
              },
              legend: {
                show: true,
                position: 'bottom',
                width: '50px',
              },
              colors: ['#0066cc', '#cc00cc', '#ff0066', '#00cc00', '#cc3300', '#666633', '#336699', '#6600cc', '#006666', '#003300', '#6ee313'],
              tooltip: {
                theme: 'dark',
                fillSeriesColor: false,
              },
              labels: [
                this.util.appTranslate('customers'),
                this.util.appTranslate('deliveryman'),
                this.util.appTranslate('restaurants'),
                this.util.appTranslate('vendor_deliveryman'),
                this.util.appTranslate('outlets'),
                this.util.appTranslate('city_master'),
                this.util.appTranslate('support_team'),
                this.util.appTranslate('dd_guest'),
                this.util.appTranslate('waiters'),
                this.util.appTranslate('accountant'),
                this.util.appTranslate('kitchen_owners')
              ],
            };
          }

          if (response && response.orderEarningStats) {
            const orderEarning: AdminDashboardEarningStatsInterface[] = response.orderEarningStats;

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
            const orderEarning: AdminDashboardEarningStatsInterface[] = response.posOrderEarningStats;
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
            const orderEarning: AdminDashboardEarningStatsInterface[] = response.tableOrderEarningStats;
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
            const orderEarning: AdminDashboardEarningStatsInterface[] = response.diningBookingEarningStats;
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

          const mappedTopRatedRestaurant = response.topRatedRestaurant.map(
            (item: AdminDashboardTrendingRestaurantInterface) => {
              const mainTranslation = item.translations.find((t) => t.code == this.util.appLocaleName());
              item.displayName = mainTranslation?.title || item.name;

              if (item && item.city && item.city?.id) {
                if (item.city?.translations) {
                  const translation = item.city.translations.find((t) => t.code == this.util.appLocaleName());
                  item.city.displayName = translation?.value || item.city.name;
                } else {
                  item.city.displayName = item.city?.name || '';
                }
              }

              if (item && item.locality && item.locality?.id) {
                if (item.locality?.translations) {
                  const translation = item.locality.translations.find((t) => t.code == this.util.appLocaleName());
                  item.locality.displayName = translation?.value || item.locality.name;
                } else {
                  item.locality.displayName = item.locality?.name || '';
                }
              }

              return item;
            }
          );
          this.topRatedRestaurant = mappedTopRatedRestaurant;

          const mappedTopOrderedRestaurant = response.topOrderedRestaurant.map(
            (item: AdminDashboardTrendingRestaurantInterface) => {
              const mainTranslation = item.translations.find((t) => t.code == this.util.appLocaleName());
              item.displayName = mainTranslation?.title || item.name;

              if (item && item.city && item.city?.id) {
                if (item.city?.translations) {
                  const translation = item.city.translations.find((t) => t.code == this.util.appLocaleName());
                  item.city.displayName = translation?.value || item.city.name;
                } else {
                  item.city.displayName = item.city?.name || '';
                }
              }

              if (item && item.locality && item.locality?.id) {
                if (item.locality?.translations) {
                  const translation = item.locality.translations.find((t) => t.code == this.util.appLocaleName());
                  item.locality.displayName = translation?.value || item.locality.name;
                } else {
                  item.locality.displayName = item.locality?.name || '';
                }
              }

              return item;
            }
          );
          this.trendingRestaurant = mappedTopOrderedRestaurant;
          console.log(this.trendingRestaurant);

          const mappedTopRatedDeliveryman = response.topRatedDeliveryman.map(
            (item: AdminDashboardTopRatedDeliverymanInterface) => {
              if (item && item.city && item.city?.id) {
                if (item.city?.translations) {
                  const translation = item.city.translations.find((t) => t.code == this.util.appLocaleName());
                  item.city.displayName = translation?.value || item.city.name;
                } else {
                  item.city.displayName = item.city?.name || '';
                }
              }

              if (item && item.locality && item.locality?.id) {
                if (item.locality?.translations) {
                  const translation = item.locality.translations.find((t) => t.code == this.util.appLocaleName());
                  item.locality.displayName = translation?.value || item.locality.name;
                } else {
                  item.locality.displayName = item.locality?.name || '';
                }
              }

              return item;
            }
          );
          this.topRatedDeliveryman = mappedTopRatedDeliveryman;

          const mappedTopOrderHandlingDeliveryan = response.topOrderHandlingDeliveryan.map(
            (item: AdminDashboardMostHandleOrderDeliveryInterface) => {
              if (item && item.city && item.city?.id) {
                if (item.city?.translations) {
                  const translation = item.city.translations.find((t) => t.code == this.util.appLocaleName());
                  item.city.displayName = translation?.value || item.city.name;
                } else {
                  item.city.displayName = item.city?.name || '';
                }
              }

              if (item && item.locality && item.locality?.id) {
                if (item.locality?.translations) {
                  const translation = item.locality.translations.find((t) => t.code == this.util.appLocaleName());
                  item.locality.displayName = translation?.value || item.locality.name;
                } else {
                  item.locality.displayName = item.locality?.name || '';
                }
              }

              return item;
            }
          );
          this.mostHandleOrderDeliveryman = mappedTopOrderHandlingDeliveryan;

          const mappedTopRatedFoodList = response.topRatedFood.map(
            (item: AdminDashboardTopRatedFoodInterface) => {
              const mainTranslation = item.translations.find((t) => t.code == this.util.appLocaleName());
              item.displayName = mainTranslation?.title || item.name;
              if (item && item.restaurants && item.restaurants?.id) {
                if (item.restaurants?.translations) {
                  const translation = item.restaurants.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurants.displayName = translation?.title || item.restaurants.name;
                } else {
                  item.restaurants.displayName = item.restaurants?.name || '';
                }
              }
              return item;
            }
          );
          this.topRatedFood = mappedTopRatedFoodList;


          const mappedTopOrderedFood = response.topOrderedFood.map(
            (item: AdminDashboardTopRatedFoodInterface) => {
              const mainTranslation = item.translations.find((t) => t.code == this.util.appLocaleName());
              item.displayName = mainTranslation?.title || item.name;
              if (item && item.restaurants && item.restaurants?.id) {
                if (item.restaurants?.translations) {
                  const translation = item.restaurants.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurants.displayName = translation?.title || item.restaurants.name;
                } else {
                  item.restaurants.displayName = item.restaurants?.name || '';
                }
              }
              return item;
            }
          );
          this.topOrderedFood = mappedTopOrderedFood;

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
        this.util.handleError(error, 'admin');
      },
    });
  }

  onOrderCountClick(item: AdminOrderCountArrayInterface) {
    console.log(item);
    this.router.navigate(['admin/order-management/orders-list']);
  }

  onRestaurantDetail(id: string) {
    console.log(id);
    this.router.navigate(['admin/restaurant-management/restaurant-detail', id]);
  }

  onDeliverymanDetail(id: string) {
    this.router.navigate(['admin/driver-management/deliveryman-details', id]);
  }

  onFoodDetail(id: string) {
    console.log(id);
    this.router.navigate(['admin/foods/food-detail', id]);
  }
}
