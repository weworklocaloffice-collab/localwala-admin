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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, MaterialModule],
  templateUrl: './reports.html',
})
export class Reports implements OnInit {
  isLoaded: boolean = false;
  summary: any = null;

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.getSummary();
  }

  getSummary() {
    this.isLoaded = false;
    this.api.get_private('v1/local-services/admin/reports').subscribe({
      next: (response: any) => {
        this.summary = response;
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  exportCsv() {
    if (!this.summary) {
      this.util.onSuccess('ts_no_records_found');
      return;
    }
    const rows: any[][] = [
      ['Metric', 'Value'],
      ['Active providers', this.summary.providers?.active || 0],
      ['Pending verification', this.summary.providers?.pendingVerification || 0],
      ['Published services', this.summary.services?.published || 0],
      ['Bookings', this.summary.bookings?.total || 0],
      ['Booking conversion %', this.summary.bookings?.conversionRate || 0],
      ['Fulfilment rate %', this.summary.bookings?.fulfilmentRate || 0],
      ['Gross booking value', this.summary.revenue?.grossBookingValue || 0],
      ['Cash collected', this.summary.revenue?.cashCollected || 0],
      ['Refunded', this.summary.revenue?.refunded || 0],
      ['Platform revenue', this.summary.revenue?.platformRevenue || 0],
      ['Provider payable', this.summary.revenue?.providerPayable || 0],
      ['Settlement liability', this.summary.settlement?.liability || 0],
      ['Refunds pending', this.summary.refunds?.pending || 0],
      ['Refund approved amount', this.summary.refunds?.approvedAmount || 0],
      ['Quote acceptance %', this.summary.quotes?.acceptanceRate || 0],
      [],
      ['Category', 'Bookings', 'Gross booking value'],
      ...(this.summary.categories || []).map((row: any) => [
        row.categoryKey,
        row.bookings,
        row.grossBookingValue,
      ]),
    ];
    const csvContent = rows
      .map((row) =>
        row
          .map((cell: any) => {
            const value = cell instanceof Date ? cell.toISOString() : cell;
            return typeof value === 'number' ? value.toString() : `"${value ?? ''}"`;
          })
          .join(','),
      )
      .join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    link.setAttribute('download', 'local-services-reports.csv');
    link.click();
  }
}
