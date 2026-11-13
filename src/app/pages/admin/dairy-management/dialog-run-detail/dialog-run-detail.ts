import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/** Read-only run detail for the operations console: the ordered stop sheet. */
@Component({
  selector: 'app-dialog-dairy-run-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './dialog-run-detail.html',
})
export class DialogRunDetail {
  isLoaded: boolean = false;
  run: any;
  stops: any[] = [];

  constructor(
    public api: ApiService,
    public util: UtilService,
    public dialogRef: MatDialogRef<DialogRunDetail>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.api.get_private('v1/dairy/admin/runs/' + this.data.runId).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        this.run = response.run;
        this.stops = response.stops || [];
      },
      error: () => {
        this.isLoaded = true;
      },
    });
  }

  close() {
    this.dialogRef.close();
  }
}
