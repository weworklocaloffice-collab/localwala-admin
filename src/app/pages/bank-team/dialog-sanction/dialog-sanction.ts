import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilService } from 'src/app/services/util-service';

/**
 * Sanction dialog (BR-10). The bank enters the sanctioned amount —
 * defaulted to the requested amount, editable down. The POST happens
 * in the caller so this dialog stays a pure input surface.
 */
@Component({
  selector: 'app-dialog-sanction',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-sanction.html',
})
export class DialogSanction {
  sanctionedAmount: number | null = null;

  constructor(
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogSanction>,
    @Inject(MAT_DIALOG_DATA) public data: { requestedAmount: number },
  ) {
    this.sanctionedAmount = data?.requestedAmount ?? null;
  }

  onClose() {
    this.dialogRef.close();
  }

  onConfirm() {
    if (this.sanctionedAmount === null) return;
    this.dialogRef.close({ event: 'confirmed', sanctionedAmount: this.sanctionedAmount });
  }
}
