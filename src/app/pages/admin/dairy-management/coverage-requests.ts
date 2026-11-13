import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dairy-coverage-requests',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './coverage-requests.html',
})
export class CoverageRequests {
  isLoaded = false;
  isReviewing = false;
  requests: any[] = [];
  selected: any = null;
  reviewNotes: Record<string, string> = {};
  reviewingLocalityId: string | null = null;
  page = 1;
  limit = 20;
  totalResults = 0;
  status = 'pending';

  constructor(public api: ApiService, public util: UtilService) {}

  ngOnInit() { this.load(); }

  load() {
    this.isLoaded = false;
    const params = new HttpParams().set('page', this.page).set('limit', this.limit).set('status', this.status);
    this.api.get_private('v1/dairy/admin/coverage/requests?' + params.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        this.requests = response?.requests ?? [];
        this.totalResults = Number(response?.totalResults ?? 0);
        if (this.selected) this.selected = this.requests.find((item) => item._id === this.selected._id) ?? null;
      },
      error: (error: any) => { this.isLoaded = true; this.util.handleError(error, 'admin'); },
    });
  }

  select(request: any) {
    this.selected = request;
    this.reviewNotes = {};
  }

  localityId(review: any): string {
    const locality = review?.locality;
    return typeof locality === 'object'
      ? String(locality?.id ?? locality?._id ?? '')
      : String(locality ?? '');
  }

  localityName(review: any): string {
    const locality = review?.locality;
    return typeof locality === 'object' ? String(locality?.name ?? 'Locality') : 'Locality';
  }

  canDecline(review: any): boolean {
    return !!(this.reviewNotes[this.localityId(review)] ?? '').trim();
  }

  review(review: any, decision: 'approved' | 'rejected') {
    const localityId = this.localityId(review);
    const note = (this.reviewNotes[localityId] ?? '').trim();
    if (!this.selected || !localityId || this.isReviewing || this.reviewingLocalityId ||
      (decision === 'rejected' && !note)) return;
    this.isReviewing = true;
    this.reviewingLocalityId = localityId;
    this.api.patch_private('v1/dairy/admin/coverage/requests/' + this.selected._id,
      { localityId, decision, note }).subscribe({
      next: () => {
        this.isReviewing = false;
        this.reviewingLocalityId = null;
        this.load();
      },
      error: (error: any) => {
        this.isReviewing = false;
        this.reviewingLocalityId = null;
        this.util.handleError(error, 'admin');
      },
    });
  }

  changeStatus(status: string) { this.status = status; this.page = 1; this.selected = null; this.load(); }
  previous() { if (this.page > 1) { this.page--; this.load(); } }
  next() { if (this.page * this.limit < this.totalResults) { this.page++; this.load(); } }
  localityNames(request: any): string {
    return (request?.requestedLocalities ?? []).map((item: any) => item.name).join(', ') || '—';
  }
}
