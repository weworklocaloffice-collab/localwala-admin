import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-stores-customer-subscriptions',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './customer-subscriptions.html',
})
export class CustomerSubscriptions {
  rows: any[] = [];
  filteredRows: any[] = [];
  isLoaded = false;
  statusFilter = '';
  searchQuery = '';
  acting = '';

  constructor(private api: ApiService, public util: UtilService, private dialogRef: MatDialog) {}

  ngOnInit() { this.load(); }

  load() {
    this.isLoaded = false;
    let url = 'v1/admin/stores/customer-subscriptions?limit=50';
    if (this.statusFilter) url += '&status=' + this.statusFilter;
    this.api.get_private(url).subscribe({
      next: (r: any) => { this.rows = r && r.items ? r.items : []; this.filteredRows = this.rows; this.isLoaded = true; },
      error: (e: any) => { this.rows = []; this.isLoaded = true; this.util.handleError(e, 'admin'); },
    });
  }

  onSearch() {
    const q = (this.searchQuery || '').toLowerCase();
    this.filteredRows = q
      ? this.rows.filter((r: any) => JSON.stringify(r).toLowerCase().includes(q))
      : this.rows;
  }

  onStatusFilter() { this.load(); }

  pause(id: string) { this.transition(id, 'paused', 'Pause this subscription?'); }
  resume(id: string) { this.transition(id, 'scheduled', 'Resume this subscription?'); }
  cancel(id: string) { this.transition(id, 'cancelled', 'Cancel this subscription?'); }

  private transition(id: string, status: string, confirm: string) {
    const ref = this.dialogRef.open(ConfirmDialog, {
      data: { title: confirm, subTitle: 'This action cannot be undone.', okTitle: status, closeTitle: 'ts_cancel' },
    });
    ref.afterClosed().subscribe((result: any) => {
      if (result && result.action === 'confirm') this.doTransition(id, status);
    });
  }

  private doTransition(id: string, status: string) {
    this.acting = id;
    this.api.patch_private('v1/admin/stores/customer-subscriptions/' + id + '/' + status, {}).subscribe({
      next: () => { this.acting = ''; this.util.onSuccess('stores_done'); this.load(); },
      error: (e: any) => { this.acting = ''; this.util.handleError(e, 'admin'); },
    });
  }
}
