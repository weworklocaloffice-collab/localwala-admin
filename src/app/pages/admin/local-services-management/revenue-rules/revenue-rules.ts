import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogRuleForm } from '../dialog-rule-form/dialog-rule-form';
import { DialogRuleStatus } from '../dialog-rule-status/dialog-rule-status';

@Component({
  selector: 'app-ls-revenue-rules',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './revenue-rules.html',
})
export class RevenueRules {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  displayedColumn: string[] = ['code', 'scope', 'toggles', 'amounts', 'status', 'action'];

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
    const param: any = { limit: this.pageSize, page: this.currentPage, status: this.selectedStatus };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) return;
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/local-services/admin/revenue/rules?' + httpParams.toString()).subscribe({
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

  onCreate() {
    this.dialog
      .open(DialogRuleForm, { data: {}, disableClose: true, width: '640px' })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_rule_created');
          this.getList();
        }
      });
  }

  onTransition(row: any, status: string) {
    this.dialog
      .open(DialogRuleStatus, { data: { row: row, status: status }, disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_rule_status_updated');
          this.getList();
        }
      });
  }

  onClone(row: any) {
    this.api.post_private('v1/local-services/admin/revenue/rules/' + row._id + '/clone', {}).subscribe({
      next: () => {
        this.util.onSuccess('ts_rule_cloned');
        this.getList();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
