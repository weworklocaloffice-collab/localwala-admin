import { Location } from '@angular/common';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DateTime } from 'luxon';
import { ReviewPercentageInterface } from 'src/app/interfaces/review.percentage.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ApexAxisChartSeries, ApexChart, ChartComponent, ApexDataLabels, ApexYAxis, ApexLegend, ApexXAxis, ApexTooltip, ApexTheme, ApexGrid, ApexPlotOptions, ApexFill } from 'ng-apexcharts';
import { MaterialModule } from 'src/app/material.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgIcon } from '@ng-icons/core';
import { GoogleMapsModule } from '@angular/google-maps';
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
  selector: 'app-cityzen-deliveryman-detail-personal-info',
  imports: [MaterialModule, NgApexchartsModule, CommonModule, GoogleMapsModule, NgIcon],
  templateUrl: './cityzen-deliveryman-detail-personal-info.html',
})
export class CityzenDeliverymanDetailPersonalInfo implements AfterViewInit {

  @Input() driverId!: string;
  @ViewChild('orderEarningStatsChart') orderEarningStatsChart: ChartComponent = Object.create(null);
  public orderEarningStatsChartOptions: Partial<ChartOptions> | any;
  @ViewChild('orderStatsChart') orderStatsChart: ChartComponent = Object.create(null);
  public orderStatsChartOptions: Partial<ChartOptions> | any;
  reviews = new MatTableDataSource<ReviewPercentageInterface>([]);
  displayedReviewsColumns: string[] = ['progress', 'number'];
  totalEarning: number = 0;
  walletFund: number = 0;
  inHandAmount: number = 0;
  withdrawnAmount: number = 0;
  driverName: string = '';
  driverContact: string = '';
  driverEmail: string = '';
  driverImage: string = '';
  driverRole: string = '';
  driverRestaurant: string = '';
  type: string = 'freelancer';
  identity: string = 'passport';
  identityNumber: string = '';
  identityProof: string = '';
  drivingLicense: string = '';
  age: number = 0;
  dob: string = '';
  orderHandling: number = 0;
  rating: number = 0;
  vehicle: string = '';
  offlineMessage: string = '';
  city: string = '';
  locality: string = '';
  totalRating: number = 0;
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
  deliveredOrder: number = 0;
  rejectedOrder: number = 0;
  cancelledOrder: number = 0;
  lateAccept: number = 0;
  orderComplaints: number = 0;
  restaurantComplaints: number = 0;
  disbursements: number = 0;
  collectedCash: number = 0;
  payoutAccounts: number = 0;
  withdrawalRequest: number = 0;
  medias: number = 0;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private location: Location,
  ) {
    this.orderEarningStatsChartOptions = {
      series: [0, 0, 0, 0],
      chart: {
        type: 'donut',
        fontFamily: "'Plus Jakarta Sans', sans-serif;",
        toolbar: {
          show: false,
        },
        height: 220,
      },
      labels: [this.util.appTranslate('bonuses'), this.util.appTranslate('tips'), this.util.appTranslate('extra_shift'), this.util.appTranslate('total_earning')],
      colors: ['#EE9173', '#3FC2CF', '#F65472', '#F9AE21'],
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
                label: this.util.appTranslate('th_earning_stats'),
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
        show: true,
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
    this.orderStatsChartOptions = {
      series: [
        {
          name: '',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ],

      chart: {
        type: 'bar',
        fontFamily: "'Plus Jakarta Sans', sans-serif;",
        foreColor: '#adb0bb',
        toolbar: {
          show: false,
        },
        height: 290,
      },
      colors: [

      ],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '45%',
          distributed: true,
          endingShape: 'rounded',
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      grid: {
        yaxis: {
          lines: {
            show: false,
          },
        },
      },
      xaxis: {
        categories: [[this.util.appTranslate('ideal')], [this.util.appTranslate('accepted')], [this.util.appTranslate('reached_restaurant')], [this.util.appTranslate('pickup_order')], [this.util.appTranslate('reached_customer')], [this.util.appTranslate('rejected')], [this.util.appTranslate('cancelled')], [this.util.appTranslate('late_accept')], [this.util.appTranslate('delivered')]],
        axisBorder: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
      tooltip: {
        theme: 'dark',
      },
    };
  }

  ngAfterViewInit() {
    console.log(`------ ${this.driverId}`);
    this.getInfo();
  }

  getInfo() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/deliveryman_detail_info/' + this.driverId).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success) {
          this.reviews = response.percentages;
          if (response && response.driverInfo && response.driverInfo.id != '') {
            const info = response.driverInfo;
            if (info && info.wallets && info.wallets.id != '') {
              this.walletFund = parseFloat(info.wallets.balance);
            }

            if (info && info.driverInfo && info.driverInfo.id) {
              const driverInfo = info.driverInfo;
              this.driverName = `${driverInfo.firstName} ${driverInfo.lastName}`;
              this.driverImage = driverInfo.image;
              this.driverContact = `+${driverInfo.countryCode} ${driverInfo.contactNumber}`;
              this.driverEmail = driverInfo.contactEmail;
              this.driverRole = driverInfo.role;
              if (this.driverRole == 'vendorDriver' && info.restaurant && info.restaurant.name != '') {
                this.driverRestaurant = info.restaurant.name;
                if (info && info.restaurant && info.restaurant?.translations && Array.isArray(info.restaurant?.translations)) {
                  const translation = info.restaurant.translations.find((t: any) => t.code == this.util.appLocaleName());
                  this.driverRestaurant = translation?.title || info.restaurant.name;
                }
              }
            }

            if (info && info.vehicle && info.vehicle.id != '') {
              this.vehicle = info.vehicle.name;
              if (info && info.vehicle && info.vehicle?.translations && Array.isArray(info.vehicle?.translations)) {
                const translation = info.vehicle.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.vehicle = translation?.value || info.vehicle.name;
              }
            }

            if (info && info.offlineMessage && info.offlineMessage.id != '') {
              this.offlineMessage = info.offlineMessage.name;
              if (info && info.offlineMessage && info.offlineMessage?.translations && Array.isArray(info.offlineMessage?.translations)) {
                const translation = info.offlineMessage.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.offlineMessage = translation?.value || info.offlineMessage.name;
              }
            }

            if (info && info.city && info.city.id != '') {
              this.city = info.city.name;
              if (info && info.city && info.city?.translations && Array.isArray(info.city?.translations)) {
                const translation = info.city.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.city = translation?.value || info.city.name;
              }
            }

            if (info && info.locality && info.locality.id != '') {
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

            this.type = info.type;
            this.identity = info.identity;
            this.identityNumber = info.identityNumber;
            this.identityProof = info.identityProof;
            this.drivingLicense = info.drivingLicense;

            this.age = info.age;
            this.dob = DateTime.fromJSDate(new Date(info.dob)).setLocale(this.util.appLocaleName()).toFormat('dd, LLLL yyyy');
            this.orderHandling = info.orderHandling;
            this.rating = parseFloat(info.rating);

            this.totalRating = info.reviews;
            this.deliveredOrder = info.deliveredOrder;
            this.rejectedOrder = info.rejectedOrder;
            this.cancelledOrder = info.cancelledOrder;
            this.lateAccept = info.lateAccept;
            this.orderComplaints = info.orderComplaints;
            this.restaurantComplaints = info.restaurantComplaints;
            this.disbursements = info.disbursements;
            this.collectedCash = info.collectedCash;
            this.payoutAccounts = info.payoutAccounts;
            this.withdrawalRequest = info.withdrawalRequest;
            this.medias = info.medias;
          }
          this.inHandAmount = parseFloat(response.inHandAmount);
          this.withdrawnAmount = parseFloat(response.withdrawnAmount);
          this.totalEarning = parseFloat(response.totalEarning);

          const earningChartData = response.earningChartData;
          const totalEarnings = parseFloat(earningChartData.totalEarnings);
          const totalTips = parseFloat(earningChartData.totalTips);
          const totalBonuses = parseFloat(earningChartData.totalBonuses);
          const totalExtraShiftEarning = parseFloat(earningChartData.totalExtraShiftEarning);

          this.orderEarningStatsChartOptions = {
            series: [totalBonuses, totalTips, totalExtraShiftEarning, totalEarnings],
            chart: {
              type: 'donut',
              fontFamily: "'Plus Jakarta Sans', sans-serif;",
              toolbar: {
                show: false,
              },
              height: 220,
            },
            labels: [this.util.appTranslate('bonuses'), this.util.appTranslate('tips'), this.util.appTranslate('extra_shift'), this.util.appTranslate('total_earning')],
            colors: ['#EE9173', '#3FC2CF', '#F65472', '#F9AE21'],
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
                      label: this.util.appTranslate('th_earning_stats'),
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
              show: true,
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
          if (response && response.chartCount && response.chartCount.length) {
            let idealStatus = 0;
            let acceptedStatus = 0;
            let driver_reached_restaurantStatus = 0;
            let driver_pickpup_orderStatus = 0;
            let driver_reached_customerStatus = 0;
            let rejectedStatus = 0;
            let cancelledStatus = 0;
            let deliveredStatus = 0;
            let accepted_anotherStatus = 0;
            const chart: any[] = response.chartCount;
            const indexOfIdeal = chart.findIndex((x) => x.status == 'ideal');
            if (indexOfIdeal != -1) {
              idealStatus = chart[indexOfIdeal].count;
            }
            const indexOfAccepted = chart.findIndex((x) => x.status == 'accepted');
            if (indexOfAccepted != -1) {
              acceptedStatus = chart[indexOfAccepted].count;
            }
            const indexOfReachedRestaurant = chart.findIndex((x) => x.status == 'driver_reached_restaurant');
            if (indexOfReachedRestaurant != -1) {
              driver_reached_restaurantStatus = chart[indexOfReachedRestaurant].count;
            }
            const indexOfPickedOrder = chart.findIndex((x) => x.status == 'driver_pickpup_order');
            if (indexOfPickedOrder != -1) {
              driver_pickpup_orderStatus = chart[indexOfPickedOrder].count;
            }
            const indexOfReachedCustomer = chart.findIndex((x) => x.status == 'driver_reached_customer');
            if (indexOfReachedCustomer != -1) {
              driver_reached_customerStatus = chart[indexOfReachedCustomer].count;
            }
            const indexOfRejected = chart.findIndex((x) => x.status == 'rejected');
            if (indexOfRejected != -1) {
              rejectedStatus = chart[indexOfRejected].count;
            }
            const indexOfCancelled = chart.findIndex((x) => x.status == 'cancelled');
            if (indexOfCancelled != -1) {
              cancelledStatus = chart[indexOfCancelled].count;
            }
            const indexOfDelivered = chart.findIndex((x) => x.status == 'delivered');
            if (indexOfDelivered != -1) {
              deliveredStatus = chart[indexOfDelivered].count;
            }
            const indexOfAcceptedAnother = chart.findIndex((x) => x.status == 'accepted_another');
            if (indexOfAcceptedAnother != -1) {
              accepted_anotherStatus = chart[indexOfAcceptedAnother].count;
            }

            this.orderStatsChartOptions = {
              series: [
                {
                  name: '',
                  data: [idealStatus, acceptedStatus, driver_reached_restaurantStatus, driver_pickpup_orderStatus, driver_reached_customerStatus, rejectedStatus, cancelledStatus, accepted_anotherStatus, deliveredStatus],
                },
              ],

              chart: {
                type: 'bar',
                fontFamily: "'Plus Jakarta Sans', sans-serif;",
                foreColor: '#adb0bb',
                toolbar: {
                  show: false,
                },
                height: 290,
              },
              colors: [],
              plotOptions: {
                bar: {
                  borderRadius: 4,
                  columnWidth: '45%',
                  distributed: true,
                  endingShape: 'rounded',
                },
              },
              dataLabels: {
                enabled: false,
              },
              legend: {
                show: false,
              },
              grid: {
                yaxis: {
                  lines: {
                    show: false,
                  },
                },
              },
              xaxis: {
                categories: [[this.util.appTranslate('ideal')], [this.util.appTranslate('accepted')], [this.util.appTranslate('reached_restaurant')], [this.util.appTranslate('pickup_order')], [this.util.appTranslate('reached_customer')], [this.util.appTranslate('rejected')], [this.util.appTranslate('cancelled')], [this.util.appTranslate('late_accept')], [this.util.appTranslate('delivered')]],
                axisBorder: {
                  show: false,
                },
              },
              yaxis: {
                labels: {
                  show: false,
                },
              },
              tooltip: {
                theme: 'dark',
              },
            };
          }

        } else {
          this.util.onError('ts_something_went_wrong', '');
          this.onBack();
        }
      },
      error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      },
    });
  }

  onBack() {
    this.location.back();
  }

}
