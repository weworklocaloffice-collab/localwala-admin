import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-ls-mapping',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './ls-mapping.html',
})
export class LsMapping {
  isLoading: boolean = false;
  chain: any[] = [];
  effective: any = null;
  preview: any = null;

  form = new FormGroup({
    categoryKey: new FormControl('home'),
    serviceKey: new FormControl(''),
    labourAmount: new FormControl(400),
    partsAmount: new FormControl(250),
  });

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  check() {
    const v: any = this.form.value;
    this.isLoading = true;
    this.chain = [];
    this.effective = null;
    this.preview = null;
    let httpParams = new HttpParams();
    if (v.categoryKey) httpParams = httpParams.set('categoryKey', v.categoryKey);
    if (v.serviceKey) httpParams = httpParams.set('serviceKey', v.serviceKey);
    this.api.get_private('v1/local-services/admin/revenue/mapping?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.chain = response.chain || [];
        this.effective = response.effective || null;
        this.runPreview(v);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  runPreview(v: any) {
    this.api.post_private('v1/local-services/admin/revenue/preview', {
      categoryKey: v.categoryKey || null,
      serviceKey: v.serviceKey || null,
      labourAmount: Number(v.labourAmount) || 0,
      partsAmount: Number(v.partsAmount) || 0,
    }).subscribe({
      next: (response: any) => {
        this.preview = response;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        this.util.handleError(error, 'admin');
      },
    });
  }
}
