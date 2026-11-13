import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { JhatkaAdminService } from '../jhatka-admin.service';
import { JhatkaOutlet } from '../jhatka.models';
import { PaisePipe } from '../paise.pipe';
import { OutletStatusDialog } from '../outlets/outlet-status-dialog/outlet-status-dialog';

@Component({
  selector: 'app-jhatka-outlet-detail',
  imports: [CommonModule, RouterModule, MaterialModule, PaisePipe],
  templateUrl: './outlet-detail.html',
  styles: [
    `
      .detail-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 18px;
      }
      .eyebrow {
        color: var(--mat-sys-primary);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .page-title {
        font-size: 28px;
        line-height: 1.2;
        font-weight: 700;
        margin: 4px 0 6px;
      }
      .page-copy {
        color: var(--mat-sys-on-surface-variant);
        font-size: 14px;
        margin: 0;
      }
      .hero-card {
        overflow: hidden;
      }
      .hero-cover {
        height: 150px;
        background: linear-gradient(135deg, #1f4d3a, #2f7d5a);
        background-size: cover;
        background-position: center;
        position: relative;
      }
      .hero-cover::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, transparent 20%, rgba(0, 0, 0, 0.38));
      }
      .hero-body {
        display: flex;
        align-items: flex-end;
        gap: 16px;
        padding: 0 24px 20px;
        margin-top: -36px;
        position: relative;
        z-index: 1;
        flex-wrap: wrap;
      }
      .hero-logo {
        width: 78px;
        height: 78px;
        border-radius: 18px;
        object-fit: cover;
        background: #ffffff;
        border: 4px solid #ffffff;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.16);
        display: grid;
        place-items: center;
        font-size: 26px;
        font-weight: 700;
        color: #1f4d3a;
        flex: 0 0 auto;
      }
      .hero-name {
        font-size: 24px;
        font-weight: 700;
        line-height: 1.2;
      }
      .hero-meta {
        color: var(--mat-sys-on-surface-variant);
        font-size: 13px;
        margin-top: 3px;
      }
      .hero-actions {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .status-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        background: var(--mat-sys-surface-container-high);
        color: var(--mat-sys-on-surface-variant);
        text-transform: capitalize;
      }
      .status-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
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
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 18px;
      }
      .kpi-card {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 14px;
        padding: 16px;
        background: var(--mat-sys-surface-container-lowest);
      }
      .kpi-label {
        color: var(--mat-sys-on-surface-variant);
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .kpi-value {
        font-size: 22px;
        font-weight: 700;
        margin-top: 6px;
        line-height: 1.2;
      }
      .kpi-hint {
        color: var(--mat-sys-on-surface-variant);
        font-size: 12px;
        margin-top: 4px;
      }
      .section-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
      .span-2 {
        grid-column: 1 / -1;
      }
      .info-section {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 14px;
        padding: 16px;
        background: var(--mat-sys-surface-container-lowest);
      }
      .info-title {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--mat-sys-on-surface-variant);
        margin-bottom: 12px;
      }
      .info-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding: 9px 0;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
        font-size: 13px;
      }
      .info-row:last-child {
        border-bottom: 0;
      }
      .info-label {
        color: var(--mat-sys-on-surface-variant);
        flex: 0 0 44%;
      }
      .info-value {
        font-weight: 600;
        text-align: right;
        word-break: break-word;
      }
      .address-block {
        font-size: 14px;
        line-height: 1.7;
      }
      .about-copy {
        font-size: 14px;
        line-height: 1.7;
        color: var(--mat-sys-on-surface-variant);
      }
      .hours-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      .hours-table td {
        padding: 9px 8px;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }
      .hours-table tr:last-child td {
        border-bottom: 0;
      }
      .hours-table td:last-child {
        text-align: right;
        font-weight: 600;
      }
      .closed-text {
        color: var(--mat-sys-error);
      }
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 0;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }
      .toggle-row:last-child {
        border-bottom: 0;
      }
      .toggle-title {
        font-weight: 600;
        font-size: 14px;
      }
      .toggle-copy {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        margin-top: 2px;
      }
      .notice-box {
        display: flex;
        gap: 12px;
        padding: 14px;
        border-radius: 12px;
        background: #fff8e6;
        border: 1px solid #f3d19e;
        color: #7a4b00;
      }
      .notice-box.ok {
        background: #eaf7ef;
        border-color: #b9e3c8;
        color: #1b6b3a;
      }
      .notice-box .mat-icon {
        flex: 0 0 auto;
      }
      .chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
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
      .empty-panel {
        border: 1px dashed var(--mat-sys-outline);
        border-radius: 14px;
        padding: 28px;
        text-align: center;
        color: var(--mat-sys-on-surface-variant);
      }
      .audit-line {
        color: var(--mat-sys-on-surface-variant);
        font-size: 12px;
        margin-top: 16px;
      }
      @media (max-width: 960px) {
        .kpi-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 720px) {
        .kpi-grid,
        .section-grid {
          grid-template-columns: 1fr;
        }
        .hero-actions {
          margin-left: 0;
          width: 100%;
        }
      }
    `,
  ],
})
export class JhatkaOutletDetail {
  isLoaded = false;
  isPatching = false;
  outlet: JhatkaOutlet | null = null;
  compliance: any[] = [];

