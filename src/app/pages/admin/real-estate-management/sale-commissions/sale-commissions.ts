import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

export const COMMISSION_STATUSES: string[] = [
  'PENDING',
  'VERIFIED',
  'EARNED',
  'SETTLEMENT_CREATED',
  'PAID',
  'REVERSED',
];

/**
 * Commission list base (plan §10.2 rows 25, 28–30, §1.1).
 *
 * One table, four screens: sale-commissions (all beneficiaries),
 * referral-earnings (?beneficiaryType=REFERRER), executive-earnings
 * (?beneficiaryType=EXECUTIVE), bank-commissions (?beneficiaryType=BANK).
 * Listing-package money and sale commission are never summed into one
 * "earnings" number — separate event types, separate rows.
 */
@Component({
  selector: 'app-real-estate-sale-commissions',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './sale-commissions.html',
})
export class SaleCommissions {
  beneficiaryType: string = '';
  titleKey: string = 'realEstate_sale_commissions';
  subtitleKey: string = 'realEstate_sale_commissions_subtitle';
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  statuses = COMMISSION_STATUSES;
  displayedColumn: string[] = ['commission', 'beneficiary', 'amount', 'status'];

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
    let httpParams = new HttpParams()
      .set('limit', this.pageSize)
      .set('page', this.currentPage + 1);
    if (this.selectedStatus) {
      httpParams = httpParams.set('status', this.selectedStatus);
    }
    if (this.beneficiaryType) {
      httpParams = httpParams.set('beneficiaryType', this.beneficiaryType);
    }
    this.api.get_private('v1/realestate/admin/commissions?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        if (response && response.results) {
          this.list = response.results;
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
}
