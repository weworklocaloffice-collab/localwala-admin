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
import { DialogDriverSuspend } from './dialog-driver-suspend/dialog-driver-suspend';

/**
 * Store drivers — suspend / reactivate (BR-08).
 *
 * There is deliberately no delete: a driver is never hard-deleted, so
 * historical deliveries keep resolving to the driver who made them. Suspend
 * is the strongest action here; it also marks the driver unavailable so no
 * new assignment lands on them. Search matches driverCode (the backend
 * text filter).
 */
@Component({
  selector: 'app-stores-drivers',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './drivers.html',
})
export class Drivers extends StoresListBase {
  readonly STATUSES = ['active', 'inactive', 'suspended', 'reactivated'];

  constructor(
    api: ApiService,
    util: UtilService,
    dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    this.path = 'drivers';
    this.listTitleKey = 'stores_drivers_list';
    this.displayedColumn = ['driver', 'outlet', 'status', 'available', 'deliveries', 'action'];
  }

  override ngOnInit() {
    this.getList();
  }

  override get extraQuery(): any {
    const q: any = {};
    if (this.statusFilter) q['status'] = this.statusFilter;
    return q;
  }

  canSuspend(row: any): boolean {
    return row.status === 'active' || row.status === 'reactivated';
  }

  canReactivate(row: any): boolean {
    return row.status === 'suspended' || row.status === 'inactive';
  }

  onSuspend(row: any) {
    const ref = this.dialog.open(DialogDriverSuspend, {
      data: { driver: row },
      disableClose: true,
    });
    ref.afterClosed().subscribe((result: any) => {
      if (result && result.event === 'suspend') {
        this.api
          .post_private('v1/admin/stores/drivers/' + row._id + '/suspend', {
            reason: result.reason || undefined,
          })
          .subscribe({
            next: () => {
              this.util.onSuccess(this.util.appTranslate('stores_driver_suspended'));
              this.getList();
            },
            error: (error: any) => this.util.handleError(error, 'admin'),
          });
      }
    });
  }

  onReactivate(row: any) {
    this.api.post_private('v1/admin/stores/drivers/' + row._id + '/reactivate', {}).subscribe({
      next: () => {
        this.util.onSuccess(this.util.appTranslate('stores_driver_reactivated'));
        this.getList();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
