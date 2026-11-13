import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { PaisePipe } from '../paise.pipe';

/**
 * Supply requests (OD-12 companion): the platform side of "LocalWala supplies
 * the meat". Approving a request is a CREDIT decision as much as a stock one —
 * it freezes the transfer price per line and (for deduct mode) extends credit
 * under the platform cap. Fulfilment posts a receipt at the partner outlet and
 * debits their ledger.
 */
@Component({
  selector: 'app-jhatka-supply',
  imports: [CommonModule, FormsModule, PaisePipe, MaterialModule],
  templateUrl: './supply.html',
})
export class JhatkaSupply {
  isLoaded: boolean = false;
  list: any[] = [];
  statusFilter: string = '';
  selected: any = null;
  rateByProduct: any = {};
  supplier: string = '';
  rawSkuByProduct: any = {};
  reason: string = '';
  busy: boolean = false;

  // Delivery-area change requests (OD-12 companion): partner proposes, admin approves.
  areaLoaded: boolean = false;
  areaRequests: any[] = [];
  areaSelected: any = null;
  areaReason: string = '';
  areaBusy: boolean = false;

  displayedColumns: string[] = ['request', 'items', 'value', 'mode', 'status', 'action'];
  areaColumns: string[] = ['request', 'current', 'proposed', 'status', 'action'];

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {
    this.getList();
    this.getAreaRequests();
  }

  idOf(element: any): string {
    return element?.id || element?._id || '';
  }

  getList() {
    this.isLoaded = false;
    const status = this.statusFilter ? `&status=${this.statusFilter}` : '';
    this.api.get_private(`v1/jhatka/admin/supply/requests?limit=50${status}`).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        this.list = response?.requests || [];
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  open(element: any) {
    this.selected = element;
    this.rateByProduct = {};
    this.rawSkuByProduct = {};
    this.supplier = '';
    this.reason = '';
    for (const item of element.items || []) {
      const pid = this.pidOf(item);
      // Sensible default: freeze at the catalogue's last known rate if shown.
      this.rateByProduct[pid] = item.ratePaisePerUnit ?? 0;
    }
  }

  close() {
    this.selected = null;
  }

  pidOf(item: any): string {
    const p = item?.product;
    return typeof p === 'object' ? (p?.id || p?._id || '') : String(p || '');
  }

  approve() {
    const id = this.idOf(this.selected);
    this.busy = true;
    this.api.post_private(`v1/jhatka/admin/supply/requests/${id}/approve`, {
      rates: this.rateByProduct,
    }).subscribe({
      next: () => {
        this.busy = false;
        this.util.onSuccess('Request approved — rates frozen');
        this.close();
        this.getList();
      },
      error: (error: any) => {
        this.busy = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  reject() {
    if (!this.reason || this.reason.length < 3) {
      this.util.onInfo('A rejection reason is required');
      return;
    }
    const id = this.idOf(this.selected);
    this.busy = true;
    this.api.post_private(`v1/jhatka/admin/supply/requests/${id}/reject`, { reason: this.reason }).subscribe({
      next: () => {
        this.busy = false;
        this.close();
        this.getList();
      },
      error: (error: any) => {
        this.busy = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  cancel() {
    if (!this.reason || this.reason.length < 3) {
      this.util.onInfo('A cancellation reason is required');
      return;
    }
    const id = this.idOf(this.selected);
    this.busy = true;
    this.api.post_private(`v1/jhatka/admin/supply/requests/${id}/cancel`, { reason: this.reason }).subscribe({
      next: () => {
        this.busy = false;
        this.close();
        this.getList();
      },
      error: (error: any) => {
        this.busy = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  fulfil() {
    const id = this.idOf(this.selected);
    const rawSkuByProduct: any = {};
    let missing = false;
    for (const item of this.selected.items || []) {
      const pid = this.pidOf(item);
      const sku = (this.rawSkuByProduct[pid] || '').trim().toUpperCase();
      if (!sku) {
        missing = true;
        break;
      }
      rawSkuByProduct[pid] = sku;
    }
    if (missing) {
      this.util.onInfo('A raw SKU per line is required (as printed on the pack)');
      return;
    }
    this.busy = true;
    this.api.post_private(`v1/jhatka/admin/supply/requests/${id}/fulfil`, {
      supplier: this.supplier,
      rawSkuByProduct,
    }).subscribe({
      next: () => {
        this.busy = false;
        this.util.onSuccess('Fulfilled — receipt posted, ledger debited');
        this.close();
        this.getList();
      },
      error: (error: any) => {
        this.busy = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Delivery-area change requests
  // ---------------------------------------------------------------------------

  getAreaRequests() {
    this.areaLoaded = false;
    this.api.get_private('v1/jhatka/admin/supply/area-requests').subscribe({
      next: (response: any) => {
        this.areaLoaded = true;
        this.areaRequests = response?.requests || [];
      },
      error: (error: any) => {
        this.areaLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  openArea(element: any) {
    this.areaSelected = element;
    this.areaReason = '';
  }

  closeArea() {
    this.areaSelected = null;
  }

  approveArea() {
    const id = this.idOf(this.areaSelected);
    this.areaBusy = true;
    this.api.post_private(`v1/jhatka/admin/supply/area-requests/${id}/approve`, {}).subscribe({
      next: () => {
        this.areaBusy = false;
        this.util.onSuccess('Approved — the delivery rings are now live');
        this.closeArea();
        this.getAreaRequests();
      },
      error: (error: any) => {
        this.areaBusy = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  rejectArea() {
    if (!this.areaReason || this.areaReason.trim().length < 3) {
      this.util.onInfo('A rejection reason is required');
      return;
    }
    const id = this.idOf(this.areaSelected);
    this.areaBusy = true;
    this.api.post_private(`v1/jhatka/admin/supply/area-requests/${id}/reject`, {
      reason: this.areaReason.trim(),
    }).subscribe({
      next: () => {
        this.areaBusy = false;
        this.util.onSuccess('Request rejected');
        this.closeArea();
        this.getAreaRequests();
      },
      error: (error: any) => {
        this.areaBusy = false;
        this.util.handleError(error, 'admin');
      },
    });
  }
}
