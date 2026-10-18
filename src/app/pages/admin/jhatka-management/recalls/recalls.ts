import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-jhatka-recalls',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './recalls.html',
})
export class JhatkaRecalls {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  displayedColumn: string[] = ['recall', 'severity', 'customers', 'status', 'action'];

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
      status: this.selectedStatus,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) {
        return;
      }
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/jhatka/admin/compliance/recalls?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        if (response && response.recalls) {
          this.list = response.recalls;
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

  onStatusFilter() {
    this.currentPage = 0;
    this.getList();
  }

  closeRecall(element: any, force: boolean) {
    const body: any = {};
    if (force) {
      const note = window.prompt('Force-closing over unacknowledged customers requires a resolution note:');
      if (!note) {
        return;
      }
      body.force = true;
      body.resolutionNote = note;
    }
    this.api.post_private(`v1/jhatka/admin/compliance/recalls/${element.id}/close`, body).subscribe({
      next: () => this.getList(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
