import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogLsStatus } from '../dialog-ls-status/dialog-ls-status';

@Component({
  selector: 'app-ls-moderation',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './ls-moderation.html',
})
export class LsModeration {
  offeringsLoaded: boolean = false;
  documentsLoaded: boolean = false;
  offerings: any[] = [];
  documents: any[] = [];
  offeringPage: number = 0;
  documentPage: number = 0;
  pageSize: number = 10;
  offeringColumns: string[] = ['service', 'price', 'status', 'action'];
  documentColumns: string[] = ['kind', 'provider', 'status', 'action'];

  @ViewChild('offeringPaginator', { read: MatPaginator })
  offeringPaginator: MatPaginator;

  @ViewChild('documentPaginator', { read: MatPaginator })
  documentPaginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.getOfferings();
    this.getDocuments();
  }

  getOfferings() {
    this.offeringsLoaded = false;
    this.api
      .get_private(
        'v1/local-services/admin/providers/offerings?limit=' + this.pageSize + '&page=' + this.offeringPage + '&status=pending',
      )
      .subscribe({
        next: (response: any) => {
          if (response && response.results) {
            this.offerings = response.results;
            if (this.offeringPaginator) {
              this.offeringPaginator.length = response.totalResults;
              this.offeringPaginator.hidePageSize = response.totalResults <= 0 ? true : false;
            }
          }
          this.offeringsLoaded = true;
        },
        error: (error: any) => {
          this.offeringsLoaded = true;
          this.util.handleError(error, 'admin');
        },
      });
  }

  getDocuments() {
    this.documentsLoaded = false;
    this.api
      .get_private(
        'v1/local-services/admin/providers/documents?limit=' + this.pageSize + '&page=' + this.documentPage + '&status=pending',
      )
      .subscribe({
        next: (response: any) => {
          if (response && response.results) {
            this.documents = response.results;
            if (this.documentPaginator) {
              this.documentPaginator.length = response.totalResults;
              this.documentPaginator.hidePageSize = response.totalResults <= 0 ? true : false;
            }
          }
          this.documentsLoaded = true;
        },
        error: (error: any) => {
          this.documentsLoaded = true;
          this.util.handleError(error, 'admin');
        },
      });
  }

  onOfferingPage(event: any) {
    this.offeringPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getOfferings();
  }

  onDocumentPage(event: any) {
    this.documentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getDocuments();
  }

  onOfferingStatus(row: any, status: string) {
    this.dialog
      .open(DialogLsStatus, {
        data: { apiPath: 'v1/local-services/admin/providers/offerings/', row, status },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_status_updated');
          this.getOfferings();
        }
      });
  }

  onDocumentStatus(row: any, status: string) {
    this.dialog
      .open(DialogLsStatus, {
        data: { apiPath: 'v1/local-services/admin/providers/documents/', row, status },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_status_updated');
          this.getDocuments();
        }
      });
  }
}
