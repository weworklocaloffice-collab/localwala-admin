import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogSanction } from '../dialog-sanction/dialog-sanction';
import { DialogReject } from '../dialog-reject/dialog-reject';
import { DialogDisburse } from '../dialog-disburse/dialog-disburse';

const STATUSES = ['UNDER_BANK_REVIEW', 'SANCTIONED', 'REJECTED', 'DISBURSED', 'WITHDRAWN'];

/**
 * Application detail — the screen where SANCTIONED / REJECTED /
 * DISBURSED are set (BR-10). The bank is the only actor allowed to
 * set those; the rights strings live ONLY in the `bank` role array.
 *
 * Shows: lead / customer / property / requested amount / timeline /
 * actions. No bank id in any URL — the backend reads it from the token.
 */
@Component({
  selector: 'app-bank-application-detail',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './application-detail.html',
})
export class ApplicationDetail implements OnInit, OnDestroy {
  isLoaded: boolean = false;
  app: any = null;
  offerList: any[] = [];
  id: string = '';
  sub: any = null;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  load() {
    this.isLoaded = false;
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.id = id;
    this.sub = this.api.get_private(`v1/realestate/bank/applications/${id}`).subscribe({
      next: (response: any) => {
        this.app = response;
        this.isLoaded = true;
        this.loadOffers();
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  loadOffers() {
    this.api.get_private('v1/realestate/bank/offers').subscribe({
      next: (response: any) => {
        const all = Array.isArray(response) ? response : [];
        this.offerList = all.filter((o: any) => String(o.loanApplication) === String(this.id));
      },
      error: () => {},
    });
  }

  setStatus(status: string) {
    if (status === 'SANCTIONED') {
      this.dialog
        .open(DialogSanction, { data: { requestedAmount: this.app.requestedAmount }, disableClose: true })
        .afterClosed()
        .subscribe((result: any) => {
          if (result && result.event === 'confirmed') {
            this.postStatus('SANCTIONED', { sanctionedAmount: result.sanctionedAmount });
          }
        });
      return;
    }
    if (status === 'REJECTED') {
      this.dialog
        .open(DialogReject, { disableClose: true })
        .afterClosed()
        .subscribe((result: any) => {
          if (result && result.event === 'confirmed') {
            this.postStatus('REJECTED', { rejectionReason: result.rejectionReason });
          }
        });
      return;
    }
    if (status === 'DISBURSED') {
      this.dialog
        .open(DialogDisburse, {
          data: { sanctionedAmount: this.app.sanctionedAmount || this.app.requestedAmount },
          disableClose: true,
        })
        .afterClosed()
        .subscribe((result: any) => {
          if (result && result.event === 'confirmed') {
            this.postStatus('DISBURSED', { disbursedAmount: result.disbursedAmount });
          }
        });
      return;
    }
  }

  postStatus(status: string, body: any) {
    this.api.post_private(`v1/realestate/bank/applications/${this.id}/status/${status}`, body).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.load();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
