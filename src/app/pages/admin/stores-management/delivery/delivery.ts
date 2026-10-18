/**
 * LocalWala – Local Commerce & Delivery Platform
 * (NodeJS, MongoDB, Angular & Flutter)
 *
 * Copyright © 2026 WeWorkLocal Private Limited
 * https://weworklocal.in/
 *
 * This source code is confidential.
 * Unauthorized copying, redistribution, resale, publication,
 * modification, or use of this source code in any public or
 * commercial repository is strictly prohibited.
 *
 * Ownership Fingerprint:
 * LWL|WWL|2026|LOCALWALA|NODE
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { StoresListBase } from '../stores-list-base';

/**
 * Deliveries — admin read + status console (§6.20, §12.3).
 *
 * Cross-tenant by design: an admin investigating a stuck or failed
 * delivery needs the row regardless of which outlet created it. Partner
 * mutations (assign, transition, OTP, COD collect) live on the partner
 * surface and revalidate outlet scope (BR-38). The admin screen is
 * observe + flag — no mutations.
 *
 * The OTP hash and attempts are shown for the admin who needs to spot
 * a driver stuck on retries; the raw OTP is never returned to anyone.
 */
@Component({
  selector: 'app-stores-delivery',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './delivery.html',
})
export class Delivery extends StoresListBase {
  readonly STATUSES = [
    'assigned',
    'accepted',
    'at_store',
    'picked_up',
    'out_for_delivery',
    'delivered',
    'failed',
    'cancelled',
  ];

  constructor(
    api: ApiService,
    util: UtilService,
    dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    this.path = 'deliveries';
    this.listTitleKey = 'stores_delivery_list';
    this.displayedColumn = [
      'order',
      'outlet',
      'driver',
      'status',
      'lifecycle',
      'cod',
      'attempts',
      'action',
    ];
  }

  override ngOnInit() {
    this.getList();
  }

  /**
   * A failed delivery is the alarming case: badge it. The status chip
   * in the template already carries the enum class.
   */
  isCritical(row: any): boolean {
    return row.status === 'failed' || row.status === 'cancelled';
  }

  /**
   * OTP attempts against the cap — anything >= 3 is "close to lockout"
   * and worth an admin's eye even if the delivery is still in flight.
   */
  isRetryHigh(row: any): boolean {
    return (
      typeof row.otpAttempts === 'number' &&
      typeof row.maxOtpAttempts === 'number' &&
      row.otpAttempts >= row.maxOtpAttempts - 1
    );
  }

  getLifecycle(row: any): string {
    const assigned = row.assignedAt ? new Date(row.assignedAt) : null;
    const pickedUp = row.pickedUpAt ? new Date(row.pickedUpAt) : null;
    const delivered = row.deliveredAt ? new Date(row.deliveredAt) : null;
    if (delivered) {
      const ms = delivered.getTime() - (assigned ? assigned.getTime() : delivered.getTime());
      return Math.round(ms / 60000) + 'm';
    }
    if (pickedUp && assigned) {
      return Math.round((Date.now() - pickedUp.getTime()) / 60000) + 'm out';
    }
    if (assigned) {
      return Math.round((Date.now() - assigned.getTime()) / 60000) + 'm since assign';
    }
    return '—';
  }

  viewDetail(row: any) {
    // Drill-in to a detail view is out of scope for the console. The list
    // carries the data the admin needs to spot a stuck row; the underlying
    // partner screen handles the action.
    this.util.onSuccess(`${row.driverCode || row._id} · ${row.status}`);
  }
}
