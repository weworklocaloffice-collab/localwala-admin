import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { DateTime } from 'luxon';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CityzenFoodCampaignListInterface } from 'src/app/interfaces/cityzen.food.campaign.interface';
import { HttpParams } from '@angular/common/http';
import { DialogCityzenFoodCampaignRequest } from './dialog-cityzen-food-campaign-request/dialog-cityzen-food-campaign-request';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-food-campaign',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-food-campaign.html',
})
export class CityzenFoodCampaign {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  campaigns = new MatTableDataSource<CityzenFoodCampaignListInterface>([]);
  displayedColumn = ['title', 'duration', 'time', 'foods', 'request', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  searchQuery: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'search': this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/food_campaign_list/' + this.util.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: CityzenFoodCampaignListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.title;
              } else {
                item.displayName = item?.title || '';
              }
              return item;
            }
          );
          this.campaigns = new MatTableDataSource<CityzenFoodCampaignListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.campaigns);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onAddCampaign() {
    this.router.navigate(['cityzen-team/u/add-food-campaign']);
  }

  onStatusChange(event: MatSlideToggleChange, campaigns: CityzenFoodCampaignListInterface) {
    console.log(event);
    console.log(campaigns);
    campaigns.status = event.checked;
    this.api.patch_private('v1/cityzen/update_food_campaign_status/' + campaigns.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onEdit(campaigns: CityzenFoodCampaignListInterface) {
    console.log(campaigns);
    console.log(campaigns.id);
    this.router.navigate(['cityzen-team/u/manage-food-campaign', campaigns.id]);
  }

  onDelete(campaigns: CityzenFoodCampaignListInterface) {
    console.log(campaigns);
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_campaign_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/cityzen/delete_food_campaign/' + campaigns.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'cityzen');
          }
        });
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

  onJoiningRequest(campaigns: CityzenFoodCampaignListInterface) {
    console.log(campaigns);
    const dialogRef = this.dialog.open(DialogCityzenFoodCampaignRequest, {
      data: { id: campaigns.id, name: campaigns.displayName },
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      height: "calc(100% - 30px)",
      width: "calc(100% - 30px)",
      maxWidth: "100%",
      maxHeight: "100%",
      panelClass: 'full-width-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      this.getList();
    });
  }

  onDetail(id: string) {
    console.log(id);
    this.router.navigate(['cityzen-team/u/food-campaign-detail', id]);
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
