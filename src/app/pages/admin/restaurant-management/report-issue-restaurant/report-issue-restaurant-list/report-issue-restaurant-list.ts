import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AdminReportIssueRestaurantListInterface } from 'src/app/interfaces/admin.report.issue.restaurant.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-report-issue-restaurant-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './report-issue-restaurant-list.html',
})
export class ReportIssueRestaurantList {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  reports = new MatTableDataSource<AdminReportIssueRestaurantListInterface>([]);
  displayedColumn = ['id', 'user', 'reason', 'restaurant', 'status'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  filterStatus: boolean = true;
  exportType: string = 'export';
  searchQuery: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router
  ) {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'status': this.filterStatus,
      'search': this.searchQuery
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/report_issue_list/restaurant/get?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.reports) {
          const mappedList = response.reports.map(
            (item: AdminReportIssueRestaurantListInterface) => {
              if (item && item.restaurant && item.restaurant?.id) {
                if (item.restaurant?.translations) {
                  const translation = item.restaurant.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurant.displayName = translation?.title || item.restaurant.name;
                } else {
                  item.restaurant.displayName = item.restaurant?.name || '';
                }
              }

              if (item && item.reasons && item.reasons?.id) {
                if (item.reasons?.translations) {
                  const translation = item.reasons.translations.find((t) => t.code == this.util.appLocaleName());
                  item.reasons.displayName = translation?.value || item.reasons.name;
                } else {
                  item.reasons.displayName = item.reasons?.name || '';
                }
              }
              return item;
            }
          );
          this.reports = new MatTableDataSource<AdminReportIssueRestaurantListInterface>(mappedList);
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

  onFilterChangeEvent(newStatus: boolean) {
    console.log(newStatus);
    this.filterStatus = newStatus;
    this.getList();
  }

  onUserInfo(item: AdminReportIssueRestaurantListInterface) {
    console.log(item);
    if (item && item.userInfo && item.userInfo.id && item.userInfo.id != '') {
      this.router.navigate(['admin/customer-management/customer-detail', item.userInfo.id]);
    }
  }

  onRestaurantDetail(item: AdminReportIssueRestaurantListInterface) {
    console.log(item);
    if (item && item.restaurant && item.restaurant.id && item.restaurant.id !== '') {
      this.router.navigate(['admin/restaurant-management/restaurant-detail', item.restaurant.id]);
    }
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      console.log('exportCollection Now');
      const spinnerRef = this.util.start();
      const param: any = {
        'type': exportOption,
        'search': this.searchQuery,
        'status': this.filterStatus
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/report_issue_list/restaurant/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'RestaurantReportIssue.xlsx' : 'RestaurantReportIssue.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'reportissuerestaurants.json';
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
    this.router.navigate(['admin/import-export-management/import-collection/', 'restaurant_report_issue']);
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
