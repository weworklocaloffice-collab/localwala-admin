import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Admin — executive management (plan §10.2 rows 14, 15).
 *
 * The admin sees the executive pool, can flip `available` to put an
 * exec on the bench, and can mark an exec SUSPENDED/TERMINATED with
 * a reason. The "Show only available" filter is the load-bearing one
 * for assignment-engine debugging.
 */
@Component({
  selector: 'app-real-estate-admins-executives',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './executives.html',
})
export class Executives {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  availableFilter: string = '';
  statusFilter: string = '';
  displayedColumn: string[] = ['name', 'city', 'status', 'available', 'lastAssigned', 'action'];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    let httpParams = new HttpParams().set('limit', 200);
    if (this.availableFilter) {
      httpParams = httpParams.set('available', this.availableFilter);
    }
    if (this.statusFilter) {
      httpParams = httpParams.set('status', this.statusFilter);
    }
    this.api.get_private('v1/realestate/admin/executives?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        const data = (response && response.results) || response || [];
        this.list = Array.isArray(data) ? data : [];
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onFilter() {
    this.getList();
  }

  onToggleAvailable(row: any) {
    if (!this.util.hasRight('realestate.admin_executive_manage')) return;
    this.api
      .patch_private(`v1/realestate/admin/executives/${row._id}/availability`, { available: !row.available })
      .subscribe({
        next: () => {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        },
        error: (error: any) => this.util.handleError(error, 'admin'),
      });
  }

  onSuspend(row: any) {
    if (!this.util.hasRight('realestate.admin_executive_manage')) return;
    this.api
      .patch_private(`v1/realestate/admin/executives/${row._id}/status`, { status: 'SUSPENDED', reason: 'admin_action' })
      .subscribe({
        next: () => {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        },
        error: (error: any) => this.util.handleError(error, 'admin'),
      });
  }
}
