import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-bank-documents',
  imports: [CommonModule, MaterialModule],
  templateUrl: './documents.html',
})
export class Documents {
  isLoaded: boolean = false;
  documents: any[] = [];
  displayedColumns: string[] = ['title', 'category', 'status', 'actions'];

  /**
   * Client mirror of `API/src/modules/realestate/middlewares/
   * realestate.document.access.js` for the bank actor: bank sees
   * BANK_VISIBLE + CUSTOMER_VISIBLE and may download. The server still
   * enforces this; the mirror only decides which buttons render.
   */
  documentAccess = {
    allowedClasses: (_actor: string) => ['BANK_VISIBLE', 'CUSTOMER_VISIBLE'],
    mayDownload: (_actor: string) => true,
  };

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.getList();
  }

  /**
   * The model carries `fileUrl` as a plain URL string, resolved server-side
   * only for authorised readers. No file, no download — a toast, not a 404.
   */
  downloadDocument(element: any) {
    if (element && element.fileUrl) {
      window.open(element.fileUrl, '_blank', 'noopener');
    } else {
      this.util.onError('ts_file_not_available', '');
    }
  }

  getList() {
    this.isLoaded = false;
    this.api.get_private('v1/realestate/bank/documents').subscribe({
      next: (response: any) => {
        this.documents = Array.isArray(response) ? response : [];
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }
}