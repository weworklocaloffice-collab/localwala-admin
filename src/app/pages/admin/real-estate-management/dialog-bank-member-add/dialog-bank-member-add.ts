import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-bank-member-add',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-bank-member-add.html',
})
export class DialogBankMemberAdd {
  user: string = '';
  designation: string = '';
  isSaving: boolean = false;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogBankMemberAdd>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  onClose() {
    this.dialogRef.close();
  }

  /**
   * Links an existing role-'bank' user as an officer of this bank.
   * The user id must belong to a user created in role management
   * with role 'bank' — the server resolves the bank from the token,
   * never from the client.
   */
  onSubmit() {
    if (!this.user) return;
    this.isSaving = true;
    this.api
      .post_private(`v1/realestate/admin/banks/${this.data.bank._id}/members`, {
        user: this.user,
        designation: this.designation,
      })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.dialogRef.close({ event: 'added' });
        },
        error: (error: any) => {
          this.isSaving = false;
          this.util.handleError(error, 'admin');
        },
      });
  }
}
