import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-stores-subscription-anomalies',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './subscription-anomalies.html',
})
export class SubscriptionAnomalies {
  rows: any[] = [];
  filteredRows: any[] = [];
  isLoaded = false;
  searchQuery = '';

  constructor(private api: ApiService, public util: UtilService) {}

  ngOnInit() { this.load(); }

  onSearch() {
    const q = (this.searchQuery || '').toLowerCase();
    this.filteredRows = q
      ? this.rows.filter((r: any) => JSON.stringify(r).toLowerCase().includes(q))
      : this.rows;
  }

  load() {
    this.isLoaded = false;
    this.api.get_private('v1/admin/stores/customer-subscriptions?limit=200').subscribe({
      next: (r: any) => {
        const items = r && r.items ? r.items : [];
        // Flag subscriptions with high skip counts (3+ skipDates) as anomalies.
        this.rows = items.filter((s: any) => (s.skipDates || []).length >= 3);
        this.filteredRows = this.rows;
        this.isLoaded = true;
      },
      error: (e: any) => { this.rows = []; this.isLoaded = true; this.util.handleError(e, 'admin'); },
    });
  }
}
