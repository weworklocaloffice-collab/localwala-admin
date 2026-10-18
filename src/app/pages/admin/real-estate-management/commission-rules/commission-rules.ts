import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MatDialog } from '@angular/material/dialog';
import { DialogCommissionRule } from '../dialog-commission-rule/dialog-commission-rule';

export const RULE_STATUSES: string[] = ['DRAFT', 'ACTIVE', 'RETIRED'];

@Component({
  selector: 'app-real-estate-commission-rules',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './commission-rules.html',
})
export class CommissionRules {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  statuses = RULE_STATUSES;
  displayedColumn: string[] = ['name', 'rate', 'slab', 'version', 'status', 'action'];

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
    let httpParams = new HttpParams()
      .set('limit', this.pageSize)
      .set('page', this.currentPage + 1);
    if (this.selectedStatus) {
      httpParams = httpParams.set('status', this.selectedStatus);
    }
    this.api.get_private('v1/realestate/admin/commission-rules?' + httpParams.toString()).subscribe({
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

  onFilter() {
    this.currentPage = 0;
    this.getList();
  }

  /**
   * Version timeline safety: existing sales keep their frozen
   * snapshot (BR-15), so activating a new rate never restates
   * history. The screen states it next to the button.
   */
  onCreate() {
    this.dialog
      .open(DialogCommissionRule, { disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'created') {
          this.util.onSuccess('ts_created');
          this.getList();
        }
      });
  }

  onActivate(row: any) {
    this.api.post_private(`v1/realestate/admin/commission-rules/${row._id}/activate`, {}).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.getList();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  onEdit(row: any) {
    this.dialog
      .open(DialogCommissionRule, { disableClose: true, data: row })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'created') {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        }
      });
  }

  onRetire(row: any) {
    if (!confirm(`Retire this rule? ${row.name}`)) return;
    this.api.post_private(`v1/realestate/admin/commission-rules/${row._id}/retire`, {}).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.getList();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
