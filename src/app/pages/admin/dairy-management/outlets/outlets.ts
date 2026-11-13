import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogOutletTerms } from '../dialog-outlet-terms/dialog-outlet-terms';
import { DialogOutletStatus } from '../dialog-outlet-status/dialog-outlet-status';
import { DialogPartnerCreate } from '../dialog-partner-create/dialog-partner-create';
import { DialogOutletCreate } from '../dialog-outlet-create/dialog-outlet-create';

/**
 * Every dairy outlet, whatever its commercial model.
 *
 * This is the directory the plan describes as missing: the old screen listed
 * `DairyPartner` agreements, so direct outlets and franchises were invisible and
 * there was no place from which a commission partner could be created. The
 * agreement-specific lists still exist under Franchises and Commission Partners;
 * this screen answers "which outlets do we have".
 */
@Component({
  selector: 'app-dairy-outlets',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './outlets.html',
  styles: [
    `
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
        margin-bottom: 18px;
      }
      .kpi-card {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 14px;
        padding: 16px 18px;
        background: var(--mat-sys-surface);
      }
      .kpi-label {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .kpi-value {
        font-size: 28px;
        font-weight: 700;
        line-height: 1.2;
        margin-top: 6px;
      }
      .kpi-hint {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        margin-top: 2px;
      }
      .filter-bar {
        display: grid;
        grid-template-columns: minmax(220px, 1.5fr) repeat(3, minmax(150px, 1fr)) auto auto;
        gap: 12px;
        align-items: center;
        margin-bottom: 18px;
      }
      @media (max-width: 1100px) {
        .kpi-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .filter-bar {
          grid-template-columns: 1fr 1fr;
        }
      }
      @media (max-width: 640px) {
        .kpi-grid,
        .filter-bar {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class Outlets {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  search: string = '';
  selectedStatus: string = '';
  selectedModel: string = '';
  selectedCity: string = '';
  listOfCities: any[] = [];
  summary: any = {
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    direct: 0,
    franchise: 0,
    commissionPartner: 0,
  };
  displayedColumn: string[] = [
    'outlet',
    'location',
    'owner',
    'model',
    'terms',
    'status',
    'action',
  ];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.getList();
    this.getCities();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      limit: this.pageSize,
      page: this.currentPage,
      search: this.search,
      status: this.selectedStatus,
      model: this.selectedModel,
      city: this.selectedCity,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) {
        return;
      }
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/dairy/admin/outlets?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        if (response && response.outlets) {
          this.list = response.outlets;
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
        if (response && response.summary) {
          this.summary = response.summary;
        }
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  /** The city master data is the same public list the registration form uses. */
  getCities() {
    this.api.get_public('v1/public/register/getBasicDataDairyRequest').subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.listOfCities = response;
        }
      },
      error: (error: any) => {
        console.error('Could not load cities for the outlet filter:', error);
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

  clearFilters() {
    this.search = '';
    this.selectedStatus = '';
    this.selectedModel = '';
    this.selectedCity = '';
    this.onFilter();
  }

  /** The outlet's own trading state, separate from any agreement status. */
  outletState(row: any): string {
    if (!row.verified) return 'pending';
    return row.status ? 'active' : 'suspended';
  }

  modelKey(row: any): string {
    return 'dairy_model_' + (row.businessModel || 'direct');
  }

  partnerStatusKey(row: any): string {
    return 'dairy_outlet_status_' + (row.partner.status || 'pending');
  }

  franchiseStatusKey(row: any): string {
    return 'dairy_franchise_status_' + (row.franchise.status || 'pending');
  }

  ownerName(row: any): string {
    if (!row.owner) return '';
    return [row.owner.firstName, row.owner.lastName].filter(Boolean).join(' ');
  }

/** Create a new outlet (direct / commission partner / franchise) with its owner login. */
  onCreateOutlet() {
    this.dialog
      .open(DialogOutletCreate, {
        data: { cities: this.listOfCities },
        disableClose: true,
        width: '720px',
      })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'add') {
          this.util.onSuccess('ts_outlet_created');
          this.getList();
        }
      });
  }

  /** Direct, verified, trading, and not already tied to either agreement type. */
  canCreatePartner(row: any): boolean {
    return (
      this.util.hasRight('dairy_partner_manage') &&
      row.businessModel === 'direct' &&
      row.verified === true &&
      row.status === true &&
      !row.partner &&
      !row.franchise
    );
  }

  onCreatePartner(row?: any) {
    this.dialog
      .open(DialogPartnerCreate, {
        data: { outlet: row || null },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'add') {
          this.util.onSuccess('ts_partner_created');
          this.getList();
        }
      });
  }

  /** Commission terms live on the agreement, not the outlet. */
  onEditTerms(row: any) {
    this.dialog
      .open(DialogOutletTerms, { data: { row: row.partner }, disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_outlet_terms_updated');
          this.getList();
        }
      });
  }

  onChangeStatus(row: any, status: string) {
    this.dialog
      .open(DialogOutletStatus, {
        data: { row: row.partner, status: status },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess(
            status == 'active' ? 'ts_outlet_reactivated' : 'ts_outlet_status_updated',
          );
          this.getList();
        }
      });
  }
}
