import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmVerticalStatusDialog } from '../dialog-vertical-status/dialog-vertical-status';

export interface DairyVerticalInterface {
  _id: string;
  key: string;
  name: string;
  description: string;
  status: boolean;
  businessCount: number;
  statusChangedAt: string;
  statusReason: string;
}

@Component({
  selector: 'app-dairy-verticals',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './verticals.html',
})
export class Verticals {
  isLoaded: boolean = false;
  verticals: DairyVerticalInterface[] = [];
  displayedColumn: string[] = ['name', 'businessCount', 'status', 'lastChanged', 'action'];

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.getVerticals();
  }

  getVerticals() {
    this.api.get_private('v1/dairy/admin/verticals').subscribe({
      next: (response: any) => {
        // Unlike the master-data lists in this panel, this endpoint wraps its
        // result in `{ verticals: [...] }` rather than returning a bare array.
        if (response && response.verticals) {
          this.verticals = response.verticals;
        }
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  /**
   * Whether dairy is currently taking new trading.
   *
   * Derived from the dairy row rather than kept as its own field, so the banner can
   * never disagree with the table it sits above.
   */
  get isTrading(): boolean {
    const dairy = this.verticals.find((v) => v.key === 'dairy');
    return dairy ? dairy.status === true : true;
  }

  /**
   * Flipping a vertical stops it taking new orders, plans and outlets.
   *
   * Turning it *off* asks for a reason first, because that is the direction that
   * affects every outlet on the platform and leaves a trail in the audit fields.
   * Turning it back on is a single click — the operator has usually just finished
   * dealing with whatever forced the halt, and making them re-confirm the fix
   * during an incident is friction in the wrong place.
   */
  onToggle(vertical: DairyVerticalInterface, checked: boolean) {
    if (!checked) {
      this.confirmHalt(vertical);
      return;
    }
    this.applyStatus(vertical, true, null);
  }

  private confirmHalt(vertical: DairyVerticalInterface) {
    const dialogRef = this.dialog.open(ConfirmVerticalStatusDialog, {
      data: {
        vertical: vertical,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.action == 'confirm') {
        this.applyStatus(vertical, false, result.reason);
      }
    });
  }

  private applyStatus(vertical: DairyVerticalInterface, status: boolean, reason: string | null) {
    const spinnerRef = this.util.start('ts_please_wait');
    const body: any = { status: status };
    if (reason) {
      body.reason = reason;
    }

    this.api.patch_private('v1/dairy/admin/verticals/' + vertical.key, body).subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        if (response && response.vertical) {
          this.util.onSuccess(status ? 'ts_vertical_enabled' : 'ts_vertical_halted');
          this.getVerticals();
        }
      },
      error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
        // Re-read the truth: if the switch failed we must not leave the control
        // showing the state the operator just tried to set.
        this.getVerticals();
      },
    });
  }
}
