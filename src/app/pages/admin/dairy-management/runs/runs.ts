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
import { DialogRunDetail } from '../dialog-run-detail/dialog-run-detail';

@Component({
  selector: 'app-dairy-runs',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './runs.html',
})
export class Runs {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  fromDate: string = '';
  toDate: string = '';
  displayedColumn: string[] = ['serviceDate', 'outlet', 'rider', 'status', 'stops', 'cans', 'collect', 'action'];

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
      page: this.currentPage + 1,
    };
    if (this.selectedStatus) {
      param.status = this.selectedStatus;
    }
    if (this.fromDate) {
      param.from = this.fromDate;
    }
    if (this.toDate) {
      param.to = this.toDate;
    }
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) {
        return;
      }
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/dairy/admin/runs?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        if (response && response.runs) {
          this.list = response.runs;
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      },
      error: () => {
        this.isLoaded = true;
      },
    });
  }

  onFilter() {
    this.currentPage = 0;
    this.getList();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  viewDetail(run: any) {
    this.dialog.open(DialogRunDetail, {
      width: '760px',
      data: { runId: run._id },
    });
  }
}
