import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ApexChart, ChartComponent, ApexDataLabels, ApexLegend, ApexStroke, ApexTooltip, ApexAxisChartSeries, ApexXAxis, ApexYAxis, ApexGrid, ApexPlotOptions, ApexFill } from 'ng-apexcharts';
import { DateTime } from 'luxon';
import { CityzenOrderCountArrayInterface } from 'src/app/interfaces/cityzen.order.count.array.interface';
import { CityzenDashboardTopRatedRestaurantInterface } from 'src/app/interfaces/cityzen.dashboard.top.rated.restaurant.interface';
import { CityzenDashboardTrendingRestaurantInterface } from 'src/app/interfaces/cityzen.dashboard.trending.restaurant.interface';
import { CityzenDashboardTopRatedDeliverymanInterface } from 'src/app/interfaces/cityzen.dashboard.top.rated.deliveryman.interface';
import { CityzenDashboardMostHandleOrderDeliveryInterface } from 'src/app/interfaces/cityzen.dashboard.most.handle.order.deliveryman.interface';
import { CityzenDashboardTopRatedFoodInterface } from 'src/app/interfaces/cityzen.dashboard.top.rated.food.interface';
import { CityzenDashboardMostOrderedFoodInterface } from 'src/app/interfaces/cityzen.dashboard.most.ordered.food.interface';
import { CityzenDashboardEarningStatsInterface } from 'src/app/interfaces/cityzen.dashboard.earning.stats.interface';
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
  selector: 'app-cityzen-dashboard',
  imports: [MaterialModule, NgApexchartsModule, NgIcon],
  templateUrl: './cityzen-dashboard.html',
})
export class CityzenDashboard {

  isLoaded: boolean = false;
  @ViewChild('orderEarningChart') orderEarningChart: ChartComponent = Object.create(null);
  @ViewChild('posEarningChart') posEarningChart: ChartComponent = Object.create(null);
  @ViewChild('tableOrderEarningChart') tableOrderEarningChart: ChartComponent = Object.create(null);
  @ViewChild('bookingEarningChart') bookingEarningChart: ChartComponent = Object.create(null);
  public orderEarningChartOption!: Partial<ChartOption> | any;
  public posEarningChartOption!: Partial<ChartOption> | any;
  public tableOrderEarningChartOption!: Partial<ChartOption> | any;
  public bookingEarningChartOption!: Partial<ChartOption> | any;
  orderCount: CityzenOrderCountArrayInterface[] = [];
  topRatedRestaurant: CityzenDashboardTopRatedRestaurantInterface[] = [];
  trendingRestaurant: CityzenDashboardTrendingRestaurantInterface[] = [];
  topRatedDeliveryman: CityzenDashboardTopRatedDeliverymanInterface[] = [];
  mostHandleOrderDeliveryman: CityzenDashboardMostHandleOrderDeliveryInterface[] = [];
  topRatedFood: CityzenDashboardTopRatedFoodInterface[] = [];
  topOrderedFood: CityzenDashboardMostOrderedFoodInterface[] = [];
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
    const orderCount: CityzenOrderCountArrayInterface[] = [
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

  }

  getInfo() {
    this.isLoaded = false;
    this.api.get_private('v1/cityzen/dashboard/' + this.util.getItem('_uid')).subscribe({
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
            const orderCount: CityzenOrderCountArrayInterface[] = [
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


          if (response && response.orderEarningStats) {
            const orderEarning: CityzenDashboardEarningStatsInterface[] = response.orderEarningStats;

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
            const orderEarning: CityzenDashboardEarningStatsInterface[] = response.posOrderEarningStats;
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
            const orderEarning: CityzenDashboardEarningStatsInterface[] = response.tableOrderEarningStats;
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
            const orderEarning: CityzenDashboardEarningStatsInterface[] = response.diningBookingEarningStats;
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

          const topRatedRestaurantMappedList = response.topRatedRestaurant.map(
            (item: CityzenDashboardTopRatedRestaurantInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }

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
          this.topRatedRestaurant = topRatedRestaurantMappedList;

          const trendingRestaurantMappedList = response.topOrderedRestaurant.map(
            (item: CityzenDashboardTrendingRestaurantInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }

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
          this.trendingRestaurant = trendingRestaurantMappedList;

          const topRatedDeliverymaMappedList = response.topRatedDeliveryman.map(
            (item: CityzenDashboardMostHandleOrderDeliveryInterface) => {
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
          this.topRatedDeliveryman = topRatedDeliverymaMappedList;

          const deliverymaMappedList = response.topOrderHandlingDeliveryan.map(
            (item: CityzenDashboardMostHandleOrderDeliveryInterface) => {
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
          this.mostHandleOrderDeliveryman = deliverymaMappedList;
          const topRatedFoodMappedList = response.topRatedFood.map(
            (item: CityzenDashboardMostOrderedFoodInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }

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
          this.topRatedFood = topRatedFoodMappedList;

          const topOrderFoodMappedList = response.topOrderedFood.map(
            (item: CityzenDashboardMostOrderedFoodInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }

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
          this.topOrderedFood = topOrderFoodMappedList;
        }
      },
      error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'cityzen');
      },
    });
  }

  onOrderCountClick(item: CityzenOrderCountArrayInterface) {
    console.log(item);
    this.router.navigate(['cityzen-team/regular-order-list']);
  }

  onRestaurantDetail(id: string) {
    console.log(id);
    this.router.navigate(['cityzen-team/u/restaurant-detail', id]);
  }

  onDeliverymanDetail(id: string) {
    this.router.navigate(['cityzen-team/u/deliveryman-details', id]);
  }

  onFoodDetail(id: string) {
    console.log(id);
    this.router.navigate(['cityzen-team/u/food-detail', id]);
  }

}
