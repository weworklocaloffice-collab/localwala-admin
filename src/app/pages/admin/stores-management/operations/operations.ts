import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * The Local Stores operational console.
 *
 * ## One screen, eight queues
 *
 * These are eight independent problems with eight independent owners and eight different
 * urgencies. What they share is the question that gets an operator to open the admin
 * panel in the first place — "is anything on fire?" — so the summary tiles come first and
 * each tile selects its queue below.
 *
 * A separate page per console would put that question behind eight navigations, which is
 * the same reason the plan groups them.
 *
 * ## The tiles are the product
 *
 * A queue list without counts is a list. `suspended: 3` is what makes an operator decide
 * to look. Counts are fetched once on init and cached — re-fetching all eight on every
 * tile click would be eight requests to redraw one table.
 */
@Component({
  selector: 'app-stores-operations',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './operations.html',
})
export class Operations implements OnInit {
  /** Every console, with the endpoint and the tile it belongs to. */
  readonly CONSOLES = [
    {
      key: 'subscription-health',
      path: 'subscription-health',
      labelKey: 'stores_console_subscription_health',
      countKey: 'subscriptionHealth',
      columns: ['chain', 'plan', 'status', 'days', 'retryCount', 'nextBillingDate'],
      icon: 'credit_card',
    },
    {
      key: 'settlement-exceptions',
      path: 'settlement-exceptions',
      labelKey: 'stores_console_settlement_exceptions',
      countKey: 'settlementExceptions',
      columns: ['settlement', 'store', 'status', 'netAmount', 'failureReason', 'ageDays'],
      icon: 'receipt_long',
    },
    {
      key: 'refund-failures',
      path: 'refund-failures',
      labelKey: 'stores_console_refund_failures',
      countKey: 'refundFailures',
      columns: ['order', 'store', 'componentKey', 'amount', 'fundingSource', 'failureReason'],
      icon: 'currency_exchange',
    },
    {
      key: 'inventory-drift',
      path: 'inventory-drift',
      labelKey: 'stores_console_inventory_drift',
      countKey: 'inventoryDrift',
      columns: ['outlet', 'product', 'expectedAvailable', 'availableQty', 'driftAmount', 'movementSeq'],
      icon: 'inventory_2',
    },
    {
      key: 'compliance-expiry',
      path: 'compliance-expiry',
      labelKey: 'stores_console_compliance_expiry',
      countKey: 'complianceExpiry',
      columns: ['subject', 'kind', 'expiry', 'daysRemaining', 'bucket'],
      icon: 'verified_user',
    },
    {
      key: 'organic-verification',
      path: 'organic-verification',
      labelKey: 'stores_console_organic_queue',
      countKey: 'organicVerification',
      columns: ['subject', 'certificate', 'issuingAuthority', 'status', 'expiry'],
      icon: 'eco',
    },
    {
      key: 'abuse-queue',
      path: 'abuse-queue',
      labelKey: 'stores_console_abuse_queue',
      countKey: 'abuse',
      columns: ['kind', 'subject', 'detail', 'priority', 'status'],
      icon: 'report',
    },
    {
      key: 'application-ageing',
      path: 'application-ageing',
      labelKey: 'stores_console_application_ageing',
      countKey: 'applicationAgeing',
      columns: ['business', 'store', 'status', 'ageDays', 'incompleteSteps'],
      icon: 'hourglass_empty',
    },
    {
      key: 'cod-remittance',
      path: 'cod-remittance',
      labelKey: 'stores_console_cod_remittance',
      countKey: 'codRemittance',
      // Remittance rows, not order rows: driver/outlet/date/expected/
      // collected/remitted/variance/status (§6.21.3).
      columns: ['driver', 'outlet', 'date', 'expected', 'collected', 'remitted', 'variance', 'status'],
      icon: 'monetization_on',
    },
  ];

  summary: any = {};
  isSummaryLoaded: boolean = false;

  activeConsole: any = null;
  rows: any[] = [];
  isRowsLoaded: boolean = false;

  constructor(
    private api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.loadSummary();
    // Applications is the default queue: it is the one an operator is accountable for
    // every day, and the tiles are already visible beside it.
    this.select(this.CONSOLES[7]);
  }

