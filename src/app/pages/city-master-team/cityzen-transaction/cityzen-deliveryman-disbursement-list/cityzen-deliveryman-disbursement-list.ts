import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { CityzenDeliverymanDisbursementReportInterface } from 'src/app/interfaces/cityzen.deliveryman.disbursement.report.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogCityzenDeliverymanDisbursementDetail } from './dialog-cityzen-deliveryman-disbursement-detail/dialog-cityzen-deliveryman-disbursement-detail';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-deliveryman-disbursement-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-deliveryman-disbursement-list.html',
})
export class CityzenDeliverymanDisbursementList {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  list = new MatTableDataSource<CityzenDeliverymanDisbursementReportInterface>([]);
  displayedColumn = ['name', 'amount', 'payout', 'status', 'action'];
  statusName: string = 'all';
  isLoaded: boolean = false;
  pageSize: number = 5;
  currentPage: number = 0;
  searchQuery: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router,
    private dialog: MatDialog,
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
    this.api.get_private('v1/cityzen/deliveryman_disbursement_list/' + this.util.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: CityzenDeliverymanDisbursementReportInterface) => {
              if (item && item.withdrawalMethodDetail && item.withdrawalMethodDetail?.id) {
                if (item.withdrawalMethodDetail?.translations) {
                  const translation = item.withdrawalMethodDetail.translations.find((t) => t.code == this.util.appLocaleName());
                  item.withdrawalMethodDetail.displayName = translation?.title || item.withdrawalMethodDetail.name;
                } else {
                  item.withdrawalMethodDetail.displayName = item.withdrawalMethodDetail?.name || '';
                }
              }
              return item;
            }
          );
          this.list = new MatTableDataSource<CityzenDeliverymanDisbursementReportInterface>(mappedList);
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

  viewDisbursement(report: CityzenDeliverymanDisbursementReportInterface) {
    console.log(report);
    const dialogRef = this.dialog.open(DialogCityzenDeliverymanDisbursementDetail, {
      data: { id: report.id },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'true') {
        this.getList();
      }
    });
  }

  acceptDisbursement(report: CityzenDeliverymanDisbursementReportInterface) {
    console.log(report);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/accept_deliveryman_disbursement/' + report.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true) {
          this.getList();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  rejectDisbursement(report: CityzenDeliverymanDisbursementReportInterface) {
    console.log(report);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/decline_deliveryman_disbursement/' + report.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true) {
          this.getList();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onDeliverymanDetail(item: CityzenDeliverymanDisbursementReportInterface) {
    console.log(item);
    if (item && item.driverInfo && item.driverInfo.id && item.driverInfo.id != '') {
      this.router.navigate(['cityzen-team/u/deliveryman-details', item.driverInfo.id]);
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
