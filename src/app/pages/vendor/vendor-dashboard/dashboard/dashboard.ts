import { Component, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ApexAxisChartSeries, ApexChart, ChartComponent, ApexDataLabels, ApexYAxis, ApexLegend, ApexXAxis, ApexTooltip, ApexTheme, ApexGrid, ApexPlotOptions, ApexFill } from 'ng-apexcharts';
import { DateTime } from 'luxon';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { VendorBusinessInsightTrendingFoodInterface } from 'src/app/interfaces/vendor.business.insight.trending.food.interface';
import { VendorOrderCountArrayInterface } from 'src/app/interfaces/vendor.order.count.array.interface';
import { Router } from '@angular/router';
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
  selector: 'app-dashboard',
  imports: [FormsModule, ReactiveFormsModule, MaterialModule, NgApexchartsModule, NgIcon],
  templateUrl: './dashboard.html',
})
export class Dashboard {

  @ViewChild('paginatorOrderTrending', { read: MatPaginator, static: false }) paginatorOrderTrending: MatPaginator;
  @ViewChild('paginatorPosTrending', { read: MatPaginator, static: false }) paginatorPosTrending: MatPaginator;
  @ViewChild('paginatorTableOrderTrending', { read: MatPaginator, static: false }) paginatorTableOrderTrending: MatPaginator;
  @ViewChild('orderChart') orderChart: ChartComponent = Object.create(null);
  @ViewChild('posChart') posChart: ChartComponent = Object.create(null);
  @ViewChild('tableOrderChart') tableOrderChart: ChartComponent = Object.create(null);
  public orderChartOptions: Partial<ChartOptions> | any;
  public posChartOptions: Partial<ChartOptions> | any;
  public tableOrderChartOptions: Partial<ChartOptions> | any;
  orderUnit: string = 'all';
  isLoaded: boolean = false;
  trendingColumn = ['name', 'detail'];
  orderTotalSold: number = 0;
  orderAverageSold: number = 0;
  orderTrendingItem = new MatTableDataSource<VendorBusinessInsightTrendingFoodInterface>([]);
  orderStatsStart: string = '';
  orderStatsEnd: string = '';
  posTotalSold: number = 0;
  posAverageSold: number = 0;
  posTrendingItem = new MatTableDataSource<VendorBusinessInsightTrendingFoodInterface>([]);
  posStatsStart: string = '';
  posStatsEnd: string = '';
  tableOrderTotalSold: number = 0;
  tableOrderAverageSold: number = 0;
  tableOrderTrendingItem = new MatTableDataSource<VendorBusinessInsightTrendingFoodInterface>([]);
  tableOrderStatsStart: string = '';
  tableOrderStatsEnd: string = '';
  posPermission: boolean = false;
  tableOrderPermission: boolean = false;
  orderCount: VendorOrderCountArrayInterface[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {
    this.overAllInsight();
  }

  orderUnitChange(unit: string) {
    console.log(unit);
    if (unit == 'all') {
      this.overAllInsight();
    } else if (unit == 'month') {
      this.monthlyInsight();
    } else if (unit == 'week') {
      this.weeklyInsight();
    } else if (unit == 'today') {
      this.todayInsight();
    }
  }

  overAllInsight() {
    console.log('Overall Insight');
    const spinnerRef = this.util.start('ts_fetching');
    this.isLoaded = false;
    this.api.get_private('v1/vendor_web/business/web_overall_insight/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        if (response && response.success) {

          const orderCount: VendorOrderCountArrayInterface[] = [
            {
              "img": "assets/orders/cancelled_order.png",
              "color": "success",
              "title": this.util.appTranslate('all_orders'),
              "desc": this.util.numberFormat(response.allOrder),
              "key": "cancelled"
            },
            {
              "img": "assets/orders/fresh_order.png",
              "color": "warning",
              "title": this.util.appTranslate('new_orders'),
              "desc": this.util.numberFormat(response.newOrder),
              "key": "fresh"
            },
            {
              "img": "assets/orders/preparing_order.png",
              "color": "secondary",
              "title": this.util.appTranslate('preparing_orders'),
              "desc": this.util.numberFormat(response.preparingOrder),
              "key": "preparing"
            },
            {
              "img": "assets/orders/ready_order.png",
              "color": "error",
              "title": this.util.appTranslate('ready_orders'),
              "desc": this.util.numberFormat(response.readyOrder),
              "key": "ready"
            },
            {
              "img": "assets/orders/handover_order.png",
              "color": "error",
              "title": this.util.appTranslate('handover_orders'),
              "desc": this.util.numberFormat(response.handoverOrder),
              "key": "handover"
            },
            {
              "img": "assets/orders/ongoing.png",
              "color": "secondary",
              "title": this.util.appTranslate('ongoing_orders'),
              "desc": this.util.numberFormat(response.ongoingOrder),
              "key": "ongoing"
            },
            {
              "img": "assets/orders/delivered_order.png",
              "color": "warning",
              "title": this.util.appTranslate('delivered_orders'),
              "desc": this.util.numberFormat(response.deliveredOrder),
              "key": "delivered"
            },
            {
              "img": "assets/orders/rejected_order.png",
              "color": "primary",
              "title": this.util.appTranslate('rejected_orders'),
              "desc": this.util.numberFormat(response.rejectedOrder),
              "key": "rejected"
            },
          ];
          this.orderCount = orderCount;

          if (response && response.orderTotalSold) {
            this.orderTotalSold = response.orderTotalSold.totalSold;
            this.orderAverageSold = response.orderTotalSold.averageSold;
          }

          if (response && response.orderMinMaxDate && response.orderMinMaxDate.min && response.orderMinMaxDate.max) {
            this.orderStatsStart = DateTime.fromISO(response.orderMinMaxDate.min).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
            this.orderStatsEnd = DateTime.fromISO(response.orderMinMaxDate.max).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
          } else {
            this.orderStatsStart = '';
            this.orderStatsEnd = '';
          }

          if (response && response.orderChartData) {
            const chart = response.orderChartData;
            const chartSeries: number[] = [];
            const chartXCategories: string[] = [];
            chart.forEach((element: any) => {
              chartSeries.push(element.soldCount);
              chartXCategories.push(DateTime.fromISO(element.date).setLocale(this.util.appLocaleName()).toFormat('MMM dd, yyyy'));
            });
            this.orderChartOptions = {
              series: [
                {
                  name: this.util.appTranslate('sales'),
                  data: chartSeries,
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
              colors: ['#398bf7', '#06d79c'],
              legend: {
                show: false,
              },
              grid: {
                show: false,
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
                categories: chartXCategories,
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

          if (response && response.orderTrendingFoods) {
            response.orderTrendingFoods.forEach((element: any) => {
              let offerPrice: number = 0;
              if (element && element.foodDetails && element.foodDetails.name) {
                const food = element.foodDetails;
                let price: number = 0;
                if (food && food.price && food.price != null) {
                  price = food.price;
                  if (food.taxationEnable != null && food.taxationEnable != '' && food.taxationEnable == true) {
                    let taxPercentage: number = 0;
                    if (food.foodtaxations != null && food.foodtaxations.length > 0) {
                      food.foodtaxations.forEach((taxation: any) => {
                        taxPercentage = taxPercentage + taxation.taxAmount;
                      });
                    }
                    if (taxPercentage > 0) {
                      const basePrice = price;
                      const finalPriceString: string = (basePrice + (taxPercentage / 100) * basePrice).toFixed(2);
                      const finalPrice = parseFloat(finalPriceString).toFixed(2);
                      price = parseFloat(finalPrice);
                    }
                  }
                } else {
                  offerPrice = price;
                }
                if (food && food.discount && food.discount != null && food.discount != '') {
                  const discount = parseFloat(food.discount);
                  if (discount > 0) {
                    if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '%') {
                      const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(food.discount.toString()) / 100)).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    } else if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '$') {
                      const discountValue = (parseFloat(price.toString()) - parseFloat(food.discount.toString())).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    }
                  } else {
                    offerPrice = price;
                  }
                } else {
                  offerPrice = price;
                }
              }
              const total = (parseFloat(offerPrice.toString()) * parseFloat(element.count.toString())).toFixed(2);
              offerPrice = parseFloat(total);
              element.offerPrice = offerPrice;
            });
            const mappedList = response.orderTrendingFoods.map(
              (item: VendorBusinessInsightTrendingFoodInterface) => {
                if (item && item.foodDetails && item.foodDetails?.id) {
                  if (item.foodDetails?.translations) {
                    const translation = item.foodDetails.translations.find((t) => t.code == this.util.appLocaleName());
                    item.foodDetails.displayName = translation?.title || item.foodDetails.name;
                  } else {
                    item.foodDetails.displayName = item.foodDetails?.name || '';
                  }
                }
                return item;
              }
            );
            this.orderTrendingItem.data = mappedList;
            this.orderTrendingItem.paginator = this.paginatorOrderTrending;
          }

          if (response && response.posTotalSold) {
            this.posTotalSold = response.posTotalSold.totalSold;
            this.posAverageSold = response.posTotalSold.averageSold;
          }

          if (response && response.posChartData) {
            const chart = response.posChartData;
            const chartSeries: number[] = [];
            const chartXCategories: string[] = [];
            chart.forEach((element: any) => {
              chartSeries.push(element.soldCount);
              chartXCategories.push(DateTime.fromISO(element.date).setLocale(this.util.appLocaleName()).toFormat('MMM dd, yyyy'));
            });
            this.posChartOptions = {
              series: [
                {
                  name: this.util.appTranslate('sales'),
                  data: chartSeries,
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
              colors: ['#398bf7', '#06d79c'],
              legend: {
                show: false,
              },
              grid: {
                show: false,
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
                categories: chartXCategories,
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

          if (response && response.posTrendingFoods) {
            response.posTrendingFoods.forEach((element: any) => {
              let offerPrice: number = 0;
              if (element && element.foodDetails && element.foodDetails.name) {
                const food = element.foodDetails;
                let price: number = 0;
                if (food && food.price && food.price != null) {
                  price = food.price;
                  if (food.taxationEnable != null && food.taxationEnable != '' && food.taxationEnable == true) {
                    let taxPercentage: number = 0;
                    if (food.foodtaxations != null && food.foodtaxations.length > 0) {
                      food.foodtaxations.forEach((taxation: any) => {
                        taxPercentage = taxPercentage + taxation.taxAmount;
                      });
                    }
                    if (taxPercentage > 0) {
                      const basePrice = price;
                      const finalPriceString: string = (basePrice + (taxPercentage / 100) * basePrice).toFixed(2);
                      const finalPrice = parseFloat(finalPriceString).toFixed(2);
                      price = parseFloat(finalPrice);
                    }
                  }
                } else {
                  offerPrice = price;
                }
                if (food && food.discount && food.discount != null && food.discount != '') {
                  const discount = parseFloat(food.discount);
                  if (discount > 0) {
                    if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '%') {
                      const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(food.discount.toString()) / 100)).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    } else if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '$') {
                      const discountValue = (parseFloat(price.toString()) - parseFloat(food.discount.toString())).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    }
                  } else {
                    offerPrice = price;
                  }
                } else {
                  offerPrice = price;
                }
              }
              const total = (parseFloat(offerPrice.toString()) * parseFloat(element.count.toString())).toFixed(2);
              offerPrice = parseFloat(total);
              element.offerPrice = offerPrice;
            });
            const mappedList = response.posTrendingFoods.map(
              (item: VendorBusinessInsightTrendingFoodInterface) => {
                if (item && item.foodDetails && item.foodDetails?.id) {
                  if (item.foodDetails?.translations) {
                    const translation = item.foodDetails.translations.find((t) => t.code == this.util.appLocaleName());
                    item.foodDetails.displayName = translation?.title || item.foodDetails.name;
                  } else {
                    item.foodDetails.displayName = item.foodDetails?.name || '';
                  }
                }
                return item;
              }
            );
            this.posTrendingItem.data = mappedList;
            this.posTrendingItem.paginator = this.paginatorPosTrending;
          }

          if (response && response.posMinMaxDate && response.posMinMaxDate.min && response.posMinMaxDate.max) {
            this.posStatsStart = DateTime.fromISO(response.posMinMaxDate.min).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
            this.posStatsEnd = DateTime.fromISO(response.posMinMaxDate.max).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
          } else {
            this.posStatsStart = '';
            this.posStatsEnd = '';
          }

          if (response && response.tableOrderTotalSold) {
            this.tableOrderTotalSold = response.tableOrderTotalSold.totalSold;
            this.tableOrderAverageSold = response.tableOrderTotalSold.averageSold;
          }

          if (response && response.tableOrderTrendingFoods) {
            response.tableOrderTrendingFoods.forEach((element: any) => {
              let offerPrice: number = 0;
              if (element && element.foodDetails && element.foodDetails.name) {
                const food = element.foodDetails;
                let price: number = 0;
                if (food && food.price && food.price != null) {
                  price = food.price;
                  if (food.taxationEnable != null && food.taxationEnable != '' && food.taxationEnable == true) {
                    let taxPercentage: number = 0;
                    if (food.foodtaxations != null && food.foodtaxations.length > 0) {
                      food.foodtaxations.forEach((taxation: any) => {
                        taxPercentage = taxPercentage + taxation.taxAmount;
                      });
                    }
                    if (taxPercentage > 0) {
                      const basePrice = price;
                      const finalPriceString: string = (basePrice + (taxPercentage / 100) * basePrice).toFixed(2);
                      const finalPrice = parseFloat(finalPriceString).toFixed(2);
                      price = parseFloat(finalPrice);
                    }
                  }
                } else {
                  offerPrice = price;
                }
                if (food && food.discount && food.discount != null && food.discount != '') {
                  const discount = parseFloat(food.discount);
                  if (discount > 0) {
                    if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '%') {
                      const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(food.discount.toString()) / 100)).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    } else if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '$') {
                      const discountValue = (parseFloat(price.toString()) - parseFloat(food.discount.toString())).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    }
                  } else {
                    offerPrice = price;
                  }
                } else {
                  offerPrice = price;
                }
              }
              const total = (parseFloat(offerPrice.toString()) * parseFloat(element.count.toString())).toFixed(2);
              offerPrice = parseFloat(total);
              element.offerPrice = offerPrice;
            });
            const mappedList = response.tableOrderTrendingFoods.map(
              (item: VendorBusinessInsightTrendingFoodInterface) => {
                if (item && item.foodDetails && item.foodDetails?.id) {
                  if (item.foodDetails?.translations) {
                    const translation = item.foodDetails.translations.find((t) => t.code == this.util.appLocaleName());
                    item.foodDetails.displayName = translation?.title || item.foodDetails.name;
                  } else {
                    item.foodDetails.displayName = item.foodDetails?.name || '';
                  }
                }
                return item;
              }
            );
            this.tableOrderTrendingItem.data = mappedList;
            this.tableOrderTrendingItem.paginator = this.paginatorTableOrderTrending;
          }

          if (response && response.tableOrderChartData) {
            const chart = response.tableOrderChartData;
            const chartSeries: number[] = [];
            const chartXCategories: string[] = [];
            chart.forEach((element: any) => {
              chartSeries.push(element.soldCount);
              chartXCategories.push(DateTime.fromISO(element.date).setLocale(this.util.appLocaleName()).toFormat('MMM dd, yyyy'));
            });
            this.tableOrderChartOptions = {
              series: [
                {
                  name: this.util.appTranslate('sales'),
                  data: chartSeries,
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
              colors: ['#398bf7', '#06d79c'],
              legend: {
                show: false,
              },
              grid: {
                show: false,
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
                categories: chartXCategories,
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

          if (response && response.tableOrderMinMaxDate && response.tableOrderMinMaxDate.min && response.tableOrderMinMaxDate.max) {
            this.tableOrderStatsStart = DateTime.fromISO(response.tableOrderMinMaxDate.min).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
            this.tableOrderStatsEnd = DateTime.fromISO(response.tableOrderMinMaxDate.max).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
          } else {
            this.tableOrderStatsStart = '';
            this.tableOrderStatsEnd = '';
          }

          if (response && response.permission) {
            const permission = response.permission;
            this.posPermission = permission.pos;
            this.tableOrderPermission = permission.tableOrder;
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  monthlyInsight() {
    console.log('Monthly Insight');
    const spinnerRef = this.util.start('ts_fetching');
    this.isLoaded = false;
    this.api.get_private('v1/vendor_web/business/web_monthly_insight/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        if (response && response.success) {
          const orderCount: VendorOrderCountArrayInterface[] = [
            {
              "img": "assets/orders/cancelled_order.png",
              "color": "success",
              "title": this.util.appTranslate('all_orders'),
              "desc": this.util.numberFormat(response.allOrder),
              "key": "cancelled"
            },
            {
              "img": "assets/orders/fresh_order.png",
              "color": "warning",
              "title": this.util.appTranslate('new_orders'),
              "desc": this.util.numberFormat(response.newOrder),
              "key": "fresh"
            },
            {
              "img": "assets/orders/preparing_order.png",
              "color": "secondary",
              "title": this.util.appTranslate('preparing_orders'),
              "desc": this.util.numberFormat(response.preparingOrder),
              "key": "preparing"
            },
            {
              "img": "assets/orders/ready_order.png",
              "color": "error",
              "title": this.util.appTranslate('ready_orders'),
              "desc": this.util.numberFormat(response.readyOrder),
              "key": "ready"
            },
            {
              "img": "assets/orders/handover_order.png",
              "color": "error",
              "title": this.util.appTranslate('handover_orders'),
              "desc": this.util.numberFormat(response.handoverOrder),
              "key": "handover"
            },
            {
              "img": "assets/orders/ongoing.png",
              "color": "secondary",
              "title": this.util.appTranslate('ongoing_orders'),
              "desc": this.util.numberFormat(response.ongoingOrder),
              "key": "ongoing"
            },
            {
              "img": "assets/orders/delivered_order.png",
              "color": "warning",
              "title": this.util.appTranslate('delivered_orders'),
              "desc": this.util.numberFormat(response.deliveredOrder),
              "key": "delivered"
            },
            {
              "img": "assets/orders/rejected_order.png",
              "color": "primary",
              "title": this.util.appTranslate('rejected_orders'),
              "desc": this.util.numberFormat(response.rejectedOrder),
              "key": "rejected"
            },
          ];
          this.orderCount = orderCount;

          if (response && response.orderTotalSold) {
            this.orderTotalSold = response.orderTotalSold.totalSold;
            this.orderAverageSold = response.orderTotalSold.averageSold;
          }

          if (response && response.orderMinMaxDate && response.orderMinMaxDate.min && response.orderMinMaxDate.max) {
            this.orderStatsStart = DateTime.fromISO(response.orderMinMaxDate.min).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
            this.orderStatsEnd = DateTime.fromISO(response.orderMinMaxDate.max).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
          } else {
            this.orderStatsStart = '';
            this.orderStatsEnd = '';
          }

          if (response && response.orderChartData) {
            const chart = response.orderChartData;
            const chartSeries: number[] = [];
            const chartXCategories: string[] = [];
            chart.forEach((element: any) => {
              chartSeries.push(element.soldCount);
              chartXCategories.push(DateTime.fromISO(element.date).setLocale(this.util.appLocaleName()).toFormat('MMM dd, yyyy'));
            });
            this.orderChartOptions = {
              series: [
                {
                  name: this.util.appTranslate('sales'),
                  data: chartSeries,
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
              colors: ['#398bf7', '#06d79c'],
              legend: {
                show: false,
              },
              grid: {
                show: false,
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
                categories: chartXCategories,
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

          if (response && response.orderTrendingFoods) {
            response.orderTrendingFoods.forEach((element: any) => {
              let offerPrice: number = 0;
              if (element && element.foodDetails && element.foodDetails.name) {
                const food = element.foodDetails;
                let price: number = 0;
                if (food && food.price && food.price != null) {
                  price = food.price;
                  if (food.taxationEnable != null && food.taxationEnable != '' && food.taxationEnable == true) {
                    let taxPercentage: number = 0;
                    if (food.foodtaxations != null && food.foodtaxations.length > 0) {
                      food.foodtaxations.forEach((taxation: any) => {
                        taxPercentage = taxPercentage + taxation.taxAmount;
                      });
                    }
                    if (taxPercentage > 0) {
                      const basePrice = price;
                      const finalPriceString: string = (basePrice + (taxPercentage / 100) * basePrice).toFixed(2);
                      const finalPrice = parseFloat(finalPriceString).toFixed(2);
                      price = parseFloat(finalPrice);
                    }
                  }
                } else {
                  offerPrice = price;
                }
                if (food && food.discount && food.discount != null && food.discount != '') {
                  const discount = parseFloat(food.discount);
                  if (discount > 0) {
                    if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '%') {
                      const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(food.discount.toString()) / 100)).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    } else if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '$') {
                      const discountValue = (parseFloat(price.toString()) - parseFloat(food.discount.toString())).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    }
                  } else {
                    offerPrice = price;
                  }
                } else {
                  offerPrice = price;
                }
              }
              const total = (parseFloat(offerPrice.toString()) * parseFloat(element.count.toString())).toFixed(2);
              offerPrice = parseFloat(total);
              element.offerPrice = offerPrice;
            });
            const mappedList = response.orderTrendingFoods.map(
              (item: VendorBusinessInsightTrendingFoodInterface) => {
                if (item && item.foodDetails && item.foodDetails?.id) {
                  if (item.foodDetails?.translations) {
                    const translation = item.foodDetails.translations.find((t) => t.code == this.util.appLocaleName());
                    item.foodDetails.displayName = translation?.title || item.foodDetails.name;
                  } else {
                    item.foodDetails.displayName = item.foodDetails?.name || '';
                  }
                }
                return item;
              }
            );
            this.orderTrendingItem.data = mappedList;
            this.orderTrendingItem.paginator = this.paginatorOrderTrending;
          }

          if (response && response.posTotalSold) {
            this.posTotalSold = response.posTotalSold.totalSold;
            this.posAverageSold = response.posTotalSold.averageSold;
          }

          if (response && response.posChartData) {
            const chart = response.posChartData;
            const chartSeries: number[] = [];
            const chartXCategories: string[] = [];
            chart.forEach((element: any) => {
              chartSeries.push(element.soldCount);
              chartXCategories.push(DateTime.fromISO(element.date).setLocale(this.util.appLocaleName()).toFormat('MMM dd, yyyy'));
            });
            this.posChartOptions = {
              series: [
                {
                  name: this.util.appTranslate('sales'),
                  data: chartSeries,
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
              colors: ['#398bf7', '#06d79c'],
              legend: {
                show: false,
              },
              grid: {
                show: false,
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
                categories: chartXCategories,
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

          if (response && response.posTrendingFoods) {
            response.posTrendingFoods.forEach((element: any) => {
              let offerPrice: number = 0;
              if (element && element.foodDetails && element.foodDetails.name) {
                const food = element.foodDetails;
                let price: number = 0;
                if (food && food.price && food.price != null) {
                  price = food.price;
                  if (food.taxationEnable != null && food.taxationEnable != '' && food.taxationEnable == true) {
                    let taxPercentage: number = 0;
                    if (food.foodtaxations != null && food.foodtaxations.length > 0) {
                      food.foodtaxations.forEach((taxation: any) => {
                        taxPercentage = taxPercentage + taxation.taxAmount;
                      });
                    }
                    if (taxPercentage > 0) {
                      const basePrice = price;
                      const finalPriceString: string = (basePrice + (taxPercentage / 100) * basePrice).toFixed(2);
                      const finalPrice = parseFloat(finalPriceString).toFixed(2);
                      price = parseFloat(finalPrice);
                    }
                  }
                } else {
                  offerPrice = price;
                }
                if (food && food.discount && food.discount != null && food.discount != '') {
                  const discount = parseFloat(food.discount);
                  if (discount > 0) {
                    if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '%') {
                      const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(food.discount.toString()) / 100)).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    } else if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '$') {
                      const discountValue = (parseFloat(price.toString()) - parseFloat(food.discount.toString())).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    }
                  } else {
                    offerPrice = price;
                  }
                } else {
                  offerPrice = price;
                }
              }
              const total = (parseFloat(offerPrice.toString()) * parseFloat(element.count.toString())).toFixed(2);
              offerPrice = parseFloat(total);
              element.offerPrice = offerPrice;
            });
            const mappedList = response.posTrendingFoods.map(
              (item: VendorBusinessInsightTrendingFoodInterface) => {
                if (item && item.foodDetails && item.foodDetails?.id) {
                  if (item.foodDetails?.translations) {
                    const translation = item.foodDetails.translations.find((t) => t.code == this.util.appLocaleName());
                    item.foodDetails.displayName = translation?.title || item.foodDetails.name;
                  } else {
                    item.foodDetails.displayName = item.foodDetails?.name || '';
                  }
                }
                return item;
              }
            );
            this.posTrendingItem.data = mappedList;
            this.posTrendingItem.paginator = this.paginatorPosTrending;
          }

          if (response && response.posMinMaxDate && response.posMinMaxDate.min && response.posMinMaxDate.max) {
            this.posStatsStart = DateTime.fromISO(response.posMinMaxDate.min).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
            this.posStatsEnd = DateTime.fromISO(response.posMinMaxDate.max).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
          } else {
            this.posStatsStart = '';
            this.posStatsEnd = '';
          }

          if (response && response.tableOrderTotalSold) {
            this.tableOrderTotalSold = response.tableOrderTotalSold.totalSold;
            this.tableOrderAverageSold = response.tableOrderTotalSold.averageSold;
          }

          if (response && response.tableOrderTrendingFoods) {
            response.tableOrderTrendingFoods.forEach((element: any) => {
              let offerPrice: number = 0;
              if (element && element.foodDetails && element.foodDetails.name) {
                const food = element.foodDetails;
                let price: number = 0;
                if (food && food.price && food.price != null) {
                  price = food.price;
                  if (food.taxationEnable != null && food.taxationEnable != '' && food.taxationEnable == true) {
                    let taxPercentage: number = 0;
                    if (food.foodtaxations != null && food.foodtaxations.length > 0) {
                      food.foodtaxations.forEach((taxation: any) => {
                        taxPercentage = taxPercentage + taxation.taxAmount;
                      });
                    }
                    if (taxPercentage > 0) {
                      const basePrice = price;
                      const finalPriceString: string = (basePrice + (taxPercentage / 100) * basePrice).toFixed(2);
                      const finalPrice = parseFloat(finalPriceString).toFixed(2);
                      price = parseFloat(finalPrice);
                    }
                  }
                } else {
                  offerPrice = price;
                }
                if (food && food.discount && food.discount != null && food.discount != '') {
                  const discount = parseFloat(food.discount);
                  if (discount > 0) {
                    if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '%') {
                      const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(food.discount.toString()) / 100)).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    } else if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '$') {
                      const discountValue = (parseFloat(price.toString()) - parseFloat(food.discount.toString())).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    }
                  } else {
                    offerPrice = price;
                  }
                } else {
                  offerPrice = price;
                }
              }
              const total = (parseFloat(offerPrice.toString()) * parseFloat(element.count.toString())).toFixed(2);
              offerPrice = parseFloat(total);
              element.offerPrice = offerPrice;
            });
            const mappedList = response.tableOrderTrendingFoods.map(
              (item: VendorBusinessInsightTrendingFoodInterface) => {
                if (item && item.foodDetails && item.foodDetails?.id) {
                  if (item.foodDetails?.translations) {
                    const translation = item.foodDetails.translations.find((t) => t.code == this.util.appLocaleName());
                    item.foodDetails.displayName = translation?.title || item.foodDetails.name;
                  } else {
                    item.foodDetails.displayName = item.foodDetails?.name || '';
                  }
                }
                return item;
              }
            );
            this.tableOrderTrendingItem.data = mappedList;
            this.tableOrderTrendingItem.paginator = this.paginatorTableOrderTrending;
          }

          if (response && response.tableOrderChartData) {
            const chart = response.tableOrderChartData;
            const chartSeries: number[] = [];
            const chartXCategories: string[] = [];
            chart.forEach((element: any) => {
              chartSeries.push(element.soldCount);
              chartXCategories.push(DateTime.fromISO(element.date).setLocale(this.util.appLocaleName()).toFormat('MMM dd, yyyy'));
            });
            this.tableOrderChartOptions = {
              series: [
                {
                  name: this.util.appTranslate('sales'),
                  data: chartSeries,
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
              colors: ['#398bf7', '#06d79c'],
              legend: {
                show: false,
              },
              grid: {
                show: false,
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
                categories: chartXCategories,
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

          if (response && response.tableOrderMinMaxDate && response.tableOrderMinMaxDate.min && response.tableOrderMinMaxDate.max) {
            this.tableOrderStatsStart = DateTime.fromISO(response.tableOrderMinMaxDate.min).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
            this.tableOrderStatsEnd = DateTime.fromISO(response.tableOrderMinMaxDate.max).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
          } else {
            this.tableOrderStatsStart = '';
            this.tableOrderStatsEnd = '';
          }

          if (response && response.permission) {
            const permission = response.permission;
            this.posPermission = permission.pos;
            this.tableOrderPermission = permission.tableOrder;
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  weeklyInsight() {
    console.log('Weekly Insight');
    const spinnerRef = this.util.start('ts_fetching');
    this.isLoaded = false;
    this.api.get_private('v1/vendor_web/business/web_weekly_insight/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        if (response && response.success) {
          const orderCount: VendorOrderCountArrayInterface[] = [
            {
              "img": "assets/orders/cancelled_order.png",
              "color": "success",
              "title": this.util.appTranslate('all_orders'),
              "desc": this.util.numberFormat(response.allOrder),
              "key": "cancelled"
            },
            {
              "img": "assets/orders/fresh_order.png",
              "color": "warning",
              "title": this.util.appTranslate('new_orders'),
              "desc": this.util.numberFormat(response.newOrder),
              "key": "fresh"
            },
            {
              "img": "assets/orders/preparing_order.png",
              "color": "secondary",
              "title": this.util.appTranslate('preparing_orders'),
              "desc": this.util.numberFormat(response.preparingOrder),
              "key": "preparing"
            },
            {
              "img": "assets/orders/ready_order.png",
              "color": "error",
              "title": this.util.appTranslate('ready_orders'),
              "desc": this.util.numberFormat(response.readyOrder),
              "key": "ready"
            },
            {
              "img": "assets/orders/handover_order.png",
              "color": "error",
              "title": this.util.appTranslate('handover_orders'),
              "desc": this.util.numberFormat(response.handoverOrder),
              "key": "handover"
            },
            {
              "img": "assets/orders/ongoing.png",
              "color": "secondary",
              "title": this.util.appTranslate('ongoing_orders'),
              "desc": this.util.numberFormat(response.ongoingOrder),
              "key": "ongoing"
            },
            {
              "img": "assets/orders/delivered_order.png",
              "color": "warning",
              "title": this.util.appTranslate('delivered_orders'),
              "desc": this.util.numberFormat(response.deliveredOrder),
              "key": "delivered"
            },
            {
              "img": "assets/orders/rejected_order.png",
              "color": "primary",
              "title": this.util.appTranslate('rejected_orders'),
              "desc": this.util.numberFormat(response.rejectedOrder),
              "key": "rejected"
            },
          ];
          this.orderCount = orderCount;

          if (response && response.orderTotalSold) {
            this.orderTotalSold = response.orderTotalSold.totalSold;
            this.orderAverageSold = response.orderTotalSold.averageSold;
          }

          if (response && response.orderMinMaxDate && response.orderMinMaxDate.min && response.orderMinMaxDate.max) {
            this.orderStatsStart = DateTime.fromISO(response.orderMinMaxDate.min).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
            this.orderStatsEnd = DateTime.fromISO(response.orderMinMaxDate.max).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
          } else {
            this.orderStatsStart = '';
            this.orderStatsEnd = '';
          }

          if (response && response.orderChartData) {
            const chart = response.orderChartData;
            const chartSeries: number[] = [];
            const chartXCategories: string[] = [];
            chart.forEach((element: any) => {
              chartSeries.push(element.soldCount);
              chartXCategories.push(DateTime.fromISO(element.date).setLocale(this.util.appLocaleName()).toFormat('MMM dd, yyyy'));
            });
            this.orderChartOptions = {
              series: [
                {
                  name: this.util.appTranslate('sales'),
                  data: chartSeries,
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
              colors: ['#398bf7', '#06d79c'],
              legend: {
                show: false,
              },
              grid: {
                show: false,
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
                categories: chartXCategories,
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

          if (response && response.orderTrendingFoods) {
            response.orderTrendingFoods.forEach((element: any) => {
              let offerPrice: number = 0;
              if (element && element.foodDetails && element.foodDetails.name) {
                const food = element.foodDetails;
                let price: number = 0;
                if (food && food.price && food.price != null) {
                  price = food.price;
                  if (food.taxationEnable != null && food.taxationEnable != '' && food.taxationEnable == true) {
                    let taxPercentage: number = 0;
                    if (food.foodtaxations != null && food.foodtaxations.length > 0) {
                      food.foodtaxations.forEach((taxation: any) => {
                        taxPercentage = taxPercentage + taxation.taxAmount;
                      });
                    }
                    if (taxPercentage > 0) {
                      const basePrice = price;
                      const finalPriceString: string = (basePrice + (taxPercentage / 100) * basePrice).toFixed(2);
                      const finalPrice = parseFloat(finalPriceString).toFixed(2);
                      price = parseFloat(finalPrice);
                    }
                  }
                } else {
                  offerPrice = price;
                }
                if (food && food.discount && food.discount != null && food.discount != '') {
                  const discount = parseFloat(food.discount);
                  if (discount > 0) {
                    if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '%') {
                      const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(food.discount.toString()) / 100)).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    } else if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '$') {
                      const discountValue = (parseFloat(price.toString()) - parseFloat(food.discount.toString())).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    }
                  } else {
                    offerPrice = price;
                  }
                } else {
                  offerPrice = price;
                }
              }
              const total = (parseFloat(offerPrice.toString()) * parseFloat(element.count.toString())).toFixed(2);
              offerPrice = parseFloat(total);
              element.offerPrice = offerPrice;
            });
            const mappedList = response.orderTrendingFoods.map(
              (item: VendorBusinessInsightTrendingFoodInterface) => {
                if (item && item.foodDetails && item.foodDetails?.id) {
                  if (item.foodDetails?.translations) {
                    const translation = item.foodDetails.translations.find((t) => t.code == this.util.appLocaleName());
                    item.foodDetails.displayName = translation?.title || item.foodDetails.name;
                  } else {
                    item.foodDetails.displayName = item.foodDetails?.name || '';
                  }
                }
                return item;
              }
            );
            this.orderTrendingItem.data = mappedList;
            this.orderTrendingItem.paginator = this.paginatorOrderTrending;
          }

          if (response && response.posTotalSold) {
            this.posTotalSold = response.posTotalSold.totalSold;
            this.posAverageSold = response.posTotalSold.averageSold;
          }

          if (response && response.posChartData) {
            const chart = response.posChartData;
            const chartSeries: number[] = [];
            const chartXCategories: string[] = [];
            chart.forEach((element: any) => {
              chartSeries.push(element.soldCount);
              chartXCategories.push(DateTime.fromISO(element.date).setLocale(this.util.appLocaleName()).toFormat('MMM dd, yyyy'));
            });
            this.posChartOptions = {
              series: [
                {
                  name: this.util.appTranslate('sales'),
                  data: chartSeries,
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
              colors: ['#398bf7', '#06d79c'],
              legend: {
                show: false,
              },
              grid: {
                show: false,
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
                categories: chartXCategories,
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

          if (response && response.posTrendingFoods) {
            response.posTrendingFoods.forEach((element: any) => {
              let offerPrice: number = 0;
              if (element && element.foodDetails && element.foodDetails.name) {
                const food = element.foodDetails;
                let price: number = 0;
                if (food && food.price && food.price != null) {
                  price = food.price;
                  if (food.taxationEnable != null && food.taxationEnable != '' && food.taxationEnable == true) {
                    let taxPercentage: number = 0;
                    if (food.foodtaxations != null && food.foodtaxations.length > 0) {
                      food.foodtaxations.forEach((taxation: any) => {
                        taxPercentage = taxPercentage + taxation.taxAmount;
                      });
                    }
                    if (taxPercentage > 0) {
                      const basePrice = price;
                      const finalPriceString: string = (basePrice + (taxPercentage / 100) * basePrice).toFixed(2);
                      const finalPrice = parseFloat(finalPriceString).toFixed(2);
                      price = parseFloat(finalPrice);
                    }
                  }
                } else {
                  offerPrice = price;
                }
                if (food && food.discount && food.discount != null && food.discount != '') {
                  const discount = parseFloat(food.discount);
                  if (discount > 0) {
                    if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '%') {
                      const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(food.discount.toString()) / 100)).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    } else if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '$') {
                      const discountValue = (parseFloat(price.toString()) - parseFloat(food.discount.toString())).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    }
                  } else {
                    offerPrice = price;
                  }
                } else {
                  offerPrice = price;
                }
              }
              const total = (parseFloat(offerPrice.toString()) * parseFloat(element.count.toString())).toFixed(2);
              offerPrice = parseFloat(total);
              element.offerPrice = offerPrice;
            });
            const mappedList = response.posTrendingFoods.map(
              (item: VendorBusinessInsightTrendingFoodInterface) => {
                if (item && item.foodDetails && item.foodDetails?.id) {
                  if (item.foodDetails?.translations) {
                    const translation = item.foodDetails.translations.find((t) => t.code == this.util.appLocaleName());
                    item.foodDetails.displayName = translation?.title || item.foodDetails.name;
                  } else {
                    item.foodDetails.displayName = item.foodDetails?.name || '';
                  }
                }
                return item;
              }
            );
            this.posTrendingItem.data = mappedList;
            this.posTrendingItem.paginator = this.paginatorPosTrending;
          }

          if (response && response.posMinMaxDate && response.posMinMaxDate.min && response.posMinMaxDate.max) {
            this.posStatsStart = DateTime.fromISO(response.posMinMaxDate.min).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
            this.posStatsEnd = DateTime.fromISO(response.posMinMaxDate.max).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
          } else {
            this.posStatsStart = '';
            this.posStatsEnd = '';
          }

          if (response && response.tableOrderTotalSold) {
            this.tableOrderTotalSold = response.tableOrderTotalSold.totalSold;
            this.tableOrderAverageSold = response.tableOrderTotalSold.averageSold;
          }

          if (response && response.tableOrderTrendingFoods) {
            response.tableOrderTrendingFoods.forEach((element: any) => {
              let offerPrice: number = 0;
              if (element && element.foodDetails && element.foodDetails.name) {
                const food = element.foodDetails;
                let price: number = 0;
                if (food && food.price && food.price != null) {
                  price = food.price;
                  if (food.taxationEnable != null && food.taxationEnable != '' && food.taxationEnable == true) {
                    let taxPercentage: number = 0;
                    if (food.foodtaxations != null && food.foodtaxations.length > 0) {
                      food.foodtaxations.forEach((taxation: any) => {
                        taxPercentage = taxPercentage + taxation.taxAmount;
                      });
                    }
                    if (taxPercentage > 0) {
                      const basePrice = price;
                      const finalPriceString: string = (basePrice + (taxPercentage / 100) * basePrice).toFixed(2);
                      const finalPrice = parseFloat(finalPriceString).toFixed(2);
                      price = parseFloat(finalPrice);
                    }
                  }
                } else {
                  offerPrice = price;
                }
                if (food && food.discount && food.discount != null && food.discount != '') {
                  const discount = parseFloat(food.discount);
                  if (discount > 0) {
                    if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '%') {
                      const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(food.discount.toString()) / 100)).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    } else if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '$') {
                      const discountValue = (parseFloat(price.toString()) - parseFloat(food.discount.toString())).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    }
                  } else {
                    offerPrice = price;
                  }
                } else {
                  offerPrice = price;
                }
              }
              const total = (parseFloat(offerPrice.toString()) * parseFloat(element.count.toString())).toFixed(2);
              offerPrice = parseFloat(total);
              element.offerPrice = offerPrice;
            });
            const mappedList = response.tableOrderTrendingFoods.map(
              (item: VendorBusinessInsightTrendingFoodInterface) => {
                if (item && item.foodDetails && item.foodDetails?.id) {
                  if (item.foodDetails?.translations) {
                    const translation = item.foodDetails.translations.find((t) => t.code == this.util.appLocaleName());
                    item.foodDetails.displayName = translation?.title || item.foodDetails.name;
                  } else {
                    item.foodDetails.displayName = item.foodDetails?.name || '';
                  }
                }
                return item;
              }
            );
            this.tableOrderTrendingItem.data = mappedList;
            this.tableOrderTrendingItem.paginator = this.paginatorTableOrderTrending;
          }

          if (response && response.tableOrderChartData) {
            const chart = response.tableOrderChartData;
            const chartSeries: number[] = [];
            const chartXCategories: string[] = [];
            chart.forEach((element: any) => {
              chartSeries.push(element.soldCount);
              chartXCategories.push(DateTime.fromISO(element.date).setLocale(this.util.appLocaleName()).toFormat('MMM dd, yyyy'));
            });
            this.tableOrderChartOptions = {
              series: [
                {
                  name: this.util.appTranslate('sales'),
                  data: chartSeries,
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
              colors: ['#398bf7', '#06d79c'],
              legend: {
                show: false,
              },
              grid: {
                show: false,
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
                categories: chartXCategories,
              },
              tooltip: {
                theme: 'dark',
              },
            };
          }

          if (response && response.tableOrderMinMaxDate && response.tableOrderMinMaxDate.min && response.tableOrderMinMaxDate.max) {
            this.tableOrderStatsStart = DateTime.fromISO(response.tableOrderMinMaxDate.min).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
            this.tableOrderStatsEnd = DateTime.fromISO(response.tableOrderMinMaxDate.max).setLocale(this.util.appLocaleName()).toFormat('MMMM d, yyyy');
          } else {
            this.tableOrderStatsStart = '';
            this.tableOrderStatsEnd = '';
          }

          if (response && response.permission) {
            const permission = response.permission;
            this.posPermission = permission.pos;
            this.tableOrderPermission = permission.tableOrder;
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  todayInsight() {
    console.log('Today Insight');
    const spinnerRef = this.util.start('ts_fetching');
    this.isLoaded = false;
    this.api.get_private('v1/vendor_web/business/web_today_insight/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        if (response && response.success) {
          const orderCount: VendorOrderCountArrayInterface[] = [
            {
              "img": "assets/orders/cancelled_order.png",
              "color": "success",
              "title": this.util.appTranslate('all_orders'),
              "desc": this.util.numberFormat(response.allOrder),
              "key": "cancelled"
            },
            {
              "img": "assets/orders/fresh_order.png",
              "color": "warning",
              "title": this.util.appTranslate('new_orders'),
              "desc": this.util.numberFormat(response.newOrder),
              "key": "fresh"
            },
            {
              "img": "assets/orders/preparing_order.png",
              "color": "secondary",
              "title": this.util.appTranslate('preparing_orders'),
              "desc": this.util.numberFormat(response.preparingOrder),
              "key": "preparing"
            },
            {
              "img": "assets/orders/ready_order.png",
              "color": "error",
              "title": this.util.appTranslate('ready_orders'),
              "desc": this.util.numberFormat(response.readyOrder),
              "key": "ready"
            },
            {
              "img": "assets/orders/handover_order.png",
              "color": "error",
              "title": this.util.appTranslate('handover_orders'),
              "desc": this.util.numberFormat(response.handoverOrder),
              "key": "handover"
            },
            {
              "img": "assets/orders/ongoing.png",
              "color": "secondary",
              "title": this.util.appTranslate('ongoing_orders'),
              "desc": this.util.numberFormat(response.ongoingOrder),
              "key": "ongoing"
            },
            {
              "img": "assets/orders/delivered_order.png",
              "color": "warning",
              "title": this.util.appTranslate('delivered_orders'),
              "desc": this.util.numberFormat(response.deliveredOrder),
              "key": "delivered"
            },
            {
              "img": "assets/orders/rejected_order.png",
              "color": "primary",
              "title": this.util.appTranslate('rejected_orders'),
              "desc": this.util.numberFormat(response.rejectedOrder),
              "key": "rejected"
            },
          ];
          this.orderCount = orderCount;

          if (response && response.orderTotalSold) {
            this.orderTotalSold = response.orderTotalSold.totalSold;
            this.orderAverageSold = response.orderTotalSold.averageSold;
          }

          if (response && response.orderChartData) {
            const chart = response.orderChartData;
            const chartSeries: number[] = [];
            const chartXCategories: string[] = [];
            chart.forEach((element: any) => {
              chartSeries.push(element.soldCount);
              chartXCategories.push(DateTime.fromISO(element.date).setLocale(this.util.appLocaleName()).toFormat('MMM dd, yyyy'));
            });
            this.orderChartOptions = {
              series: [
                {
                  name: this.util.appTranslate('sales'),
                  data: chartSeries,
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
              colors: ['#398bf7', '#06d79c'],
              legend: {
                show: false,
              },
              grid: {
                show: false,
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
                categories: chartXCategories,
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

          if (response && response.orderTrendingFoods) {
            response.orderTrendingFoods.forEach((element: any) => {
              let offerPrice: number = 0;
              if (element && element.foodDetails && element.foodDetails.name) {
                const food = element.foodDetails;
                let price: number = 0;
                if (food && food.price && food.price != null) {
                  price = food.price;
                  if (food.taxationEnable != null && food.taxationEnable != '' && food.taxationEnable == true) {
                    let taxPercentage: number = 0;
                    if (food.foodtaxations != null && food.foodtaxations.length > 0) {
                      food.foodtaxations.forEach((taxation: any) => {
                        taxPercentage = taxPercentage + taxation.taxAmount;
                      });
                    }
                    if (taxPercentage > 0) {
                      const basePrice = price;
                      const finalPriceString: string = (basePrice + (taxPercentage / 100) * basePrice).toFixed(2);
                      const finalPrice = parseFloat(finalPriceString).toFixed(2);
                      price = parseFloat(finalPrice);
                    }
                  }
                } else {
                  offerPrice = price;
                }
                if (food && food.discount && food.discount != null && food.discount != '') {
                  const discount = parseFloat(food.discount);
                  if (discount > 0) {
                    if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '%') {
                      const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(food.discount.toString()) / 100)).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    } else if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '$') {
                      const discountValue = (parseFloat(price.toString()) - parseFloat(food.discount.toString())).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    }
                  } else {
                    offerPrice = price;
                  }
                } else {
                  offerPrice = price;
                }
              }
              const total = (parseFloat(offerPrice.toString()) * parseFloat(element.count.toString())).toFixed(2);
              offerPrice = parseFloat(total);
              element.offerPrice = offerPrice;
            });
            const mappedList = response.orderTrendingFoods.map(
              (item: VendorBusinessInsightTrendingFoodInterface) => {
                if (item && item.foodDetails && item.foodDetails?.id) {
                  if (item.foodDetails?.translations) {
                    const translation = item.foodDetails.translations.find((t) => t.code == this.util.appLocaleName());
                    item.foodDetails.displayName = translation?.title || item.foodDetails.name;
                  } else {
                    item.foodDetails.displayName = item.foodDetails?.name || '';
                  }
                }
                return item;
              }
            );
            this.orderTrendingItem.data = mappedList;
            this.orderTrendingItem.paginator = this.paginatorOrderTrending;
          }

          if (response && response.posTotalSold) {
            this.posTotalSold = response.posTotalSold.totalSold;
            this.posAverageSold = response.posTotalSold.averageSold;
          }

          if (response && response.posChartData) {
            const chart = response.posChartData;
            const chartSeries: number[] = [];
            const chartXCategories: string[] = [];
            chart.forEach((element: any) => {
              chartSeries.push(element.soldCount);
              chartXCategories.push(DateTime.fromISO(element.date).setLocale(this.util.appLocaleName()).toFormat('MMM dd, yyyy'));
            });
            this.posChartOptions = {
              series: [
                {
                  name: this.util.appTranslate('sales'),
                  data: chartSeries,
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
              colors: ['#398bf7', '#06d79c'],
              legend: {
                show: false,
              },
              grid: {
                show: false,
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
                categories: chartXCategories,
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

          if (response && response.posTrendingFoods) {
            response.posTrendingFoods.forEach((element: any) => {
              let offerPrice: number = 0;
              if (element && element.foodDetails && element.foodDetails.name) {
                const food = element.foodDetails;
                let price: number = 0;
                if (food && food.price && food.price != null) {
                  price = food.price;
                  if (food.taxationEnable != null && food.taxationEnable != '' && food.taxationEnable == true) {
                    let taxPercentage: number = 0;
                    if (food.foodtaxations != null && food.foodtaxations.length > 0) {
                      food.foodtaxations.forEach((taxation: any) => {
                        taxPercentage = taxPercentage + taxation.taxAmount;
                      });
                    }
                    if (taxPercentage > 0) {
                      const basePrice = price;
                      const finalPriceString: string = (basePrice + (taxPercentage / 100) * basePrice).toFixed(2);
                      const finalPrice = parseFloat(finalPriceString).toFixed(2);
                      price = parseFloat(finalPrice);
                    }
                  }
                } else {
                  offerPrice = price;
                }
                if (food && food.discount && food.discount != null && food.discount != '') {
                  const discount = parseFloat(food.discount);
                  if (discount > 0) {
                    if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '%') {
                      const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(food.discount.toString()) / 100)).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    } else if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '$') {
                      const discountValue = (parseFloat(price.toString()) - parseFloat(food.discount.toString())).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    }
                  } else {
                    offerPrice = price;
                  }
                } else {
                  offerPrice = price;
                }
              }
              const total = (parseFloat(offerPrice.toString()) * parseFloat(element.count.toString())).toFixed(2);
              offerPrice = parseFloat(total);
              element.offerPrice = offerPrice;
            });
            const mappedList = response.posTrendingFoods.map(
              (item: VendorBusinessInsightTrendingFoodInterface) => {
                if (item && item.foodDetails && item.foodDetails?.id) {
                  if (item.foodDetails?.translations) {
                    const translation = item.foodDetails.translations.find((t) => t.code == this.util.appLocaleName());
                    item.foodDetails.displayName = translation?.title || item.foodDetails.name;
                  } else {
                    item.foodDetails.displayName = item.foodDetails?.name || '';
                  }
                }
                return item;
              }
            );
            this.posTrendingItem.data = mappedList;
            this.posTrendingItem.paginator = this.paginatorPosTrending;
          }

          if (response && response.tableOrderTotalSold) {
            this.tableOrderTotalSold = response.tableOrderTotalSold.totalSold;
            this.tableOrderAverageSold = response.tableOrderTotalSold.averageSold;
          }

          if (response && response.tableOrderTrendingFoods) {
            response.tableOrderTrendingFoods.forEach((element: any) => {
              let offerPrice: number = 0;
              if (element && element.foodDetails && element.foodDetails.name) {
                const food = element.foodDetails;
                let price: number = 0;
                if (food && food.price && food.price != null) {
                  price = food.price;
                  if (food.taxationEnable != null && food.taxationEnable != '' && food.taxationEnable == true) {
                    let taxPercentage: number = 0;
                    if (food.foodtaxations != null && food.foodtaxations.length > 0) {
                      food.foodtaxations.forEach((taxation: any) => {
                        taxPercentage = taxPercentage + taxation.taxAmount;
                      });
                    }
                    if (taxPercentage > 0) {
                      const basePrice = price;
                      const finalPriceString: string = (basePrice + (taxPercentage / 100) * basePrice).toFixed(2);
                      const finalPrice = parseFloat(finalPriceString).toFixed(2);
                      price = parseFloat(finalPrice);
                    }
                  }
                } else {
                  offerPrice = price;
                }
                if (food && food.discount && food.discount != null && food.discount != '') {
                  const discount = parseFloat(food.discount);
                  if (discount > 0) {
                    if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '%') {
                      const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(food.discount.toString()) / 100)).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    } else if (food && food.discountType && food.discountType != null && food.discountType != '' && food.discountType == '$') {
                      const discountValue = (parseFloat(price.toString()) - parseFloat(food.discount.toString())).toFixed(2);
                      offerPrice = parseFloat(discountValue);
                    }
                  } else {
                    offerPrice = price;
                  }
                } else {
                  offerPrice = price;
                }
              }
              const total = (parseFloat(offerPrice.toString()) * parseFloat(element.count.toString())).toFixed(2);
              offerPrice = parseFloat(total);
              element.offerPrice = offerPrice;
            });
            const mappedList = response.tableOrderTrendingFoods.map(
              (item: VendorBusinessInsightTrendingFoodInterface) => {
                if (item && item.foodDetails && item.foodDetails?.id) {
                  if (item.foodDetails?.translations) {
                    const translation = item.foodDetails.translations.find((t) => t.code == this.util.appLocaleName());
                    item.foodDetails.displayName = translation?.title || item.foodDetails.name;
                  } else {
                    item.foodDetails.displayName = item.foodDetails?.name || '';
                  }
                }
                return item;
              }
            );
            this.tableOrderTrendingItem.data = mappedList;
            this.tableOrderTrendingItem.paginator = this.paginatorTableOrderTrending;
          }

          if (response && response.tableOrderChartData) {
            const chart = response.tableOrderChartData;
            const chartSeries: number[] = [];
            const chartXCategories: string[] = [];
            chart.forEach((element: any) => {
              chartSeries.push(element.soldCount);
              chartXCategories.push(DateTime.fromISO(element.date).setLocale(this.util.appLocaleName()).toFormat('MMM dd, yyyy'));
            });
            this.tableOrderChartOptions = {
              series: [
                {
                  name: this.util.appTranslate('sales'),
                  data: chartSeries,
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
              colors: ['#398bf7', '#06d79c'],
              legend: {
                show: false,
              },
              grid: {
                show: false,
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
                categories: chartXCategories,
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

          if (response && response.permission) {
            const permission = response.permission;
            this.posPermission = permission.pos;
            this.tableOrderPermission = permission.tableOrder;
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onOrderCountClick(item: VendorOrderCountArrayInterface) {
    console.log(item);
    this.router.navigate(['vendor/order-management/orders-list']);
  }

}
