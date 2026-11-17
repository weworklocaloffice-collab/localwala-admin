import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-ls-provider-types',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './ls-provider-types.html',
})
export class LsProviderTypes {
  isLoaded: boolean = false;
  saving: boolean = false;
  editingId: string | null = null;
  list: any[] = [];
  displayedColumn: string[] = ['label', 'key', 'sortOrder', 'status', 'action'];
  form: any = { key: '', label: '', sortOrder: 100, active: true };

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    this.api.get_private('v1/local-services/admin/provider-types').subscribe({
      next: (response: any) => {
        this.list = response && response.results ? response.results : [];
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onCreate() {
    if (!this.form.label.trim()) return;
    if (!this.editingId && !this.form.key.trim()) return;
    this.saving = true;
    const payload: any = {
      label: this.form.label.trim(),
      sortOrder: Number(this.form.sortOrder) || 0,
      active: this.form.active,
    };
    const request = this.editingId
      ? this.api.patch_private('v1/local-services/admin/provider-types/' + this.editingId, payload)
      : this.api.post_private('v1/local-services/admin/provider-types', {
          ...payload,
          key: this.form.key.trim().toLowerCase(),
        });
    request.subscribe({
      next: () => {
        this.saving = false;
        this.util.onSuccess(this.editingId ? 'ts_status_updated' : 'ts_record_created');
        this.resetForm();
        this.getList();
      },
      error: (error: any) => {
        this.saving = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onEdit(row: any) {
    this.editingId = row._id;
    this.form = {
      key: row.key,
      label: row.label,
      sortOrder: row.sortOrder,
      active: row.active,
    };
  }

  resetForm() {
    this.editingId = null;
    this.form = { key: '', label: '', sortOrder: 100, active: true };
  }

  onToggle(row: any) {
    this.api
      .patch_private('v1/local-services/admin/provider-types/' + row._id, {
        active: !row.active,
      })
      .subscribe({
        next: () => {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        },
        error: (error: any) => this.util.handleError(error, 'admin'),
      });
  }
}
