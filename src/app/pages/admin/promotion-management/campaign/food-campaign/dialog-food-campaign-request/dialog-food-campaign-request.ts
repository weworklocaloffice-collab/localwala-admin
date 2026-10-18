import { Component, Inject, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FoodCampaignRequestListInterface } from 'src/app/interfaces/food.campaign.request.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-dialog-food-campaign-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './dialog-food-campaign-request.html',
})
export class DialogFoodCampaignRequest {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  campaigns = new MatTableDataSource<FoodCampaignRequestListInterface>([]);
  displayedColumn = ['restaurant', 'food', 'price', 'discount', 'action'];
  id: string = '';
  name: string = '';
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private router: Router,
    public dialogRef: MatDialogRef<DialogFoodCampaignRequest>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.id && this.data.name) {
      this.id = this.data.id;
      this.name = this.data.name;
      this.getList();
    } else {
      this.dialogRef.close({ event: 'close' });
    }
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
    this.api.get_private('v1/admin/food_campaign_request/get/' + this.id + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: FoodCampaignRequestListInterface) => {
              if (item && item.restaurants && item.restaurants?.id) {
                if (item.restaurants?.translations) {
                  const translation = item.restaurants.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurants.displayName = translation?.title || item.restaurants.name;
                  item.restaurants.displayAddress = translation?.address || item.restaurants.address;
                } else {
                  item.restaurants.displayName = item.restaurants?.name || '';
                  item.restaurants.displayAddress = item.restaurants?.address || '';
                }
              }

              if (item && item.foods && item.foods?.id) {
                if (item.foods?.translations) {
                  const translation = item.foods.translations.find((t) => t.code == this.util.appLocaleName());
                  item.foods.displayName = translation?.title || item.foods.name;
                  item.foods.displayShortDescription = translation?.shortDescription || item.foods.name;
                } else {
                  item.foods.displayName = item.foods?.name || '';
                  item.foods.displayShortDescription = item.foods?.shortDescription || '';
                }
              }

              return item;
            }
          );
          this.campaigns = new MatTableDataSource<FoodCampaignRequestListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.campaigns);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onSelect() {
    this.dialogRef.close({ event: 'ok' });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  acceptRequest(campaign: FoodCampaignRequestListInterface) {
    console.log('accept', campaign);
    const spinnerRef = this.util.start();
    this.api.get_private('v1/admin/food_campaign_request/accept/' + campaign.campaign + '/' + campaign.food).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.getList();
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  rejectRequest(campaign: FoodCampaignRequestListInterface) {
    console.log('reject', campaign);
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_campaign_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/food_campaign_request/reject/' + campaign.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'admin');
          }
        });
      }
    });
  }

  onRestaurantDetail(item: FoodCampaignRequestListInterface) {
    console.log(item);
    if (item && item.restaurant && item.restaurant != '') {
      this.dialogRef.close({ event: 'close' });
      this.router.navigate(['admin/restaurant-management/restaurant-detail', item.restaurant]);
    }
  }

}
