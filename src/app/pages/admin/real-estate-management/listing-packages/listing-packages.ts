import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogListingPackage } from '../dialog-listing-package/dialog-listing-package';

/**
 * Listing packages — admin catalogue.
 *
 * Packages are seeded, and the admin owns the catalogue from here:
 * create, edit in place (`code` + `price` immutable — sold orders keep
 * their `packageSnapshot`, BR-15) and highlight one package. Retiring
 * (`status: false`) stops new sales; existing entitlements keep running.
 */
@Component({
  selector: 'app-real-estate-listing-packages',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './listing-packages.html',
})
export class ListingPackages {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  displayedColumn: string[] = ['code', 'name', 'price', 'listings', 'duration', 'status', 'action'];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

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
    let httpParams = new HttpParams()
      .set('limit', this.pageSize)
      .set('page', this.currentPage + 1);
    if (this.selectedStatus) {
      httpParams = httpParams.set('status', this.selectedStatus);
    }
    this.api.get_private('v1/realestate/admin/listing-packages?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        const data = (response && response.data) || response;
        this.list = Array.isArray(data) ? data : (data && data.results) || [];
        if (this.paginator && response && response.totalResults !== undefined) {
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onFilter() {
    this.currentPage = 0;
    this.getList();
  }

  formatPrice(rupees: number): string {
    // Backend ships hydrated rupees (moneyField getter), not paise.
    if (rupees === null || rupees === undefined) return '—';
    return '₹' + Number(rupees).toLocaleString('en-IN');
  }

  onCreate() {
    this.dialog
      .open(DialogListingPackage, { disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'created') {
          this.util.onSuccess('ts_created');
          this.getList();
        }
      });
  }

  onEdit(row: any) {
    this.dialog
      .open(DialogListingPackage, { disableClose: true, data: row })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'created') {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        }
      });
  }

  onRecommend(row: any) {
    this.api.post_private(`v1/realestate/admin/listing-packages/${row.code}/recommend`, {}).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.getList();
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }
}
