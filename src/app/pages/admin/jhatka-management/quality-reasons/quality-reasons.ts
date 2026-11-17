import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { UtilService } from 'src/app/services/util-service';
import { JhatkaAdminService } from '../jhatka-admin.service';
import { JhatkaQualityRejectionReason } from '../jhatka.models';
import { JhatkaReasonDialog } from './reason-dialog/reason-dialog';

@Component({
  selector: 'app-jhatka-quality-reasons',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './quality-reasons.html',
})
export class JhatkaQualityReasons {
  isLoaded = false;
  displayedColumns = ['code', 'label', 'category', 'severity', 'autoReject', 'status', 'actions'];
  reasons: JhatkaQualityRejectionReason[] = [];
  meta: any = {};
  search = '';
  statusFilter = 'all';
  categoryFilter = '';
  busyId = '';

  constructor(
    public admin: JhatkaAdminService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {
    this.load();
  }

  load() {
    this.isLoaded = false;
    this.admin.getRejectionReasons({}).subscribe({
      next: (response: any) => {
        this.reasons = Array.isArray(response?.reasons) ? response.reasons : [];
        this.meta = response?.meta || {};
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
        this.isLoaded = true;
      },
    });
  }

  get filteredReasons(): JhatkaQualityRejectionReason[] {
    const search = this.search.trim().toLowerCase();
    return this.reasons.filter((reason) => {
      if (this.statusFilter === 'active' && reason.status === false) return false;
      if (this.statusFilter === 'inactive' && reason.status !== false) return false;
      if (this.categoryFilter && reason.category !== this.categoryFilter) return false;
      if (!search) return true;
      return [reason.code, reason.label, reason.description, reason.category, reason.fault]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search);
    });
  }

  get categories(): string[] {
    return this.meta?.categories || [];
  }

  documentId(value: any): string {
    return this.admin.idOf(value);
  }

  openReason(reason?: JhatkaQualityRejectionReason) {
    this.dialog
      .open(JhatkaReasonDialog, {
        data: { reason, meta: this.meta },
        width: '720px',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.saved) {
          this.load();
        }
      });
  }

  toggleStatus(reason: JhatkaQualityRejectionReason, checked: boolean) {
    const id = this.documentId(reason);
    if (!id) return;
    this.busyId = id;
    this.admin.updateRejectionReason(id, { status: checked }).subscribe({
      next: () => {
        this.util.onSuccess('jhatka_quality_reason_updated');
        this.load();
        this.busyId = '';
      },
      error: (error) => {
        this.util.handleError(error, 'admin');
        this.busyId = '';
      },
    });
  }
}

