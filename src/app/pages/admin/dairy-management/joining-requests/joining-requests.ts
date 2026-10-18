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
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { ReviewJoiningRequestDialog } from '../dialog-review-request/dialog-review-request';

@Component({
  selector: 'app-dairy-joining-requests',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './joining-requests.html',
})
export class JoiningRequests {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  searchQuery: string = '';
  selectedStatus: string = 'pending';
  displayedColumn: string[] = ['name', 'location', 'applicant', 'status', 'action'];

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

  /**
   * The pending queue is the default view.
   *
   * An operator opening this screen is asking "what needs a decision", and an
   * unfiltered list would bury today's work under every request ever approved.
   */
  getList() {
    this.isLoaded = false;
    const param: any = {
      limit: this.pageSize,
      page: this.currentPage,
      status: this.selectedStatus,
      search: this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) {
        return;
      }
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/dairy/admin/joining-requests?' + httpParams.toString()).subscribe({
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

  onSearch() {
    this.currentPage = 0;
    this.getList();
  }

  /**
   * Approve or reject.
   *
   * Approval flips `Business.verified`, which is what lets the outlet trade — so it
   * goes through a dialog that states that consequence and, for a rejection, collects
   * the reason that gets stored against the request.
   */
  onReview(row: any, approve: boolean) {
    if (!approve) {
      this.dialog
        .open(ConfirmDialog, {
          data: {
            title: 'ts_are_you_sure',
            subTitle: 'ts_reject_outlet_instruction',
            okTitle: 'ts_yes_reject_it',
            closeTitle: 'ts_cancel',
          },
          disableClose: true,
        })
        .afterClosed()
        .subscribe((result: any) => {
          if (result && result.action == 'confirm') {
            this.openReviewDialog(row, false);
          }
        });
      return;
    }

    this.openReviewDialog(row, true);
  }

  private openReviewDialog(row: any, approve: boolean) {
    this.dialog
      .open(ReviewJoiningRequestDialog, {
        data: { row: row, approve: approve },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'reviewed') {
          this.util.onSuccess(approve ? 'ts_outlet_approved' : 'ts_outlet_rejected');
          this.getList();
        }
      });
  }
}
