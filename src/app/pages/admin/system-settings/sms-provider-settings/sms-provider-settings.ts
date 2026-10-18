import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { FirebaseSmsProvider } from "./providers/firebase-sms-provider/firebase-sms-provider";
import { TwilioSmsProvider } from "./providers/twilio-sms-provider/twilio-sms-provider";
import { Msg91SmsProvider } from "./providers/msg91-sms-provider/msg91-sms-provider";
import { NexmoSmsProvider } from "./providers/nexmo-sms-provider/nexmo-sms-provider";
import { SmsDotToSmsProvider } from "./providers/sms-dot-to-sms-provider/sms-dot-to-sms-provider";
import { TwoFactorSmsProvider } from "./providers/two-factor-sms-provider/two-factor-sms-provider";
import { Fast2smsSmsProvider } from "./providers/fast2sms-sms-provider/fast2sms-sms-provider";

@Component({
  selector: 'app-sms-provider-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, FirebaseSmsProvider, TwilioSmsProvider, Msg91SmsProvider, NexmoSmsProvider, SmsDotToSmsProvider, TwoFactorSmsProvider, Fast2smsSmsProvider],
  templateUrl: './sms-provider-settings.html',
})
export class SmsProviderSettings {

  tabIndex: number = 0;

  constructor(public util: UtilService) { }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
