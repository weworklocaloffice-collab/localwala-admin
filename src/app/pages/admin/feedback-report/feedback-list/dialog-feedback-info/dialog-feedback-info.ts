import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-feedback-info',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-feedback-info.html',
})
export class DialogFeedbackInfo {

  id: string = '';
  createdAt: string = '';
  shortDescription: string = '';
  userContact: string = '';
  userCountryCode: string = '';
  userEmail: string = '';
  userName: string = '';
  replyText: string = '';
  isFormSubmit: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogFeedbackInfo>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.data !== null && this.data.data.id != null && this.data.data.id != '') {
      this.id = this.data.data.id;
      this.createdAt = this.data.data.createdAt;
      this.shortDescription = this.data.data.shortDescription;
      this.userContact = this.data.data.userContact;
      this.userCountryCode = this.data.data.userCountryCode;
      this.userEmail = this.data.data.userEmail;
      this.userName = this.data.data.userName;
      console.log(this.id);
      console.log(this.createdAt);
      console.log(this.shortDescription);
      console.log(this.userContact);
      console.log(this.userCountryCode);
      console.log(this.userEmail);
      console.log(this.userName);
    }
  }

  onSubmit() {
    console.log(this.replyText);
    if (this.replyText != '') {
      this.isFormSubmit = true;
      const param = {
        id: this.id,
        email: this.userEmail,
        text: this.replyText,
      }
      this.api.patch_private('v1/admin/feedback/update/', param).subscribe({
        next: (response: any) => {
          console.log(response);
          this.isFormSubmit = false;
          this.util.onSuccess('ts_feedback_updated');
          this.dialogRef.close({ event: 'update', data: response });
        }, error: (error: any) => {
          console.log(error);
          this.isFormSubmit = false;
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

}
