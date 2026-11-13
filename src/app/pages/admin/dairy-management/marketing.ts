import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dairy-marketing',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './marketing.html',
})
export class DairyMarketing {
  loadingPackages = true;
  loadingCampaigns = true;
  loadingCoupons = true;
  savingPackage = false;
  reviewingId: string | null = null;
  packages: any[] = [];
  campaigns: any[] = [];
  coupons: any[] = [];
  page = 1;
  limit = 20;
  totalResults = 0;
  status = 'pending_review';
  couponStatus = 'pending_review';
  readonly placements = [
    { value: 'dairy_home_banner', label: 'Dairy home banner' },
    { value: 'featured_partner', label: 'Featured Dairy partner' },
    { value: 'featured_product', label: 'Featured Dairy product' },
  ];
  readonly durations = [1, 3, 6, 12, 24, 168, 720];
  packageForm = {
    name: '', code: '', placement: 'dairy_home_banner', targetingLevel: 'locality',
    durationHours: 24, price: 0, maxConcurrent: 1, status: true,
  };
  reviewNotes: Record<string, string> = {};
  couponReviewNotes: Record<string, string> = {};

  constructor(public api: ApiService, public util: UtilService) {}

  ngOnInit() { this.loadPackages(); this.loadCampaigns(); this.loadCoupons(); }

  loadPackages() {
    this.loadingPackages = true;
    this.api.get_private('v1/dairy/admin/marketing/packages?limit=100').subscribe({
      next: (response: any) => { this.packages = response?.packages ?? []; this.loadingPackages = false; },
      error: (error: any) => { this.loadingPackages = false; this.util.handleError(error, 'admin'); },
    });
  }

  loadCampaigns() {
    this.loadingCampaigns = true;
    const params = new HttpParams().set('page', this.page).set('limit', this.limit).set('status', this.status);
    this.api.get_private('v1/dairy/admin/marketing/campaigns?' + params.toString()).subscribe({
      next: (response: any) => {
        this.campaigns = response?.campaigns ?? [];
        this.totalResults = Number(response?.totalResults ?? 0);
        this.loadingCampaigns = false;
      },
      error: (error: any) => { this.loadingCampaigns = false; this.util.handleError(error, 'admin'); },
    });
  }

  loadCoupons() {
    this.loadingCoupons = true;
    const params = new HttpParams().set('page', 1).set('limit', 100).set('status', this.couponStatus);
    this.api.get_private('v1/dairy/admin/marketing/coupons?' + params.toString()).subscribe({
      next: (response: any) => { this.coupons = response?.coupons ?? []; this.loadingCoupons = false; },
      error: (error: any) => { this.loadingCoupons = false; this.util.handleError(error, 'admin'); },
    });
  }

  reviewCoupon(coupon: any, decision: 'approve' | 'reject') {
    const note = (this.couponReviewNotes[coupon._id] ?? '').trim();
    if (decision === 'reject' && !note) return;
    this.reviewingId = coupon._id;
    this.api.patch_private('v1/dairy/admin/marketing/coupons/' + coupon._id + '/review', { decision, note }).subscribe({
      next: () => { this.reviewingId = null; this.loadCoupons(); },
      error: (error: any) => { this.reviewingId = null; this.util.handleError(error, 'admin'); },
    });
  }

  setCouponStatus(status: string) { this.couponStatus = status; this.loadCoupons(); }

  createPackage() {
    if (!this.packageForm.name.trim() || !this.packageForm.code.trim() || this.packageForm.price <= 0 || this.savingPackage) return;
    this.savingPackage = true;
    this.api.post_private('v1/dairy/admin/marketing/packages', {
      ...this.packageForm,
      name: this.packageForm.name.trim(),
      code: this.packageForm.code.trim().toUpperCase(),
      price: Number(this.packageForm.price),
      maxConcurrent: Number(this.packageForm.maxConcurrent),
      durationHours: Number(this.packageForm.durationHours),
    }).subscribe({
      next: () => {
        this.savingPackage = false;
        this.packageForm = { ...this.packageForm, name: '', code: '', price: 0 };
        this.loadPackages();
      },
      error: (error: any) => { this.savingPackage = false; this.util.handleError(error, 'admin'); },
    });
  }

  togglePackage(item: any) {
    const body = {
      name: item.name, code: item.code, placement: item.placement,
      targetingLevel: item.targetingLevel, durationHours: item.durationHours,
      price: item.price, maxConcurrent: item.maxConcurrent ?? 1, status: !item.status,
    };
    this.api.patch_private('v1/dairy/admin/marketing/packages/' + item._id, body).subscribe({
      next: () => this.loadPackages(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  review(campaign: any, decision: 'approve' | 'reject') {
    const note = (this.reviewNotes[campaign._id] ?? '').trim();
    if (decision === 'reject' && !note) return;
    this.reviewingId = campaign._id;
    this.api.patch_private('v1/dairy/admin/marketing/campaigns/' + campaign._id + '/review', { decision, note }).subscribe({
      next: () => { this.reviewingId = null; this.loadCampaigns(); },
      error: (error: any) => { this.reviewingId = null; this.util.handleError(error, 'admin'); },
    });
  }

  setStatus(status: string) { this.status = status; this.page = 1; this.loadCampaigns(); }
  previous() { if (this.page > 1) { this.page--; this.loadCampaigns(); } }
  next() { if (this.page * this.limit < this.totalResults) { this.page++; this.loadCampaigns(); } }
  localityNames(campaign: any): string {
    return (campaign?.targetLocalities ?? []).map((row: any) => row?.name ?? 'Locality').join(', ');
  }
}
