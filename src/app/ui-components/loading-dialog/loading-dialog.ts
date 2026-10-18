import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-loading-dialog',
  imports: [MatNativeDateModule, MaterialModule],
  templateUrl: './loading-dialog.html',
})
export class LoadingDialog {
  constructor(
    public dialogRef: MatDialogRef<LoadingDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
}
