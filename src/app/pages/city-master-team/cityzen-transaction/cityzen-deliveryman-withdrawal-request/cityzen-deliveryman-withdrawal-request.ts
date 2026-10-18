import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { CityzenDeliverymanWithdrawalRequestInterface } from 'src/app/interfaces/cityzen.deliveryman.withdrawal.request.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-deliveryman-withdrawal-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-deliveryman-withdrawal-request.html',
})
export class CityzenDeliverymanWithdrawalRequest {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  list = new MatTableDataSource<CityzenDeliverymanWithdrawalRequestInterface>([]);
  displayedColumn = ['id', 'name', 'amount', 'time', 'status', 'action'];
  statusName: string = 'all';
  isLoaded: boolean = false;
  pageSize: number = 5;
  currentPage: number = 0;
  searchQuery: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router,
  ) {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'status': this.statusName,
      'search': this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/deliveryman_withdrawal_request/' + this.util.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          this.list = response.results;
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onFilterChangeEvent(newStatus: string) {
    console.log(newStatus);
    this.statusName = newStatus;
    this.getList();
  }

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  getStatusColor(requestStatus: string) {
    if (requestStatus == 'created') {
      return 'primary';
    } else if (requestStatus == 'accepted') {
      return 'success';
    } else if (requestStatus == 'rejected') {
      return 'error';
    }
    return 'primary';
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  openDetail(detail: CityzenDeliverymanWithdrawalRequestInterface) {
    console.log(detail);
    this.router.navigate(['/cityzen-team/u/withdrawal-request-detail/', detail.id]);
  }

  onDeliverymanDetail(item: CityzenDeliverymanWithdrawalRequestInterface) {
    console.log(item);
    if (item && item.deliveryman && item.deliveryman.id && item.deliveryman.id != '') {
      this.router.navigate(['cityzen-team/u/deliveryman-details', item.deliveryman.id]);
    }
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
