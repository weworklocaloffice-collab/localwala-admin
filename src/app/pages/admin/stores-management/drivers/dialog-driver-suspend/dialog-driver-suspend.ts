/**
 * LocalWala – Local Commerce & Delivery Platform
 * (NodeJS, MongoDB, Angular & Flutter)
 *
 * Copyright © 2026 WeWorkLocal Private Limited
 * https://weworklocal.in/
 *
 * This source code is confidential.
 * Unauthorized copying, redistribution, resale, publication,
 * modification, or use of this source code in any public or
 * commercial repository is strictly prohibited.
 *
 * Ownership Fingerprint:
 * LWL|WWL|2026|LOCALWALA|NODE
 */

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilService } from 'src/app/services/util-service';

/**
 * Suspend reason dialog. The reason is optional backend-side but recorded
 * on the driver when given — a suspension without a recorded reason is a
 * dispute waiting to happen, so the field is offered, not hidden.
 */
@Component({
  selector: 'app-dialog-driver-suspend',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-driver-suspend.html',
})
export class DialogDriverSuspend {
  reason: string = '';

  constructor(
    public dialogRef: MatDialogRef<DialogDriverSuspend>,
    public util: UtilService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  confirm() {
    this.dialogRef.close({ event: 'suspend', reason: this.reason.trim() });
  }
}
