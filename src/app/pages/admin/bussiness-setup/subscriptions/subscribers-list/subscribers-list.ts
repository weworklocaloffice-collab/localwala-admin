import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SubscriberListInterface } from 'src/app/interfaces/subscriber.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DateTime } from 'luxon';
import { MatDialog } from '@angular/material/dialog';
import { DialogExtendSubscriptionDate } from './dialog-extend-subscription-date/dialog-extend-subscription-date';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-subscribers-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './subscribers-list.html',
})
export class SubscribersList {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  subscriptions = new MatTableDataSource<SubscriberListInterface>([]);
  displayedColumn = ['restaurant', 'subscription', 'trail', 'date', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  searchQuery: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private router: Router
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
    this.api.get_private('v1/admin/subscriber/getAll?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: SubscriberListInterface) => {
              if (item && item.restaurant && item.restaurant?.id) {
                if (item.restaurant?.translations) {
                  const translation = item.restaurant.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurant.displayName = translation?.title || item.restaurant.name;
                } else {
                  item.restaurant.displayName = item.restaurant?.name || '';
                }
              }

              if (item && item.subscriptions && item.subscriptions?.id) {
                if (item.subscriptions?.translations) {
                  const translation = item.subscriptions.translations.find((t) => t.code == this.util.appLocaleName());
                  item.subscriptions.displayName = translation?.title || item.subscriptions.name;
                } else {
                  item.subscriptions.displayName = item.subscriptions?.name || '';
                }
              }
              return item;
            }
          );
          this.subscriptions = new MatTableDataSource<SubscriberListInterface>(mappedList);
          console.log(this.subscriptions);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
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

  onExtendDate(subscriber: SubscriberListInterface) {
    console.log(subscriber);
    const dialogRef = this.dialog.open(DialogExtendSubscriptionDate, {
      data: {
        restaurant: subscriber.restaurant.displayName,
        subscription: subscriber.subscriptions.displayName,
        id: subscriber.id,
        endDate: subscriber.endDate,
        startDate: subscriber.startDate,
        trialEndDate: subscriber.trialEndDate,
        trialStartDate: subscriber.trialStartDate,
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getList();
      }
    });
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
      this.api.export_collection('v1/admin/subscriber/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'PackageSubscriber.xlsx' : 'PackageSubscriber.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'subscribers.json';
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
    this.router.navigate(['admin/import-export-management/import-collection/', 'restaurant_subscriber']);
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
