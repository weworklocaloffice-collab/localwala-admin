import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { map, Observable, startWith } from 'rxjs';
import { VendorBookingRejectionListInterface } from 'src/app/interfaces/vendor.booking.rejection.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-reject-table-booking-reason',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-reject-table-booking-reason.html',
})
export class DialogRejectTableBookingReason {

  rejectForm = new FormGroup({
    id: new FormControl('', [Validators.required]),
  });
  reasons: Observable<VendorBookingRejectionListInterface[]>;
  listOfReasons: VendorBookingRejectionListInterface[] = [];
  reasonCtrl = new FormControl('');
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogRejectTableBookingReason>,
  ) {
    this.getReason();
  }

  getReason() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/dining_booking/cancellation/restaurant/').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.reasons) {
          this.listOfReasons = response.reasons;
          this.reasons = this.reasonCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterReason(element) : this.listOfReasons.slice()))
          );
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  private _filterReason(value: any): VendorBookingRejectionListInterface[] {
    let filterValue: string;
    if (value && value.name) {
      filterValue = value.name;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfReasons.filter((element) =>
      this.getTranslatedReasonName(element).toLowerCase().includes(filterValue)
    );
  }

  get f() {
    return this.rejectForm.controls;
  }

  onSubmit() {
    this.isFormSubmit = true;
    if (this.rejectForm.valid) {
      console.log(this.rejectForm.controls['id'].value);
      this.dialogRef.close({ event: 'selected', data: this.rejectForm.controls['id'].value });
    }
  }

  onReasonSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.rejectForm.controls['id'].setValue(event.option.value);
    }
  }

  getTranslatedReasonName(item: VendorBookingRejectionListInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayReasonName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfReasons.find(item => item.id == id);
    return selected ? this.getTranslatedReasonName(selected) : '';
  };

}
