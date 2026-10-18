import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Officers of one bank. Lists `GET banks/:id/members` and moves the
 * lifecycle ACTIVE ↔ SUSPENDED → TERMINATED. Suspended/terminated
 * officers fail bank-auth, so `/auth/bank/login` rejects them.
 * Removal is a status, never a delete — the trail stays.
 */
@Component({
  selector: 'app-dialog-bank-members',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-bank-members.html',
})
export class DialogBankMembers {
  isLoaded: boolean = false;
  members: any[] = [];
  statuses = ['ACTIVE', 'SUSPENDED', 'TERMINATED'];

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogBankMembers>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.load();
  }

  get bankId(): string {
    return this.data?.bank?._id || this.data?.bank?.id || this.data?.bankId || '';
  }

  get bankName(): string {
    return this.data?.bank?.name || this.data?.bank?.code || '';
  }

  load() {
    this.isLoaded = false;
    this.api.get_private(`v1/realestate/admin/banks/${this.bankId}/members`).subscribe({
      next: (response: any) => {
        this.members = (response && response.results) || [];
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  memberName(m: any): string {
    const u = m.user || {};
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    return name || u.email || u.mobile || m.user;
  }

  onStatus(m: any, status: string) {
    this.api
      .patch_private(`v1/realestate/admin/banks/${this.bankId}/members/${m._id}`, { status })
      .subscribe({
        next: () => {
          this.util.onSuccess('ts_status_updated');
          this.load();
        },
        error: (error: any) => {
          this.util.handleError(error, 'admin');
        },
      });
  }

  onClose() {
    this.dialogRef.close();
  }
}
