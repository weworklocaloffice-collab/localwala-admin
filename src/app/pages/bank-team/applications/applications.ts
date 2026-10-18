import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Bank applications — the bank's loan queue. SANCTIONED / REJECTED /
 * DISBURSED are set HERE and nowhere else (BR-10). Each button POSTs
 * to /applications/:id/status/:status; the backend re-verifies the
 * bank role via bankAuth.
 */
@Component({
  selector: 'app-bank-applications',
  imports: [CommonModule, MaterialModule],
  templateUrl: './applications.html',
})
export class Applications {
  isLoaded: boolean = false;
  list: any[] = [];
  displayedColumn: string[] = ['app', 'amount', 'status', 'action'];

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    this.api.get_private('v1/realestate/bank/applications').subscribe({
      next: (response: any) => {
        this.list = Array.isArray(response) ? response : [];
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  setStatus(row: any, status: string) {
    const body: any = {};
    if (status === 'SANCTIONED') body.sanctionedAmount = row.requestedAmount;
    if (status === 'DISBURSED') body.disbursedAmount = row.sanctionedAmount || row.requestedAmount;
    this.api.post_private(`v1/realestate/bank/applications/${row._id}/status/${status}`, body).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.getList();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
