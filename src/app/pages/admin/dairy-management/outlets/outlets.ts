import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogOutletTerms } from '../dialog-outlet-terms/dialog-outlet-terms';
import { DialogOutletStatus } from '../dialog-outlet-status/dialog-outlet-status';

@Component({
  selector: 'app-dairy-outlets',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './outlets.html',
})
export class Outlets {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  displayedColumn: string[] = ['name', 'location', 'commission', 'status', 'action'];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      limit: this.pageSize,
      page: this.currentPage,
      status: this.selectedStatus,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) {
        return;
      }
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/dairy/admin/partners?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        if (response && response.results) {
          this.list = response.results;
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onStatusFilter() {
    this.currentPage = 0;
    this.getList();
  }

  /** Commission, payout mode and the agreement dates. */
  onEditTerms(row: any) {
    this.dialog
      .open(DialogOutletTerms, { data: { row: row }, disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_outlet_terms_updated');
          this.getList();
        }
      });
  }

  /**
   * Suspend or terminate.
   *
   * `terminated` is a one-way door in the UI even though the API allows moving back
   * to `active` — so a misclick is a deliberate act to undo rather than another click.
   */
  onChangeStatus(row: any, status: string) {
    this.dialog
      .open(DialogOutletStatus, { data: { row: row, status: status }, disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess(
            status == 'active' ? 'ts_outlet_reactivated' : 'ts_outlet_status_updated',
          );
          this.getList();
        }
      });
  }
}
