import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-jhatka-settlement-detail',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './settlement-detail.html',
})
export class JhatkaSettlementDetail {
  isLoaded: boolean = false;
  settlement: any = null;
  recomputed: any = null;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private route: ActivatedRoute,
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.getDetail(id);
    }
  }

  getDetail(id: string) {
    this.isLoaded = false;
    this.api.get_private(`v1/jhatka/admin/settlements/${id}`).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        this.settlement = response?.settlement || null;
        this.recomputed = response?.recomputed || null;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  finalise() {
    const id = this.settlement?.id || this.settlement?._id;
    if (!id) {
      return;
    }
    this.api.post_private(`v1/jhatka/admin/settlements/${id}/finalise`, {}).subscribe({
      next: () => this.getDetail(id),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  dispute() {
    const id = this.settlement?.id || this.settlement?._id;
    if (!id) {
      return;
    }
    const reason = window.prompt('Dispute reason (at least 10 characters):');
    if (!reason) {
      return;
    }
    this.api.post_private(`v1/jhatka/admin/settlements/${id}/dispute`, { disputeReason: reason }).subscribe({
      next: () => this.getDetail(id),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
