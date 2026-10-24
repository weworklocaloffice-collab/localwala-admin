import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Application-status dialog — the timeline of one loan application.
 *
 * ## Why this exists
 *
 * The loan application document keeps only its LATEST state. A loan
 * officer opening a file needs to answer "what happened to this
 * application, and who moved it" — the portal had no answer, because
 * the history was never recorded.
 *
 * The history is written by the loan service on every transition
 * (offer received, customer accepted, bank review, sanction, reject,
 * disburse) and read back from
 * `GET /v1/realestate/bank/applications/:id/status-history`.
 *
 * ## The document requests
 *
 * The same dialog shows what the bank asked the customer for and what
 * came back, because a status timeline without the paperwork state is
 * half the picture: an application sitting in UNDER_BANK_REVIEW may be
 * waiting on a salary slip the customer never sent.
 */
@Component({
  selector: 'app-dialog-application-status',
  imports: [CommonModule, MaterialModule],
  templateUrl: './dialog-application-status.html',
})
export class DialogApplicationStatus implements OnInit {
  isLoaded: boolean = false;
  history: any[] = [];
  documentRequests: any[] = [];
  applicationId: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialogRef: MatDialogRef<DialogApplicationStatus>,
    @Inject(MAT_DIALOG_DATA) public data: { applicationId: string },
  ) {
    this.applicationId = data?.applicationId || '';
  }

  ngOnInit() {
    this.load();
  }

  load() {
    if (!this.applicationId) {
      this.isLoaded = true;
      return;
    }
    this.api
      .get_private(`v1/realestate/bank/applications/${this.applicationId}/status-history`)
      .subscribe({
        next: (response: any) => {
          this.history = Array.isArray(response) ? response : response?.results || [];
          this.isLoaded = true;
        },
        error: () => {
          this.history = [];
          this.isLoaded = true;
        },
      });
    this.api
      .get_private(`v1/realestate/bank/applications/${this.applicationId}/document-requests`)
      .subscribe({
        next: (response: any) => {
          this.documentRequests = Array.isArray(response) ? response : response?.results || [];
        },
        error: () => {
          this.documentRequests = [];
        },
      });
  }

  onClose() {
    this.dialogRef.close();
  }

  /** The actor that moved the application, in the portal's words. */
  actorLabel(entry: any): string {
    const type = entry?.actorType || '';
    if (type === 'BANK') return this.util.appTranslate('bank_timeline_actor_bank');
    if (type === 'CUSTOMER') return this.util.appTranslate('bank_timeline_actor_customer');
    if (type === 'ADMIN') return this.util.appTranslate('bank_timeline_actor_admin');
    if (type === 'SYSTEM') return this.util.appTranslate('bank_timeline_actor_system');
    return type || '—';
  }

  statusClass(status: string): string {
    if (status === 'SANCTIONED' || status === 'DISBURSED') return 'ts-success';
    if (status === 'REJECTED' || status === 'WITHDRAWN') return 'ts-error';
    return 'ts-default';
  }
}
