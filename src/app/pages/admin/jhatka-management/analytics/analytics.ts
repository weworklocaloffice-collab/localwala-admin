import { Component, OnDestroy } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

export interface JhatkaAnalyticsData {
  period: { from: string; to: string };
  orders: {
    count: number;
    byLifecycle: Record<string, number>;
    byBusinessModel: Record<string, number>;
    estimatedTotal: number;
    finalTotal: number;
    refundedTotal: number;
    absorbedOverchargeTotal: number;
    taxCollected: number;
  };
  contribution: {
    grossCollected: number;
    wastageValue: number;
    contributionAfterWastage: number;
    absorbedOvercharge: number;
    refundRate: number;
  };
  wastage: { count: number; orderLinked: number; value: number; byCause: Record<string, number> };
  refunds: {
    count: number;
    value: number;
    byStatus: Record<string, number>;
    byReason: Record<string, number>;
  };
  outlets: { count: number; byBusinessModel: Record<string, number> };
  subscriptions: { count: number; occurrencesGenerated: number; occurrencesSkipped: number };
  compliance: { byStatus: Record<string, number>; openRecalls: number };
}

interface BarRow {
  key: string;
  label: string;
  count: number;
  pct: number;
}

type PresetDays = 7 | 30 | 90;

@Component({
  selector: 'app-jhatka-analytics',
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  templateUrl: './analytics.html',
  styles: [
    `
      .page-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 18px;
      }
      .eyebrow {
        color: var(--mat-sys-primary);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .page-title {
        font-size: 28px;
        line-height: 1.2;
        font-weight: 700;
        margin: 4px 0 6px;
      }
      .page-copy {
        color: var(--mat-sys-on-surface-variant);
        font-size: 14px;
        max-width: 760px;
        margin: 0;
      }
      .head-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .range-card {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 16px;
        box-shadow: none;
        margin-bottom: 16px;
        background: var(--mat-sys-surface-container-lowest);
      }
      .range-card mat-card-content {
        padding: 14px 16px;
      }
      .range-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        flex-wrap: wrap;
      }
      .preset-group {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .range-label {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--mat-sys-on-surface-variant);
        margin-right: 2px;
      }
      .preset-button {
        min-width: 0;
        padding: 0 12px;
        height: 32px;
        font-size: 12px;
        border-color: var(--mat-sys-outline-variant);
        color: var(--mat-sys-on-surface-variant);
      }
      .preset-button.preset-active {
        border-color: var(--mat-sys-primary);
        background: color-mix(in srgb, var(--mat-sys-primary) 10%, transparent);
        color: var(--mat-sys-primary);
        font-weight: 700;
      }
      .range-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .range-controls mat-form-field {
        width: 154px;
      }
      .range-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 4px;
        font-size: 11px;
        color: var(--mat-sys-on-surface-variant);
      }
      .range-error {
        color: #b42318;
        font-weight: 600;
      }
      .load-bar {
        border-radius: 999px;
        margin-bottom: 12px;
      }
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 16px;
      }
      .kpi-card {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 16px;
        padding: 16px;
        background: var(--mat-sys-surface-container-lowest);
        min-height: 126px;
        display: flex;
        flex-direction: column;
      }
      .kpi-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .kpi-label {
        color: var(--mat-sys-on-surface-variant);
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .kpi-icon {
        width: 30px;
        height: 30px;
        border-radius: 9px;
        display: grid;
        place-items: center;
        background: var(--mat-sys-surface-container-high);
        color: var(--mat-sys-on-surface-variant);
      }
      .kpi-icon mat-icon {
        font-size: 17px;
        width: 17px;
        height: 17px;
      }
      .kpi-value {
        font-size: 25px;
        line-height: 1.15;
        font-weight: 700;
        margin: 10px 0 4px;
        font-variant-numeric: tabular-nums;
      }
      .kpi-hint {
        font-size: 11px;
        line-height: 1.45;
        color: var(--mat-sys-on-surface-variant);
        margin-top: auto;
      }
      .attention {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding: 14px 16px;
        border: 1px solid #f1c56b;
        border-radius: 14px;
        background: #fff8e8;
        color: #6b4300;
        margin-bottom: 16px;
      }
      .attention mat-icon {
        flex: 0 0 auto;
        margin-top: 1px;
      }
      .attention-title {
        font-weight: 700;
        margin-bottom: 4px;
      }
      .attention-list {
        margin: 0;
        padding-left: 18px;
        font-size: 12px;
        line-height: 1.65;
      }
      .attention-list strong {
        font-weight: 700;
      }
      .inline-error {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border: 1px solid #f2b8b5;
        border-radius: 12px;
        background: #fdecec;
        color: #8f1d14;
        font-size: 12px;
        margin-bottom: 16px;
      }
      .inline-error button {
        margin-left: auto;
      }
      .analytics-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
        gap: 16px;
        margin-bottom: 16px;
        align-items: stretch;
      }
      .analytics-grid.three {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .panel {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 18px;
        box-shadow: none;
        background: var(--mat-sys-surface-container-lowest);
        height: 100%;
      }
      .panel mat-card-content {
        padding: 18px 20px;
      }
      .panel-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }
      .panel-title {
        font-size: 15px;
        font-weight: 700;
      }
      .panel-sub {
        color: var(--mat-sys-on-surface-variant);
        font-size: 11px;
        line-height: 1.45;
        margin-top: 3px;
      }
      .panel-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 8px;
        border-radius: 999px;
        background: var(--mat-sys-surface-container-high);
        color: var(--mat-sys-on-surface-variant);
        font-size: 10px;
        font-weight: 700;
        white-space: nowrap;
      }
      .panel-badge.good {
        background: #e7f6ec;
        color: #157a3b;
      }
      .panel-badge.warn {
        background: #fff4dd;
        color: #9a5b00;
      }
      .panel-badge.danger {
        background: #fdecec;
        color: #b42318;
      }
      .money-list {
        display: flex;
        flex-direction: column;
      }
      .money-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 12px;
        align-items: baseline;
        padding: 8px 0;
        border-bottom: 1px dashed var(--mat-sys-outline-variant);
        font-size: 12px;
      }
      .money-row:last-child {
        border-bottom: 0;
      }
      .money-row span {
        color: var(--mat-sys-on-surface-variant);
      }
      .money-row strong {
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .money-row.subtract strong {
        color: #b54708;
      }
      .money-row.emphasis {
        margin-top: 4px;
        padding: 12px;
        border: 0;
        border-radius: 12px;
        background: #e7f6ec;
      }
      .money-row.emphasis span {
        color: #115c2e;
        font-weight: 600;
      }
      .money-row.emphasis strong {
        color: #115c2e;
        font-size: 17px;
      }
      .composition {
        margin-top: 14px;
      }
      .composition-head {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--mat-sys-on-surface-variant);
        margin-bottom: 6px;
      }
      .stacked-bar {
        display: flex;
        height: 12px;
        border-radius: 999px;
        overflow: hidden;
        background: var(--mat-sys-surface-container-high);
      }
      .seg-contribution {
        background: #2f8f5b;
      }
      .seg-wastage {
        background: #e6a23c;
      }
      .seg-refunds {
        background: #d9534f;
      }
      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 9px;
        font-size: 10px;
        color: var(--mat-sys-on-surface-variant);
      }
      .legend-item {
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .legend-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
      }
      .money-note {
        margin-top: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        background: var(--mat-sys-surface-container);
        color: var(--mat-sys-on-surface-variant);
        font-size: 11px;
        line-height: 1.5;
      }
      .absorbed {
        display: flex;
        gap: 9px;
        align-items: flex-start;
        margin-top: 10px;
        padding: 10px 12px;
        border-radius: 10px;
        background: #fff8e8;
        color: #6b4300;
        font-size: 11px;
        line-height: 1.5;
      }
      .absorbed mat-icon {
        font-size: 17px;
        width: 17px;
        height: 17px;
        flex: 0 0 auto;
      }
      .panel-scroll {
        max-height: 286px;
        overflow-y: auto;
        padding-right: 4px;
      }
      .bar-list {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .bar-row-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        font-size: 11px;
        margin-bottom: 4px;
      }
      .bar-row-head span:first-child {
        color: var(--mat-sys-on-surface);
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .bar-row-head strong {
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        font-size: 11px;
      }
      .track {
        height: 6px;
        border-radius: 999px;
        overflow: hidden;
        background: var(--mat-sys-surface-container-high);
      }
      .track span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--mat-sys-primary);
      }
      .track .fill-warm {
        background: #e6a23c;
      }
      .track .fill-danger {
        background: #d9534f;
      }
      .track .fill-green {
        background: #2f8f5b;
      }
      .divider {
        height: 1px;
        background: var(--mat-sys-outline-variant);
        margin: 14px 0;
      }
      .mini-title {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--mat-sys-on-surface-variant);
        margin-bottom: 9px;
      }
      .summary-number {
        font-size: 24px;
        font-weight: 700;
        line-height: 1.2;
        font-variant-numeric: tabular-nums;
      }
      .summary-line {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: baseline;
        padding: 6px 0;
        font-size: 11px;
        border-bottom: 1px dashed var(--mat-sys-outline-variant);
      }
      .summary-line:last-child {
        border-bottom: 0;
      }
      .summary-line span:first-child {
        color: var(--mat-sys-on-surface-variant);
      }
      .summary-line strong {
        font-variant-numeric: tabular-nums;
      }
      .chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 8px;
        border-radius: 8px;
        background: var(--mat-sys-surface-container-high);
        color: var(--mat-sys-on-surface-variant);
        font-size: 10px;
        font-weight: 600;
      }
      .chip strong {
        color: var(--mat-sys-on-surface);
        font-variant-numeric: tabular-nums;
      }
      .empty-line {
        padding: 16px 0;
        font-size: 11px;
        color: var(--mat-sys-on-surface-variant);
        text-align: center;
      }
      .state-panel {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 18px;
        background: var(--mat-sys-surface-container-lowest);
        padding: 52px 20px;
        text-align: center;
        color: var(--mat-sys-on-surface-variant);
      }
      .state-icon {
        width: 54px;
        height: 54px;
        border-radius: 16px;
        display: inline-grid;
        place-items: center;
        background: var(--mat-sys-surface-container-high);
        margin-bottom: 12px;
      }
      .state-title {
        color: var(--mat-sys-on-surface);
        font-size: 15px;
        font-weight: 700;
      }
      .state-copy {
        font-size: 12px;
        margin: 4px auto 14px;
        max-width: 460px;
        line-height: 1.55;
      }
      .footnote {
        color: var(--mat-sys-on-surface-variant);
        font-size: 10px;
        line-height: 1.6;
        padding: 0 2px;
      }
      @media (max-width: 1100px) {
        .kpi-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .analytics-grid,
        .analytics-grid.three {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      @media (max-width: 680px) {
        .kpi-grid {
          grid-template-columns: minmax(0, 1fr);
        }
        .page-title {
          font-size: 24px;
        }
        .range-controls mat-form-field {
          width: 100%;
        }
        .range-controls {
          width: 100%;
        }
        .range-controls button {
          flex: 1;
        }
      }
    `,
  ],
})
export class JhatkaAnalytics implements OnDestroy {
  private readonly maxWindowDays = 90;
  private request?: Subscription;

