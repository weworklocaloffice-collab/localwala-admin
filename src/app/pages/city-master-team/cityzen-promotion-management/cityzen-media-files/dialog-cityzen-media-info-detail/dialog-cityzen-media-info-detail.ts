import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-dialog-cityzen-media-info-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './dialog-cityzen-media-info-detail.html',
})
export class DialogCityzenMediaInfoDetail {

  id: string = '';
  createdAt: string = '';
  path: string = '';
  userName: string = '';
  userId: string = '';
  userRole: string = '';
  userCover: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private clipboard: Clipboard,
    public dialogRef: MatDialogRef<DialogCityzenMediaInfoDetail>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.values) {
      const value = this.data.values;
      if (value && value.path && value.id && value.createdAt) {
        this.id = value.id;
        this.path = value.path;
        this.createdAt = DateTime.fromISO(value.createdAt).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
        if (value && value.userInfo && value.userInfo.id) {
          const user = value.userInfo;
          this.userId = user.id;
          this.userName = `${user.firstName} ${user.lastName}`;
          this.userCover = user.image;
          this.userRole = user.role;
        } else {
          this.userName = this.util.appTranslate('unknown');
        }
      }
    }
  }

  onDelete() {
    console.log('Delete');
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_media_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/cityzen/delete_media_files/' + this.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.dialogRef.close({ event: 'delete', data: response });
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'cityzen');
          }
        });
      }
    });
  }

  copyClipboard() {
    console.log('copyClipboard');
    this.clipboard.copy(this.path);
    this.util.onSuccess('ts_copied_to_clipboard');
  }

}
