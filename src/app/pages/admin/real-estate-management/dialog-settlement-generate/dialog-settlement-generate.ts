import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

export const PARTY_TYPES: string[] = ['VENDOR', 'EXECUTIVE', 'REFERRER', 'BANK', 'LOCALWALA'];

@Component({
  selector: 'app-dialog-settlement-generate',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-settlement-generate.html',
})
export class DialogSettlementGenerate {
  partyType: string = 'VENDOR';
  entryIdsRaw: string = '';
  tdsPercent: number | null = 0;
  partyTypes = PARTY_TYPES;
  isSaving: boolean = false;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogSettlementGenerate>,
  ) {}

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    const entryIds = this.entryIdsRaw
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (!entryIds.length) {
      return;
    }
    this.isSaving = true;
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    this.api
      .post_private('v1/realestate/admin/settlements/generate', {
        partyType: this.partyType,
        periodFrom: from.toISOString(),
        periodTo: now.toISOString(),
        entryIds: entryIds,
        tdsPercent: this.tdsPercent || 0,
      })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.dialogRef.close({ event: 'generated' });
        },
        error: (error: any) => {
          this.isSaving = false;
          this.util.handleError(error, 'admin');
        },
      });
  }
}
