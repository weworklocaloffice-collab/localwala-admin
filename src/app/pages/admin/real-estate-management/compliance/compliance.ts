import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Compliance — audit + ledger export surface (plan §10.2 row 33).
 *
 * BR-17/BR-20: the ledger is append-only and every money movement is
 * audited. This screen shows the newest audit rows and exports the
 * current ledger / audit pages as CSV for reconciliation. Export runs
 * client-side over the already-fetched page — no new backend.
 */
@Component({
  selector: 'app-real-estate-compliance',
  imports: [CommonModule, MaterialModule],
  templateUrl: './compliance.html',
})
export class Compliance {
  isLoaded: boolean = false;
  audits: any[] = [];
  ledgerCount: number = 0;

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoaded = false;
    this.api.get_private('v1/realestate/admin/audit-logs?limit=20').subscribe({
      next: (response: any) => {
        this.audits = (response && response.results) || [];
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
    this.api.get_private('v1/realestate/admin/ledger?limit=1').subscribe({
      next: (response: any) => {
        this.ledgerCount = response ? response.totalResults : 0;
      },
      error: () => {
        this.ledgerCount = 0;
      },
    });
  }

  downloadCsv(kind: string) {
    if (kind === 'ledger') {
      this.downloadLedgerCsv();
      return;
    }
    const header = 'eventType,targetType,targetId,actorType,createdAt';
    const lines = this.audits.map((r: any) =>
      [r.eventType, r.targetType, r.targetId, r.actorType, r.createdAt].join(','),
    );
    this.saveCsv(`real-estate-audit.csv`, [header, ...lines].join('\n'));
  }

  /**
   * Ledger export — current first page (100 rows) as CSV. The ledger is
   * append-only (BR-17), so a page export is a faithful slice, never a
   * recomputation. Amounts export as stored (paise inside moneyFields
   * arrive hydrated; the column carries what the API returned).
   */
  downloadLedgerCsv() {
    this.api.get_private('v1/realestate/admin/ledger?limit=100').subscribe({
      next: (response: any) => {
        const rows = (response && response.results) || [];
        const header = 'entryNo,eventType,accountType,direction,amount,partyType,createdAt';
        const lines = rows.map((r: any) =>
          [r.entryNo, r.eventType, r.accountType, r.direction, r.amount, r.partyType, r.createdAt].join(','),
        );
        this.saveCsv(`real-estate-ledger.csv`, [header, ...lines].join('\n'));
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }

  private saveCsv(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
