import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogLsStatus } from '../dialog-ls-status/dialog-ls-status';

@Component({
  selector: 'app-ls-applications',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './ls-applications.html',
})
export class LsApplications {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  displayedColumn: string[] = ['business', 'submitted', 'status', 'action'];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    this.api
      .get_private(
        'v1/local-services/admin/providers?limit=' +
          this.pageSize +
          '&page=' +
          this.currentPage +
          '&statuses=SUBMITTED,UNDER_REVIEW',
      )
      .subscribe({
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

  openDetail(row: any) {
    this.router.navigate(['/admin/local-services-management/providers', row._id]);
  }

  onTransition(row: any, status: string) {
    this.dialog
      .open(DialogLsStatus, { data: { apiPath: 'v1/local-services/admin/providers/', row, status }, disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        }
      });
  }
}
