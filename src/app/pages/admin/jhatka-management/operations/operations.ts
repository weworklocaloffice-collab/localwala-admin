import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-jhatka-operations',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './operations.html',
})
export class JhatkaOperations {
  isLoaded: boolean = false;
  refunds: any[] = [];
  recurring: any[] = [];
  subscriptions: any[] = [];
  cancellations: any[] = [];
  yieldSpecs: any[] = [];
  newYieldSpec: any = { code: '', name: '', cutType: 'curry_cut', expectedYieldPct: null };
  cutTypes: string[] = ['whole', 'curry_cut', 'skinless', 'boneless', 'cleaned', 'fish_cleaned', 'prawn_peeled', 'portioned'];

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {
    this.getAll();
  }

  pickList(response: any, keys: string[]): any[] {
    if (!response) {
      return [];
    }
    for (const key of keys) {
      if (Array.isArray(response[key])) {
        return response[key];
      }
    }
    return [];
  }

  getAll() {
    this.isLoaded = false;
    const calls: Array<[string, (list: any[]) => void]> = [
      ['v1/jhatka/admin/operations/refunds', (list) => (this.refunds = list)],
      ['v1/jhatka/admin/operations/recurring-orders', (list) => (this.recurring = list)],
      ['v1/jhatka/admin/operations/subscriptions', (list) => (this.subscriptions = list)],
      ['v1/jhatka/admin/operations/cancellations', (list) => (this.cancellations = list)],
      ['v1/jhatka/admin/operations/yield-specs', (list) => (this.yieldSpecs = list)],
    ];
    let pending = calls.length;
    const done = () => {
      pending -= 1;
      if (pending <= 0) {
        this.isLoaded = true;
      }
    };
    calls.forEach(([url, assign]) => {
      this.api.get_private(url).subscribe({
        next: (response: any) => {
          assign(this.pickList(response, ['refunds', 'recurringOrders', 'recurring', 'subscriptions', 'orders', 'yieldSpecs', 'specs', 'cancellations']));
          done();
        },
        error: (error: any) => {
          this.util.handleError(error, 'admin');
          done();
        },
      });
    });
  }

  createYieldSpec() {
    if (!this.newYieldSpec.code || !this.newYieldSpec.name) {
      return;
    }
    this.api.post_private('v1/jhatka/admin/operations/yield-specs', this.newYieldSpec).subscribe({
      next: () => {
        this.newYieldSpec = { code: '', name: '', cutType: 'curry_cut', expectedYieldPct: null };
        this.getAll();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  editYieldSpec(element: any) {
    const raw = window.prompt(
      `Expected yield % for ${element.code} (0–100, exclusive of 0):`,
      String(element.expectedYieldPct ?? '')
    );
    if (raw === null) {
      return;
    }
    const expectedYieldPct = Number(raw);
    if (!Number.isFinite(expectedYieldPct) || expectedYieldPct <= 0 || expectedYieldPct > 100) {
      this.util.handleError({ message: 'Expected yield must be > 0 and <= 100' }, 'admin');
      return;
    }
    this.api.patch_private(`v1/jhatka/admin/operations/yield-specs/${element.id}`, { expectedYieldPct }).subscribe({
      next: () => this.getAll(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
