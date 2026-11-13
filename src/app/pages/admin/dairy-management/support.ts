import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({ selector: 'app-dairy-support', imports: [CommonModule, FormsModule, MaterialModule], templateUrl: './support.html' })
export class DairySupport {
  loading = false;
  saving = false;
  tickets: any[] = [];
  selected: any = null;
  reply = '';
  status = '';
  priority = '';
  filterStatus = '';
  search = '';
  page = 1;
  limit = 20;
  totalResults = 0;

  constructor(public api: ApiService, public util: UtilService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    let params = new HttpParams().set('page', this.page).set('limit', this.limit);
    if (this.filterStatus) params = params.set('status', this.filterStatus);
    if (this.search.trim()) params = params.set('search', this.search.trim());
    this.api.get_private('v1/dairy/admin/support/tickets?' + params.toString()).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.tickets = response?.tickets ?? [];
        this.totalResults = Number(response?.totalResults ?? 0);
        if (this.selected) this.selected = this.tickets.find((row: any) => row._id === this.selected._id) ?? null;
      },
      error: (error: any) => { this.loading = false; this.util.handleError(error, 'admin'); },
    });
  }

  select(ticket: any) {
    this.api.get_private('v1/dairy/admin/support/tickets/' + ticket._id).subscribe({
      next: (response: any) => { this.selected = response?.ticket ?? ticket; this.status = this.selected.status; this.priority = this.selected.priority; },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  replyToTicket() {
    if (!this.selected || !this.reply.trim() || this.saving) return;
    this.saving = true;
    this.api.post_private('v1/dairy/admin/support/tickets/' + this.selected._id + '/replies', { message: this.reply.trim() }).subscribe({
      next: (response: any) => { this.saving = false; this.reply = ''; this.selected = response?.ticket ?? this.selected; this.select(this.selected); this.load(); },
      error: (error: any) => { this.saving = false; this.util.handleError(error, 'admin'); },
    });
  }

  saveTicket() {
    if (!this.selected || this.saving) return;
    this.saving = true;
    this.api.patch_private('v1/dairy/admin/support/tickets/' + this.selected._id, { status: this.status, priority: this.priority }).subscribe({
      next: (response: any) => { this.saving = false; this.selected = response?.ticket ?? this.selected; this.load(); },
      error: (error: any) => { this.saving = false; this.util.handleError(error, 'admin'); },
    });
  }

  previous() { if (this.page > 1) { this.page--; this.load(); } }
  next() { if (this.page * this.limit < this.totalResults) { this.page++; this.load(); } }
}
