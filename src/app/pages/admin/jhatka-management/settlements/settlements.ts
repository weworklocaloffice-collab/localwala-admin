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
  total: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  displayedColumn: string[] = ['settlement', 'period', 'net', 'status', 'action'];
  rules: any[] = [];
  payables: any[] = [];
  payouts: any[] = [];
  outlets: any[] = [];
  payableSuppliers: any[] = [];
  generatingPayable: boolean = false;
  generatePayableForm: any = {
    outlet: '',
    supplier: '',
    from: this.isoDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    to: this.isoDate(new Date()),
    tdsApplicable: false,
    tdsRatePercent: 0,
  };

  @ViewChild('paginator', { read: MatPaginator, static: false })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {
    this.getList();
    this.getMoney();
    this.getPayableOptions();
  }

  isoDate(date: Date): string {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
  }

  getPayableOptions() {
    this.api.get_private('v1/jhatka/admin/outlets?limit=200').subscribe({
      next: (response: any) => {
        this.outlets = this.pickList(response, ['outlets', 'data']);
      },
      error: () => {},
    });
    this.api.get_private('v1/jhatka/admin/suppliers?limit=200').subscribe({
      next: (response: any) => {
        this.payableSuppliers = this.pickList(response, ['suppliers']);
      },
      error: () => {},
    });
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

  documentId(element: any): string {
    return String(element?.id || element?._id || '');
  }

  generatePayable() {
    const form = this.generatePayableForm;
    if (!form.outlet || !form.supplier) {
      this.util.onInfo('Select an outlet and a supplier');
      return;
    }
    if (!form.from || !form.to || form.to <= form.from) {
      this.util.onInfo('The period end must be after the period start');
      return;
    }
    if (form.tdsApplicable) {
      const rate = Number(form.tdsRatePercent);
      if (Number.isNaN(rate) || rate < 0 || rate > 100) {
        this.util.onInfo('TDS rate must be between 0 and 100');
        return;
      }
    }
    this.generatingPayable = true;
    this.api
      .post_private('v1/jhatka/admin/settlements/payables/generate', {
        outlet: form.outlet,
        supplier: form.supplier,
        from: form.from,
        to: form.to,
        tdsApplicable: !!form.tdsApplicable,
        tdsRatePercent: Number(form.tdsRatePercent) || 0,
      })
      .subscribe({
        next: () => {
          this.generatingPayable = false;
          this.getMoney();
        },
        error: (error: any) => {
          this.generatingPayable = false;
          this.util.handleError(error, 'admin');
        },
      });
  }

  approvePayable(element: any) {
    const id = this.documentId(element);
    if (!id) {
      this.util.onInfo('Payable id is missing');
      return;
    }
    this.api.patch_private(`v1/jhatka/admin/settlements/payables/${id}/approve`, {}).subscribe({
      next: () => this.getMoney(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  payPayable(element: any) {
    const id = this.documentId(element);
    if (!id) {
      this.util.onInfo('Payable id is missing');
      return;
    }
    const paymentReference = window.prompt(
      `Bank/UPI transfer reference for ${element.payableNo || 'this payable'} (required):`,
    )?.trim();
    if (!paymentReference || paymentReference.length < 3) {
      this.util.onInfo('A payment reference of at least 3 characters is required');
      return;
    }
    this.api.post_private(`v1/jhatka/admin/settlements/payables/${id}/pay`, { paymentReference }).subscribe({
      next: () => this.getMoney(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  disputePayable(element: any) {
    const id = this.documentId(element);
    if (!id) {
      this.util.onInfo('Payable id is missing');
      return;
    }
    const reason = window.prompt('Dispute reason (at least 3 characters):')?.trim();
    if (!reason || reason.length < 3) {
      this.util.onInfo('A dispute reason of at least 3 characters is required');
      return;
    }
    this.api.patch_private(`v1/jhatka/admin/settlements/payables/${id}/dispute`, { reason }).subscribe({
      next: () => this.getMoney(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  voidPayable(element: any) {
    const id = this.documentId(element);
    if (!id) {
      this.util.onInfo('Payable id is missing');
      return;
    }
    const reason = window.prompt('Void reason (at least 3 characters):')?.trim();
    if (!reason || reason.length < 3) {
      this.util.onInfo('A void reason of at least 3 characters is required');
      return;
    }
    this.api.patch_private(`v1/jhatka/admin/settlements/payables/${id}/void`, { reason }).subscribe({
      next: () => this.getMoney(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  approvePayout(element: any) {
    const id = this.documentId(element);
    if (!id) {
      this.util.onInfo('Payout id is missing');
      return;
    }
    this.api.post_private(`v1/jhatka/admin/settlements/payouts/${id}/approve`, {}).subscribe({
      next: () => this.getMoney(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  payPayout(element: any) {
    const id = this.documentId(element);
    if (!id) {
      this.util.onInfo('Payout id is missing');
      return;
    }
    const paymentReference = window.prompt(
      `Bank/UPI transfer reference for ${element.payoutNo || 'this payout'} (required):`,
    )?.trim();
    if (!paymentReference || paymentReference.length < 3) {
      this.util.onInfo('A payment reference of at least 3 characters is required');
      return;
    }
    this.api.post_private(`v1/jhatka/admin/settlements/payouts/${id}/pay`, { paymentReference }).subscribe({
      next: () => this.getMoney(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  /**
   * Commission rules govern what partners are actually paid: the weekly payout
   * sweep resolves the ACTIVE rule for each outlet's business model and uses its
   * ratePercent (falling back to 10% only when no rule is in force). Creating a
   * rule lands it as DRAFT — activation is the separate deliberate act, because
   * activating changes real money. An ACTIVE rule is immutable: change the rate
   * by retiring it and creating a superseding one, so history never restates.
   */
  createRule() {
    const code = window.prompt('Rule code (unique, e.g. CP-15):')?.trim();
    if (!code) return;
    const name = window.prompt('Rule name:')?.trim();
    if (!name) return;
    const businessModel = window.prompt('Business model (commission_partner | franchise):', 'commission_partner')?.trim();
    if (businessModel !== 'commission_partner' && businessModel !== 'franchise') {
      this.util.onInfo('Business model must be commission_partner or franchise');
      return;
    }
    const basis = window.prompt('Basis (gross_order_value | final_weighted_value | net_of_refunds | fixed_monthly):', 'gross_order_value')?.trim();
    if (!basis) return;
    // TWO different rates (netting them hides both in a statement):
    //   platformFeePercent — LocalWala's cut, DEDUCTED from the payout
    //   ratePercent        — the partner's earning, RECORDED on the statement
    const feeStr = window.prompt('Platform charge percent (0–100, kept by LocalWala, deducted from payouts):', '10')?.trim();
    const platformFeePercent = Number(feeStr);
    if (feeStr === '' || Number.isNaN(platformFeePercent) || platformFeePercent < 0 || platformFeePercent > 100) {
      this.util.onInfo('A platform charge between 0 and 100 is required');
      return;
    }
    const rateStr = window.prompt('Partner commission percent (0–100, the partner\'s earning, recorded on statements):', '0')?.trim();
    const ratePercent = Number(rateStr);
    if (rateStr === '' || Number.isNaN(ratePercent) || ratePercent < 0 || ratePercent > 100) {
      this.util.onInfo('A partner rate between 0 and 100 is required');
      return;
    }
    const effectiveFrom = window.prompt('Effective from (yyyy-mm-dd):', new Date().toISOString().slice(0, 10))?.trim();
    if (!effectiveFrom) return;

    this.api.post_private('v1/jhatka/admin/settlements/commission-rules', {
      code, name, businessModel, basis, platformFeePercent, ratePercent, effectiveFrom,
    }).subscribe({
      next: () => this.getMoney(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  activateRule(element: any) {
    const id = this.documentId(element);
    this.api.patch_private(`v1/jhatka/admin/settlements/commission-rules/${id}`, { status: 'active' }).subscribe({
      next: () => this.getMoney(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  retireRule(element: any) {
    const id = this.documentId(element);
    this.api.patch_private(`v1/jhatka/admin/settlements/commission-rules/${id}`, { status: 'retired' }).subscribe({
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
          this.total = response.total ?? this.list.length;
          if (this.paginator) {
            this.paginator.length = this.total;
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
    const id = this.documentId(element);
    if (!id) {
      this.util.onInfo('Settlement id is missing');
      return;
    }
    this.api.post_private(`v1/jhatka/admin/settlements/${id}/finalise`, {}).subscribe({
      next: () => this.getList(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  dispute(element: any) {
    const id = this.documentId(element);
    if (!id) {
      this.util.onInfo('Settlement id is missing');
      return;
    }
    const reason = window.prompt('Dispute reason (at least 10 characters):');
    if (!reason) {
      return;
    }
    this.api.post_private(`v1/jhatka/admin/settlements/${id}/dispute`, { disputeReason: reason }).subscribe({
      next: () => this.getList(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
