import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-jhatka-supplier-detail',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './supplier-detail.html',
})
export class JhatkaSupplierDetail {
  isLoaded: boolean = false;
  supplier: any = null;
  documents: any[] = [];
  compliant: boolean | null = null;
  statuses: string[] = ['pending', 'valid', 'expiring', 'expired', 'rejected'];

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

  supplierId(): string {
    return this.supplier?.id || this.supplier?._id || '';
  }

  getDetail(id: string) {
    this.isLoaded = false;
    this.api.get_private(`v1/jhatka/admin/suppliers/${id}`).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        this.supplier = response?.supplier || null;
        this.documents = response?.documents || [];
        this.compliant = response?.compliant ?? null;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  setDocumentStatus(element: any, status: string) {
    let body: any = { status };
    if (status === 'rejected') {
      const reason = window.prompt('Rejection reason (required — the supplier must be told why):');
      if (!reason) {
        return;
      }
      body.rejectedReason = reason;
    }
    this.api.patch_private(
      `v1/jhatka/admin/suppliers/${this.supplierId()}/documents/${element.id || element._id}`,
      body
    ).subscribe({
      next: () => this.getDetail(this.supplierId()),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
