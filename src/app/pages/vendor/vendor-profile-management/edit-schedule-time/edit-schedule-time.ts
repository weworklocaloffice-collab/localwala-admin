import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VendorScheduleListInterface } from 'src/app/interfaces/vendor.schedule.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogScheduleTime } from './dialog-schedule-time/dialog-schedule-time';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-edit-schedule-time',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './edit-schedule-time.html',
})
export class EditScheduleTime {

  slots: VendorScheduleListInterface[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
  ) {
    this.getSlot();
  }

  getSlot() {
    const spinnerRef = this.util.start();
    this.api.get_private('v1/vendor_web/getMySlots/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.slots && response.slots.length) {
          console.log(response.slots);
          this.slots = response.slots;
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  getDayName(dayNumber: number) {
    const dayNames = [this.util.appTranslate('dd_monday'), this.util.appTranslate('dd_tuesday'), this.util.appTranslate('dd_wednesday'), this.util.appTranslate('dd_thursday'), this.util.appTranslate('dd_friday'), this.util.appTranslate('dd_saturday'), this.util.appTranslate('dd_sunday')];
    return dayNames[dayNumber];
  }

  onSubmit() {
    console.log('Submit---');
    const spinnerRef = this.util.start();
    this.api.patch_private('v1/vendor_web/updateMySlotsWeb/' + this.util.getItem('_vendorId'), { "slots": JSON.stringify(this.slots) }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onAddItem(dayNumber: number) {
    const dialogRef = this.dialog.open(DialogScheduleTime, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'success') {
        console.log(result.data);
        const startTime = result.data.startTime;
        const endTime = result.data.endTime;
        console.log(startTime);
        console.log(endTime);
        const start = this.convertTo12HourFormat(startTime);
        const end = this.convertTo12HourFormat(endTime);
        console.log(`start ${start}`);
        console.log(`end ${end}`);
        const indexOfExisting = this.slots[dayNumber].times.findIndex((x) => x.start == start && x.end == end);
        console.log(indexOfExisting);
        if (indexOfExisting == -1) {
          console.log('add now');
          const param = {
            "start": start,
            "end": end
          };
          this.slots[dayNumber].times.push(param);
        } else {
          console.log('already exist');
          this.util.onError('ts_slot_already_existed', '');
        }
      }
    });
  }

  convertTo12HourFormat(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const convertedHours = hours % 12 || 12; // convert 0 hours to 12
    const formattedTime = `${this.padZero(convertedHours)}:${this.padZero(minutes)} ${period}`;
    return formattedTime;
  }

  padZero(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  onDelete(dayNumber: number, slotNumber: number) {
    console.log(`dayNumber ${dayNumber}`);
    console.log(`slotNumber ${slotNumber}`);
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_slot_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        const startTime = this.slots[dayNumber].times[slotNumber].start;
        const endTime = this.slots[dayNumber].times[slotNumber].end;
        console.log(startTime);
        console.log(endTime);
        this.slots[dayNumber].times = this.slots[dayNumber].times.filter((x) => x.start != startTime && x.end != endTime);
      }
    });
  }

  onEdit(dayNumber: number, slotNumber: number) {
    console.log('on Edit');
    console.log(`dayNumber ${dayNumber}`);
    console.log(`slotNumber ${slotNumber}`);
    const param = {
      "start": this.slots[dayNumber].times[slotNumber].start,
      "end": this.slots[dayNumber].times[slotNumber].end,
    };
    const dialogRef = this.dialog.open(DialogScheduleTime, {
      data: { action: 'edit', values: param },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'success') {
        console.log(result.data);
        const startTime = result.data.startTime;
        const endTime = result.data.endTime;
        console.log(startTime);
        console.log(endTime);
        const start = this.convertTo12HourFormat(startTime);
        const end = this.convertTo12HourFormat(endTime);
        console.log(`start ${start}`);
        console.log(`end ${end}`);
        const indexOfExisting = this.slots[dayNumber].times.findIndex((x) => x.start == start && x.end == end);
        console.log(indexOfExisting);
        if (indexOfExisting == -1) {
          this.slots[dayNumber].times[slotNumber].start = start;
          this.slots[dayNumber].times[slotNumber].end = end;
        } else {
          console.log('already exist');
          this.util.onError('ts_slot_already_existed', '');
        }
      }
    });
  }

}
