import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { navItems } from '../sidebar/sidebar-data';
import { TranslateService } from '@ngx-translate/core';
import { NgIcon } from '@ng-icons/core';
import { MaterialModule } from 'src/app/material.module';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AppSettings } from 'src/app/config';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { LanguagesListInterface } from 'src/app/interfaces/languages.list.interface';

interface profiledd {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

@Component({
  selector: 'app-accountant-header',
  imports: [
    RouterModule,
    CommonModule,
    NgScrollbarModule,
    NgIcon,
    MaterialModule,
  ],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None
})
export class AccountantHeaderComponent {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  showFiller = false;

  public usedLocale: string = '';
  public appLocale: LanguagesListInterface[] = [];
  public currentTheme: string = 'light';
  userCoverImage: string = '';
  userName: string = '';
  userEmail: string = '';

  profiledd: profiledd[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-account.svg',
      title: 'my_profile',
      subtitle: 'account_settings',
      link: '/accountant-team/u/profile-setting',
    },
  ];

  options = this.settings.getOptions();
  @Output() optionsChange = new EventEmitter<AppSettings>();

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
    this.options.theme = this.currentTheme;
    this.emitOptions();
    this.userEmail = this.util.getItem('_authEmail');
    this.userName = `${this.util.getItem('_authFirstName')} ${this.util.getItem('_authLastName')}`;
    this.userCoverImage = this.util.getItem('_authCoverImage');
    if (this.util && this.util.locales && Array.isArray(this.util.locales) && this.util.locales.length > 0) {
      const defaultAppLocaleIndex = this.util.locales.findIndex((x) => x.isDefault == true);
      if (defaultAppLocaleIndex != -1) {
        this.usedLocale = this.util.locales[defaultAppLocaleIndex].image;
      }

      const _appLocale = this.util.getItem('_appLocale');
      if (_appLocale && _appLocale != null && _appLocale != '' && _appLocale != 'null') {
        const savedLocaleIndex = this.util.locales.findIndex((x) => x.code == _appLocale);
        if (savedLocaleIndex != -1) {
          this.usedLocale = this.util.locales[savedLocaleIndex].image;
        }
      }
    }
    this.headerContent();
  }

  headerContent() {
    this.api.get_private('v1/accountant/accountant_header_content').subscribe({
      next: (response: any) => {
        console.log(response);
        if (response && response.success) {
          if (response && response.locales && Array.isArray(response.locales) && response.locales.length > 0) {
            this.appLocale = response.locales;
            const defaultAppLocaleIndex = this.appLocale.findIndex((x) => x.isDefault == true);
            if (defaultAppLocaleIndex != -1) {
              this.usedLocale = this.appLocale[defaultAppLocaleIndex].image;
            }

            const _appLocale = this.util.getItem('_appLocale');
            if (_appLocale && _appLocale != null && _appLocale != '' && _appLocale != 'null') {
              const savedLocaleIndex = this.util.locales.findIndex((x) => x.code == _appLocale);
              if (savedLocaleIndex != -1) {
                this.usedLocale = this.util.locales[savedLocaleIndex].image;
              }
            }
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'accountant');
      }
    });
  }


  openDialog() {
    const dialogRef = this.dialog.open(AppSearchDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  onLogout() {
    console.log('on Logout');

    this.api.post_public('v1/auth/logout_web', {}).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.clearItem();
        this.router.navigate(['/authentication/accountant']);
      }, error: (error: any) => {
        console.log(error);
        this.util.clearItem();
        this.router.navigate(['/authentication/accountant']);
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
    console.log(locale);
    this.util.setItem('_appLocale', locale.code);
    this.translate.use(locale.code);
    this.usedLocale = locale.image;
    let theme = this.util.getItem('_appTheme');
    if (!theme || theme == null || theme == '' || theme == 'null') {
      theme = 'light';
    }
    this.options.theme = theme;
    this.options.dir = locale.direction == 'ltr' ? 'ltr' : 'rtl';
    this.settings.setOptions(this.options);
    window.location.reload();
  }


}

@Component({
  selector: 'search-accountant-dialog',
  imports: [
    RouterModule,
    MaterialModule,
    NgIcon,
    FormsModule,
  ],
  templateUrl: 'search-dialog.component.html'
})
export class AppSearchDialogComponent {
  searchText: string = '';
  navItems = navItems;

  navItemsData = navItems.filter((navitem) => navitem.displayName);

  constructor(public util: UtilService) {
    console.log('header vertical');
  }

  onSearch() {
    const search = this.searchText.toLowerCase().trim();
    this.navItemsData = this.navItems.filter(
      (item) =>
        item.displayName &&
        item.displayName.toLowerCase().includes(search)
    );
  }
}
