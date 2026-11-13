import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MaterialModule } from 'src/app/material.module';
import { UtilService } from 'src/app/services/util-service';
import { JhatkaAdminService } from '../jhatka-admin.service';
import { JhatkaCityRef, JhatkaOutlet, JhatkaOutletStats } from '../jhatka.models';
import {
  OutletStatusDialog,
  OutletStatusDialogData,
} from './outlet-status-dialog/outlet-status-dialog';

@Component({
  selector: 'app-jhatka-outlets',
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  templateUrl: './outlets.html',
  styles: [
    `
      .page-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 18px;
        flex-wrap: wrap;
        margin-bottom: 20px;
      }
      .eyebrow {
        color: var(--mat-sys-primary);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .page-title {
        font-size: 30px;
        line-height: 1.15;
        font-weight: 700;
        margin: 4px 0 6px;
      }
      .page-copy {
        color: var(--mat-sys-on-surface-variant);
        font-size: 14px;
        max-width: 680px;
        margin: 0;
      }
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
        margin-bottom: 18px;
      }
      .kpi-card {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 14px;
        padding: 16px 18px;
        background: var(--mat-sys-surface);
        min-height: 104px;
      }
      .kpi-label {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .kpi-value {
        font-size: 28px;
        font-weight: 700;
        line-height: 1.2;
        margin-top: 6px;
      }
      .kpi-hint {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        margin-top: 2px;
      }
      .filter-bar {
        display: grid;
        grid-template-columns: minmax(240px, 1.6fr) repeat(3, minmax(150px, 1fr)) auto;
        gap: 12px;
        align-items: center;
      }
      .filter-bar mat-form-field {
        width: 100%;
      }
      .table-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 6px;
      }
      .outlet-cell {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 220px;
        padding: 6px 0;
      }
      .outlet-avatar {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        object-fit: cover;
        display: grid;
        place-items: center;
        font-weight: 700;
        color: var(--mat-sys-primary);
        background: var(--mat-sys-primary-container);
        flex: 0 0 42px;
      }
      .outlet-name {
        font-weight: 650;
        line-height: 1.25;
      }
      .outlet-meta {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        margin-top: 3px;
      }
      .status-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 650;
        text-transform: capitalize;
        white-space: nowrap;
      }
      .status-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        padding: 3px 8px;
        border-radius: 7px;
        background: var(--mat-sys-surface-container-high);
        color: var(--mat-sys-on-surface-variant);
        font-size: 12px;
        font-weight: 600;
      }
      .status-active {
        background: #e7f6ec;
        color: #157a3b;
      }
      .status-pending_approval {
        background: #fff4dd;
        color: #9a5b00;
      }
      .status-draft {
        background: #eef1f6;
        color: #536174;
      }
      .status-suspended {
        background: #fff0e8;
        color: #b54708;
      }
      .status-closed {
        background: #fdecec;
        color: #b42318;
      }
      .cell-muted {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        margin-top: 4px;
      }
      .empty-state {
        text-align: center;
        padding: 56px 20px;
      }
      .empty-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        margin: 0 auto 12px;
        display: grid;
        place-items: center;
        background: var(--mat-sys-surface-container-high);
        color: var(--mat-sys-on-surface-variant);
      }
      @media (max-width: 1100px) {
        .kpi-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .filter-bar {
          grid-template-columns: 1fr 1fr;
        }
      }
      @media (max-width: 640px) {
        .kpi-grid,
        .filter-bar {
          grid-template-columns: 1fr;
        }
        .page-title {
          font-size: 25px;
        }
      }
    `,
  ],
})
export class JhatkaOutlets {
  isLoaded = false;
  list: JhatkaOutlet[] = [];
  cities: JhatkaCityRef[] = [];
  stats: JhatkaOutletStats = {
    total: 0,
    byStatus: { draft: 0, pending_approval: 0, active: 0, suspended: 0, closed: 0 },
    byBusinessModel: { direct: 0, franchise: 0, commission_partner: 0 },
  };

