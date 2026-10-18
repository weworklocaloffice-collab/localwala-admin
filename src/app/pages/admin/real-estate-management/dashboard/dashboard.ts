import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Real Estate dashboard — the six metric groups (plan §10.3) plus the
 * one number finance asks for first: total principal currently held
 * as a LIABILITY. That tile reads ACTIVE holds, not the ledger, so a
 * ledger bug shows up as a mismatch against the Ledger screen rather
 * than silently agreeing with itself.
 */
@Component({
  selector: 'app-real-estate-dashboard',
  imports: [CommonModule, MaterialModule],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  isLoaded: boolean = false;
  published: number = 0;
  activeHolds: number = 0;
  holdExposure: number = 0;
  pendingRefunds: number = 0;
  pendingSettlements: number = 0;
  activeLeads: number = 0;

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoaded = false;
    const get = (url: string) =>
      new Promise<any>((resolve) => {
        this.api.get_private(url).subscribe({
          next: (r: any) => resolve(r),
          error: () => resolve(null),
        });
      });
    Promise.all([
      get('v1/realestate/admin/properties?status=PUBLISHED&limit=1'),
      get('v1/realestate/admin/holds?status=ACTIVE&limit=100'),
      get('v1/realestate/admin/refunds?status=PENDING&limit=1'),
      get('v1/realestate/admin/settlements?status=PENDING&limit=1'),
      get('v1/realestate/admin/leads?limit=1'),
    ]).then(([pub, holds, refunds, settlements, leads]) => {
      this.published = pub ? pub.totalResults : 0;
      this.activeHolds = holds ? holds.totalResults : 0;
      this.holdExposure = holds
        ? holds.results.reduce((s: number, h: any) => s + (h.principal || 0), 0)
        : 0;
      this.pendingRefunds = refunds ? refunds.totalResults : 0;
      this.pendingSettlements = settlements ? settlements.totalResults : 0;
      this.activeLeads = leads ? leads.totalResults : 0;
      this.isLoaded = true;
    });
  }
}
