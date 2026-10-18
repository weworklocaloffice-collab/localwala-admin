import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Delivery-coverage dialog (Batch B-3): the Settings screen's
 * show-inherited / override / reset UI for one restaurant.
 *
 * Every row shows the EFFECTIVE value alongside its SOURCE
 * (platform | city | restaurant | inherit), so ops sees where each number
 * comes from before overriding or resetting it:
 *
 *   Effective: 6 km   [City default · Hyderabad]
 *   Override:  ( ) Use default   (•) Custom  [ 8 ] km   [Save] [Reset]
 *
 * Narrowing is free; the backend caps and city-guards every write, so a
 * panel bug can never store a wild radius or a cross-city tick-list.
 */
@Component({
  selector: 'app-dialog-delivery-coverage',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-delivery-coverage.html',
})
export class DialogDeliveryCoverage implements OnInit {
  policy: any = null;
  loading: boolean = true;
  saving: boolean = false;
  error: string = '';

  cityLocalities: any[] = [];

  useCustomRadius: boolean = false;
  radiusOverride: number | null = null;

  useCustomLocalities: boolean = false;
  selectedLocalities: string[] = [];
  localityCtrl = new FormControl('');

  constructor(
    public util: UtilService,
    public api: ApiService,
    public dialogRef: MatDialogRef<DialogDeliveryCoverage>,
    @Inject(MAT_DIALOG_DATA) public data: { restaurantId: string; master?: string }
  ) {}

  ngOnInit(): void {
    this.load();
  }

  /** City-masters talk to cityzen routes scoped by :master (D-1); the
   * backend 403s anything outside their city. Admins use admin routes. */
  private get isCityzen(): boolean {
    return !!this.data.master;
  }

  private policyUrl(): string {
    return this.isCityzen
      ? 'v1/cityzen/restaurant_delivery_config/' + this.data.restaurantId + '/' + this.data.master
      : 'v1/admin/restaurant/delivery-config/' + this.data.restaurantId;
  }

  private saveUrl(): string {
    return this.isCityzen
      ? 'v1/cityzen/update_restaurant_delivery_config/' + this.data.restaurantId + '/' + this.data.master
      : 'v1/admin/restaurant/delivery-config/' + this.data.restaurantId;
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.get_private(this.policyUrl()).subscribe({
      next: (res: any) => {
        this.policy = res && res.policy ? res.policy : null;
        if (this.policy) {
          this.useCustomRadius = this.policy.sources && this.policy.sources.radius === 'restaurant';
          this.radiusOverride = this.policy.radiusMeters;
          this.useCustomLocalities =
            this.policy.sources && this.policy.sources.localities === 'restaurant';
          this.selectedLocalities = [...(this.policy.localities || [])];
          this.loadCityLocalities();
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = (err && err.error && err.error.message) || 'Could not load coverage';
        this.loading = false;
      },
    });
  }

  loadCityLocalities(): void {
    const cityId = this.policy && this.policy.cityId;
    if (!cityId) return;
    const url = this.isCityzen
      ? 'v1/cityzen/localities_from_city/' + cityId
      : 'v1/admin/localities/getByCityId/' + cityId;
    this.api.get_private(url).subscribe({
      next: (res: any) => {
        const list = res && (res.localities || res.data || res);
        this.cityLocalities = Array.isArray(list) ? list : [];
      },
      error: () => {
        this.cityLocalities = [];
      },
    });
  }

  localityName(id: string): string {
    const found = (this.cityLocalities || []).find(
      (l: any) => String(l._id || l.id) === String(id)
    );
    return found ? found.name : id;
  }

  servedNames(): string[] {
    return (this.policy && this.policy.localities ? this.policy.localities : []).map((id: string) =>
      this.localityName(id)
    );
  }

  sourceLabel(source: string): string {
    if (source === 'restaurant') return 'Restaurant override';
    if (source === 'city') return 'City default';
    if (source === 'platform') return 'Platform default';
    return 'Inherited';
  }

  save(): void {
    this.saving = true;
    this.error = '';
    const patch: any = {};
    const clearKeys: string[] = [];
    if (this.useCustomRadius && this.radiusOverride !== null && this.radiusOverride !== undefined) {
      patch.deliveryRadiusMeters = Math.floor(Number(this.radiusOverride));
    } else {
      clearKeys.push('deliveryRadiusMeters');
    }
    if (this.useCustomLocalities) {
      patch.localities = [...this.selectedLocalities];
    } else {
      clearKeys.push('localities');
    }
    if (clearKeys.length) patch.clearKeys = clearKeys;
    this.api.patch_private(this.saveUrl(), patch).subscribe({
        next: () => {
          this.saving = false;
          this.load();
        },
        error: (err: any) => {
          this.error = (err && err.error && err.error.message) || 'Could not save coverage';
          this.saving = false;
        },
      });
  }

  close(): void {
    this.dialogRef.close(true);
  }
}
