import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Reconciliation (Phase B) — the nightly three-way money match
 * (holds ↔ ledger ↔ refunds), latest report first.
 *
 * An unhealthy report pages finance but never auto-freezes trading;
 * the admin decides from this screen and can re-run on demand after
 * clearing a mismatch.
 */
@Component({
  selector: 'app-real-estate-reconciliation',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './reconciliation.html',
})
export class Reconciliation {
  isLoaded: boolean = false;
  isRunning: boolean = false;
  report: any = null;
  history: any[] = [];

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoaded = false;
    this.api.get_private('v1/realestate/admin/reconciliation/latest').subscribe({
      next: (response: any) => {
        this.report = (response && response.data) || null;
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
    this.api.get_private('v1/realestate/admin/reconciliation?limit=10').subscribe({
      next: (response: any) => {
        const results = (response && response.results) || [];
        // Latest report renders above; history skips it.
        this.history = Array.isArray(results) ? results.slice(1) : [];
      },
      error: () => {
        this.history = [];
      },
    });
  }

  onRun() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.api.post_private('v1/realestate/admin/reconciliation/run', {}).subscribe({
      next: () => {
        this.isRunning = false;
        this.util.onSuccess('ts_status_updated');
        this.load();
      },
      error: (error: any) => {
        this.isRunning = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  /** Paise integers on money rows; unit counts elsewhere. */
  formatValue(check: any, key: 'expectedPaise' | 'actualPaise'): string {
    const v = check?.[key];
    if (v === null || v === undefined) return '—';
    if (check?.name === 'outstanding_principal_liability') {
      return '₹' + (Number(v) / 100).toLocaleString('en-IN');
    }
    return String(v);
  }
}
