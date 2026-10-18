import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-reel-preview',
  imports: [CommonModule, MaterialModule],
  templateUrl: './dialog-reel-preview.html',
})
export class DialogReelPreview {

  videoUrl: string = '';
  status: string = '';
  isLoaded = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    public dialogRef: MatDialogRef<DialogReelPreview>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
  ) {
    this.load();
  }

  load() {
    this.api.post_private('v1/admin/reels/' + this.data.id + '/preview', {}).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        this.videoUrl = response.videoUrl || '';
        this.status = response.status || '';
      }, error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
        this.dialogRef.close();
      }
    });
  }

}
