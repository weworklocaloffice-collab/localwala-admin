import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-ls-featured',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-ls-featured.html',
})
export class DialogLsFeatured implements OnInit {
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;
  providers: any[] = [];
  services: any[] = [];

  form = new FormGroup({
    provider: new FormControl(''),
    service: new FormControl(''),
    placement: new FormControl('search', [Validators.required]),
    from: new FormControl('', [Validators.required]),
    to: new FormControl('', [Validators.required]),
    price: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogLsFeatured>,
    public util: UtilService,
    public api: ApiService,
  ) {}

  ngOnInit() {
    this.api.get_private('v1/local-services/admin/providers?limit=200&page=1').subscribe({
      next: (response: any) => (this.providers = response?.results || []),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
    this.api.get_private('v1/local-services/admin/catalog/services?limit=200&page=1&status=active').subscribe({
      next: (response: any) => (this.services = response?.results || []),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  onConfirm() {
    this.haveSubmitClicked = true;
    if (this.form.invalid || this.isSubmit) return;
    const v: any = this.form.value;
    if (!v.provider && !v.service) {
      this.util.onError('Select a provider or service', '');
      return;
    }
    const from = new Date(v.from);
    const to = new Date(v.to);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
      this.util.onError('End time must be after start time', '');
      return;
    }
    this.isSubmit = true;
    this.api.post_private('v1/local-services/admin/featured', {
      provider: v.provider || null,
      service: v.service || null,
      placement: v.placement,
      from: from.toISOString(),
      to: to.toISOString(),
      price: Number(v.price),
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
