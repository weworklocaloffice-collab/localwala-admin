import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-jhatka-variance',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './variance.html',
})
export class JhatkaVariance {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  displayedColumn: string[] = ['flag', 'direction', 'variance', 'action', 'decide'];
  actions: string[] = ['observed', 'reviewed', 'escalated', 'calibrated', 'fraud_referred'];

  @ViewChild('paginator', { read: MatPaginator, static: false })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      limit: this.pageSize,
      page: this.currentPage + 1,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) {
        return;
      }
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/jhatka/admin/operations/variance?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        if (response && (response.flags || response.variance)) {
          this.list = response.flags || response.variance;
          if (this.paginator) {
            this.paginator.length = response.count ?? this.list.length;
          }
        }
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  decide(element: any, action: string) {
    const note = window.prompt(`Move flag to ${action}. Note (optional):`) || undefined;
    this.api.patch_private(`v1/jhatka/admin/operations/variance/${element.id}`, { action, note }).subscribe({
      next: () => this.getList(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
