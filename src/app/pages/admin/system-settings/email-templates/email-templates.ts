import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UtilService } from 'src/app/services/util-service';
import { DialogMediaEmailTemplates } from './dialog-media-email-templates/dialog-media-email-templates';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';
import { UserVerificationEmailTemplateForm } from "./user-verification-email-template-form/user-verification-email-template-form";
import { ResetPasswordEmailTemplateForm } from "./reset-password-email-template-form/reset-password-email-template-form";
import { OrderRefundRequestEmailTemplateForm } from "./order-refund-request-email-template-form/order-refund-request-email-template-form";
import { TiffinSubscriptionRefundRequestEmailTemplateForm } from "./tiffin-subscription-refund-request-email-template-form/tiffin-subscription-refund-request-email-template-form";
import { DiningBookingRefundRequestEmailTemplateForm } from "./dining-booking-refund-request-email-template-form/dining-booking-refund-request-email-template-form";
import { FeedbackThankYouForm } from "./feedback-thank-you-form/feedback-thank-you-form";
import { ReportEmergencyThankYouForm } from "./report-emergency-thank-you-form/report-emergency-thank-you-form";
import { OrderSummaryEmailTemplate } from "./order-summary-email-template/order-summary-email-template";
import { RestaurantApproveRequestEmailTemplate } from "./restaurant-approve-request-email-template/restaurant-approve-request-email-template";
import { RestaurantRejectRequestEmailTemplate } from "./restaurant-reject-request-email-template/restaurant-reject-request-email-template";
import { DeliverymanApproveRequestEmailTemplate } from "./deliveryman-approve-request-email-template/deliveryman-approve-request-email-template";
import { DeliverymanRejectRequestEmailTemplate } from "./deliveryman-reject-request-email-template/deliveryman-reject-request-email-template";
import { AccountBlockedEmailTemplate } from "./account-blocked-email-template/account-blocked-email-template";
import { RestaurantExpiredPackageBlockedEmailTemplate } from "./restaurant-expired-package-blocked-email-template/restaurant-expired-package-blocked-email-template";
import { RestaurantPackageExpiringSoon } from "./restaurant-package-expiring-soon/restaurant-package-expiring-soon";
import { SupportChatExportEmailTemplate } from "./support-chat-export-email-template/support-chat-export-email-template";

@Component({
  selector: 'app-email-templates',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgIcon,
    UserVerificationEmailTemplateForm,
    ResetPasswordEmailTemplateForm,
    OrderRefundRequestEmailTemplateForm,
    TiffinSubscriptionRefundRequestEmailTemplateForm,
    DiningBookingRefundRequestEmailTemplateForm,
    FeedbackThankYouForm, ReportEmergencyThankYouForm,
    OrderSummaryEmailTemplate,
    RestaurantApproveRequestEmailTemplate,
    RestaurantRejectRequestEmailTemplate,
    DeliverymanApproveRequestEmailTemplate,
    DeliverymanRejectRequestEmailTemplate,
    AccountBlockedEmailTemplate,
    RestaurantExpiredPackageBlockedEmailTemplate,
    RestaurantPackageExpiringSoon,
    SupportChatExportEmailTemplate
  ],
  templateUrl: './email-templates.html',
})
export class EmailTemplates {

  tabIndex: number = 0;

  constructor(
    public util: UtilService,
    private dialog: MatDialog,
  ) { }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    console.log('tabChangeEvent => ', tabChangeEvent);
    console.log('index => ', tabChangeEvent.index);
    this.tabIndex = tabChangeEvent.index;
  }

  onMediaDialog() {
    const dialogRef = this.dialog.open(DialogMediaEmailTemplates, {
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
      if (result && result.event && result.event == 'update') {
        console.log('Update---');
        window.location.reload();
      }
    });
  }

}
