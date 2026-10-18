import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { PaisePipe } from '../paise.pipe';

type InventoryTab = 'batches' | 'stock' | 'movements' | 'wastage' | 'recalls';

/**
 * Platform-wide inventory console: batches, stock, movements, wastage, recalls.
 *
 * One component, five tabs — one domain, not five. Every tab is read-only
 * except batch quarantine/release, because the ledger (movements) and the loss
 * figures (wastage) must stay proof, not editable text: a console that could
 * rewrite them would let the margin be restated after the fact.
 *
 * Quarantine needs a written reason (§12: a recall must be explainable); release
 * returns the batch to `opened`. Both refresh the batches tab, because a batch
 * whose status changed anywhere else on this screen is stale everywhere.
 */
@Component({
  selector: 'app-jhatka-inventory',
  imports: [CommonModule, FormsModule, MaterialModule, PaisePipe],
  templateUrl: './inventory.html',
})
export class JhatkaInventory {
  isLoaded: boolean = false;
  tab: InventoryTab = 'batches';

  batches: any[] = [];
  stock: any[] = [];
  movements: any[] = [];
  wastage: any[] = [];
  recalls: any[] = [];

  currentPage: number = 0;
  pageSize: number = 25;
  total: number = 0;

  // Filters, per tab. Outlet is shared: an admin scoping to one counter wants
  // every tab scoped, not just the first.
  outletFilter: string = '';
  batchStatus: string = '';
  expiringInDays: string = '';
  movementType: string = '';
  wastageCause: string = '';
  recallStatus: string = '';

  batchColumns: string[] = ['batch', 'product', 'qty', 'expiry', 'status', 'action'];
  stockColumns: string[] = ['item', 'balances', 'sellable'];
  movementColumns: string[] = ['when', 'type', 'delta', 'balance'];
  wastageColumns: string[] = ['when', 'cause', 'qty', 'value'];
  recallColumns: string[] = ['recall', 'severity', 'customers', 'status'];

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {
    this.getTab();
  }

  setTab(tab: InventoryTab) {
    this.tab = tab;
    this.currentPage = 0;
    this.getTab();
  }

  getTab() {
    switch (this.tab) {
      case 'batches':
        return this.getBatches();
      case 'stock':
        return this.getStock();
      case 'movements':
        return this.getMovements();
      case 'wastage':
        return this.getWastage();
      case 'recalls':
        return this.getRecalls();
    }
  }

  params(extra: any): string {
    const param: any = {
      limit: this.pageSize,
      page: this.currentPage + 1,
      outlet: this.outletFilter,
      ...extra,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) {
        return;
      }
      httpParams = httpParams.set(key, param[key]);
    });
    return httpParams.toString();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getTab();
  }

  getBatches() {
    this.isLoaded = false;
    this.api
      .get_private(
        'v1/jhatka/admin/inventory/batches?' +
          this.params({ status: this.batchStatus, expiringInDays: this.expiringInDays })
      )
      .subscribe({
        next: (response: any) => {
          this.isLoaded = true;
          this.batches = response?.batches ?? [];
          this.total = response?.total ?? this.batches.length;
        },
        error: (error: any) => {
          this.isLoaded = true;
          this.util.handleError(error, 'admin');
        },
      });
  }

  getStock() {
    this.isLoaded = false;
    this.api
      .get_private('v1/jhatka/admin/inventory/stock?' + this.params({}))
      .subscribe({
        next: (response: any) => {
          this.isLoaded = true;
          this.stock = response?.items ?? response?.stock ?? [];
          this.total = response?.total ?? this.stock.length;
        },
        error: (error: any) => {
          this.isLoaded = true;
          this.util.handleError(error, 'admin');
        },
      });
  }

  getMovements() {
    this.isLoaded = false;
    this.api
      .get_private(
        'v1/jhatka/admin/inventory/movements?' +
          this.params({ movementType: this.movementType })
      )
      .subscribe({
        next: (response: any) => {
          this.isLoaded = true;
          this.movements = response?.movements ?? [];
          this.total = response?.total ?? this.movements.length;
        },
        error: (error: any) => {
          this.isLoaded = true;
          this.util.handleError(error, 'admin');
        },
      });
  }

  getWastage() {
    this.isLoaded = false;
    this.api
      .get_private(
        'v1/jhatka/admin/inventory/wastage?' +
          this.params({ cause: this.wastageCause })
      )
      .subscribe({
        next: (response: any) => {
          this.isLoaded = true;
          this.wastage = response?.wastages ?? [];
          this.total = response?.count ?? this.wastage.length;
        },
        error: (error: any) => {
          this.isLoaded = true;
          this.util.handleError(error, 'admin');
        },
      });
  }

  getRecalls() {
    this.isLoaded = false;
    this.api
      .get_private(
        'v1/jhatka/admin/inventory/recalls?' +
          this.params({ status: this.recallStatus })
      )
      .subscribe({
        next: (response: any) => {
          this.isLoaded = true;
          this.recalls = response?.recalls ?? [];
          this.total = response?.count ?? this.recalls.length;
        },
        error: (error: any) => {
          this.isLoaded = true;
          this.util.handleError(error, 'admin');
        },
      });
  }

  quarantine(element: any) {
    const reason = window.prompt(`Quarantine batch ${element.batchNo}? A reason is required.`);
    if (!reason || !reason.trim()) {
      return;
    }
    this.api
      .post_private(`v1/jhatka/admin/inventory/batches/${element.id}/quarantine`, {
        reason: reason.trim(),
      })
      .subscribe({
        next: () => this.getBatches(),
        error: (error: any) => this.util.handleError(error, 'admin'),
      });
  }

  release(element: any) {
    this.api
      .post_private(`v1/jhatka/admin/inventory/batches/${element.id}/release`, {})
      .subscribe({
        next: () => this.getBatches(),
        error: (error: any) => this.util.handleError(error, 'admin'),
      });
  }
}
