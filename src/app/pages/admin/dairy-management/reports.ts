import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dairy-reports',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './reports.html',
})
export class DairyReports {
  loading = false;
  exporting = false;
  from = this.dateDaysAgo(29);
  to = this.dateDaysAgo(0);
  sales: any = null;
  settlements: any = null;
  compliance: any = null;

  constructor(public api: ApiService, public util: UtilService) {}

  ngOnInit() { this.load(); }

  private dateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
  }

  load() {
    if (!this.from || !this.to || this.from > this.to) return;
    this.loading = true;
    const params = new HttpParams().set('from', new Date(`${this.from}T00:00:00.000Z`).toISOString())
      .set('to', new Date(`${this.to}T23:59:59.999Z`).toISOString());
    let completed = 0;
    const done = () => { completed++; if (completed === 3) this.loading = false; };
    this.api.get_private('v1/dairy/admin/reports/sales?' + params.toString()).subscribe({
      next: (response: any) => { this.sales = response?.report ?? null; done(); },
      error: (error: any) => { done(); this.util.handleError(error, 'admin'); },
    });
    this.api.get_private('v1/dairy/admin/reports/settlements?' + params.toString()).subscribe({
      next: (response: any) => { this.settlements = response?.report ?? null; done(); },
      error: (error: any) => { done(); this.util.handleError(error, 'admin'); },
    });
    this.api.get_private('v1/dairy/admin/reports/compliance').subscribe({
      next: (response: any) => { this.compliance = response?.report ?? null; done(); },
      error: (error: any) => { done(); this.util.handleError(error, 'admin'); },
    });
  }

  exportSales() {
    if (!this.from || !this.to || this.from > this.to) return;
    this.exporting = true;
    const params = new HttpParams().set('from', new Date(`${this.from}T00:00:00.000Z`).toISOString())
      .set('to', new Date(`${this.to}T23:59:59.999Z`).toISOString());
    this.api.export_collection('v1/dairy/admin/reports/sales/export?' + params.toString()).subscribe({
      next: (blob: Blob) => {
        this.exporting = false;
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `dairy-sales-${this.from}-${this.to}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      error: (error: any) => { this.exporting = false; this.util.handleError(error, 'admin'); },
    });
  }
}
