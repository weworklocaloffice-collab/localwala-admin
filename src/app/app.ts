import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UtilService } from './services/util-service';
import { ApiService } from './services/api-service';
import { TranslateService } from '@ngx-translate/core';
import { CoreService } from './services/core.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('localwala-web-angular');
  private htmlElement!: HTMLHtmlElement;
  options = this.settings.getOptions();
  constructor(
    public util: UtilService,
    public api: ApiService,
    private translate: TranslateService,
    private settings: CoreService,
  ) {
    this.htmlElement = document.querySelector('html')!;
    let theme = this.util.getItem('_appTheme');
    console.log(`app component theme ${theme}`);
    if (!theme || theme == null || theme == '' || theme == 'null') {
      theme = 'light';
      this.util.setItem('_appTheme', 'light');
    }

    setTimeout(() => {
      if (theme == 'dark') {
        this.htmlElement.classList.add('dark-theme');
        this.htmlElement.classList.remove('light-theme');
      } else {
        this.htmlElement.classList.remove('dark-theme');
        this.htmlElement.classList.add('light-theme');
      }
    }, 300);

    this.getDefaultSettings();
  }

  getDefaultSettings() {
    this.api.get_private('v1/public/get_web_settings').subscribe({
      next: (response: any) => {
        let theme = this.util.getItem('_appTheme');
        if (!theme || theme == null || theme == '' || theme == 'null') {
          theme = 'light';
        }
        this.options.theme = theme;
        this.api.mediaUrl = response && response.imagePath != null && response.imagePath != 'none' ? response.imagePath : `${this.api.baseUrl}storage/`;
        this.util.locales = response.locales;
        this.util.businessSetting = response.settings;
if (response && response.settings && response.settings.companyName) {
           this.util.setItem('_companyName', response.settings.companyName);
         } else {
           this.util.setItem('_companyName', 'Localwala');
         }

if (response && response.settings && response.settings.email) {
           this.util.setItem('_contactEmail', response.settings.email);
         } else {
           this.util.setItem('_contactEmail', 'contact@localwala.com');
         }

        if (response && response.settings && response.settings.defaultCountryCode && response.settings.defaultCountryCode.dial_code) {
          this.util.setItem('_contactCountryCode', response.settings.defaultCountryCode.dial_code);
        } else {
          this.util.setItem('_contactCountryCode', '+1');
        }

        if (response && response.settings && response.settings.mobile) {
          this.util.setItem('_contactMobile', response.settings.mobile);
        } else {
          this.util.setItem('_contactMobile', '00000000');
        }

        if (response && response.settings && response.settings.address) {
          this.util.setItem('_contactAddress', response.settings.address);
        } else {
          this.util.setItem('_contactAddress', 'Address');
        }

        if (response && response.settings && response.settings.favicon) {
          let favIcon: HTMLLinkElement = document.querySelector('#appFavicon')!;
          favIcon.href = `${this.api.mediaUrl}/${response.settings.favicon}`;
        }
        if (response && response.settings && response.settings.currency && response.settings.currency.symbol) {
          this.util.setItem('_currencySymbol', response.settings.currency.symbol);
        }
        if (response && response.settings && response.settings.currencySide) {
          this.util.setItem('_currencySide', response.settings.currencySide);
        }

        if (response && response.settings && response.settings.logo) {
          this.util.setItem('_brand_logo', response.settings.logo);
        }

        if (response && response.vendor && response.vendor.restaurantLoginWith) {
          this.util.setItem('_restaurantLoginWith', response.vendor.restaurantLoginWith);
          this.util.setItem('_restaurantResetPasswordWith', response.vendor.restaurantResetPasswordWith);
        }

        if (response && response.user && response.user.userLoginWith) {
          this.util.setItem('_userLoginWith', response.user.userLoginWith);
          this.util.setItem('_userResetPasswordWith', response.user.userResetPasswordWith);
          this.util.setItem('_userSignUpVerification', response.user.signUpVerification);
        }

        if (response && response.locales && Array.isArray(response.locales) && response.locales.length > 0) {
          this.util.locales = response.locales;
          const defaultLocale = this.util.getItem('_appLocale');
          if (defaultLocale && defaultLocale != null && defaultLocale != '') {
            const savedLocaleIndex = this.util.locales.findIndex((x) => x.code == defaultLocale);
            if (savedLocaleIndex != -1) {
              this.options.dir = this.util.locales[savedLocaleIndex].direction == 'ltr' ? 'ltr' : 'rtl';
            }
            this.translate.use(defaultLocale);
          } else {
            const defaultAppLocaleIndex = this.util.locales.findIndex((x) => x.isDefault == true);
            if (defaultAppLocaleIndex != -1) {
              this.util.setItem('_appLocale', this.util.locales[defaultAppLocaleIndex].code);
              this.options.dir = this.util.locales[defaultAppLocaleIndex].direction == 'ltr' ? 'ltr' : 'rtl';
              this.translate.use(this.util.locales[defaultAppLocaleIndex].code);
            }
          }
        } else {
          this.util.setItem('_appLocale', 'en'); // Default Locale
          this.translate.use('en');
        }
        if (response && response.selfRegister) {
          if (response && response.selfRegister && (response.selfRegister.vendor == true || response.selfRegister.vendor == 'true')) {
            this.util.setItem('_restaurantSelfRegister', 'true');
          } else {
            this.util.setItem('_restaurantSelfRegister', 'false');
          }

          if (response && response.selfRegister && (response.selfRegister.driver == true || response.selfRegister.driver == 'true')) {
            this.util.setItem('_deliverymanSelfRegister', 'true');
          } else {
            this.util.setItem('_deliverymanSelfRegister', 'false');
          }

        } else {
          this.util.setItem('_restaurantSelfRegister', 'false');
          this.util.setItem('_deliverymanSelfRegister', 'false');
        }

        if (response && response.settings && response.settings.socialLinks) {
          const links = response.settings.socialLinks;
          const appstore = links && links.appstore ? links.appstore : '#';
          const facebook = links && links.facebook ? links.facebook : '#';
          const instagram = links && links.instagram ? links.instagram : '#';
          const linked = links && links.linked ? links.linked : '#';
          const pinterest = links && links.pinterest ? links.pinterest : '#';
          const playstore = links && links.playstore ? links.playstore : '#';
          const vimeo = links && links.vimeo ? links.vimeo : '#';
          const x = links && links.x ? links.x : '#';
          const youtube = links && links.youtube ? links.youtube : '#';
          this.util.setItem('_appstore', appstore);
          this.util.setItem('_facebook', facebook);
          this.util.setItem('_instagram', instagram);
          this.util.setItem('_linked', linked);
          this.util.setItem('_pinterest', pinterest);
          this.util.setItem('_playstore', playstore);
          this.util.setItem('_vimeo', vimeo);
          this.util.setItem('_x', x);
          this.util.setItem('_youtube', youtube);
        }

        setTimeout(() => {
          console.log('OOKK');
          this.settings.setOptions(this.options);
        }, 300);

      }, error: (error: any) => {
        this.util.locales = [];
        console.log(error);
      }
    });
  }
}
