import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { DateTime } from 'luxon';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ApexAxisChartSeries, ApexChart, ChartComponent, ApexDataLabels, ApexYAxis, ApexLegend, ApexXAxis, ApexTooltip, ApexTheme, ApexGrid, ApexPlotOptions, ApexFill } from 'ng-apexcharts';
import { ActivatedRoute } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgIcon } from '@ng-icons/core';
import { CommonModule } from '@angular/common';

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
  selector: 'app-accountant-customer-detail',
  imports: [MaterialModule, NgApexchartsModule, CommonModule, NgIcon],
  templateUrl: './accountant-customer-detail.html',
})
export class AccountantCustomerDetail {

  @ViewChild('orderStatsChart') orderStatsChart: ChartComponent = Object.create(null);
  public orderStatsChartOptions: Partial<ChartOptions> | any;

  @ViewChild('diningStatsChart') diningStatsChart: ChartComponent = Object.create(null);
  public diningStatsChartOptions: Partial<ChartOptions> | any;

  @ViewChild('tiffinStatsChart') tiffinStatsChart: ChartComponent = Object.create(null);
  public tiffinStatsChartOptions: Partial<ChartOptions> | any;

  cover: string = '';
  name: string = '';
  role: string = 'user';
  email: string = '';
  contact: string = '';
  joined: string = '';

  walletBalance: number = 0;
  loyaltyPoints: number = 0;

  totalOrder: number = 0;
  totalOrderSpent: number = 0;

  totalOrderRefundRequest: number = 0;
  totalOrderRefundReceived: number = 0;

  totalDiningBooking: number = 0;
  totalDiningBookingSpent: number = 0;

  totalDiningBookingRefundRequest: number = 0;
  totalDiningBookingRefundReceived: number = 0;

  totalTiffinPackage: number = 0;
  totalTiffinPackageSpent: number = 0;

  totalTiffinPackageRefundRequest: number = 0;
  totalTiffinPackageRefundReceived: number = 0;

  favRest: number = 0;
  favFood: number = 0;
  favOrders: number = 0;
  address: number = 0;
  medias: number = 0;
  restaurantReviews: number = 0;
  foodReviews: number = 0;
  deliverymanReviews: number = 0;
  hiddenRest: number = 0;

