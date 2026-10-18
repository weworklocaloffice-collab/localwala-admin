import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { CityzenDeliverymanWithdrawalRequestListInterface } from 'src/app/interfaces/cityzen.deliveryman.withdrawal.request.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-deliveryman-detail-withdrawal-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-deliveryman-detail-withdrawal-request.html',
})
export class CityzenDeliverymanDetailWithdrawalRequest implements AfterViewInit {

  @Input() driverId!: string;
  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  list = new MatTableDataSource<CityzenDeliverymanWithdrawalRequestListInterface>([]);
  displayedColumn = ['id', 'amount', 'time', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {
  }

  ngAfterViewInit() {
    console.log(`------ ${this.driverId}`);
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'deliveryman': this.driverId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/deliveryman_detail_withdrawal_request_list?' + httpParams.toString()).subscribe({
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

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
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

  openDetail(detail: CityzenDeliverymanWithdrawalRequestListInterface) {
    console.log(detail);
    this.router.navigate(['/cityzen-team/u/withdrawal-request-detail/', detail.id]);
  }

}
