import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { VendorDiningScheduleInterface, Time } from 'src/app/interfaces/vendor.dining.schedule.interface';
import { DialogDiningSchedule } from './dialog-dining-schedule/dialog-dining-schedule';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-dining-schedule',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './dining-schedule.html',
})
export class DiningSchedule {

  slots: VendorDiningScheduleInterface[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
  ) {
    this.getSlot();
  }

  getSlot() {
    const spinnerRef = this.util.start();
    this.api.get_private('v1/vendor_web/restaurant_extra_detail/getMyDiningSchedule/' + this.util.getItem('_vendorId')).subscribe({
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
    console.log(this.slots);
    const spinnerRef = this.util.start();
    this.api.post_private('v1/vendor_web/restaurant_extra_detail/saveDiningScheduleWeb/' + this.util.getItem('_vendorId'), { "slots": JSON.stringify(this.slots) }).subscribe({
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
    const dialogRef = this.dialog.open(DialogDiningSchedule, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'success') {
        console.log(result.data);
        const type = result.data.type;
        const time = result.data.time;
        console.log(type);
        console.log(time);
        const selectedTime = this.convertTo12HourFormat(time);
        console.log(`type ${type}`);
        console.log(`selectedTime ${selectedTime}`);
        const indexOfExisting = this.slots[dayNumber].times.findIndex((x) => x.time == selectedTime && x.type == type);
        console.log(indexOfExisting);
        if (indexOfExisting == -1) {
          console.log('add now');
          const param = {
            "type": type,
            "time": selectedTime
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
        this.slots[dayNumber].times = this.slots[dayNumber].times.filter((_, index) => index !== slotNumber);
        this.slots = [...this.slots];
        console.log('Updated slots:', this.slots);
      }
    });
  }

  onEdit(dayNumber: number, slotNumber: number) {
    console.log('on Edit');
    console.log(`dayNumber ${dayNumber}`);
    console.log(`slotNumber ${slotNumber}`);
    const param = {
      "type": this.slots[dayNumber].times[slotNumber].type,
      "time": this.slots[dayNumber].times[slotNumber].time,
    };
    const dialogRef = this.dialog.open(DialogDiningSchedule, {
      data: { action: 'edit', values: param },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'success') {
        console.log(result.data);
        const type = result.data.type;
        const time = result.data.time;
        console.log(type);
        console.log(time);
        const selectedTime = this.convertTo12HourFormat(time);
        console.log(`start ${type}`);
        console.log(`end ${selectedTime}`);
        const indexOfExisting = this.slots[dayNumber].times.findIndex((x) => x.type == type && x.time == selectedTime);
        console.log(indexOfExisting);
        if (indexOfExisting == -1) {
          this.slots[dayNumber].times[slotNumber].type = type;
          this.slots[dayNumber].times[slotNumber].time = selectedTime;
        } else {
          console.log('already exist');
          this.util.onError('ts_slot_already_existed', '');
        }
      }
    });
  }

  getSlotsByType(times: Time[], type: string) {
    if (!times) return [];
    return times.filter(slot => slot.type === type);
  }
}
