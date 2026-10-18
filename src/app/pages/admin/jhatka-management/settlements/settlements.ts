import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { PaisePipe } from '../paise.pipe';

@Component({
  selector: 'app-jhatka-settlements',
  imports: [CommonModule, FormsModule, RouterModule, PaisePipe, MaterialModule],
  templateUrl: './settlements.html',
})
export class JhatkaSettlements {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  displayedColumn: string[] = ['settlement', 'period', 'net', 'status', 'action'];
  rules: any[] = [];
  payables: any[] = [];
  payouts: any[] = [];

  @ViewChild('paginator', { read: MatPaginator, static: false })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {
    this.getList();
    this.getMoney();
  }

  pickList(response: any, keys: string[]): any[] {
    if (!response) {
      return [];
    }
    for (const key of keys) {
      if (Array.isArray(response[key])) {
        return response[key];
      }
    }
    return [];
  }

  getMoney() {
    this.api.get_private('v1/jhatka/admin/settlements/commission-rules').subscribe({
      next: (response: any) => {
        this.rules = this.pickList(response, ['rules', 'commissionRules']);
      },
      error: () => {},
    });
    this.api.get_private('v1/jhatka/admin/settlements/payables').subscribe({
      next: (response: any) => {
        this.payables = this.pickList(response, ['payables']);
      },
      error: () => {},
    });
    this.api.get_private('v1/jhatka/admin/settlements/payouts').subscribe({
      next: (response: any) => {
        this.payouts = this.pickList(response, ['payouts']);
      },
      error: () => {},
    });
  }

  approvePayout(element: any) {
    this.api.post_private(`v1/jhatka/admin/settlements/payouts/${element.id}/approve`, {}).subscribe({
      next: () => this.getMoney(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
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
    this.api.get_private('v1/jhatka/admin/settlements?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        if (response && response.settlements) {
          this.list = response.settlements;
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

  finalise(element: any) {
    this.api.post_private(`v1/jhatka/admin/settlements/${element.id}/finalise`, {}).subscribe({
      next: () => this.getList(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  dispute(element: any) {
    const reason = window.prompt('Dispute reason (at least 10 characters):');
    if (!reason) {
      return;
    }
    this.api.post_private(`v1/jhatka/admin/settlements/${element.id}/dispute`, { disputeReason: reason }).subscribe({
      next: () => this.getList(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