  userId: string = '';
  constructor(
    public util: UtilService,
    public api: ApiService,
    private location: Location,
    private route: ActivatedRoute,
  ) {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.userId != '') {
      this.orderStatsChartOptions = {
        series: [0, 0],
        chart: {
          type: 'donut',
          fontFamily: "'Plus Jakarta Sans', sans-serif;",
          toolbar: {
            show: false,
          },
          height: 275,
        },
        labels: [this.util.appTranslate('total_spent'), this.util.appTranslate('refund_received')],
        colors: ['#42C9D6', '#F89778'],
        plotOptions: {
          pie: {
            donut: {
              size: '89%',
              background: 'transparent',
              labels: {
                show: true,
                name: {
                  show: true,
                  offsetY: 7,
                },
                value: {
                  show: false,
                },
                total: {
                  show: true,
                  color: '#2A3547',
                  fontSize: '10px',
                  fontWeight: '600',
                  label: '',
                },
              },
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: false,
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
      };
      this.diningStatsChartOptions = {
        series: [0, 0],
        chart: {
          type: 'donut',
          fontFamily: "'Plus Jakarta Sans', sans-serif;",
          toolbar: {
            show: false,
          },
          height: 275,
        },
        labels: [this.util.appTranslate('total_spent'), this.util.appTranslate('refund_received')],
        colors: ['#42C9D6', '#F89778'],
        plotOptions: {
          pie: {
            donut: {
              size: '89%',
              background: 'transparent',
              labels: {
                show: true,
                name: {
                  show: true,
                  offsetY: 7,
                },
                value: {
                  show: false,
                },
                total: {
                  show: true,
                  color: '#2A3547',
                  fontSize: '10px',
                  fontWeight: '600',
                  label: '',
                },
              },
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: false,
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
      };
      this.tiffinStatsChartOptions = {
        series: [0, 0],
        chart: {
          type: 'donut',
          fontFamily: "'Plus Jakarta Sans', sans-serif;",
          toolbar: {
            show: false,
          },
          height: 275,
        },
        labels: [this.util.appTranslate('total_spent'), this.util.appTranslate('refund_received')],
        colors: ['#42C9D6', '#F89778'],
        plotOptions: {
          pie: {
            donut: {
              size: '89%',
              background: 'transparent',
              labels: {
                show: true,
                name: {
                  show: true,
                  offsetY: 7,
                },
                value: {
                  show: false,
                },
                total: {
                  show: true,
                  color: '#2A3547',
                  fontSize: '10px',
                  fontWeight: '600',
                  label: '',
                },
              },
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: false,
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
      };
      this.getInfo();
    } else {
      this.util.onError('ts_something_went_wrong', '');
      this.onBack();
    }
  }

  getInfo() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/accountant/customer_detail/' + this.userId).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true && response.userInfo && response.userInfo.id) {
          console.log('Get The Results');
          const userInfo = response.userInfo;
          this.cover = userInfo.image;
          this.name = `${userInfo.firstName} ${userInfo.lastName}`;
          this.role = userInfo.role;
          this.email = userInfo.contactEmail;
          this.contact = `+${userInfo.countryCode} ${userInfo.contactNumber}`;
          this.joined = DateTime.fromISO(userInfo.createdAt).setLocale(this.util.appLocaleName()).toFormat('dd, LLLL, yyyy');

          this.walletBalance = userInfo.wallets.balance;
          this.loyaltyPoints = userInfo.loyaltyPoints;

          this.totalOrder = userInfo.orderCount;
          this.totalOrderSpent = userInfo.orderGrandTotal;

          this.totalOrderRefundRequest = userInfo.orderRefund;
          this.totalOrderRefundReceived = userInfo.orderRefundTotal;

          this.totalDiningBooking = userInfo.diningBookings;
          this.totalDiningBookingSpent = userInfo.diningGrandTotal;

          this.totalDiningBookingRefundRequest = userInfo.diningRefund;
          this.totalDiningBookingRefundReceived = userInfo.diningRefundTotal;

          this.totalTiffinPackage = userInfo.tiffinPackages;
          this.totalTiffinPackageSpent = userInfo.tiffinPackageGrandTotal;

          this.totalTiffinPackageRefundRequest = userInfo.tiffinRefund;
          this.totalTiffinPackageRefundReceived = userInfo.tiffinRefundTotal;


          this.favRest = userInfo.favRest;
          this.favFood = userInfo.favFood;
          this.favOrders = userInfo.favOrders;
          this.address = userInfo.address;
          this.medias = userInfo.medias;
          this.restaurantReviews = userInfo.restaurantReviews;
          this.foodReviews = userInfo.foodReviews;
          this.deliverymanReviews = userInfo.deliverymanReviews;
          this.hiddenRest = userInfo.hiddenRest;

          this.orderStatsChartOptions = {
            series: [this.totalOrderSpent, this.totalOrderRefundReceived],
            chart: {
              type: 'donut',
              fontFamily: "'Plus Jakarta Sans', sans-serif;",
              toolbar: {
                show: false,
              },
              height: 275,
            },
            labels: [this.util.appTranslate('total_spent'), this.util.appTranslate('refund_received')],
            colors: ['#42C9D6', '#F89778'],
            plotOptions: {
              pie: {
                donut: {
                  size: '89%',
                  background: 'transparent',
                  labels: {
                    show: true,
                    name: {
                      show: true,
                      offsetY: 7,
                    },
                    value: {
                      show: false,
                    },
                    total: {
                      show: true,
                      color: '#2A3547',
                      fontSize: '10px',
                      fontWeight: '600',
                      label: this.util.appTranslate('order_stats'),
                    },
                  },
                },
              },
            },
            dataLabels: {
              enabled: false,
            },
            stroke: {
              show: false,
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
          };

          this.diningStatsChartOptions = {
            series: [this.totalDiningBookingSpent, this.totalDiningBookingRefundReceived],
            chart: {
              type: 'donut',
              fontFamily: "'Plus Jakarta Sans', sans-serif;",
              toolbar: {
                show: false,
              },
              height: 275,
            },
            labels: [this.util.appTranslate('total_spent'), this.util.appTranslate('refund_received')],
            colors: ['#42C9D6', '#F89778'],
            plotOptions: {
              pie: {
                donut: {
                  size: '89%',
                  background: 'transparent',
                  labels: {
                    show: true,
                    name: {
                      show: true,
                      offsetY: 7,
                    },
                    value: {
                      show: false,
                    },
                    total: {
                      show: true,
                      color: '#2A3547',
                      fontSize: '10px',
                      fontWeight: '600',
                      label: this.util.appTranslate('dining_stats'),
                    },
                  },
                },
              },
            },
            dataLabels: {
              enabled: false,
            },
            stroke: {
              show: false,
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
          };

          this.tiffinStatsChartOptions = {
            series: [this.totalTiffinPackageSpent, this.totalTiffinPackageRefundReceived],
            chart: {
              type: 'donut',
              fontFamily: "'Plus Jakarta Sans', sans-serif;",
              toolbar: {
                show: false,
              },
              height: 275,
            },
            labels: [this.util.appTranslate('total_spent'), this.util.appTranslate('refund_received')],
            colors: ['#42C9D6', '#F89778'],
            plotOptions: {
              pie: {
                donut: {
                  size: '89%',
                  background: 'transparent',
                  labels: {
                    show: true,
                    name: {
                      show: true,
                      offsetY: 7,
                    },
                    value: {
                      show: false,
                    },
                    total: {
                      show: true,
                      color: '#2A3547',
                      fontSize: '10px',
                      fontWeight: '600',
                      label: this.util.appTranslate('tiffin_pacakges_stats'),
                    },
                  },
                },
              },
            },
            dataLabels: {
              enabled: false,
            },
            stroke: {
              show: false,
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
          };

        } else {
          this.util.onError('ts_something_went_wrong', '');
          this.onBack();
        }
      },
      error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'accountant');
      },
    });
  }

  onBack() {
    this.location.back();
  }

}
