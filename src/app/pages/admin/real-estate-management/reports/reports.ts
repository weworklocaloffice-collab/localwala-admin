import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Reports — pipeline conversion snapshot (plan §10.2 row 32).
 *
 * Read-only aggregates over existing list endpoints (limit=1 reads the
 * totalResults counter, never the rows). No new backend: a report that
 * needs its own endpoint is a report nobody reconciles against the
 * screens it claims to summarise.
 */
@Component({
  selector: 'app-real-estate-reports',
  imports: [CommonModule, MaterialModule],
  templateUrl: './reports.html',
})
export class Reports {
  isLoaded: boolean = false;
  rows: { label: string; value: number }[] = [];

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
    const count = (url: string) => get(url).then((r: any) => (r ? r.totalResults : 0));
    Promise.all([
      count('v1/realestate/admin/properties?status=PUBLISHED&limit=1'),
      count('v1/realestate/admin/leads?limit=1'),
      count('v1/realestate/admin/visits?limit=1'),
      count('v1/realestate/admin/holds?status=ACTIVE&limit=1'),
      count('v1/realestate/admin/sales?limit=1'),
      count('v1/realestate/admin/commissions?status=EARNED&limit=1'),
      count('v1/realestate/admin/settlements?status=PAID&limit=1'),
      count('v1/realestate/admin/bank-offers?status=ACCEPTED&limit=1'),
    ]).then(([published, leads, visits, holds, sales, earned, settled, offers]) => {
      this.rows = [
        { label: 'realEstate_rep_published', value: published },
        { label: 'realEstate_rep_leads', value: leads },
        { label: 'realEstate_rep_visits', value: visits },
        { label: 'realEstate_rep_active_holds', value: holds },
        { label: 'realEstate_rep_sales', value: sales },
        { label: 'realEstate_rep_earned_commissions', value: earned },
        { label: 'realEstate_rep_paid_settlements', value: settled },
        { label: 'realEstate_rep_accepted_offers', value: offers },
      ];
      this.isLoaded = true;
    });
  }
}
