import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogLsMarketingPackage } from '../dialog-ls-marketing-package/dialog-ls-marketing-package';

@Component({
  selector: 'app-marketing-packages',
  imports: [CommonModule, MaterialModule],
  templateUrl: './marketing-packages.html',
})
export class MarketingPackages {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  displayedColumn: string[] = ['package', 'placement', 'targeting', 'duration', 'price', 'status', 'action'];

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
    const httpParams = new HttpParams()
      .set('limit', this.pageSize)
      .set('page', this.currentPage + 1);
    this.api.get_private('v1/local-services/admin/marketing/packages?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.list = response?.packages || [];
        this.paginator.length = response?.totalResults || 0;
        this.paginator.hidePageSize = !response?.totalResults;
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

  onCreate() {
    this.dialog
      .open(DialogLsMarketingPackage, { disableClose: true, width: '480px' })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_record_created');
          this.getList();
        }
      });
  }

  onEdit(row: any) {
    this.dialog
      .open(DialogLsMarketingPackage, { data: { row }, disableClose: true, width: '480px' })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        }
      });
  }

  onToggleStatus(row: any) {
    this.api.patch_private('v1/local-services/admin/marketing/packages/' + row._id, { status: !row.status }).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.getList();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
