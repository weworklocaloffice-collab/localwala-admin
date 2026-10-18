import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

/**
 * The platform-wide Jhatka console.
 *
 * ## Why these numbers are fetched and not computed here
 *
 * `absorbedOvercharge`, `refundRate` and `contributionAfterWastage` each join money
 * across orders, refunds and wastage. The service computes them in one pass over one
 * window. If this screen summed them in TypeScript it would be a second definition of
 * revenue, and the first time the two drifted the admin panel and the finance team
 * would be looking at different numbers for the same week.
 *
 * ## `contribution` is NOT profit, and the label says so
 *
 * It excludes COGS and operator payouts, which live in `JhatkaSettlement` on a
 * settlement cadence rather than a daily one. Calling it "profit" here would invite
 * someone to compare it to the settlement statement and conclude one of them is wrong.
 */
@Component({
  selector: 'app-jhatka-analytics',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './analytics.html',
})
export class JhatkaAnalytics {
  isLoaded = false;
  data: JhatkaAnalyticsData | null = null;

  /** ISO date strings for the window picker. Empty = the service's 30-day default. */
  from = '';
  to = '';

  /** Business-model breakdown is a small fixed set, so a table beats a chart here. */
  readonly businessModels: string[] = ['direct', 'franchise', 'commission_partner'];

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {
    this.getAnalytics();
  }

  getAnalytics() {
    this.isLoaded = false;

    let httpParams = new HttpParams();
    if (this.from) {
      httpParams = httpParams.set('from', this.from);
    }
    if (this.to) {
      httpParams = httpParams.set('to', this.to);
    }

    this.api.get_private('v1/jhatka/admin/analytics?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        this.data = response?.analytics ?? null;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  reset() {
    this.from = '';
    this.to = '';
    this.getAnalytics();
  }

  /** Turn a `{ STATE: n }` map into sorted `[label, count]` pairs for the template. */
  toRows(map: Record<string, number> | undefined): Array<[string, number]> {
    if (!map) {
      return [];
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }

  /** Was an open recall or an expiry the kind of thing that needs shouting about? */
  get needsAttention(): boolean {
    if (!this.data) {
      return false;
    }
    const expired = this.data.compliance?.byStatus?.['expired'] ?? 0;
    return (this.data.compliance?.openRecalls ?? 0) > 0 || expired > 0;
  }
}