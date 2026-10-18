import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DateTime } from 'luxon';
import { AdminDeliverymanDisbursementReportListInterface } from 'src/app/interfaces/admin.deliveryman.disbursement.report.list.interface';
import { AdminPayoutMethodLimitedDataInterface } from 'src/app/interfaces/admin.payout.method.limited.data.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogDeliverymanDisbursementDetail } from '../../transactions/deliveryman-disbursements/deliveryman-disbursement-list/dialog-deliveryman-disbursement-detail/dialog-deliveryman-disbursement-detail';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-deliveryman-disbursement-report',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon, MatNativeDateModule],
  templateUrl: './deliveryman-disbursement-report.html',
})
export class DeliverymanDisbursementReport {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  reports = new MatTableDataSource<AdminDeliverymanDisbursementReportListInterface>([]);
  displayedColumn = ['id', 'deliveryman', 'amount', 'creds', 'status', 'date', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  isFilterApplied: boolean = false;
  filterDates = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  payoutMethod: string = 'all';
  statusName: string = 'all';
  searchQuery: string = '';
  payoutMethodList: AdminPayoutMethodLimitedDataInterface[] = [];
  pendingAmount: number = 0;
  pendingCount: number = 0;
  approvedAmount: number = 0;
  approvedCount: number = 0;
  rejectedAmount: number = 0;
  rejectedCount: number = 0;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
    private router: Router,
  ) {
    this.getInitial();
    this.getList();
  }

  getInitial() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/reports/deliverymanDisbursementReportInitial').subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        console.log(response);
        if (response && response.methods && response.methods.length) {
          const mappedList = response.methods.map(
            (item: AdminPayoutMethodLimitedDataInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.payoutMethodList = mappedList;
        }
        if (response && response.stats) {
          if (response && response.stats && response.stats.pending) {
            const stats = response.stats.pending;
            this.pendingAmount = stats.amount;
            this.pendingCount = stats.count;
          }

          if (response && response.stats && response.stats.approved) {
            const stats = response.stats.approved;
            this.approvedAmount = stats.amount;
            this.approvedCount = stats.count;
          }

          if (response && response.stats && response.stats.cancelled) {
            const stats = response.stats.cancelled;
            this.rejectedAmount = stats.amount;
            this.rejectedCount = stats.count;
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onFilter() {
    this.isFilterApplied = true;
    this.pageSize = 5;
    this.currentPage = 0;
    this.searchQuery = '';
    this.getList();
  }

  onSearch() {
    this.isFilterApplied = false;
    this.pageSize = 5;
    this.currentPage = 0;
    this.statusName = 'all';
    this.payoutMethod = 'all';
    this.filterDates.controls['start'].setValue(null);
    this.filterDates.controls['end'].setValue(null);
    this.paginator.firstPage();
    this.getList();
  }

  clearFilter() {
    this.isFilterApplied = false;
    this.pageSize = 5;
    this.currentPage = 0;
    this.searchQuery = '';
    this.payoutMethod = 'all';
    this.statusName = 'all';
    this.filterDates.controls['start'].setValue(null);
    this.filterDates.controls['end'].setValue(null);
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    let filterStartDate = '';
    let filterEndDate = '';
    if (this.filterDates.controls['start'].value != null && this.filterDates.controls['end'].value != null) {
      const start = this.filterDates.controls['start'].value;
      const end = this.filterDates.controls['end'].value;
      filterStartDate = DateTime.fromJSDate(new Date(start)).toFormat('dd/MM/yyyy');
      filterEndDate = DateTime.fromJSDate(new Date(end)).toFormat('dd/MM/yyyy');
    }
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'search': this.searchQuery,
      'payment': this.payoutMethod,
      'filter': this.isFilterApplied,
      'status': this.statusName,
      'filterDates': `${filterStartDate}-${filterEndDate}`,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/reports/deliverymanDisbursement?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminDeliverymanDisbursementReportListInterface) => {
              if (item && item.withdrawalMethodDetail && item.withdrawalMethodDetail?.id) {
                if (item.withdrawalMethodDetail?.translations) {
                  const translation = item.withdrawalMethodDetail.translations.find((t) => t.code == this.util.appLocaleName());
                  item.withdrawalMethodDetail.displayName = translation?.title || item.withdrawalMethodDetail.name;
                } else {
                  item.withdrawalMethodDetail.displayName = item.withdrawalMethodDetail?.name || '';
                }
              }

              if (item && item.defaultPayoutMethodDetailInfo && item.defaultPayoutMethodDetailInfo?.id) {
                if (item.defaultPayoutMethodDetailInfo?.translations) {
                  const translation = item.defaultPayoutMethodDetailInfo.translations.find((t) => t.code == this.util.appLocaleName());
                  item.defaultPayoutMethodDetailInfo.displayName = translation?.title || item.defaultPayoutMethodDetailInfo.name;
                } else {
                  item.defaultPayoutMethodDetailInfo.displayName = item.defaultPayoutMethodDetailInfo?.name || '';
                }
              }
              return item;
            }
          );
          this.reports = new MatTableDataSource<AdminDeliverymanDisbursementReportListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.reports);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }


  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      console.log('exportCollection Now');
      const spinnerRef = this.util.start();
      let filterStartDate = '';
      let filterEndDate = '';
      if (this.filterDates.controls['start'].value != null && this.filterDates.controls['end'].value != null) {
        const start = this.filterDates.controls['start'].value;
        const end = this.filterDates.controls['end'].value;
        filterStartDate = DateTime.fromJSDate(new Date(start)).toFormat('dd/MM/yyyy');
        filterEndDate = DateTime.fromJSDate(new Date(end)).toFormat('dd/MM/yyyy');
      }
      const param: any = {
        'type': exportOption,
        'search': this.searchQuery,
        'payment': this.payoutMethod,
        'filter': this.isFilterApplied,
        'status': this.statusName,
        'filterDates': `${filterStartDate}-${filterEndDate}`,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/reports/deliveryman_disbursement/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'DeliverymanDisbursementReport.xlsx' : 'DeliverymanDisbursementReport.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'deliverymandisbursements.json';
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

  viewDisbursement(report: AdminDeliverymanDisbursementReportListInterface) {
    console.log(report);
    const dialogRef = this.dialog.open(DialogDeliverymanDisbursementDetail, {
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

  onDeliverymanDetail(item: AdminDeliverymanDisbursementReportListInterface) {
    if (item && item.driverInfo && item.driverInfo.id && item.driverInfo.id != '') {
      this.router.navigate(['admin/driver-management/deliveryman-details', item.driverInfo.id]);
    }
  }

}
