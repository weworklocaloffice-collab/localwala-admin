import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilService } from 'src/app/services/util-service';

/**
 * Disburse dialog (BR-10). Defaults to the sanctioned amount; the bank
 * confirms the figure actually transferred. Only SANCTIONED
 * applications reach this dialog (the caller gates it).
 */
@Component({
  selector: 'app-dialog-disburse',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-disburse.html',
})
export class DialogDisburse {
  disbursedAmount: number | null = null;

  constructor(
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogDisburse>,
    @Inject(MAT_DIALOG_DATA) public data: { sanctionedAmount: number },
  ) {
    this.disbursedAmount = data?.sanctionedAmount ?? null;
  }

  onClose() {
    this.dialogRef.close();
  }

  onConfirm() {
    if (this.disbursedAmount === null) return;
    this.dialogRef.close({ event: 'confirmed', disbursedAmount: this.disbursedAmount });
  }
}
