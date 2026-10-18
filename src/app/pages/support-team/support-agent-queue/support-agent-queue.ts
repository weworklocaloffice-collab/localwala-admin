import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

type QueueView = 'mine' | 'unassigned' | 'breached' | 'all' | 'offered';

@Component({
  selector: 'app-support-agent-queue',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './support-agent-queue.html',
})
export class SupportAgentQueue implements OnInit, OnDestroy {
  @ViewChild('queuePaginator', { read: MatPaginator, static: false }) queuePaginator: MatPaginator;

  queue = new MatTableDataSource<any>([]);
  displayedColumn = ['select', 'customer', 'type',
    'handover', 'priority', 'sla', 'firstResponse', 'assignee', 'time', 'action'];
  selectedIds = new Set<string>();
  bulkAgents: any[] = [];
  bulkAssignTo = '';

  view: QueueView = 'mine';
  pageSize: number = 20;
  currentPage: number = 1;
  isLoaded = false;
  totalResults = 0;
  searchTerm = '';

  private searchDebounce: any = null;
  private poll: any = null;
  private heartbeat: any = null;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getList();
    // Wait timers and SLA breaches are time-based, so a page left open would
    // silently show stale values. Poll rather than leave the agent guessing.
    this.poll = setInterval(() => this.getList(true), 30000);
    // Presence heartbeat. Without this an agent sitting on the queue list —
    // the exact place an available agent waits — is marked offline by the cron
    // and never rotated a ticket. The workspace beats separately per ticket.
    this.beatOnline();
    this.heartbeat = setInterval(() => this.beatOnline(), 30000);
  }

  ngOnDestroy() {
    if (this.poll) clearInterval(this.poll);
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    if (this.heartbeat) clearInterval(this.heartbeat);
    // Leaving the queue is NOT leaving the desk (opening a thread destroys
    // this component). Offline is posted only on real logout, otherwise every
    // thread open falsely offlines the agent and the sweep rips their tickets
    // back to the queue.
  }

  private beatOnline() {
    this.api
      .post_private('v1/support_team/presence/heartbeat', { agent: localStorage.getItem('_uid') || '' })
      .subscribe({
        error: () => {
          // A failed heartbeat must never interrupt the queue.
        },
      });
  }

  setView(view: QueueView) {
    this.view = view;
    this.currentPage = 1;
    this.clearSelection();
    this.getList();
  }

  onSearch(value: string) {
    this.searchTerm = value;
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    // Server-side search, debounced. Filtering the already-loaded page can
    // never find a ticket that is not in this page of results.
    this.searchDebounce = setTimeout(() => {
      this.currentPage = 1;
      this.getList();
    }, 400);
  }

  getList(silent = false) {
    if (!silent) this.isLoaded = false;
    let httpParams = new HttpParams();
    httpParams = httpParams.set('limit', this.pageSize);
    httpParams = httpParams.set('page', this.currentPage);
    httpParams = httpParams.set('view', this.view);
    if (this.view === 'mine' || this.view === 'offered') {
      httpParams = httpParams.set('agent', localStorage.getItem('_uid') || '');
    }
    if (this.searchTerm) {
      httpParams = httpParams.set('q', this.searchTerm);
    }

    this.api
      .get_private(`v1/support_team/queue?${httpParams.toString()}`)
      .subscribe({
        next: (response: any) => {
          this.isLoaded = true;
          if (response && response.chats) {
            this.queue = new MatTableDataSource<any>(response.chats);
            this.totalResults = response.totalResults || 0;
            if (this.queuePaginator) {
              this.queuePaginator.length = this.totalResults;
            }
          }
        },
        error: (error: any) => {
          this.isLoaded = true;
          this.util.handleError(error, 'support-team');
        },
      });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  getDate(date: string) {
    if (!date) return '-';
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy hh:mm a');
  }

  // Minutes remaining until the SLA deadline. Negative = breached.
  slaMinutes(slaDueAt: string): number | null {
    if (!slaDueAt) return null;
    const due = DateTime.fromISO(slaDueAt);
    return Math.round(due.diff(DateTime.now(), 'minutes').minutes);
  }

  slaLabel(slaDueAt: string): string {
    const mins = this.slaMinutes(slaDueAt);
    if (mins === null) return '-';
    if (mins < 0) return `${Math.abs(mins)}m over`;
    if (mins < 60) return `${mins}m left`;
    return `${Math.round(mins / 60)}h left`;
  }

  isBreached(slaDueAt: string): boolean {
    const mins = this.slaMinutes(slaDueAt);
    return mins !== null && mins < 0;
  }

  onChat(item: any) {
    // Backend shapes lean rows with `id`; pre-shaping builds have only `_id`.
    const id = item?.id || item?._id;
    if (!id) return;
    this.router.navigate(['support-team/u/message', id]);
  }

  // One-click self-accept for unassigned tickets: transfer to self.
  // Uses the existing transfer endpoint (audited server-side); the row then
  // moves to "mine" on the next poll. Agents without assignment rights get a
  // 403 from webAuth, never a silent claim.
  acceptingId: string | null = null;

  onAccept(item: any) {
    const me = localStorage.getItem('_uid') || '';
    const id = item?.id || item?._id;
    if (!me || !id || this.acceptingId) return;
    this.acceptingId = id;
    this.api
      .post_private(`v1/support_team/chat/transfer/${id}`, { toAgent: me, reason: 'self-accept from queue' })
      .subscribe({
        next: () => {
          this.acceptingId = null;
          this.getList(true);
        },
        error: (error: any) => {
          this.acceptingId = null;
          // Lost the race: another agent claimed it first (409). Refresh so
          // the row leaves this view instead of lingering as actionable.
          this.getList(true);
          this.util.handleError(error, 'support-team');
        },
      });
  }

  trackById(index: number, item: any) {
    return item.id || index;
  }

  isSupervisor(): boolean {
    return (localStorage.getItem('_authRole') || '') === 'supportSupervisor';
  }

  toggleSelect(id: string, checked: boolean) {
    if (!id) return;
    if (checked) this.selectedIds.add(id);
    else this.selectedIds.delete(id);
  }

  clearSelection() {
    this.selectedIds.clear();
    this.bulkAssignTo = '';
  }

  loadBulkAgents() {
    if (this.bulkAgents.length || !this.isSupervisor()) return;
    this.api.get_private('v1/support_team/agents/online').subscribe({
      next: (response: any) => {
        this.bulkAgents = (response && response.agents) || [];
      },
      error: () => {},
    });
  }

  bulkResolve() {
    if (!this.selectedIds.size) return;
    this.api.post_private('v1/support_team/chat/bulk', { ids: [...this.selectedIds], action: 'resolve', reason: 'supervisor bulk close' }).subscribe({
      next: () => {
        this.clearSelection();
        this.getList(true);
      },
      error: (error: any) => this.util.handleError(error, 'support-team'),
    });
  }

  bulkAssign() {
    if (!this.selectedIds.size || !this.bulkAssignTo) return;
    this.api.post_private('v1/support_team/chat/bulk', { ids: [...this.selectedIds], action: 'assign', toAgent: this.bulkAssignTo, reason: 'supervisor bulk move' }).subscribe({
      next: (response: any) => {
        const failed = ((response && response.results) || []).filter((r: any) => !r.ok);
        if (failed.length) this.util.onError('ts_something_went_wrong', `${failed.length} failed (capacity?)`);
        this.clearSelection();
        this.getList(true);
      },
      error: (error: any) => this.util.handleError(error, 'support-team'),
    });
  }
}