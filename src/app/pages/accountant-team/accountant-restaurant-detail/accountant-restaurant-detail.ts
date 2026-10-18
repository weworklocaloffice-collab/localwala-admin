import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { DateTime } from 'luxon';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ApexAxisChartSeries, ApexChart, ChartComponent, ApexDataLabels, ApexYAxis, ApexLegend, ApexXAxis, ApexTooltip, ApexTheme, ApexGrid, ApexPlotOptions, ApexFill } from 'ng-apexcharts';
import { MatTableDataSource } from '@angular/material/table';
import { ReviewPercentageInterface } from 'src/app/interfaces/review.percentage.interface';
import { MaterialModule } from 'src/app/material.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgIcon } from '@ng-icons/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

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
  selector: 'app-accountant-restaurant-detail',
  imports: [MaterialModule, NgApexchartsModule, GoogleMapsModule, CommonModule, NgIcon],
  templateUrl: './accountant-restaurant-detail.html',
})
export class AccountantRestaurantDetail {

  reviews = new MatTableDataSource<ReviewPercentageInterface>([]);
  displayedReviewsColumns: string[] = ['progress', 'number'];
  @ViewChild('orderStatsChart') orderStatsChart: ChartComponent = Object.create(null);
  public orderStatsChartOptions: Partial<ChartOptions> | any;
  @ViewChild('diningStatsChart') diningStatsChart: ChartComponent = Object.create(null);
  public diningStatsChartOptions: Partial<ChartOptions> | any;
  @ViewChild('posTableOrderChart') posTableOrderChart: ChartComponent = Object.create(null);
  public posTableOrderStatsChartOptions: Partial<ChartOptions> | any;
  name: string = '';
  address: string = '';
  shortDescription: string = '';
  logo: string = '';
  cover: string = '';
  city: string = '';
  locality: string = '';
  mapCenterLocation: google.maps.LatLng;
  mapTypeId: google.maps.MapTypeId.ROADMAP;
  mapOptions: google.maps.MapOptions = {
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeId: 'roadmap'
  };
  markerPosition: google.maps.LatLngLiteral;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  ownerName: string = '';
  ownerEmail: string = '';
  ownerContact: string = '';
  ownerRole: string = '';
  ownerImage: string = '';
  joiningDate: string = '';
  license: string = '';
  licenseNo: string = '';
  cuisine: string = '';
  diningCategory: string = '';
  restauranttypes: string = '';
  categories: string = '';
  restaurantfacilities: string = '';
  dishPriceForTwo: number = 0;
  minOrderAmount: number = 0;
  approxDeliveryTime: string = '';
  walletFund: number = 0;
  inHandAmount: number = 0;
  totalEarning: number = 0;
  withdrawnAmount: number = 0;
  orderTotalEarning: number = 0;
  orderRefundedAmount: number = 0;
  diningBookingEarningAmount: number = 0;
  bookingRefundAmount: number = 0;
  posEarningAmount: number = 0;
  tableOrderEarningAmount: number = 0;
  businessType: string = '';
  commission: number = 0;
  posOrderCommission: number = 0;
  tableOrderCommission: number = 0;
  takeAway: boolean = false;
  acceptHomeDelivery: boolean = false;
  acceptScheduleDelivery: boolean = false;
  pos: boolean = false;
  ownDriver: boolean = false;
  promote: boolean = false;
  customCategory: boolean = false;
  multiOutlet: boolean = false;
  preBooking: boolean = false;
  tableOrder: boolean = false;
  tiffinSubscription: boolean = false;
  ownWaiter: boolean = false;
  ownKitchen: boolean = false;
  orderLimit: number = 0;
  productLimit: number = 0;
  totalRating: number = 0;
  rating: number = 0;
  orderCount: number = 0;
  diningBookings: number = 0;
  tiffinPackages: number = 0;
  soldTiffinPackages: number = 0;
  posOrders: number = 0;
  tableOrders: number = 0;
  totalProducts: number = 0;
  totalWaiters: number = 0;
  totalDeliveryman: number = 0;
  orderRefund: number = 0;
  diningRefund: number = 0;
  tiffinRefund: number = 0;
  orderComplaints: number = 0;
  restaurantComplaints: number = 0;
  totalOutlets: number = 0;
  disbursements: number = 0;
  collectedCash: number = 0;
  payoutAccounts: number = 0;
  withdrawalRequest: number = 0;
  medias: number = 0;
  socialFacebook: string = '';
  socialInstagram: string = '';
  socialX: string = '';
  socialYoutube: string = '';
  socialLinkedIn: string = '';
  socialPinterest: string = '';
  restaurantId: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private location: Location,
    private route: ActivatedRoute,
  ) {
    this.restaurantId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.restaurantId != null && this.restaurantId != '') {
      this.getInfo();
    } else {
      this.util.onError('ts_something_went_wrong', '');
      this.location.back();
    }
    this.orderStatsChartOptions = {
      series: [0, 0],
      chart: {
        type: 'donut',
        fontFamily: "'Plus Jakarta Sans', sans-serif;",
        toolbar: {
          show: false,
        },
        height: 220,
      },
      labels: [this.util.appTranslate('total_earning'), this.util.appTranslate('refund_amount')],
      colors: ['#42C9D6', '#F89778'],
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
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
        height: 220,
      },
      labels: [this.util.appTranslate('total_earning'), this.util.appTranslate('refund_amount')],
      colors: ['#42C9D6', '#F89778'],
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
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
    this.posTableOrderStatsChartOptions = {
      series: [0, 0],
      chart: {
        type: 'donut',
        fontFamily: "'Plus Jakarta Sans', sans-serif;",
        toolbar: {
          show: false,
        },
        height: 220,
      },
      labels: [this.util.appTranslate('pos_earning'), this.util.appTranslate('table_order_earning')],
      colors: ['#42C9D6', '#F89778'],
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
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
                label: this.util.appTranslate('pos_and_table_order'),
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
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/accountant/restaurant_detail/' + this.restaurantId).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success) {
          const info = response.restaurant;
          this.name = info.name;
          this.address = info.address;
          this.logo = info.logo;
          this.cover = info.cover;
          this.shortDescription = info.shortDescription;

          if (response && response.restaurant && response.restaurant?.translations && Array.isArray(response.restaurant?.translations)) {
            const translation = response.restaurant.translations.find((t: any) => t.code == this.util.appLocaleName());
            this.name = translation?.title || response.restaurant.name;
            this.address = translation?.address || response.restaurant.address;
            this.shortDescription = translation?.shortDescription || response.restaurant.shortDescription;
          }

          if (info && info.city && info.city.name != '') {
            this.city = info.city.name;
            if (info && info.city && info.city?.translations && Array.isArray(info.city?.translations)) {
              const translation = info.city.translations.find((t: any) => t.code == this.util.appLocaleName());
              this.city = translation?.value || info.city.name;
            }
          }
          if (info && info.locality && info.locality.name != '') {
            this.locality = info.locality.name;
            if (info && info.locality && info.locality?.translations && Array.isArray(info.locality?.translations)) {
              const translation = info.locality.translations.find((t: any) => t.code == this.util.appLocaleName());
              this.locality = translation?.value || info.locality.name;
            }
          }
          if (info && info.location && info.location.type && info.location.coordinates && info.location.coordinates.length) {
            const location = info.location;
            this.mapCenterLocation = new google.maps.LatLng(location.coordinates[1], location.coordinates[0]);
            this.markerPosition = { lat: location.coordinates[1], lng: location.coordinates[0] };
          }

          if (info && info.owerInfo && info.owerInfo.id != '') {
            const owner = info.owerInfo;
            this.ownerName = `${owner.firstName} ${owner.lastName}`;
            this.ownerEmail = owner.contactEmail;
            this.ownerContact = `+${owner.countryCode} ${owner.contactNumber}`;
            this.ownerImage = owner.image;
            this.ownerRole = owner.role;
          }

          if (info && info.license && info.license.name != '') {
            this.license = info.license.name;
            if (info && info.license && info.license?.translations && Array.isArray(info.license?.translations)) {
              const translation = info.license.translations.find((t: any) => t.code == this.util.appLocaleName());
              this.license = translation?.value || info.license.name;
            }
          }
          this.licenseNo = info.licenseId;
          this.joiningDate = DateTime.fromISO(info.createdAt).setLocale(this.util.appLocaleName()).toFormat('dd, LLLL, yyyy');
          if (info && info.cuisine && info.cuisine.length) {
            const nameList: string[] = [];
            info.cuisine.forEach((element: any) => {
              let name = element.name;
              if (element && element?.translations && Array.isArray(element?.translations)) {
                const translation = element.translations.find((t: any) => t.code == this.util.appLocaleName());
                name = translation?.value || element.name;
              }
              nameList.push(name);
            });
            this.cuisine = nameList.join(', ');
          }
          if (info && info.diningCategory && info.diningCategory.length) {
            const nameList: string[] = [];
            info.diningCategory.forEach((element: any) => {
              let name = element.name;
              if (element && element?.translations && Array.isArray(element?.translations)) {
                const translation = element.translations.find((t: any) => t.code == this.util.appLocaleName());
                name = translation?.value || element.name;
              }
              nameList.push(name);
            });
            this.diningCategory = nameList.join(', ');
          }

          if (info && info.restauranttypes && info.restauranttypes.length) {
            const nameList: string[] = [];
            info.restauranttypes.forEach((element: any) => {
              let name = element.name;
              if (element && element?.translations && Array.isArray(element?.translations)) {
                const translation = element.translations.find((t: any) => t.code == this.util.appLocaleName());
                name = translation?.value || element.name;
              }
              nameList.push(name);
            });
            this.restauranttypes = nameList.join(', ');
          }

          if (info && info.categories && info.categories.length) {
            const nameList: string[] = [];
            info.categories.forEach((element: any) => {
              let name = element.name;
              if (element && element?.translations && Array.isArray(element?.translations)) {
                const translation = element.translations.find((t: any) => t.code == this.util.appLocaleName());
                name = translation?.value || element.name;
              }
              nameList.push(name);
            });
            this.categories = nameList.join(', ');
          }

          if (info && info.restaurantfacilities && info.restaurantfacilities.length) {
            const nameList: string[] = [];
            info.restaurantfacilities.forEach((element: any) => {
              let name = element.name;
              if (element && element?.translations && Array.isArray(element?.translations)) {
                const translation = element.translations.find((t: any) => t.code == this.util.appLocaleName());
                name = translation?.value || element.name;
              }
              nameList.push(name);
            });
            this.restaurantfacilities = nameList.join(', ');
          }

          this.approxDeliveryTime = info.approxDeliveryTime;
          this.dishPriceForTwo = info.dishPriceForTwo;
          this.minOrderAmount = info.minOrderAmount;

          this.takeAway = info && (info.takeAway == true || info.takeAway == 'true');
          this.acceptHomeDelivery = info && (info.acceptHomeDelivery == true || info.acceptHomeDelivery == 'true');
          this.acceptScheduleDelivery = info && (info.acceptScheduleDelivery == true || info.acceptScheduleDelivery == 'true');

          this.orderLimit = info.orderLimit;
          this.productLimit = info.productLimit;

          if (response && response.wallet) {
            const wallet = response.wallet;
            if (wallet.walletInfo && wallet.walletInfo.id != '') {
              this.walletFund = parseFloat(wallet.walletInfo.balance);
            }
            this.inHandAmount = parseFloat(wallet.inHandAmount);
            this.totalEarning = parseFloat(wallet.totalEarning);
            this.withdrawnAmount = parseFloat(wallet.withdrawnAmount);


            this.orderTotalEarning = parseFloat(wallet.orderEarningAmount);
            this.orderRefundedAmount = parseFloat(wallet.orderRefundAmount);

            this.orderStatsChartOptions = {
              series: [this.orderTotalEarning, this.orderRefundedAmount],
              chart: {
                type: 'donut',
                fontFamily: "'Plus Jakarta Sans', sans-serif;",
                toolbar: {
                  show: false,
                },
                height: 220,
              },
              labels: [this.util.appTranslate('total_earning'), this.util.appTranslate('refund_amount')],
              colors: ['#42C9D6', '#F89778'],
              plotOptions: {
                pie: {
                  startAngle: 0,
                  endAngle: 360,
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
                x: {
                  show: true,
                },
                fillSeriesColor: false,
                y: {
                  formatter: (value: number) => {
                    return this.util.priceFormat(value);
                  }
                }
              },
            };

            this.diningBookingEarningAmount = parseFloat(wallet.diningBookingEarningAmount);
            this.bookingRefundAmount = parseFloat(wallet.bookingRefundAmount);

            this.diningStatsChartOptions = {
              series: [this.diningBookingEarningAmount, this.bookingRefundAmount],
              chart: {
                type: 'donut',
                fontFamily: "'Plus Jakarta Sans', sans-serif;",
                toolbar: {
                  show: false,
                },
                height: 220,
              },
              labels: [this.util.appTranslate('total_earning'), this.util.appTranslate('refund_amount')],
              colors: ['#42C9D6', '#F89778'],
              plotOptions: {
                pie: {
                  startAngle: 0,
                  endAngle: 360,
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
                x: {
                  show: true,
                },
                fillSeriesColor: false,
                y: {
                  formatter: (value: number) => {
                    return this.util.priceFormat(value);
                  }
                }
              },
            };

            this.posEarningAmount = parseFloat(wallet.posEarningAmount);
            this.tableOrderEarningAmount = parseFloat(wallet.tableOrderEarningAmount);

            this.posTableOrderStatsChartOptions = {
              series: [this.posEarningAmount, this.tableOrderEarningAmount],
              chart: {
                type: 'donut',
                fontFamily: "'Plus Jakarta Sans', sans-serif;",
                toolbar: {
                  show: false,
                },
                height: 220,
              },
              labels: [this.util.appTranslate('pos_earning'), this.util.appTranslate('table_order_earning')],
              colors: ['#42C9D6', '#F89778'],
              plotOptions: {
                pie: {
                  startAngle: 0,
                  endAngle: 360,
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
                        label: this.util.appTranslate('pos_and_table_order'),
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

          if (info && info.type == 'subscription') {
            if (info && info.subscriptionInfo && info.subscriptionInfo.id) {
              let name = info.subscriptionInfo.name;
              if (info && info.subscriptionInfo && info.subscriptionInfo?.translations && Array.isArray(info.subscriptionInfo?.translations)) {
                const translation = info.subscriptionInfo.translations.find((t: any) => t.code == this.util.appLocaleName());
                name = translation?.title || info.subscriptionInfo.name;
              }
              this.businessType = `${this.util.appTranslate('subscription')} - (${name})`;
            } else {
              this.businessType = this.util.appTranslate('subscription');
            }
          } else {
            this.businessType = this.util.appTranslate('commission');
          }
          this.commission = info.commission;
          this.posOrderCommission = info.posOrderCommission;
          this.tableOrderCommission = info.tableOrderCommission;

          this.rating = info.rating;
          this.totalRating = info.totalRating;

          if (info && info.owerInfo && info.owerInfo.role == 'vendor') {
            this.pos = info.pos;
            this.ownDriver = info.ownDriver;
            this.promote = info.promote;
            this.customCategory = info.customCategory;
            this.multiOutlet = info.multiOutlet;
            this.preBooking = info.preBooking;
            this.tableOrder = info.tableOrder;
            this.tiffinSubscription = info.tiffinSubscription;
            this.ownWaiter = info.ownWaiter;
            this.ownKitchen = info.ownKitchen;
          } else if (info && info.owerInfo && info.owerInfo.role != 'vendor') {
            if (info && info.manager && info.manager.id != '') {
              const manager = info.manager;
              this.pos = manager.pos;
              this.ownDriver = manager.ownDriver;
              this.promote = manager.promote;
              this.customCategory = manager.customCategory;
              this.multiOutlet = manager.multiOutlet;
              this.preBooking = manager.preBooking;
              this.tableOrder = manager.tableOrder;
              this.tiffinSubscription = manager.tiffinSubscription;
              this.ownWaiter = manager.ownWaiter;
              this.ownKitchen = manager.ownKitchen;
              this.commission = manager.commission;
              this.posOrderCommission = manager.posOrderCommission;
              this.tableOrderCommission = manager.tableOrderCommission;
            }
          }

          this.orderCount = info.orderCount;
          this.diningBookings = info.diningBookings;
          this.tiffinPackages = info.tiffinPackages;
          this.soldTiffinPackages = info.soldTiffinPackages;
          this.posOrders = info.posOrders;
          this.tableOrders = info.tableOrders;
          this.totalProducts = info.totalProducts;
          this.totalWaiters = info.totalWaiters;
          this.totalDeliveryman = info.totalDeliveryman;
          this.orderRefund = info.orderRefund;
          this.diningRefund = info.diningRefund;
          this.tiffinRefund = info.tiffinRefund;
          this.orderComplaints = info.orderComplaints;
          this.restaurantComplaints = info.restaurantComplaints;
          this.totalOutlets = info.totalOutlets;
          this.disbursements = info.disbursements;
          this.collectedCash = info.collectedCash;
          this.payoutAccounts = info.payoutAccounts;
          this.withdrawalRequest = info.withdrawalRequest;
          this.medias = info.medias;

          this.socialFacebook = info.socialFacebook;
          this.socialInstagram = info.socialInstagram;
          this.socialX = info.socialX;
          this.socialYoutube = info.socialYoutube;
          this.socialLinkedIn = info.socialLinkedIn;
          this.socialPinterest = info.socialPinterest;

          this.reviews = response.percentages;


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
