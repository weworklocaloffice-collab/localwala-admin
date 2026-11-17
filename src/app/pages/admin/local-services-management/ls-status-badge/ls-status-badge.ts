import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ls-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ls-status-badge.html',
  styles: [
    `
      .ls-status {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        line-height: 18px;
        white-space: nowrap;
      }
      .ls-status.is-success {
        color: #13deb9;
        background: rgba(19, 222, 185, 0.12);
      }
      .ls-status.is-warning {
        color: #ffae1f;
        background: rgba(255, 174, 31, 0.12);
      }
      .ls-status.is-error {
        color: #fa896b;
        background: rgba(250, 137, 107, 0.12);
      }
      .ls-status.is-info {
        color: #5d87ff;
        background: rgba(93, 135, 255, 0.12);
      }
      .ls-status.is-neutral {
        color: #7c8fac;
        background: rgba(124, 143, 172, 0.12);
      }
    `,
  ],
})
export class LsStatusBadge {
  @Input() status: string = '';

  private tones: any = {
    DRAFT: 'neutral',
    SUBMITTED: 'info',
    UNDER_REVIEW: 'info',
    APPROVED: 'success',
    ACTIVE: 'success',
    SUSPENDED: 'warning',
    INACTIVE: 'neutral',
    REJECTED: 'error',
    CLOSED: 'neutral',
    REQUESTED: 'info',
    PENDING_PROVIDER: 'warning',
    ACCEPTED: 'info',
    PAYMENT_PENDING: 'warning',
    CONFIRMED: 'success',
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
    CANCELLED: 'error',
    NO_SHOW: 'error',
    DISPUTED: 'warning',
    requested: 'info',
    approved: 'success',
    rejected: 'error',
    completed: 'success',
    failed: 'error',
    pending: 'warning',
    verified: 'success',
    processing: 'info',
    settled: 'success',
    reversed: 'warning',
    draft: 'neutral',
    active: 'success',
    inactive: 'neutral',
  };

  tone(): string {
    return this.tones[this.status] || 'neutral';
  }

  label(): string {
    if (!this.status) return '—';
    return this.status.replace(/_/g, ' ');
  }
}
