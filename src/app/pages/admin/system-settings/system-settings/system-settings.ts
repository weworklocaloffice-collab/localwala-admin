import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { AppWebSettings } from "../app-web-settings/app-web-settings";
import { EmailConfigSettings } from "../email-config-settings/email-config-settings";
import { LandingPageSettings } from "../landing-page-settings/landing-page-settings";
import { SmsProviderSettings } from "../sms-provider-settings/sms-provider-settings";

@Component({
  selector: 'app-system-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, AppWebSettings, EmailConfigSettings, LandingPageSettings, SmsProviderSettings],
  templateUrl: './system-settings.html',
})
export class SystemSettings {

  tabIndex: number = 0;

  constructor(public util: UtilService) { }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
