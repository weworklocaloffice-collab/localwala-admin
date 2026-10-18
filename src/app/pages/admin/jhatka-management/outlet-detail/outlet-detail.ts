import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-jhatka-outlet-detail',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './outlet-detail.html',
})
export class JhatkaOutletDetail {
  isLoaded: boolean = false;
  outlet: any = null;
  compliance: any[] = [];

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

  outletId(): string {
    return this.outlet?.id || this.outlet?._id || '';
  }

  getDetail(id: string) {
    this.isLoaded = false;
    this.api.get_private(`v1/jhatka/admin/outlets/${id}`).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        this.outlet = response?.outlet || null;
        this.compliance = response?.compliance || [];
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  setStatus(status: string) {
    const id = this.outletId();
    if (!id) {
      return;
    }
    const statusReason = status === 'active'
      ? undefined
      : window.prompt(`Reason for ${status} (recorded on the outlet):`) || undefined;
    if (status !== 'active' && statusReason === undefined) {
      return;
    }
    this.api.patch_private(`v1/jhatka/admin/outlets/${id}`, { status, statusReason }).subscribe({
      next: () => this.getDetail(id),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
