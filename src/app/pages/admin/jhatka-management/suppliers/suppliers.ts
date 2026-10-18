import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-jhatka-suppliers',
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  templateUrl: './suppliers.html',
})
export class JhatkaSuppliers {
  isLoaded: boolean = false;
  list: any[] = [];
  expiring: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  search: string = '';
  newSupplier: any = { name: '', code: '' };
  displayedColumn: string[] = ['supplier', 'status', 'action'];
  newDoc: any = { supplier: '', type: 'fssai', reference: '', issuedAt: '', expiresAt: '', fileUrl: '' };
  documentTypes: string[] = ['fssai', 'gst_registration', 'trade_licence', 'msme', 'lab_report', 'insurance', 'other'];
  uploadingDoc: boolean = false;

  @ViewChild('paginator', { read: MatPaginator, static: false })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {
    this.getList();
    this.getExpiring();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      limit: this.pageSize,
      page: this.currentPage + 1,
      search: this.search,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) {
        return;
      }
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/jhatka/admin/suppliers?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        if (response && response.suppliers) {
          this.list = response.suppliers;
          if (this.paginator) {
            this.paginator.length = response.total ?? this.list.length;
          }
        }
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  getExpiring() {
    this.api.get_private('v1/jhatka/admin/suppliers/expiring-documents').subscribe({
      next: (response: any) => {
        this.expiring = response?.documents || response?.expiring || [];
      },
      error: () => {},
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onSearch() {
    this.currentPage = 0;
    this.getList();
  }

  createSupplier() {
    if (!this.newSupplier.name || !this.newSupplier.code) {
      return;
    }
    this.api.post_private('v1/jhatka/admin/suppliers', this.newSupplier).subscribe({
      next: () => {
        this.newSupplier = { name: '', code: '' };
        this.getList();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  setStatus(element: any, status: string) {
    this.api.patch_private(`v1/jhatka/admin/suppliers/${element.id}`, { status }).subscribe({
      next: () => this.getList(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  onDocFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }
    this.uploadingDoc = true;
    this.api.uploadFile(file).subscribe({
      next: (response: any) => {
        this.uploadingDoc = false;
        // Shared uploader responds `{ path }`; that path is what the document stores.
        this.newDoc.fileUrl = response?.path || response?.fileUrl || '';
      },
      error: (error: any) => {
        this.uploadingDoc = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  addDocument() {
    if (!this.newDoc.supplier || !this.newDoc.type) {
      return;
    }
    const body: any = {
      type: this.newDoc.type,
      reference: this.newDoc.reference || undefined,
      issuedAt: this.newDoc.issuedAt || undefined,
      expiresAt: this.newDoc.expiresAt || undefined,
      fileUrl: this.newDoc.fileUrl || undefined,
    };
    this.api.post_private(`v1/jhatka/admin/suppliers/${this.newDoc.supplier}/documents`, body).subscribe({
      next: () => {
        this.newDoc = { supplier: '', type: 'fssai', reference: '', issuedAt: '', expiresAt: '', fileUrl: '' };
        this.getExpiring();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  verifyDocument(element: any, status: 'verified' | 'rejected') {
    const supplierId = element.supplier?._id || element.supplier?.id || element.supplier;
    const docId = element._id || element.id;
    let rejectedReason: string | undefined;
    if (status === 'rejected') {
      const reason = window.prompt(`Why is this ${element.type} document rejected? (required)`);
      if (!reason || !reason.trim()) {
        return;
      }
      rejectedReason = reason.trim();
    }
    const body: any = { status };
    if (rejectedReason) {
      body.rejectedReason = rejectedReason;
    }
    this.api.patch_private(
      `v1/jhatka/admin/suppliers/${supplierId}/documents/${docId}`,
      body
    ).subscribe({
      next: () => this.getExpiring(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  renewDocument(element: any) {
    const supplierId = element.supplier?._id || element.supplier?.id || element.supplier;
    const docId = element._id || element.id;
    const expiresAt = window.prompt('New expiry (YYYY-MM-DD):', '');
    if (!expiresAt || !expiresAt.trim()) {
      return;
    }
    this.api.patch_private(
      `v1/jhatka/admin/suppliers/${supplierId}/documents/${docId}`,
      { expiresAt: expiresAt.trim(), status: 'verified' }
    ).subscribe({
      next: () => this.getExpiring(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
