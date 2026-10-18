import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { UserBrandingComponent } from '../../vertical/sidebar/branding.component';
import { AppSettings } from 'src/app/config';
import { LanguagesListInterface } from 'src/app/interfaces/languages.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-user-horizontal-header',
  imports: [RouterModule, MaterialModule, UserBrandingComponent, NgIcon],
  templateUrl: './header.component.html'
})
export class AppHorizontalUserHeaderComponent {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  showFiller = false;

  @Output() optionsChange = new EventEmitter<AppSettings>();

  public usedLocale: string = '';
  public appLocale: LanguagesListInterface[] = [];
  public currentTheme: string = 'light';
  options = this.settings.getOptions();

  constructor(
    private settings: CoreService,
    private vsidenav: CoreService,
    public dialog: MatDialog,
    private translate: TranslateService,
    public api: ApiService,
    public util: UtilService,
    private router: Router,
  ) {
    this.appLocale = this.util.locales;
    let theme = this.util.getItem('_appTheme');
    if (!theme || theme == null || theme == '' || theme == 'null') {
      theme = 'light';
    }
    this.currentTheme = theme;
    this.options.theme = theme;
    if (this.util && this.util.locales && Array.isArray(this.util.locales) && this.util.locales.length > 0) {
      const defaultAppLocaleIndex = this.util.locales.findIndex((x) => x.isDefault == true);
      if (defaultAppLocaleIndex != -1) {
        this.usedLocale = this.util.locales[defaultAppLocaleIndex].image;
        this.options.dir = this.util.locales[defaultAppLocaleIndex].direction == 'ltr' ? 'ltr' : 'rtl';
      }

      const _appLocale = this.util.getItem('_appLocale');
      if (_appLocale && _appLocale != null && _appLocale != '' && _appLocale != 'null') {
        const savedLocaleIndex = this.util.locales.findIndex((x) => x.code == _appLocale);
        if (savedLocaleIndex != -1) {
          this.usedLocale = this.util.locales[savedLocaleIndex].image;
          this.options.dir = this.util.locales[savedLocaleIndex].direction == 'ltr' ? 'ltr' : 'rtl';
        }
      }
    }

    this.headerContent();
    setTimeout(() => {
      this.settings.setOptions(this.options);
    }, 300);

  }

  headerContent() {
    this.api.get_private('v1/public/customer_header_content').subscribe({
      next: (response: any) => {
        console.log(response);
        let theme = this.util.getItem('_appTheme');
        if (!theme || theme == null || theme == '' || theme == 'null') {
          theme = 'light';
        }
        this.options.theme = theme;
        if (response && response.success) {
          if (response && response.languages && Array.isArray(response.languages) && response.languages.length > 0) {
            this.appLocale = response.languages;
            this.util.locales = response.languages
            const defaultAppLocaleIndex = this.appLocale.findIndex((x) => x.isDefault == true);
            if (defaultAppLocaleIndex != -1) {
              this.usedLocale = this.appLocale[defaultAppLocaleIndex].image;
              this.options.dir = this.appLocale[defaultAppLocaleIndex].direction == 'ltr' ? 'ltr' : 'rtl';
            }

            const _appLocale = this.util.getItem('_appLocale');
            if (_appLocale && _appLocale != null && _appLocale != '' && _appLocale != 'null') {
              const savedLocaleIndex = this.util.locales.findIndex((x) => x.code == _appLocale);
              if (savedLocaleIndex != -1) {
                this.usedLocale = this.util.locales[savedLocaleIndex].image;
                this.options.dir = this.util.locales[savedLocaleIndex].direction == 'ltr' ? 'ltr' : 'rtl';
              }
            }
          }
        }
        setTimeout(() => {
          this.settings.setOptions(this.options);
        }, 300);
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'public');
      }
    });
  }

  private emitOptions() {
    this.optionsChange.emit(this.options);
  }

  setlightDark(newTheme: string) {
    const theme = this.util.getItem('_appTheme');
    if (theme && theme != null && theme != '' && theme != 'null' && theme == 'dark') {
      this.util.setItem('_appTheme', 'light');
      this.currentTheme = 'light';
    } else {
      this.util.setItem('_appTheme', 'dark');
      this.currentTheme = 'dark';
    }

    this.options.theme = newTheme;
    this.emitOptions();
  }

  changeLanguage(locale: LanguagesListInterface): void {
    this.util.setItem('_appLocale', locale.code);
    this.translate.use(locale.code);
    this.usedLocale = locale.image;
    let theme = this.util.getItem('_appTheme');
    if (!theme || theme == null || theme == '' || theme == 'null') {
      theme = 'light';
    }
    this.options.theme = theme;
    this.settings.setOptions(this.options);
    window.location.reload();
  }

  partnerButton(): boolean {
    const _restaurantSelfRegister = this.util.getItem('_restaurantSelfRegister');
    const _deliverymanSelfRegister = this.util.getItem('_deliverymanSelfRegister');
    if (_restaurantSelfRegister == 'true' || _deliverymanSelfRegister == 'true') {
      return true;
    }
    return false;
  }

  restaurantPartnerButton(): boolean {
    const _restaurantSelfRegister = this.util.getItem('_restaurantSelfRegister');
    if (_restaurantSelfRegister == 'true') {
      return true;
    }
    return false;
  }

  deliverymanPartnerButton(): boolean {
    const _deliverymanSelfRegister = this.util.getItem('_deliverymanSelfRegister');
    if (_deliverymanSelfRegister == 'true') {
      return true;
    }
    return false;
  }

  onNavigatePage(name: string) {
    this.router.navigate([name]);
  }
}
