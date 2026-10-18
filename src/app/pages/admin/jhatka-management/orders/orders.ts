import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-jhatka-orders',
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  templateUrl: './orders.html',
})
export class JhatkaOrders {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedLifecycle: string = '';
  displayedColumn: string[] = ['order', 'lifecycle', 'total', 'refunded', 'open'];

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
      lifecycle: this.selectedLifecycle,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) {
        return;
      }
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/jhatka/admin/orders?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        if (response && response.orders) {
          this.list = response.orders;
          if (this.paginator) {
            this.paginator.length = response.count ?? response.total ?? this.list.length;
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

  onLifecycleFilter() {
    this.currentPage = 0;
    this.getList();
  }
}
