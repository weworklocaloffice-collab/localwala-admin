import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-ls-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './ls-settings.html',
})
export class LsSettings {
  isLoaded = false;
  hasError = false;
  settings: any[] = [];
  editing: any = null;
  editValue: any = '';

  constructor(public api: ApiService, public util: UtilService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoaded = false;
    this.hasError = false;
    this.api.get_private('v1/local-services/admin/settings').subscribe({
      next: (res: any) => {
        this.settings = res.settings || [];
        this.isLoaded = true;
      },
      error: (err: any) => {
        this.isLoaded = true;
        this.hasError = true;
        this.util.handleError(err, 'admin');
      },
    });
  }

  startEdit(s: any) {
    this.editing = s;
    this.editValue = s.value;
  }

  cancelEdit() {
    this.editing = null;
  }

  saveEdit() {
    if (!this.editing) return;
    this.api.patch_private('v1/local-services/admin/settings', { key: this.editing.key, value: this.editValue }).subscribe({
      next: () => {
        this.util.onSuccess('ts_settings_saved');
        this.editing = null;
        this.load();
      },
      error: (err: any) => this.util.handleError(err, 'admin'),
    });
  }
}
