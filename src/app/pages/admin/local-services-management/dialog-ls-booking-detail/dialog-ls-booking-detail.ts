import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-ls-booking-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './dialog-ls-booking-detail.html',
})
export class DialogLsBookingDetail {
  isLoaded: boolean = false;
  booking: any = null;
  history: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<DialogLsBookingDetail>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.getDetail(data.id);
  }

  getDetail(id: string) {
    this.api.get_private('v1/local-services/admin/bookings/' + id).subscribe({
      next: (response: any) => {
        this.booking = response.booking;
        this.history = response.history || [];
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onClose() {
    this.dialogRef.close({ event: 'close' });
  }
}
