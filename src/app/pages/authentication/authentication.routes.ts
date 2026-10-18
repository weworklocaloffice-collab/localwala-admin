import { Routes } from '@angular/router';
import { AppErrorComponent } from './error/error.component';
import { AppMaintenanceComponent } from './maintenance/maintenance.component';
import { AdminLogin } from './admin-login/admin-login';
import { setupGuard } from 'src/app/guard/setup-guard';
import { AccountantLogin } from './accountant-login/accountant-login';
import { SupportTeamLogin } from './support-team-login/support-team-login';
import { CityMasterLogin } from './city-master-login/city-master-login';
import { VendorLogin } from './vendor-login/vendor-login';
import { BankLogin } from './bank-login/bank-login';
import { AuthRoleForgotPassword } from './auth-role-forgot-password/auth-role-forgot-password';
import { VendorForgotPassword } from './vendor-forgot-password/vendor-forgot-password';
import { Register } from './register/register';
import { registerGuard } from 'src/app/guard/register-guard';
import { WebSmsVerification } from './web-sms-verification/web-sms-verification';
import { WebSmsResetPasswordVerification } from './web-sms-reset-password-verification/web-sms-reset-password-verification';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'error',
        component: AppErrorComponent,
        data: {
          title: 'error'
        }
      },
      {
        path: 'maintenance',
        component: AppMaintenanceComponent,
        data: {
          title: 'maintenance'
        }
      },
      {
        path: 'admin',
        component: AdminLogin,
        canActivate: [setupGuard],
        data: {
          title: 'admin_login'
        }
      },
      {
        path: 'accountant',
        component: AccountantLogin,
        data: {
          title: 'accountant_team_login'
        }
      },
      {
        path: 'support',
        component: SupportTeamLogin,
        data: {
          title: 'support_team_login'
        }
      },
      {
        path: 'cityzen',
        component: CityMasterLogin,
        data: {
          title: 'city_master_login'
        }
      },
      {
        path: 'vendor',
        component: VendorLogin,
        data: {
          title: 'vendor_login'
        }
      },
      {
        path: 'bank',
        component: BankLogin,
        data: {
          title: 'bank_login'
        }
      },
      {
        path: 'reset-auth-role-password/:role',
        component: AuthRoleForgotPassword,
        data: {
          title: 'reset_auth_account_password'
        }
      },
      {
        path: 'reset-vendor-password',
        component: VendorForgotPassword,
        data: {
          title: 'reset_vendor_account_password'
        }
      },
      {
        path: 'register',
        component: Register,
        canActivate: [registerGuard],
        data: {
          title: 'setup_admin_account_btn'
        }
      },
      {
        path: 'web-sms-verification/:id',
        component: WebSmsVerification,
        data: {
          title: 'verification'
        }
      },
      {
        path: 'web-sms-reset-password-verification/:id',
        component: WebSmsResetPasswordVerification,
        data: {
          title: 'verification'
        }
      },
    ],
  },
];
