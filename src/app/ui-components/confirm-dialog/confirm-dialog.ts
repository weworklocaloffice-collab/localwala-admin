import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilService } from 'src/app/services/util-service';
import { MaterialModule } from 'src/app/material.module';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [MaterialModule, MatNativeDateModule],
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  title: string = '';
  subTitle: string = '';
  okTitle: string = '';
  closeTitle: string = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialogRef<ConfirmDialog>,
    private util: UtilService
  ) {
    console.log(data);
    this.title = data && data.title ? this.util.appTranslate(data.title) : this.util.appTranslate('ts_are_you_sure');
    this.subTitle = data && data.subTitle ? this.util.appTranslate(data.subTitle) : this.util.appTranslate('ts_action_cannot_be_undone');
    this.okTitle = data && data.okTitle ? this.util.appTranslate(data.okTitle) : this.util.appTranslate('ts_ok');
    this.closeTitle = data && data.closeTitle ? this.util.appTranslate(data.closeTitle) : this.util.appTranslate('ts_cancel');
  }

  onActionButton(action: string) {
    this.dialog.close({ 'action': action });
  }
}
