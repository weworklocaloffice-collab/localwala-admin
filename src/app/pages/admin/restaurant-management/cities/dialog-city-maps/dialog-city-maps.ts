import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminCityMapDialogDriverInterface } from 'src/app/interfaces/admin.city.map.dialog.driver.interface';
import { AdminCityMapDialogMarkerInterface } from 'src/app/interfaces/admin.city.map.dialog.marker.interface';
import { AdminCityMapDialogRestaurantInterface } from 'src/app/interfaces/admin.city.map.dialog.restaurant.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ApexChart, ChartComponent, ApexDataLabels, ApexLegend, ApexStroke, ApexTooltip, ApexAxisChartSeries, ApexXAxis, ApexYAxis, ApexGrid, ApexPlotOptions, ApexFill } from 'ng-apexcharts';
import { GoogleMapsModule } from '@angular/google-maps';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
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
  selector: 'app-dialog-city-maps',
  imports: [GoogleMapsModule, MaterialModule, FormsModule, ReactiveFormsModule, CommonModule, NgApexchartsModule, NgIcon],
  templateUrl: './dialog-city-maps.html',
})
export class DialogCityMaps {
  @ViewChild('restaurantPaginator', { read: MatPaginator, static: false }) restaurantPaginator: MatPaginator;
  @ViewChild('deliverymanPaginator', { read: MatPaginator, static: false }) deliverymanPaginator: MatPaginator;
  @ViewChild('countChart') countChart: ChartComponent = Object.create(null);
  displayedColumnRestaurant = ['name', 'locality', 'owner', 'action'];
  displayedColumnDeliveryman = ['name', 'locality', 'contact', 'action'];
  id: string = '';
  name: string = '';
  mapCenterLocation: google.maps.LatLng;
  mapTypeId: google.maps.MapTypeId.ROADMAP;
  mapOptions: google.maps.MapOptions = {
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeId: 'roadmap',
    styles: [
      {
        featureType: 'all',
        elementType: 'all',
        stylers: [{ saturation: -100 }]
      }
    ]
  };
  markerPosition: google.maps.LatLngLiteral;
  markerOptions: google.maps.MarkerOptions = { draggable: true };
  circleOptions: google.maps.CircleOptions;
  restaurantSource = new MatTableDataSource<AdminCityMapDialogRestaurantInterface>([]);
  deliverymanSource = new MatTableDataSource<AdminCityMapDialogDriverInterface>([]);
  // restaurants: AdminCityMapDialogRestaurantInterface[] = [];
  drivers: AdminCityMapDialogDriverInterface[] = [];
  locationMarker: AdminCityMapDialogMarkerInterface[] = [];
  hoveredTitle: string = '';
  deliveryArea: number = 5;
  findMode: string = 'km';
  pageSize: number = 5;
  currentPage: number = 0;
  pageSizeDeliveryman: number = 5;
  currentPageDeliveryman: number = 0;
  isRestaurantLoaded: boolean = false;
  isDeliverymanLoaded: boolean = false;
  public countChartOption!: Partial<ChartOption> | any;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id && this.id != '') {
      this.countChartOption = {
        series: [1, 2, 3, 4, 5, 6, 7, 8, 9],
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
        colors: ['#0066cc', '#cc00cc', '#ff0066', '#00cc00', '#cc3300', '#666633', '#336699', '#6600cc', '#006666'],
        tooltip: {
          theme: 'dark',
          fillSeriesColor: false,
        },
        labels: [
          this.util.appTranslate('locality'),
          this.util.appTranslate('restaurants'),
          this.util.appTranslate('deliveryman'),
          this.util.appTranslate('banners'),
          this.util.appTranslate('restaurant_campaign'),
          this.util.appTranslate('dining_campaign'),
          this.util.appTranslate('food_campaign'),
          this.util.appTranslate('coupons'),
          this.util.appTranslate('dining_coupons')
        ],
      };
      this.getDetail();
    } else {
      this.util.onError('ts_something_went_wrong', '');
      this.location.back();
    }
  }

  getDetail() {
    console.log('Fetch Data');
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    const spinnerRef = this.util.start('ts_fetching');
    this.isRestaurantLoaded = false;
    this.isDeliverymanLoaded = false;
    this.api.get_private('v1/admin/cities/map_dialog/' + this.id + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.isRestaurantLoaded = true;
        this.isDeliverymanLoaded = true;
        if (response && response.success == true) {
          const info = response.info;
          this.name = info.name;
          if (response && response.info && response.info.translations && Array.isArray(response.info.translations)) {
            if (response.info.translations) {
              const translation = response.info.translations.find((t: any) => t.code == this.util.appLocaleName());
              this.name = translation?.value || response.info.name;
            }
          }
          if (info && info.location && info.location.coordinates && info.location.coordinates.length > 0) {
            const coordinates = info.location.coordinates;
            this.mapCenterLocation = new google.maps.LatLng(coordinates[1], coordinates[0]);
            this.markerPosition = { lat: coordinates[1], lng: coordinates[0] };
            this.circleOptions = {
              center: this.mapCenterLocation,
              radius: 5000,
              strokeColor: '#FF0000',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#FF0000',
              fillOpacity: 0.2,
              clickable: false
            };
          }

          const mappedDeliverymanList = response.drivers.map(
            (item: AdminCityMapDialogDriverInterface) => {
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

          const mappedAllDeliveryman: AdminCityMapDialogDriverInterface[] = response.allDrivers.map(
            (item: AdminCityMapDialogDriverInterface) => {
              return item;
            }
          );

          this.drivers = mappedDeliverymanList;


          const mappedRestaurantList = response.restaurants.map(
            (item: AdminCityMapDialogRestaurantInterface) => {
              const mainTranslation = item.translations!.find((t) => t.code == this.util.appLocaleName());
              item.displayName = mainTranslation?.title || item.name;
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

          const mappedAllRestaurants: AdminCityMapDialogRestaurantInterface[] = response.allRestaurants.map(
            (item: AdminCityMapDialogRestaurantInterface) => {
              const mainTranslation = item.translations!.find((t) => t.code == this.util.appLocaleName());
              item.displayName = mainTranslation?.title || item.name;
              return item;
            }
          );
          this.restaurantSource = new MatTableDataSource<AdminCityMapDialogRestaurantInterface>(mappedRestaurantList);
          // this.restaurants = mappedRestaurantList;

          this.restaurantPaginator.length = response.totalRestaurants;
          this.restaurantPaginator.hidePageSize = response.totalRestaurants <= 0 ? true : false;

          this.deliverymanSource = new MatTableDataSource<AdminCityMapDialogDriverInterface>(mappedDeliverymanList);

          this.deliverymanPaginator.length = response.totalDeliveryman;
          this.deliverymanPaginator.hidePageSize = response.totalDeliveryman <= 0 ? true : false;

          this.locationMarker = [];

          mappedAllRestaurants.forEach((element) => {
            this.locationMarker.push({
              lat: element.location.coordinates[1],
              lng: element.location.coordinates[0],
              title: element.displayName,
              icon: 'assets/images/location/restaurant_location.png',
            });
          });

          mappedAllDeliveryman.forEach((element) => {
            this.locationMarker.push({
              lat: element.location.coordinates[1],
              lng: element.location.coordinates[0],
              title: `${element.driverInfo.firstName} ${element.driverInfo.lastName}`,
              icon: 'assets/images/location/driver_location.png',
            });
          });


          const area = response && response.area && response.area.deliveryArea != 0 ? response.area.deliveryArea : 5;
          const findMode = response && response.area && response.area.findMode != '' ? response.area.findMode : 'km';
          const radiusCircle = findMode == 'km' ? area * 1000 : area * 1609.34;

          this.circleOptions = {
            center: this.mapCenterLocation,
            radius: radiusCircle,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.2,
            clickable: false
          };

          const banners = response.banners;
          const coupons = response.coupons;
          const diningCoupon = response.diningCoupon;
          const totalRestaurants = response.totalRestaurants;
          const locality = response.locality;
          const totalDeliveryman = response.totalDeliveryman;
          const restaurantCampaign = response.restaurantCampaign;
          const diningCampaign = response.diningCampaign;
          const foodCampaign = response.foodCampaign;

          this.countChartOption = {
            series: [locality, totalRestaurants, totalDeliveryman, banners, restaurantCampaign, diningCampaign, foodCampaign, coupons, diningCoupon],
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
            colors: ['#0066cc', '#cc00cc', '#ff0066', '#00cc00', '#cc3300', '#666633', '#336699', '#6600cc', '#006666'],
            tooltip: {
              theme: 'dark',
              fillSeriesColor: false,
            },
            labels: [
              this.util.appTranslate('locality'),
              this.util.appTranslate('restaurants'),
              this.util.appTranslate('deliveryman'),
              this.util.appTranslate('banners'),
              this.util.appTranslate('restaurant_campaign'),
              this.util.appTranslate('dining_campaign'),
              this.util.appTranslate('food_campaign'),
              this.util.appTranslate('coupons'),
              this.util.appTranslate('dining_coupons')
            ],
          };
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.isRestaurantLoaded = true;
        this.isDeliverymanLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  openMarkerDialog(marker: AdminCityMapDialogMarkerInterface) {
    console.log(marker);
    this.hoveredTitle = marker.title;
  }

  onRestaurantDetail(item: AdminCityMapDialogRestaurantInterface) {
    this.router.navigate(['admin/restaurant-management/restaurant-detail', item.id]);
  }

  onDeliverymanInfo(item: AdminCityMapDialogDriverInterface) {
    console.log(item);
    if (item && item.driverInfo && item.driverInfo.id && item.driverInfo.id != '') {
      this.router.navigate(['admin/driver-management/deliveryman-details', item.driverInfo.id]);
    }
  }

  onRestaurantPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getRestaurants();
  }

  onDeliverymanPageChange(event: PageEvent) {
    console.log(event);
    this.currentPageDeliveryman = event.pageIndex + 1;
    this.pageSizeDeliveryman = event.pageSize;
    this.getDeliverymans();
  }

  getRestaurants() {
    this.isRestaurantLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/restaurant/map_dialog/' + this.id + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isRestaurantLoaded = true;
        if (response && response.restaurants) {
          const mappedRestaurantList = response.restaurants.map(
            (item: AdminCityMapDialogRestaurantInterface) => {
              const mainTranslation = item.translations!.find((t) => t.code == this.util.appLocaleName());
              item.displayName = mainTranslation?.title || item.name;
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
          this.restaurantSource = new MatTableDataSource<AdminCityMapDialogRestaurantInterface>(mappedRestaurantList);
          this.restaurantPaginator.length = response.totalRestaurants;
          this.restaurantPaginator.hidePageSize = response.totalRestaurants <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isRestaurantLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  getDeliverymans() {
    this.isDeliverymanLoaded = false;
    const param: any = {
      'limit': this.pageSizeDeliveryman,
      'page': this.currentPageDeliveryman,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/driver/map_dialog/' + this.id + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isDeliverymanLoaded = true;
        if (response && response.drivers) {
          const mappedDeliverymanList = response.drivers.map(
            (item: AdminCityMapDialogDriverInterface) => {
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
          this.deliverymanSource = new MatTableDataSource<AdminCityMapDialogDriverInterface>(mappedDeliverymanList);
          this.deliverymanPaginator.length = response.totalDeliveryman;
          this.deliverymanPaginator.hidePageSize = response.totalDeliveryman <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isDeliverymanLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }
}
