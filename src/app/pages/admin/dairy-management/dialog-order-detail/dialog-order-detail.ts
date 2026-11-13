import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/** Read-only order detail for the operations console: items, money, history. */
@Component({
  selector: 'app-dialog-dairy-order-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './dialog-order-detail.html',
})
export class DialogOrderDetail {
  isLoaded: boolean = false;
  order: any;
  history: any[] = [];

  constructor(
    public api: ApiService,
    public util: UtilService,
    public dialogRef: MatDialogRef<DialogOrderDetail>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.api.get_private('v1/dairy/admin/orders/' + this.data.orderId).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        this.order = response.order;
        this.history = response.history || [];
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
