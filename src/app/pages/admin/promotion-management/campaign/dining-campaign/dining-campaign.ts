import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { DiningCampaignListInterface } from 'src/app/interfaces/admin.dining.campaign.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { DialogDiningCampaignRequest } from './dialog-dining-campaign-request/dialog-dining-campaign-request';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dining-campaign',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dining-campaign.html',
})
export class DiningCampaign {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  campaigns = new MatTableDataSource<DiningCampaignListInterface>([]);
  displayedColumn = ['title', 'duration', 'time', 'city', 'restaurant', 'request', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  searchQuery: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
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
    this.api.get_private('v1/admin/dining_campaign/getAll?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: DiningCampaignListInterface) => {
              const mainTranslation = item.translations!.find((t) => t.code == this.util.appLocaleName());
              item.displayName = mainTranslation?.title || item.title;

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
          this.campaigns = new MatTableDataSource<DiningCampaignListInterface>(mappedList);
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

  onAddCampaign() {
    this.router.navigate(['admin/promotion-management/add-dining-campaign']);
  }

  onStatusChange(event: MatSlideToggleChange, campaigns: DiningCampaignListInterface) {
    console.log(event);
    console.log(campaigns);
    campaigns.status = event.checked;
    this.api.patch_private('v1/admin/dining_campaign/updateStatus/' + campaigns.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onEdit(campaigns: DiningCampaignListInterface) {
    console.log(campaigns);
    console.log(campaigns.id);
    this.router.navigate(['admin/promotion-management/manage-dining-campaign', campaigns.id]);
  }

  onDelete(campaigns: DiningCampaignListInterface) {
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
        this.api.delete_private('v1/admin/dining_campaign/delete/' + campaigns.id).subscribe({
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

  onJoiningRequest(campaigns: DiningCampaignListInterface) {
    console.log(campaigns);
    console.log('on image picker');
    const dialogRef = this.dialog.open(DialogDiningCampaignRequest, {
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
    this.router.navigate(['admin/promotion-management/dining-campaign-detail', id]);
  }

  onCity(item: DiningCampaignListInterface) {
    if (item && item.city && item.city.id != '') {
      this.router.navigate(['admin/zone-setup/city-detail', item.city.id]);
    }
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      const spinnerRef = this.util.start();
      const param: any = {
        'type': exportOption,
        'search': this.searchQuery,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/dining_campaign/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'DiningCampaign.xlsx' : 'DiningCampaign.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'diningcampaigns.json';
            this.api.download_export_file(blob, fileName);
          }
          this.exportType = 'export';
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.exportType = 'export';
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  importCollection() {
    this.router.navigate(['admin/import-export-management/import-collection/', 'dining_campaign']);
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
