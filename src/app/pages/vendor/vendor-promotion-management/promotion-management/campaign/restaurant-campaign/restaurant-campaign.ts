import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DateTime } from 'luxon';
import { VendorRestaurantCampaignListInterface } from 'src/app/interfaces/vendor.restaurant.campaign.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-restaurant-campaign',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './restaurant-campaign.html',
})
export class RestaurantCampaign {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  campaigns = new MatTableDataSource<VendorRestaurantCampaignListInterface>([]);
  displayedColumn = ['title', 'duration', 'time', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog
  ) {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/vendor_web/restaurant_campaign/near_me/' + this.util.getItem('_vendorId') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: VendorRestaurantCampaignListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.title;
                item.displayShortDescription = translation?.shortDescription || item.shortDescription;
              } else {
                item.displayName = item?.title || '';
                item.displayShortDescription = item?.shortDescription || '';
              }

              if (item && item.city && item.city?.id) {
                if (item.city?.translations) {
                  const translation = item.city.translations.find((t) => t.code == this.util.appLocaleName());
                  item.city.displayName = translation?.value || item.city.name;
                } else {
                  item.city.displayName = item.city?.name || '';
                }
              }

              return item;
            }
          );
          this.campaigns = new MatTableDataSource<VendorRestaurantCampaignListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.campaigns);
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

  getFormatedDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  getFormatedTime(time: string) {
    return DateTime.fromFormat(time, 'HH:mm', { locale: this.util.appLocaleName() }).toFormat('hh:mm a');
  }

  joined(element: VendorRestaurantCampaignListInterface) {
    return element && element.restaurant && element.restaurant.length && element.restaurant.length > 0 && element.restaurant.includes(this.util.getItem('_vendorId')) ? true : false;
  }

  onAction(element: VendorRestaurantCampaignListInterface) {
    if (element && element.restaurant && element.restaurant.length && element.restaurant.length > 0 && element.restaurant.includes(this.util.getItem('_vendorId'))) {
      console.log('leave');
      const dialogRef = this.dialog.open(ConfirmDialog, {
        data: { title: 'ts_are_you_sure', subTitle: 'ts_removed_from_campaign_instruction', okTitle: 'ts_leave_campaign', closeTitle: 'ts_cancel' },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
        if (result && result.action && result.action == "confirm") {
          console.log('confirmed');
          const spinnerRef = this.util.start();
          this.api.delete_private('v1/vendor_web/restaurant_campaign/leave/' + element.id + '/' + this.util.getItem('_vendorId')).subscribe({
            next: (response: any) => {
              console.log(response);
              this.util.stop(spinnerRef);
              this.util.onSuccess('ts_removed_from_campaign');
              this.getList();
            }, error: (error: any) => {
              console.log(error);
              this.util.stop(spinnerRef);
              this.util.handleError(error, 'vendor');
            }
          });
        }
      });
    } else {
      console.log('join');
      const spinnerRef = this.util.start();
      const param = {
        campaign: element.id,
        restaurant: this.util.getItem('_vendorId')
      }
      this.api.post_private('v1/vendor_web/restaurant_campaign/join_request', param).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_request_sent');
          this.getList();
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'vendor');
        }
      });
    }
  }

}
