import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { AdminReelAnalytics } from 'src/app/interfaces/admin.reels.interface';

@Component({
  selector: 'app-dialog-reel-analytics',
  imports: [CommonModule, MaterialModule],
  templateUrl: './dialog-reel-analytics.html',
})
export class DialogReelAnalytics {

  stats: AdminReelAnalytics | null = null;
  isLoaded = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    public dialogRef: MatDialogRef<DialogReelAnalytics>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
  ) {
    this.load();
  }

  load() {
    this.api.get_private('v1/admin/reels/' + this.data.id + '/analytics').subscribe({
      next: (response: AdminReelAnalytics) => {
        this.isLoaded = true;
        this.stats = response;
      }, error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
        this.dialogRef.close();
      }
    });
  }

}
