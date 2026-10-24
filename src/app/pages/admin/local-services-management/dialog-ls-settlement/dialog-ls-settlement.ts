import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-ls-settlement',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-ls-settlement.html',
})
export class DialogLsSettlement implements OnInit {
  isSubmit: boolean = false;
  providers: any[] = [];

  form = new FormGroup({
    providerId: new FormControl('', [Validators.required]),
    from: new FormControl(this.defaultFrom(), [Validators.required]),
    to: new FormControl(this.defaultTo(), [Validators.required]),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogLsSettlement>,
    public util: UtilService,
    public api: ApiService,
  ) {}

  ngOnInit() {
    this.api.get_private('v1/local-services/admin/providers?limit=200&page=1').subscribe({
      next: (response: any) => (this.providers = response?.results || []),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  defaultFrom(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return this.toInputValue(date);
  }

  defaultTo(): string {
    return this.toInputValue(new Date());
  }

  toInputValue(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  onConfirm() {
    if (this.form.invalid || this.isSubmit) return;
    const v: any = this.form.value;
    const from = new Date(v.from);
    const to = new Date(v.to);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
      this.util.onError('End time must be after start time', '');
      return;
    }
    this.isSubmit = true;
    this.api.post_private('v1/local-services/admin/revenue/settlements/generate', {
      providerId: v.providerId,
      from: from.toISOString(),
      to: to.toISOString(),
    }).subscribe({
      next: (response: any) => {
        this.isSubmit = false;
        this.dialogRef.close({ event: 'update', data: response });
      },
      error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onCancel() {
    this.dialogRef.close({ event: 'cancel' });
  }
}
