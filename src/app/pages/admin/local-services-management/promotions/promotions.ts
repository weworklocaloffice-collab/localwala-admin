/*
 * WeWorkLocal
 * Hyperlocal Commerce, Delivery & Service Platform
 *
 * Copyright © 2026 WeWorkLocal.
 * All Rights Reserved.
 *
 * Website: https://localwala.tech
 * Email: weworklocal1@gmail.com
 *
 * Proprietary and Confidential.
 *
 * Unauthorized copying, modification, distribution,
 * publication, resale, reverse engineering, or use of
 * this software without prior written authorization is
 * strictly prohibited.
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MatDialog } from '@angular/material/dialog';
import { DialogLsFeatured } from '../dialog-ls-featured/dialog-ls-featured';
import { DialogLsStatus } from '../dialog-ls-status/dialog-ls-status';

@Component({
  selector: 'app-promotions',
  imports: [CommonModule, MaterialModule],
  templateUrl: './promotions.html',
})
export class Promotions implements OnInit {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  displayedColumn: string[] = ['target', 'placement', 'window', 'price', 'status', 'action'];

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
    const httpParams = new HttpParams()
      .set('limit', this.pageSize)
      .set('page', this.currentPage + 1);
    this.api.get_private('v1/local-services/admin/featured?' + httpParams.toString()).subscribe({
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

  exportCsv() {
    if (!this.list || this.list.length === 0) {
      this.util.onSuccess('ts_no_records_found');
      return;
    }
    const headers = ['Target', 'Placement', 'From', 'To', 'Price', 'Status'];
    const rows = this.list.map((element: any) => [
      element.service?.name || element.provider?.businessName || '',
      element.placement || '',
      element.from || '',
      element.to || '',
      element.price || 0,
      element.status || '',
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map((cell: any) => {
        const c = cell instanceof Date ? cell.toISOString() : cell;
        return typeof c === 'number' ? c.toString() : `"${c}"`;
      }).join(','))
    ].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    link.setAttribute('download', 'local-services-featured.csv');
    link.click();
  }

  onCreate() {
    this.dialog
      .open(DialogLsFeatured, { disableClose: true, width: '520px' })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_record_created');
          this.getList();
        }
      });
  }

  onStatus(row: any, status: string) {
    this.dialog
      .open(DialogLsStatus, { data: { apiPath: 'v1/local-services/admin/featured/', row, status, mode: 'patch-status' }, disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        }
      });
  }
}