  loadSummary() {
    this.api.get_private('v1/admin/stores/operations/summary').subscribe({
      next: (response: any) => {
        this.summary = response || {};
        this.isSummaryLoaded = true;
      },
      error: (error: any) => {
        this.isSummaryLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  select(console_: any) {
    this.activeConsole = console_;
    this.isRowsLoaded = false;
    this.rows = [];

    this.api.get_private('v1/admin/stores/operations/' + console_.path).subscribe({
      next: (response: any) => {
        this.rows = response && response.results ? response.results : [];
        this.isRowsLoaded = true;
      },
      error: (error: any) => {
        this.isRowsLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  count(console_: any): number {
    const n = this.summary ? this.summary[console_.countKey] : undefined;
    return typeof n === 'number' ? n : 0;
  }

  /** A queue with rows is the one that needs a human; zero is the reassuring answer. */
  hasAttention(console_: any): boolean {
    return this.count(console_) > 0;
  }

  trackByIndex(index: number): number {
    return index;
  }

  // -- cell helpers ---------------------------------------------------------
  // Each console has its own row shape, so the template cannot bind `row.chain` for all
  // of them. These keep the template free of per-queue conditionals.

  cell(row: any, column: string): any {
    switch (column) {
      // subscription health
      case 'chain':
        return row.chainName || '—';
      case 'plan':
        return row.planName || '—';
      case 'days':
        return row.daysOfGraceLeft !== null && row.daysOfGraceLeft !== undefined
          ? row.daysOfGraceLeft
          : row.daysToBilling;
      // settlement exceptions
      case 'settlement':
        return row.settlementNo ? '#' + row.settlementNo : '—';
      case 'store':
        return row.storeName || row.outletName || '—';
      case 'netAmount':
        return row.netAmount;
      case 'ageDays':
        return row.ageDays !== undefined ? row.ageDays + 'd' : '—';
      // refunds
      case 'order':
        return row.orderNo ? '#' + row.orderNo : '—';
      // inventory drift
      case 'outlet':
        return row.outletName || row.outlet?.name || row.outlet?.outletCode || '—';
      case 'product':
        return row.productName || '—';
      case 'expectedAvailable':
        return row.expectedAvailable;
      case 'availableQty':
        return row.availableQty;
      case 'driftAmount':
        return row.driftAmount;
      case 'movementSeq':
        return row.movementSeq;
      // compliance / organic
      case 'subject':
        return row.subjectName || row.outletName || row.chainName || '—';
      case 'kind':
        return row.docType ? 'document' : 'subscription';
      case 'certificate':
        return row.certificateType || '—';
      case 'issuingAuthority':
        return row.issuingAuthority || '—';
      // abuse
      case 'detail':
        return row.comment || row.subject || row.description || '—';
      // applications
      case 'business':
        return row.businessName || '—';
      case 'incompleteSteps':
        return (row.incompleteSteps || []).length;
      // COD remittance (§6.21.3): driver/outlet are populated objects here,
      // unlike the flat names on the other consoles.
      case 'driver':
        return row.driver?.name || row.driver?.driverCode || '—';
      case 'date':
        return row.date ? new Date(row.date).toLocaleDateString() : '—';
      case 'expected':
        return row.expected;
      case 'collected':
        return row.collected;
      case 'remitted':
        return row.remitted;
      case 'variance':
        return row.variance;
      // shared
      case 'status':
        return row.status || '—';
      case 'priority':
        return row.priority || '—';
      case 'retryCount':
        return row.retryCount !== undefined ? row.retryCount + '/' + row.maxRetries : '—';
      case 'nextBillingDate':
      case 'expiry':
        return row.expiryDate || row.nextBillingDate
          ? new Date(row.expiryDate || row.nextBillingDate).toLocaleDateString()
          : '—';
      case 'daysRemaining':
        return row.daysRemaining;
      case 'bucket':
        return row.bucket || '—';
      case 'amount':
        return row.amount;
      case 'paymentMethod':
        return row.paymentMethod || '—';
      case 'createdAt':
        return row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—';
      default:
        return row[column] !== undefined ? row[column] : '—';
    }
  }

  /** A negative day count is the alarming case, so it gets the error colour. */
  isCritical(column: string, value: any): boolean {
    if (column === 'days' || column === 'daysRemaining') {
      return typeof value === 'number' && value <= 3;
    }
    if (column === 'driftAmount' || column === 'variance') {
      return typeof value === 'number' && Math.abs(value) > 0;
    }
    if (column === 'ageDays') {
      return typeof value === 'number' && value >= 7;
    }
    if (column === 'bucket') {
      return value === '7d';
    }
    return false;
  }
}