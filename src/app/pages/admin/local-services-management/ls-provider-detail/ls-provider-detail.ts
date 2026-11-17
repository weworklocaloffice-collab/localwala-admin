import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogLsStatus } from '../dialog-ls-status/dialog-ls-status';
import { LsStatusBadge } from '../ls-status-badge/ls-status-badge';

@Component({
  selector: 'app-ls-provider-detail',
  imports: [CommonModule, FormsModule, MaterialModule, LsStatusBadge],
  templateUrl: './ls-provider-detail.html',
})
export class LsProviderDetail {
  isLoaded: boolean = false;
  provider: any = null;
  providerId: string = '';
  documents: any[] = [];
  offerings: any[] = [];
  bookings: any[] = [];
  fundAccountId: string = '';
  savingFund: boolean = false;

  providerTransitions: any = {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['UNDER_REVIEW', 'DRAFT'],
    UNDER_REVIEW: ['APPROVED', 'REJECTED', 'SUBMITTED'],
    APPROVED: ['ACTIVE', 'SUSPENDED'],
    ACTIVE: ['SUSPENDED', 'INACTIVE'],
    SUSPENDED: ['ACTIVE', 'INACTIVE'],
    INACTIVE: ['ACTIVE'],
    REJECTED: ['DRAFT'],
    CLOSED: [],
  };

  constructor(
    public api: ApiService,
    public util: UtilService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.providerId = id;
      this.getDetail(id);
    }
  }

  get ownerName(): string {
    const owner = this.provider?.owner;
    if (!owner || typeof owner !== 'object') return '';
    return [owner.firstName, owner.lastName].filter(Boolean).join(' ');
  }

  get ownerEmail(): string {
    const owner = this.provider?.owner;
    return owner && typeof owner === 'object' ? owner.email || '' : '';
  }

  get ownerPhone(): string {
    const owner = this.provider?.owner;
    if (!owner || typeof owner !== 'object') return '';
    return [owner.countryCode, owner.mobile].filter(Boolean).join(' ');
  }

  nextStatuses(): string[] {
    return this.provider ? this.providerTransitions[this.provider.status] || [] : [];
  }

  statusColor(status: string): string {
    if (status === 'ACTIVE' || status === 'APPROVED') return 'text-success';
    if (status === 'REJECTED' || status === 'SUSPENDED' || status === 'INACTIVE' || status === 'CLOSED') return 'text-error';
    if (status === 'UNDER_REVIEW') return 'text-primary';
    return 'text-warning';
  }

  getDetail(id: string) {
    this.isLoaded = false;
    this.api.get_private('v1/local-services/admin/providers/' + id).subscribe({
      next: (response: any) => {
        this.provider = response.provider;
        this.fundAccountId = response.provider?.fundAccountId || '';
        this.getRelated(id);
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  saveFundAccount() {
    const providerId = this.provider?.id || this.provider?._id;
    if (!providerId) return;
    this.savingFund = true;
    this.api.patch_private('v1/local-services/admin/providers/' + providerId, { fundAccountId: this.fundAccountId }).subscribe({
      next: () => {
        this.savingFund = false;
        this.util.onSuccess('Fund account saved');
      },
      error: (error: any) => {
        this.savingFund = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  openStatusDialog(status: string) {
    const docCounts: any = { pending: 0, verified: 0, rejected: 0 };
    this.documents.forEach((doc) => {
      if (docCounts[doc.status] !== undefined) docCounts[doc.status] += 1;
    });
    const row = {
      ...this.provider,
      docCounts,
      offeringCount: this.offerings.length,
      bookingCount: this.bookings.length,
    };
    this.dialog
      .open(DialogLsStatus, {
        data: { apiPath: 'v1/local-services/admin/providers/', row, status },
        disableClose: true,
        width: '560px',
      })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_status_updated');
          this.getDetail(this.providerId);
        }
      });
  }

  docUrl(doc: any): string {
    if (!doc || !doc.fileUrl) return '';
    return String(doc.fileUrl).startsWith('http') ? doc.fileUrl : this.api.mediaUrl + doc.fileUrl;
  }

  verifyDocument(doc: any, status: string) {
    const docId = doc.id || doc._id;
    if (!docId) return;
    this.api.post_private('v1/local-services/admin/providers/documents/' + docId + '/' + status, {}).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.getDetail(this.providerId);
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }

  getRelated(id: string) {
    const params = new HttpParams().set('provider', id).set('limit', 20).set('page', 0);
    const qs = params.toString();
    let done = 0;
    const finish = () => {
      done += 1;
      if (done >= 3) this.isLoaded = true;
    };
    this.api.get_private('v1/local-services/admin/providers/documents?' + qs).subscribe({
      next: (r: any) => { this.documents = r.results || []; finish(); },
      error: () => finish(),
    });
    this.api.get_private('v1/local-services/admin/providers/offerings?' + qs).subscribe({
      next: (r: any) => { this.offerings = r.results || []; finish(); },
      error: () => finish(),
    });
    this.api.get_private('v1/local-services/admin/bookings?' + qs).subscribe({
      next: (r: any) => { this.bookings = r.results || []; finish(); },
      error: () => finish(),
    });
  }
}
