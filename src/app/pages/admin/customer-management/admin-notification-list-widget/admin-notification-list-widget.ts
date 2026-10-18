import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DateTime } from 'luxon';
import { AdminNotificationListInterface } from 'src/app/interfaces/admin.notification.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-admin-notification-list-widget',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './admin-notification-list-widget.html',
})
export class AdminNotificationListWidget {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  notification = new MatTableDataSource<AdminNotificationListInterface>([]);
  displayedColumn = ['title', 'datetime'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public api: ApiService,
    public util: UtilService
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
    this.api.get_private('v1/admin/notification_list?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminNotificationListInterface) => {
              let username: string = '';
              let userHelper: boolean = false;

              if (item && item.userHelper.toString() == 'true') {
                userHelper = true;
                username = item.username;
              }

              let restaurantName: string = '';
              let restaurantHelper: boolean = false;
              if (item && item.restaurantHelper.toString() == 'true') {
                restaurantHelper = true;
                if (item && item.restaurantName && item.restaurantName?.name) {
                  if (item.restaurantName?.translations) {
                    const translation = item.restaurantName.translations.find((t) => t.code == this.util.appLocaleName());
                    restaurantName = translation?.title || item.restaurantName.name;
                  } else {
                    restaurantName = item.restaurantName?.name;
                  }
                }
              }

              let time: string = '';
              let timeHelper: boolean = false;
              if (item && item.timeHelper.toString() == 'true') {
                timeHelper = true;
                time = item.time;
              }

              let driverName: string = '';
              let driverHelper: boolean = false;
              if (item && item.driverHelper.toString() == 'true') {
                driverHelper = true;
                driverName = item.driverName;
              }

              let reason: string = '';
              let reasonHelper: boolean = false;
              if (item && item.reasonHelper.toString() == 'true') {
                reasonHelper = true;
                reason = item.reason;
              }

              let amount: string = '';
              let amountHelper: boolean = false;
              if (item && item.amountHelper.toString() == 'true') {
                amountHelper = true;
                amount = item.amount.toString();
              }

              let packageName: string = '';
              let packageHelper: boolean = false;
              if (item && item.packageHelper.toString() == 'true') {
                packageHelper = true;
                if (item && item.packageName && item.packageName?.name) {
                  if (item.packageName?.translations) {
                    const translation = item.packageName.translations.find((t) => t.code == this.util.appLocaleName());
                    packageName = translation?.title || item.packageName.name;
                  } else {
                    packageName = item.packageName?.name;
                  }
                }
              }

              let kind: string = '';
              let kindHelper: boolean = false;
              if (item && item.kindHelper.toString() == 'true') {
                kindHelper = true;
                kind = item.kind;
              }

              let order: string = '';
              let orderHelper: boolean = false;
              if (item && item.orderHelper.toString() == 'true') {
                orderHelper = true;
                order = item.order;
              }

              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.title;
                item.displayContent = translation?.description || item.content;
              } else {
                item.displayName = item?.title || '';
                item.displayContent = item?.content || '';
              }

              if (userHelper) {
                item.displayName = item.displayName.replaceAll('{{user}}', username);
                item.displayContent = item.displayContent.replaceAll('{{user}}', username);
              }

              if (restaurantHelper) {
                item.displayName = item.displayName.replaceAll('{{restaurant}}', restaurantName);
                item.displayContent = item.displayContent.replaceAll('{{restaurant}}', restaurantName);
              }

              if (timeHelper) {
                item.displayName = item.displayName.replaceAll('{{time}}', time);
                item.displayContent = item.displayContent.replaceAll('{{time}}', time);
              }

              if (driverHelper) {
                item.displayName = item.displayName.replaceAll('{{driver}}', driverName);
                item.displayContent = item.displayContent.replaceAll('{{driver}}', driverName);
              }

              if (reasonHelper) {
                item.displayName = item.displayName.replaceAll('{{reason}}', reason);
                item.displayContent = item.displayContent.replaceAll('{{reason}}', reason);
              }

              if (amountHelper) {
                item.displayName = item.displayName.replaceAll('{{amount}}', amount);
                item.displayContent = item.displayContent.replaceAll('{{amount}}', amount);
              }

              if (packageHelper) {
                item.displayName = item.displayName.replaceAll('{{packageName}}', packageName);
                item.displayContent = item.displayContent.replaceAll('{{packageName}}', packageName);
              }

              if (kindHelper) {
                item.displayName = item.displayName.replaceAll('{{kind}}', kind);
                item.displayContent = item.displayContent.replaceAll('{{kind}}', kind);
              }

              if (orderHelper) {
                item.displayName = item.displayName.replaceAll('{{order}}', order);
                item.displayContent = item.displayContent.replaceAll('{{order}}', order);
              }

              return item;
            }
          );
          this.notification = new MatTableDataSource<AdminNotificationListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
        console.log(this.notification);
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

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

}
