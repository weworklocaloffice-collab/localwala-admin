import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-bank-create',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-bank-create.html',
})
export class DialogBankCreate {
  name: string = '';
  code: string = '';
  contactEmail: string = '';
  contactPhone: string = '';
  status: string = 'ACTIVE';
  statuses = ['ACTIVE', 'SUSPENDED', 'CLOSED'];
  isSaving: boolean = false;
  isEdit: boolean = false;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogBankCreate>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    // EDIT mode: `code` is the stable key and stays locked.
    this.isEdit = !!data;
    if (this.isEdit) {
      this.name = data.name || '';
      this.code = data.code || '';
      this.contactEmail = data.contactEmail || '';
      this.contactPhone = data.contactPhone || '';
      this.status = data.status || 'ACTIVE';
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (!this.name || !this.code) return;
    this.isSaving = true;
    const obs = this.isEdit
      ? this.api.patch_private(`v1/realestate/admin/banks/${this.data._id}`, {
          name: this.name,
          contactEmail: this.contactEmail,
          contactPhone: this.contactPhone,
          status: this.status,
        })
      : this.api.post_private('v1/realestate/admin/banks', {
          name: this.name,
          code: this.code,
          contactEmail: this.contactEmail,
          contactPhone: this.contactPhone,
        });
    obs.subscribe({
      next: () => {
        this.isSaving = false;
        this.dialogRef.close({ event: 'created' });
      },
      error: (error: any) => {
        this.isSaving = false;
        this.util.handleError(error, 'admin');
      },
    });
  }
}
