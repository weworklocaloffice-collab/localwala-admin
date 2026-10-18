import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-canned-responses',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './canned-responses.html',
})
export class CannedResponses {
  replies: any[] = [];
  isLoaded = false;
  editingId: string | null = null;
  formTitle = '';
  formBody = '';
  formLocale = 'en';
  formAudience = 'agent';
  saving = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    this.api.get_private('v1/support_team/canned?all=1').subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        this.replies = (response && response.canned) || [];
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'support-team');
      },
    });
  }

  startCreate() {
    this.editingId = 'new';
    this.formTitle = '';
    this.formBody = '';
    this.formLocale = 'en';
    this.formAudience = 'agent';
  }

  startEdit(item: any) {
    this.editingId = item.id || item._id;
    this.formTitle = item.title;
    this.formBody = item.body;
    this.formLocale = item.locale || 'en';
    this.formAudience = item.audience || 'agent';
  }

  cancel() {
    this.editingId = null;
  }

  save() {
    if (!this.formTitle.trim() || !this.formBody.trim() || this.saving) return;
    this.saving = true;
    if (this.editingId === 'new') {
      this.api
        .post_private('v1/support_team/canned', {
          title: this.formTitle.trim(),
          body: this.formBody.trim(),
          locale: this.formLocale,
          audience: this.formAudience,
        })
        .subscribe({
          next: () => {
            this.saving = false;
            this.editingId = null;
            this.getList();
          },
          error: (error: any) => {
            this.saving = false;
            this.util.handleError(error, 'support-team');
          },
        });
    } else {
      this.api
        .patch_private(`v1/support_team/canned/${this.editingId}`, {
          title: this.formTitle.trim(),
          body: this.formBody.trim(),
          audience: this.formAudience,
        })
        .subscribe({
          next: () => {
            this.saving = false;
            this.editingId = null;
            this.getList();
          },
          error: (error: any) => {
            this.saving = false;
            this.util.handleError(error, 'support-team');
          },
        });
    }
  }

  toggleActive(item: any) {
    const id = item.id || item._id;
    this.api.patch_private(`v1/support_team/canned/${id}`, { isActive: !item.isActive }).subscribe({
      next: () => this.getList(),
      error: (error: any) => this.util.handleError(error, 'support-team'),
    });
  }

  approve(item: any) {
    const id = item.id || item._id;
    this.api.patch_private(`v1/support_team/canned/${id}`, { isActive: true }).subscribe({
      next: () => this.getList(),
      error: (error: any) => this.util.handleError(error, 'support-team'),
    });
  }
}
