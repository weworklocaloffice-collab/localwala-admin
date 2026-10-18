import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { DateTime } from 'luxon';
import { AccountantDeliverymanDisbursementInterface } from 'src/app/interfaces/accountant.deliveryman.disbursement.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-accountant-deliveryman-disbursement-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './accountant-deliveryman-disbursement-list.html',
})
export class AccountantDeliverymanDisbursementList {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  list = new MatTableDataSource<AccountantDeliverymanDisbursementInterface>([]);
  displayedColumn = ['id', 'amount', 'time', 'status', 'action'];
  statusName: string = 'all';
  isLoaded: boolean = false;
  pageSize: number = 5;
  currentPage: number = 0;
  exportType: string = 'export';
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
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/accountant/deliveryman_disbursement_list?' + httpParams.toString()).subscribe({
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
        this.util.handleError(error, 'accountant');
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

  onFilterChangeEvent(newStatus: string) {
    console.log(newStatus);
    this.statusName = newStatus;
    this.getList();
  }

  onReportList(id: string) {
    console.log(id);
    this.router.navigate(['/accountant-team/u/deliveryman-disbursement-report-list/', id]);
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      const spinnerRef = this.util.start();
      this.api.export_collection('v1/accountant/deliveryman_disbursement/export/' + exportOption + '/' + this.statusName).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          const fileName = exportOption == 'excel' ? 'DeliverymanDisbursement.xlsx' : 'DeliverymanDisbursement.csv';
          this.api.download_export_file(blob, fileName);
          this.exportType = 'export';
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.exportType = 'export';
          this.util.handleError(error, 'accountant');
        }
      });
    }
  }

}
