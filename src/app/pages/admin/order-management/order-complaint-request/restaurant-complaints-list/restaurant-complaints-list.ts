import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminRestaurantComplaintListInterface } from 'src/app/interfaces/admin.retaurant.complaints.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-restaurant-complaints-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './restaurant-complaints-list.html',
})
export class RestaurantComplaintsList {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  complaints = new MatTableDataSource<AdminRestaurantComplaintListInterface>([]);
  displayedColumn = ['id', 'restaurant', 'reason', 'with', 'detail', 'status'];
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
      'search': this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/restaurant_complaints/get?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.complaints) {
          const mappedList = response.complaints.map(
            (item: AdminRestaurantComplaintListInterface) => {
              if (item && item.reasons && item.reasons?.id) {
                if (item.reasons?.translations) {
                  const translation = item.reasons.translations.find((t) => t.code == this.util.appLocaleName());
                  item.reasons.displayName = translation?.value || item.reasons.name;
                } else {
                  item.reasons.displayName = item.reasons?.name || '';
                }
              }

              if (item && item.restaurantInfo && item.restaurantInfo?.id) {
                if (item.restaurantInfo?.translations) {
                  const translation = item.restaurantInfo.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurantInfo.displayName = translation?.title || item.restaurantInfo.name;
                } else {
                  item.restaurantInfo.displayName = item.restaurantInfo?.name || '';
                }
              }
              return item;
            }
          );
          this.complaints = new MatTableDataSource<AdminRestaurantComplaintListInterface>(mappedList);
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

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  onFilterChangeEvent(newStatus: boolean) {
    console.log(newStatus);
    this.filterStatus = newStatus;
    this.getList();
  }

  onRestaurantDetail(item: AdminRestaurantComplaintListInterface) {
    console.log(item);
    if (item && item.restaurantInfo && item.restaurantInfo.id && item.restaurantInfo.id !== '') {
      this.router.navigate(['admin/restaurant-management/restaurant-detail', item.restaurantInfo.id]);
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
      this.api.export_collection('v1/admin/restaurant_complaints/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'RestaurantComplaints.xlsx' : 'RestaurantComplaints.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'restaurantcomplaints.json';
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
    this.router.navigate(['admin/import-export-management/import-collection/', 'restaurant_complaints']);
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
