import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-ls-campaign-review',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-ls-campaign-review.html',
})
export class DialogLsCampaignReview {
  isSubmit: boolean = false;

  form = new FormGroup({
    note: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogLsCampaignReview>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public util: UtilService,
    public api: ApiService,
  ) {}

  onConfirm() {
    if (this.isSubmit) return;
    this.isSubmit = true;
    const payload: any = { decision: this.data.decision, note: this.form.value.note || '' };
    this.api.patch_private('v1/local-services/admin/marketing/campaigns/' + this.data.row._id + '/review', payload).subscribe({
      next: (response: any) => {
        this.isSubmit = false;
        this.dialogRef.close({ event: 'update', data: response });
      },
      error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onCancel() {
    this.dialogRef.close({ event: 'cancel' });
  }
}
