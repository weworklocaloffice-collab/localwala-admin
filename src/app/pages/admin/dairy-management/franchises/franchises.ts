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
import { DialogFranchiseStatus } from '../dialog-franchise-status/dialog-franchise-status';
import { DialogFranchiseCreate } from '../dialog-franchise-create/dialog-franchise-create';

/**
 * The moves the API will accept from each status.
 *
 * Mirrors the `allowed` table in `setFranchiseStatus`. As with settlements, the
 * screen offers only legal moves so an operator is not shown a control that will
 * come back as a 400.
 *
 * Exported so `franchises.spec.ts` can compare it against the service's own table.
 */
export const FRANCHISE_TRANSITIONS: { [status: string]: string[] } = {
  pending: ['active', 'terminated'],
  active: ['suspended', 'expired', 'terminated'],
  suspended: ['active', 'terminated'],
  expired: ['active', 'terminated'],
  terminated: [],
};

@Component({
  selector: 'app-dairy-franchises',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './franchises.html',
})
export class Franchises {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  selectedCity: string = '';
  listOfCities: any[] = [];
  displayedColumn: string[] = ['name', 'territory', 'revenueShare', 'supply', 'status', 'action'];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.getList();
    this.getCities();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      limit: this.pageSize,
      page: this.currentPage,
      status: this.selectedStatus,
      city: this.selectedCity,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) {
        return;
      }
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/dairy/admin/franchises?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        if (response && response.franchises) {
          this.list = response.franchises;
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

  /** The city master data is the same public list the registration form uses. */
  getCities() {
    this.api.get_public('v1/public/register/getBasicDataDairyRequest').subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.listOfCities = response;
        }
      },
      error: (error: any) => {
        console.error('Could not load cities for the franchise filter:', error);
      },
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onFilter() {
    this.currentPage = 0;
    this.getList();
  }

  actionsFor(row: any): string[] {
    return FRANCHISE_TRANSITIONS[row.status] || [];
  }

  onChangeStatus(row: any, status: string) {
    this.dialog
      .open(DialogFranchiseStatus, { data: { row: row, status: status }, disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_franchise_status_updated');
          this.getList();
        }
      });
  }

  onCreate() {
    this.dialog
      .open(DialogFranchiseCreate, { data: { cities: this.listOfCities }, disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'add') {
          this.util.onSuccess('ts_franchise_created');
          this.getList();
        }
      });
  }
}
