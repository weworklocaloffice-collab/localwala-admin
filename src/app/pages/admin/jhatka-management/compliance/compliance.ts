import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-jhatka-compliance',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './compliance.html',
})
export class JhatkaCompliance {
  isLoaded: boolean = false;
  records: any[] = [];
  openRecalls: any[] = [];
  expiring: any[] = [];
  displayedRecordColumn: string[] = ['outlet', 'licence', 'status', 'renew'];
  displayedRecallColumn: string[] = ['recall', 'severity', 'notified'];
  newRecord: any = { outlet: '', licenceNumber: '', category: 'state_licence', expiresAt: '', gstin: '' };
  fssaiCategories: string[] = ['state_licence', 'central_licence', 'registration'];

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {
    this.getOverview();
    this.getExpiring();
  }

  getOverview() {
    this.isLoaded = false;
    this.api.get_private('v1/jhatka/admin/compliance/overview').subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        this.records = response?.records || [];
        this.openRecalls = response?.openRecalls || [];
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  getExpiring() {
    this.api.get_private('v1/jhatka/admin/compliance/expiring').subscribe({
      next: (response: any) => {
        this.expiring = response?.expiring || response?.records || [];
      },
      error: () => {},
    });
  }

  closeRecall(element: any, force: boolean) {
    const body: any = {};
    if (force) {
      const note = window.prompt('Force-closing over unacknowledged customers requires a resolution note:');
      if (!note) {
        return;
      }
      body.force = true;
      body.resolutionNote = note;
    }
    this.api.post_private(`v1/jhatka/admin/compliance/recalls/${element.id}/close`, body).subscribe({
      next: () => this.getOverview(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  createRecord() {
    if (!this.newRecord.outlet || !this.newRecord.licenceNumber || !this.newRecord.expiresAt) {
      return;
    }
    const body: any = {
      outlet: this.newRecord.outlet,
      fssai: {
        licenceNumber: this.newRecord.licenceNumber,
        category: this.newRecord.category,
        expiresAt: this.newRecord.expiresAt,
      },
    };
    if (this.newRecord.gstin) {
      body.gstin = this.newRecord.gstin;
    }
    this.api.post_private('v1/jhatka/admin/compliance', body).subscribe({
      next: () => {
        this.newRecord = { outlet: '', licenceNumber: '', category: 'state_licence', expiresAt: '', gstin: '' };
        this.getOverview();
        this.getExpiring();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  renewLicence(element: any) {
    const id = element._id || element.id;
    const licenceNumber = window.prompt(
      `New FSSAI licence number for ${element.outlet?.name || ''}:`,
      element.fssai?.licenceNumber || ''
    );
    if (licenceNumber === null || !licenceNumber.trim()) {
      return;
    }
    const expiresAt = window.prompt('New expiry (YYYY-MM-DD):', '');
    if (expiresAt === null || !expiresAt.trim()) {
      return;
    }
    this.api.patch_private(`v1/jhatka/admin/compliance/${id}`, {
      fssai: { licenceNumber: licenceNumber.trim(), expiresAt: expiresAt.trim() },
    }).subscribe({
      next: () => {
        this.getOverview();
        this.getExpiring();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
