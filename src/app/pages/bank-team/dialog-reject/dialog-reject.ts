import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { UtilService } from 'src/app/services/util-service';

/**
 * Reject dialog (BR-10). A rejection without a reason is unanswerable
 * in support — the reason is required and stored on the application.
 */
@Component({
  selector: 'app-dialog-reject',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-reject.html',
})
export class DialogReject {
  rejectionReason: string = '';

  constructor(
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogReject>,
  ) {}

  onClose() {
    this.dialogRef.close();
  }

  onConfirm() {
    if (!this.rejectionReason.trim()) return;
    this.dialogRef.close({ event: 'confirmed', rejectionReason: this.rejectionReason.trim() });
  }
}
