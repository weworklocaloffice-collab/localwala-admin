import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dairy-drivers',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './drivers.html',
})
export class Drivers {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedBlocked: string = '';
  displayedColumn: string[] = ['rider', 'outlet', 'vehicle', 'payout', 'standing', 'rating'];

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
    const param: any = {
      limit: this.pageSize,
      page: this.currentPage + 1,
    };
    if (this.selectedBlocked) {
      param.blocked = this.selectedBlocked;
    }
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) {
        return;
      }
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/dairy/admin/drivers?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        if (response && response.drivers) {
          this.list = response.drivers;
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      },
      error: () => {
        this.isLoaded = true;
      },
    });
  }

  onFilter() {
    this.currentPage = 0;
    this.getList();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }
}
