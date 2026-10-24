import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MatDialog } from '@angular/material/dialog';
import { DialogOfferCreate } from '../dialog-offer-create/dialog-offer-create';

@Component({
  selector: 'app-bank-offers',
  imports: [CommonModule, FormsModule, MaterialModule, RouterModule],
  templateUrl: './offers.html',
})
export class Offers {
  isLoaded: boolean = false;
  list: any[] = [];
  displayedColumn: string[] = ['app', 'amount', 'rate', 'tenure', 'status'];

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    this.api.get_private('v1/realestate/bank/offers').subscribe({
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

  onCreate() {
    this.dialog
      .open(DialogOfferCreate, { disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'created') {
          this.util.onSuccess('ts_created');
          this.getList();
        }
      });
  }

  /**
   * The application id behind an offer. The API populates
   * `loanApplication`, so it may be an object or a bare id.
   */
  applicationId(offer: any): string {
    const app = offer?.loanApplication;
    if (!app) return '';
    if (typeof app === 'string') return app;
    return app._id || app.id || '';
  }
}