  search = '';
  selectedStatus = '';
  selectedModel = '';
  selectedCity = '';
  currentPage = 0;
  pageSize = 10;
  total = 0;
  readonly displayedColumns = ['outlet', 'location', 'model', 'operations', 'status', 'actions'];
  readonly businessModels = ['direct', 'franchise', 'commission_partner'];
  readonly statuses = ['draft', 'pending_approval', 'active', 'suspended', 'closed'];
  readonly transitions: Record<string, string[]> = {
    draft: ['pending_approval', 'closed'],
    pending_approval: ['active', 'closed', 'draft'],
    active: ['suspended', 'closed'],
    suspended: ['active', 'closed'],
    closed: [],
  };

  constructor(
    public api: JhatkaAdminService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {
    this.getCities();
    this.getStats();
    this.getList();
  }

  getStats() {
    this.api.getOutletStats().subscribe({
      next: (stats) => (this.stats = stats),
      error: () => {},
    });
  }

  getCities() {
    this.api.getCities().subscribe({
      next: (cities) => (this.cities = cities || []),
      error: () => {},
    });
  }

  getList() {
    this.isLoaded = false;
    this.api
      .getOutlets({
        page: this.currentPage + 1,
        limit: this.pageSize,
        search: this.search.trim(),
        status: this.selectedStatus,
        businessModel: this.selectedModel,
        city: this.selectedCity,
      })
      .subscribe({
        next: (response: any) => {
          this.isLoaded = true;
          this.list = response?.outlets || [];
          this.total = response?.total ?? this.list.length;
        },
        error: (error: any) => {
          this.isLoaded = true;
          this.util.handleError(error, 'admin');
        },
      });
  }

  applyFilters() {
    this.currentPage = 0;
    this.getList();
  }

  clearFilters() {
    this.search = '';
    this.selectedStatus = '';
    this.selectedModel = '';
    this.selectedCity = '';
    this.applyFilters();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  idOf(value: any): string {
    return this.api.idOf(value);
  }

  outletId(outlet: JhatkaOutlet): string {
    return this.api.idOf(outlet);
  }

  businessName(outlet: JhatkaOutlet): string {
    const business = outlet.business as any;
    return business?.name || 'Business not linked';
  }

  cityName(value: any): string {
    return value?.name || 'City not set';
  }

  addressLine(outlet: JhatkaOutlet): string {
    return [outlet.address?.line1, outlet.address?.line2].filter(Boolean).join(', ') || 'Address not set';
  }

  initials(name: string): string {
    return (name || 'O')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Draft',
      pending_approval: 'Pending approval',
      active: 'Active',
      suspended: 'Suspended',
      closed: 'Closed',
    };
    return labels[status] || status;
  }

  statusClass(status: string): string {
    return `status-${status}`;
  }

  modelLabel(model: string): string {
    const labels: Record<string, string> = {
      direct: 'Direct operated',
      franchise: 'Franchise',
      commission_partner: 'Commission partner',
    };
    return labels[model] || model;
  }

  allowedTransitions(outlet: JhatkaOutlet): string[] {
    return this.transitions[outlet.status] || [];
  }

  openStatusDialog(outlet: JhatkaOutlet, nextStatus: string) {
    const data: OutletStatusDialogData = {
      outletName: `${outlet.name} (${outlet.outletCode})`,
      currentStatus: outlet.status,
      nextStatus,
      hasValidFssai: undefined,
    };
    this.dialog
      .open(OutletStatusDialog, { data, width: '520px', maxWidth: 'calc(100vw - 32px)', disableClose: true })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.api.setOutletStatus(this.outletId(outlet), result.status, result.statusReason).subscribe({
          next: () => {
            this.util.onSuccess('ts_status_updated');
            this.getStats();
            this.getList();
          },
          error: (error: any) => this.util.handleError(error, 'admin'),
        });
      });
  }

  trackById(_index: number, row: JhatkaOutlet): string {
    return this.outletId(row) || row.outletCode;
  }
}
