import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-dairy-compliance',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './compliance.html',
})
export class Compliance {
  isLoaded: boolean = false;
  records: any[] = [];
  displayedColumn: string[] = [
    'business',
    'licenceNumber',
    'expiresAt',
    'daysRemaining',
    'liveStatus',
  ];

  /**
   * The warning window, in days. Defaults to the API's own 30 so the screen and the
   * service agree unless an operator deliberately widens it.
   */
  days: number = 30;

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
    let httpParams = new HttpParams();
    httpParams = httpParams.set('days', this.days);

    this.api.get_private('v1/dairy/admin/compliance/expiring?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        if (response && response.records) {
          this.records = response.records;
        }
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  countWhere(predicate: (r: any) => boolean): number {
    return this.records.filter(predicate).length;
  }

  get expiredCount(): number {
    return this.countWhere((r) => r.liveStatus === 'expired');
  }

  get expiringCount(): number {
    return this.countWhere((r) => r.liveStatus === 'expiring');
  }

  /**
   * Rows whose stored status no longer matches the dates.
   *
   * This is the only thing `POST /admin/compliance/refresh` fixes, and it is what the
   * flag exists for: the cached `status` is a snapshot, and anything that reads it
   * rather than recomputing is reading a number that can be wrong.
   */
  get staleCount(): number {
    return this.countWhere((r) => r.cacheFresh === false);
  }

  onRefresh() {
    // Platform-wide, and it writes to every compliance record. Confirmed rather
    // than fired straight from the button.
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: 'ts_refresh_compliance_title',
          subTitle: 'ts_refresh_compliance_instruction',
          okTitle: 'ts_yes_run_it',
          closeTitle: 'ts_cancel',
        },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.action == 'confirm') {
          this.runRefresh();
        }
      });
  }

  private runRefresh() {
    // `ts_loading` is the key the shared loading dialog uses; there is no
    // `ts_please_wait`, so the spinner would have shown a raw key string.
    const spinnerRef = this.util.start('ts_loading');

    this.api.post_private('v1/dairy/admin/compliance/refresh', {}).subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        const changed = response && typeof response.changed === 'number' ? response.changed : 0;
        if (changed === 0) {
          this.util.onSuccess('ts_compliance_nothing_to_do');
        } else {
          this.util.onSuccess('ts_compliance_refreshed');
        }
        this.getList();
      },
      error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      },
    });
  }
}
