import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Delivery-zones dialog (Batch G-1): review, propose/publish and move
 * localities between zones for one city — no map drawing, because zones are
 * named locality groups, not shapes.
 *
 * Three tabs: Zones (current set + live per-zone numbers), Propose (system
 * suggestion → rename → publish with a reason), Move (one locality across
 * zones with a reason). City-masters pass `master` and talk to cityzen
 * routes scoped to their city (403 otherwise); admins omit it.
 */
@Component({
  selector: 'app-dialog-delivery-zones',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-delivery-zones.html',
})
export class DialogDeliveryZones implements OnInit {
  cityId: string = '';
  cityName: string = '';
  loading: boolean = true;
  saving: boolean = false;
  error: string = '';

  zones: any[] = [];
  metricsByZone: any = {};
  proposal: any[] = [];
  proposing: boolean = false;
  publishReason: string = '';

  moveLocalityId: string = '';
  moveToZoneId: string = '';
  moveReason: string = '';
  allLocalities: any[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    public dialogRef: MatDialogRef<DialogDeliveryZones>,
    @Inject(MAT_DIALOG_DATA) public data: { cityId?: string; cityName?: string; master?: string }
  ) {}

  ngOnInit(): void {
    if (this.data.cityId) {
      this.cityId = this.data.cityId;
      this.cityName = this.data.cityName || '';
      this.load();
    } else if (this.data.master) {
      this.api.get_private('v1/cityzen/delivery_zones/' + this.data.master + '/my_city').subscribe({
        next: (res: any) => {
          this.cityId = res && res.city ? res.city.id : '';
          this.cityName = res && res.city ? res.city.name : '';
          if (this.cityId) this.load();
          else {
            this.error = 'Could not resolve city';
            this.loading = false;
          }
        },
        error: (err: any) => {
          this.error = (err && err.error && err.error.message) || 'Could not resolve city';
          this.loading = false;
        },
      });
    } else {
      this.error = 'No city selected';
      this.loading = false;
    }
  }

  private get isCityzen(): boolean {
    return !!this.data.master;
  }

  private get masterSuffix(): string {
    return this.isCityzen ? '/' + this.data.master : '';
  }

  private zonesBase(): string {
    // Admin: v1/admin/delivery-zones/...  Cityzen: v1/cityzen/delivery_zones/:master/...
    return this.isCityzen
      ? 'v1/cityzen/delivery_zones/' + this.data.master
      : 'v1/admin/delivery-zones';
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.get_private(this.zonesBase() + '/by_city/' + this.cityId).subscribe({
      next: (res: any) => {
        this.zones = (res && res.zones) || [];
        this.allLocalities = [];
        for (const z of this.zones) {
          for (const loc of z.localities || []) {
            this.allLocalities.push({ id: loc._id || loc.id || loc, name: loc.name || loc._id || loc });
          }
        }
        this.loadMetrics();
      },
      error: (err: any) => {
        this.error = (err && err.error && err.error.message) || 'Could not load zones';
        this.loading = false;
      },
    });
  }

  loadMetrics(): void {
    const url = this.isCityzen
      ? 'v1/cityzen/delivery_zones/' + this.data.master + '/metrics/' + this.cityId
      : 'v1/admin/delivery-zones/metrics/' + this.cityId;
    this.api.get_private(url).subscribe({
      next: (res: any) => {
        const rows = (res && res.metrics && res.metrics.zones) || [];
        this.metricsByZone = {};
        for (const row of rows) {
          if (row && row.zone) this.metricsByZone[String(row.zone)] = row;
        }
        this.loading = false;
      },
      error: () => {
        this.metricsByZone = {};
        this.loading = false;
      },
    });
  }

  metricsFor(zoneId: string): any {
    return this.metricsByZone[String(zoneId)] || null;
  }

  propose(): void {
    this.proposing = true;
    this.error = '';
    this.api.get_private(this.zonesBase() + '/propose/' + this.cityId).subscribe({
      next: (res: any) => {
        this.proposal = (res && res.groups ? res.groups : []).map((g: any, i: number) => ({
          name: 'Zone ' + (i + 1),
          localities: (g.localities || []).map((l: any) => l.id),
          memberNames: (g.localities || []).map((l: any) => l.name),
          diameterKm: g.diameterKm,
        }));
        this.proposing = false;
      },
      error: (err: any) => {
        this.error = (err && err.error && err.error.message) || 'Could not propose zones';
        this.proposing = false;
      },
    });
  }

  publish(): void {
    this.saving = true;
    this.error = '';
    this.api
      .post_private(this.zonesBase() + '/publish/' + this.cityId, {
        groups: this.proposal.map((g: any) => ({ name: g.name, localities: g.localities })),
        reason: this.publishReason || null,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.proposal = [];
          this.publishReason = '';
          this.load();
        },
        error: (err: any) => {
          this.error = (err && err.error && err.error.message) || 'Could not publish zones';
          this.saving = false;
        },
      });
  }

  move(): void {
    if (!this.moveLocalityId || !this.moveToZoneId) return;
    this.saving = true;
    this.error = '';
    this.api
      .patch_private(this.zonesBase() + '/move/' + this.moveLocalityId, {
        toZoneId: this.moveToZoneId,
        reason: this.moveReason || null,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.moveLocalityId = '';
          this.moveToZoneId = '';
          this.moveReason = '';
          this.load();
        },
        error: (err: any) => {
          this.error = (err && err.error && err.error.message) || 'Could not move locality';
          this.saving = false;
        },
      });
  }

  close(): void {
    this.dialogRef.close(true);
  }
}