  isLoaded = false;
  isLoading = false;
  loadError = '';
  data: JhatkaAnalyticsData | null = null;

  from = '';
  to = '';
  activePreset: PresetDays | null = 30;
  lastRefreshed: Date | null = null;

  readonly todayInput = this.formatInputDate(new Date());

  readonly businessModels = [
    { key: 'direct', label: 'Direct' },
    { key: 'franchise', label: 'Franchise' },
    { key: 'commission_partner', label: 'Commission partner' },
  ];

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {
    this.applyPreset(30, false);
  }

  ngOnDestroy() {
    this.request?.unsubscribe();
  }

  applyPreset(days: PresetDays, load = true) {
    const end = this.startOfToday();
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));

    this.from = this.formatInputDate(start);
    this.to = this.formatInputDate(end);
    this.activePreset = days;

    if (load) {
      this.getAnalytics();
    }
  }

  reset() {
    this.applyPreset(30);
  }

  onRangeChange() {
    this.activePreset = null;
  }

  applyRange() {
    if (this.rangeError) {
      return;
    }
    this.getAnalytics();
  }

  refresh() {
    this.getAnalytics();
  }

  getAnalytics() {
    if (this.rangeError) {
      return;
    }

    this.request?.unsubscribe();
    this.isLoading = true;
    this.loadError = '';

    const httpParams = new HttpParams()
      .set('from', this.boundaryIso(this.from, false))
      .set('to', this.boundaryIso(this.to, true));

    this.request = this.api.get_private('v1/jhatka/admin/analytics?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.isLoaded = true;
        this.data = response?.analytics ?? null;
        this.lastRefreshed = this.data ? new Date() : null;

        if (!this.data) {
          this.loadError = 'The analytics service returned an empty response.';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.isLoaded = true;
        this.loadError = error?.error?.message || 'Analytics could not be loaded. Check the API and try again.';
        this.util.handleError(error, 'admin');
      },
    });
  }

  get rangeError(): string {
    if (!this.from || !this.to) {
      return 'Choose a start and end date.';
    }

    const from = this.parseInputDate(this.from);
    const to = this.parseInputDate(this.to);

    if (!from || !to) {
      return 'Enter valid dates.';
    }
    if (from > to) {
      return 'Start date must be on or before the end date.';
    }

    const days = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
    if (days > this.maxWindowDays) {
      return 'The report window cannot exceed 90 days.';
    }
    if (to > this.startOfToday()) {
      return 'End date cannot be in the future.';
    }

    return '';
  }

  get periodDays(): number {
    if (!this.from || !this.to) {
      return 0;
    }
    const from = this.parseInputDate(this.from);
    const to = this.parseInputDate(this.to);
    if (!from || !to || from > to) {
      return 0;
    }
    return Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
  }

  get periodLabel(): string {
    if (!this.from || !this.to) {
      return 'No period selected';
    }
    return this.formatDisplayDate(this.from) + ' to ' + this.formatDisplayDate(this.to);
  }

  get timeStamp(): string {
    return this.lastRefreshed
      ? this.lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : '';
  }

  get completedOrders(): number {
    const map = this.data?.orders.byLifecycle ?? {};
    return (map['DELIVERED'] ?? 0) + (map['COMPLETED'] ?? 0);
  }

  get cancelledOrders(): number {
    const map = this.data?.orders.byLifecycle ?? {};
    return (map['CANCELLED'] ?? 0) + (map['REJECTED'] ?? 0) + (map['PAYMENT_FAILED'] ?? 0);
  }

  get completionRate(): number {
    const count = this.data?.orders.count ?? 0;
    return count ? Math.round((this.completedOrders / count) * 100) : 0;
  }

  get failedRefunds(): number {
    return this.data?.refunds.byStatus?.['FAILED'] ?? 0;
  }

  get pendingRefunds(): number {
    const statuses = this.data?.refunds.byStatus ?? {};
    return (statuses['REFUND_PENDING'] ?? 0) + (statuses['PROCESSING'] ?? 0);
  }

  get refundActionCount(): number {
    return this.failedRefunds + this.pendingRefunds;
  }

  get expiredCompliance(): number {
    return this.data?.compliance.byStatus?.['expired'] ?? 0;
  }

  get attentionItems(): Array<{ label: string; detail: string }> {
    if (!this.data) {
      return [];
    }

    const items: Array<{ label: string; detail: string }> = [];
    if (this.expiredCompliance > 0) {
      items.push({
        label: this.expiredCompliance + ' compliance record(s) expired',
        detail: 'Expired records block new orders at the affected outlets.',
      });
    }
    if (this.data.compliance.openRecalls > 0) {
      items.push({
        label: this.data.compliance.openRecalls + ' recall(s) open',
        detail: 'Open recalls need a traceability and customer-safety response.',
      });
    }
    if (this.failedRefunds > 0) {
      items.push({
        label: this.failedRefunds + ' refund(s) failed',
        detail: 'Failed refunds need a manual retry or a documented resolution.',
      });
    }
    if (this.pendingRefunds > 0) {
      items.push({
        label: this.pendingRefunds + ' refund(s) still open',
        detail: 'Pending and processing refunds are inside this report window.',
      });
    }
    return items;
  }

  get needsAttention(): boolean {
    return this.attentionItems.length > 0;
  }

  get refundShare(): number {
    const estimated = this.data?.orders.estimatedTotal ?? 0;
    return this.clampPercent(((this.data?.orders.refundedTotal ?? 0) / estimated) * 100);
  }

  get wastageShare(): number {
    const estimated = this.data?.orders.estimatedTotal ?? 0;
    return this.clampPercent(((this.data?.wastage.value ?? 0) / estimated) * 100);
  }

  get contributionShare(): number {
    const estimated = this.data?.orders.estimatedTotal ?? 0;
    return this.clampPercent(((this.data?.contribution.contributionAfterWastage ?? 0) / estimated) * 100);
  }

  get wastageLinkedPct(): number {
    const count = this.data?.wastage.count ?? 0;
    return this.share(this.data?.wastage.orderLinked ?? 0, count);
  }

  get subscriptionSkipPct(): number {
    const generated = this.data?.subscriptions.occurrencesGenerated ?? 0;
    const skipped = this.data?.subscriptions.occurrencesSkipped ?? 0;
    return this.share(skipped, generated + skipped);
  }

  lifecycleRows(): BarRow[] {
    return this.toBarRows(this.data?.orders.byLifecycle);
  }

  wastageCauseRows(): BarRow[] {
    return this.toBarRows(this.data?.wastage.byCause);
  }

  refundReasonRows(): BarRow[] {
    return this.toBarRows(this.data?.refunds.byReason);
  }

  refundStatusRows(): BarRow[] {
    return this.toBarRows(this.data?.refunds.byStatus);
  }

  complianceRows(): BarRow[] {
    return this.toBarRows(this.data?.compliance.byStatus);
  }

  orderModelRows(): BarRow[] {
    return this.modelRows(this.data?.orders.byBusinessModel);
  }

  outletModelRows(): BarRow[] {
    return this.modelRows(this.data?.outlets.byBusinessModel);
  }

  barWidth(value: number, max: number): number {
    return max > 0 ? this.clampPercent((value / max) * 100) : 0;
  }

  toRows(map: Record<string, number> | undefined): Array<[string, number]> {
    if (!map) {
      return [];
    }
    return Object.entries(map)
      .filter(([, count]) => Number(count) > 0)
      .sort((a, b) => b[1] - a[1]);
  }

  humanize(value: string | null | undefined): string {
    if (!value) {
      return 'Unknown';
    }
    const text = String(value).replace(/_/g, ' ').toLowerCase();
    return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private toBarRows(map: Record<string, number> | undefined): BarRow[] {
    const rows = this.toRows(map);
    const max = rows.length ? Math.max(...rows.map(([, count]) => count)) : 0;
    return rows.map(([key, count]) => ({
      key,
      label: this.humanize(key),
      count,
      pct: this.barWidth(count, max),
    }));
  }

  private modelRows(map: Record<string, number> | undefined): BarRow[] {
    const source = map ?? {};
    const total = this.businessModels.reduce((sum, model) => sum + (source[model.key] ?? 0), 0);
    return this.businessModels.map((model) => ({
      key: model.key,
      label: model.label,
      count: source[model.key] ?? 0,
      pct: this.share(source[model.key] ?? 0, total),
    }));
  }

  private share(value: number, total: number): number {
    return total > 0 ? this.clampPercent((value / total) * 100) : 0;
  }

  private clampPercent(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.min(100, Math.max(0, value));
  }

  private formatInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  private formatDisplayDate(value: string): string {
    const date = this.parseInputDate(value);
    return date
      ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : value;
  }

  private parseInputDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    return date;
  }

  private boundaryIso(value: string, nextDay: boolean): string {
    const date = this.parseInputDate(value);
    if (!date) {
      return '';
    }
    if (nextDay) {
      date.setDate(date.getDate() + 1);
    }
    return date.toISOString();
  }

  private startOfToday(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }
}
