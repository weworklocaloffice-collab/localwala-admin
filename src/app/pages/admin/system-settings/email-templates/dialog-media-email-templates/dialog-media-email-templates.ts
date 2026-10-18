import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-media-email-templates',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-media-email-templates.html',
})
export class DialogMediaEmailTemplates {

  appstore: string = '';
  facebook: string = '';
  instagram: string = '';
  linkedin: string = '';
  pinterest: string = '';
  playstore: string = '';
  twitter: string = '';
  vimeo: string = '';
  youtube: string = '';

  accountBlocked: string = '';
  approved: string = '';
  gratitude: string = '';
  orderSummary: string = '';
  refundRequest: string = '';
  rejected: string = '';
  restaurantAccountBlocked: string = '';
  subscriptionExpireSoon: string = '';
  supportChatExport: string = '';
  userVerification: string = '';

  isSubmit: boolean = false;
  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogMediaEmailTemplates>,
  ) {
    this.getSavedMedia();
  }

  getSavedMedia() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/email_config/media_list').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.mediaUrls) {
          const mediaUrls = response.mediaUrls;
          console.log(mediaUrls);
          this.accountBlocked = mediaUrls.accountBlocked;
          this.approved = mediaUrls.approved;
          this.appstore = mediaUrls.appstore;
          this.facebook = mediaUrls.facebook;
          this.gratitude = mediaUrls.gratitude;
          this.instagram = mediaUrls.instagram;
          this.linkedin = mediaUrls.linkedin;
          this.orderSummary = mediaUrls.orderSummary;
          this.pinterest = mediaUrls.pinterest;
          this.playstore = mediaUrls.playstore;
          this.refundRequest = mediaUrls.refundRequest;
          this.rejected = mediaUrls.rejected;
          this.restaurantAccountBlocked = mediaUrls.restaurantAccountBlocked;
          this.subscriptionExpireSoon = mediaUrls.subscriptionExpireSoon;
          this.supportChatExport = mediaUrls.supportChatExport;
          this.twitter = mediaUrls.twitter;
          this.userVerification = mediaUrls.userVerification;
          this.vimeo = mediaUrls.vimeo;
          this.youtube = mediaUrls.youtube;
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onImagePicker(iconName: string) {
    console.log(iconName);
    const dialogRef = this.dialog.open(SelectMediaDialog, {
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      height: "calc(100% - 30px)",
      width: "calc(100% - 30px)",
      maxWidth: "100%",
      maxHeight: "100%",
      panelClass: 'full-width-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event && result.event == 'select' && result.data && result.data != '') {
        if (iconName == 'appstore') {
          this.appstore = result.data;
        } else if (iconName == 'facebook') {
          this.facebook = result.data;
        } else if (iconName == 'instagram') {
          this.instagram = result.data;
        } else if (iconName == 'linkedin') {
          this.linkedin = result.data;
        } else if (iconName == 'pinterest') {
          this.pinterest = result.data;
        } else if (iconName == 'playstore') {
          this.playstore = result.data;
        } else if (iconName == 'twitter') {
          this.twitter = result.data;
        } else if (iconName == 'vimeo') {
          this.vimeo = result.data;
        } else if (iconName == 'youtube') {
          this.youtube = result.data;
        } else if (iconName == 'accountBlocked') {
          this.accountBlocked = result.data;
        } else if (iconName == 'approved') {
          this.approved = result.data;
        } else if (iconName == 'gratitude') {
          this.gratitude = result.data;
        } else if (iconName == 'orderSummary') {
          this.orderSummary = result.data;
        } else if (iconName == 'refundRequest') {
          this.refundRequest = result.data;
        } else if (iconName == 'rejected') {
          this.rejected = result.data;
        } else if (iconName == 'restaurantAccountBlocked') {
          this.restaurantAccountBlocked = result.data;
        } else if (iconName == 'subscriptionExpireSoon') {
          this.subscriptionExpireSoon = result.data;
        } else if (iconName == 'supportChatExport') {
          this.supportChatExport = result.data;
        } else if (iconName == 'userVerification') {
          this.userVerification = result.data;
        }
      }
    });

  }

  onSave() {
    const mediaUrl = {
      appstore: this.appstore,
      facebook: this.facebook,
      instagram: this.instagram,
      linkedin: this.linkedin,
      pinterest: this.pinterest,
      playstore: this.playstore,
      twitter: this.twitter,
      vimeo: this.vimeo,
      youtube: this.youtube,
      accountBlocked: this.accountBlocked,
      approved: this.approved,
      gratitude: this.gratitude,
      orderSummary: this.orderSummary,
      refundRequest: this.refundRequest,
      rejected: this.rejected,
      restaurantAccountBlocked: this.restaurantAccountBlocked,
      subscriptionExpireSoon: this.subscriptionExpireSoon,
      supportChatExport: this.supportChatExport,
      userVerification: this.userVerification,
    };
    console.log(mediaUrl);
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/admin/email_config/update_email_media/', { mediaUrls: mediaUrl }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_setting_updated');
        this.dialogRef.close({ event: 'update' });
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

}