  readonly transitions: Record<string, string[]> = {
    draft: ['pending_approval', 'closed'],
    pending_approval: ['active', 'closed', 'draft'],
    active: ['suspended', 'closed'],
    suspended: ['active', 'closed'],
    closed: [],
  };

  readonly statusLabels: Record<string, string> = {
    draft: 'Draft',
    pending_approval: 'Pending approval',
    active: 'Active',
    suspended: 'Suspended',
    closed: 'Closed',
  };

  private outletIdValue = '';

  constructor(
    public appApi: ApiService,
    public admin: JhatkaAdminService,
    public util: UtilService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {
    this.outletIdValue = this.route.snapshot.paramMap.get('id') || '';
    if (this.outletIdValue) {
      this.getDetail();
    }
  }

  get outletId(): string {
    return this.admin.idOf(this.outlet) || this.outletIdValue;
  }

  get businessName(): string {
    const business: any = this.outlet?.business;
    return business?.name || (typeof business === 'string' ? 'Linked business' : 'Not linked');
  }

  get businessCode(): string {
    const business: any = this.outlet?.business;
    return business?.code || '';
  }

  get cityName(): string {
    const city: any = this.outlet?.city;
    return city?.name || '';
  }

  get localityName(): string {
    const locality: any = this.outlet?.locality;
    return locality?.name || '';
  }

  get contactMobile(): string {
    const contact: any = this.outlet?.contact || {};
    if (!contact.mobile) {
      return '';
    }
    return `${contact.countryCode || ''} ${contact.mobile}`.trim();
  }

  get addressLines(): string[] {
    const address: any = this.outlet?.address || {};
    return [address.line1, address.line2, address.landmark, address.pincode].filter(Boolean);
  }

  get complianceRecord(): any {
    return this.compliance?.[0] || null;
  }

  get complianceStatus(): string {
    return this.complianceRecord?.status || 'missing';
  }

  get complianceLabel(): string {
    const labels: Record<string, string> = {
      valid: 'Valid',
      expiring: 'Expiring soon',
      expired: 'Expired',
      pending: 'Pending',
      missing: 'Not recorded',
    };
    return labels[this.complianceStatus] || this.complianceStatus;
  }

  get hasValidFssai(): boolean {
    const expiry = this.complianceRecord?.fssai?.expiresAt;
    return !!expiry && new Date(expiry).getTime() > Date.now();
  }

  get fssai(): any {
    return this.complianceRecord?.fssai || (this.outlet?.taxIdentity as any)?.fssai || null;
  }

  get daysToExpiry(): number | null {
    const expiry = this.fssai?.expiresAt;
    if (!expiry) {
      return null;
    }
    return Math.ceil((new Date(expiry).getTime() - Date.now()) / 86_400_000);
  }

  get serviceArea(): any {
    return this.outlet?.serviceArea || {};
  }

  get orderConfig(): any {
    return this.outlet?.orderConfig || {};
  }

  get paymentConfig(): any {
    return this.outlet?.paymentConfig || {};
  }

  get bank(): any {
    return this.paymentConfig?.bank || {};
  }

  get operatingHours(): any[] {
    const rows = this.outlet?.operatingHours || [];
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.map((day) => {
      const row = rows.find((entry: any) => Number(entry.day) === day);
      return {
        day,
        label: this.dayLabel(day),
        from: row?.from || '',
        to: row?.to || '',
        isClosed: row ? row.isClosed === true : true,
        configured: !!row,
      };
    });
  }

  get allowedTransitions(): string[] {
    return this.transitions[this.outlet?.status || ''] || [];
  }

  get pickupEnabled(): boolean {
    return this.orderConfig?.pickupEnabled === true;
  }

  get mapLink(): string {
    const coordinates = this.outlet?.location?.coordinates;
    if (!coordinates || coordinates.length < 2) {
      return '';
    }
    return `https://www.google.com/maps?q=${coordinates[1]},${coordinates[0]}`;
  }

  get maskedAccount(): string {
    const number = String(this.bank?.accountNumber || '');
    return number.length > 4 ? `•••• ${number.slice(-4)}` : number;
  }

  get statusLabel(): string {
    return this.statusLabels[this.outlet?.status || ''] || this.outlet?.status || '';
  }

  getDetail() {
    this.isLoaded = false;
    this.admin.getOutlet(this.outletIdValue).subscribe({
      next: (response) => {
        this.isLoaded = true;
        this.outlet = response?.outlet || null;
        this.compliance = response?.compliance || [];
      },
      error: (error) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  statusLabelFor(status: string): string {
    return this.statusLabels[status] || status;
  }

  dayLabel(day: number): string {
    const labels: Record<number, string> = {
      0: 'Sunday',
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday',
    };
    return labels[day] || '';
  }

  modelLabel(model: string): string {
    const labels: Record<string, string> = {
      direct: 'Direct',
      franchise: 'Franchise',
      commission_partner: 'Commission partner',
    };
    return labels[model] || model || '';
  }

  mediaHref(path: string): string {
    if (!path) {
      return '';
    }
    return /^https?:\/\//i.test(path) ? path : this.appApi.mediaUrl + path;
  }

  openStatusDialog(nextStatus: string) {
    if (!this.outlet) {
      return;
    }
    const ref = this.dialog.open(OutletStatusDialog, {
      data: {
        outletName: this.outlet.name,
        currentStatus: this.outlet.status,
        nextStatus,
        hasValidFssai: this.hasValidFssai,
      },
      width: '480px',
      autoFocus: false,
    });

    ref.afterClosed().subscribe((result) => {
      if (!result?.status) {
        return;
      }
      this.isPatching = true;
      this.admin.setOutletStatus(this.outletId, result.status, result.statusReason).subscribe({
        next: () => {
          this.isPatching = false;
          this.util.onSuccess('jhatka_outlet_status_updated');
          this.getDetail();
        },
        error: (error) => {
          this.isPatching = false;
          this.util.handleError(error, 'admin');
        },
      });
    });
  }

  togglePickup(enabled: boolean) {
    if (!this.outlet || this.isPatching) {
      return;
    }
    this.isPatching = true;
    this.admin.updateOutlet(this.outletId, { orderConfig: { pickupEnabled: enabled } }).subscribe({
      next: () => {
        this.isPatching = false;
        this.outlet = {
          ...this.outlet!,
          orderConfig: { ...(this.outlet?.orderConfig || {}), pickupEnabled: enabled },
        };
        this.util.onSuccess('jhatka_pickup_updated');
      },
      error: (error) => {
        this.isPatching = false;
        this.util.handleError(error, 'admin');
      },
    });
  }
}
