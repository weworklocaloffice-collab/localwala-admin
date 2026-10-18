import { Routes } from '@angular/router';
import { SystemSettings } from './system-settings/system-settings';
import { AppWebSettings } from './app-web-settings/app-web-settings';
import { EmailConfigSettings } from './email-config-settings/email-config-settings';
import { EmailTemplates } from './email-templates/email-templates';
import { PaymentSettings } from './payment-settings/payment-settings';
import { AdminAccountSetting } from './admin-account-setting/admin-account-setting';

export const SystemSettingRoutes: Routes = [
  {
    path: '',
    component: SystemSettings,
    data: {
      title: 'system_settings'
    }
  },
  {
    path: 'app-web-settings',
    component: AppWebSettings,
    data: {
      title: 'app_web_settings'
    }
  },
  {
    path: 'email-config-settings',
    component: EmailConfigSettings,
    data: {
      title: 'email_config_settings'
    }
  },
  {
    path: 'email-templates',
    component: EmailTemplates,
    data: {
      title: 'email_templates'
    }
  },
  {
    path: 'payment-settings',
    component: PaymentSettings,
    data: {
      title: 'payment_settings'
    }
  },
  {
    path: 'profile-setting',
    component: AdminAccountSetting,
    data: {
      title: 'profile_setting'
    }
  }
];
