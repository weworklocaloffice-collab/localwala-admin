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
import { AdminNotificationListInterface } from 'src/app/interfaces/admin.notification.list.interface';
import { AdminSupportChatListInterface } from 'src/app/interfaces/admin.support.chat.list.interface';
import { LanguagesListInterface } from 'src/app/interfaces/languages.list.interface';

interface profiledd {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

@Component({
  selector: 'app-header',
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
export class HeaderComponent {
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
  unreadMessages: number = 0;
  notifications: AdminNotificationListInterface[] = [];

  messages: AdminSupportChatListInterface[] = [];



  profiledd: profiledd[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-account.svg',
      title: 'my_profile',
      subtitle: 'account_settings',
      link: '/admin/system-settings/profile-setting',
    },
    {
      id: 2,
      img: '/assets/images/svgs/icon-inbox.svg',
      title: 'my_inbox',
      subtitle: 'messages_email',
      link: '/admin/customer-management/chat-list',
    },
    {
      id: 3,
      img: '/assets/images/svgs/icon-tasks.svg',
      title: 'notifications',
      subtitle: 'notification_alerts',
      link: '/admin/customer-management/notification-list',
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
    this.api.get_private('v1/admin/admin_header_content').subscribe({
      next: (response: any) => {
        console.log(response);
        if (response && response.success) {
          this.unreadMessages = response.unread;
          const mappedList = response.notifications.map(
            (item: AdminNotificationListInterface) => {
              let username: string = '';
              let userHelper: boolean = false;

              if (item && item.userHelper.toString() == 'true') {
                userHelper = true;
                username = item.username;
              }

              let restaurantName: string = '';
              let restaurantHelper: boolean = false;
              if (item && item.restaurantHelper.toString() == 'true') {
                restaurantHelper = true;
                if (item && item.restaurantName && item.restaurantName?.name) {
                  if (item.restaurantName?.translations) {
                    const translation = item.restaurantName.translations.find((t) => t.code == this.util.appLocaleName());
                    restaurantName = translation?.title || item.restaurantName.name;
                  } else {
                    restaurantName = item.restaurantName?.name;
                  }
                }
              }

              let time: string = '';
              let timeHelper: boolean = false;
              if (item && item.timeHelper.toString() == 'true') {
                timeHelper = true;
                time = item.time;
              }

              let driverName: string = '';
              let driverHelper: boolean = false;
              if (item && item.driverHelper.toString() == 'true') {
                driverHelper = true;
                driverName = item.driverName;
              }

              let reason: string = '';
              let reasonHelper: boolean = false;
              if (item && item.reasonHelper.toString() == 'true') {
                reasonHelper = true;
                reason = item.reason;
              }

              let amount: string = '';
              let amountHelper: boolean = false;
              if (item && item.amountHelper.toString() == 'true') {
                amountHelper = true;
                amount = item.amount.toString();
              }

              let packageName: string = '';
              let packageHelper: boolean = false;
              if (item && item.packageHelper.toString() == 'true') {
                packageHelper = true;
                if (item && item.packageName && item.packageName?.name) {
                  if (item.packageName?.translations) {
                    const translation = item.packageName.translations.find((t) => t.code == this.util.appLocaleName());
                    packageName = translation?.title || item.packageName.name;
                  } else {
                    packageName = item.packageName?.name;
                  }
                }
              }

              let kind: string = '';
              let kindHelper: boolean = false;
              if (item && item.kindHelper.toString() == 'true') {
                kindHelper = true;
                kind = item.kind;
              }

              let order: string = '';
              let orderHelper: boolean = false;
              if (item && item.orderHelper.toString() == 'true') {
                orderHelper = true;
                order = item.order;
              }

              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.title;
                item.displayContent = translation?.description || item.content;
              } else {
                item.displayName = item?.title || '';
                item.displayContent = item?.content || '';
              }

              if (userHelper) {
                item.displayName = item.displayName.replaceAll('{{user}}', username);
                item.displayContent = item.displayContent.replaceAll('{{user}}', username);
              }

              if (restaurantHelper) {
                item.displayName = item.displayName.replaceAll('{{restaurant}}', restaurantName);
                item.displayContent = item.displayContent.replaceAll('{{restaurant}}', restaurantName);
              }

              if (timeHelper) {
                item.displayName = item.displayName.replaceAll('{{time}}', time);
                item.displayContent = item.displayContent.replaceAll('{{time}}', time);
              }

              if (driverHelper) {
                item.displayName = item.displayName.replaceAll('{{driver}}', driverName);
                item.displayContent = item.displayContent.replaceAll('{{driver}}', driverName);
              }

              if (reasonHelper) {
                item.displayName = item.displayName.replaceAll('{{reason}}', reason);
                item.displayContent = item.displayContent.replaceAll('{{reason}}', reason);
              }

              if (amountHelper) {
                item.displayName = item.displayName.replaceAll('{{amount}}', amount);
                item.displayContent = item.displayContent.replaceAll('{{amount}}', amount);
              }

              if (packageHelper) {
                item.displayName = item.displayName.replaceAll('{{packageName}}', packageName);
                item.displayContent = item.displayContent.replaceAll('{{packageName}}', packageName);
              }

              if (kindHelper) {
                item.displayName = item.displayName.replaceAll('{{kind}}', kind);
                item.displayContent = item.displayContent.replaceAll('{{kind}}', kind);
              }

              if (orderHelper) {
                item.displayName = item.displayName.replaceAll('{{order}}', order);
                item.displayContent = item.displayContent.replaceAll('{{order}}', order);
              }

              return item;
            }
          );
          this.notifications = mappedList;
          this.messages = response.supportChat;
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
        this.util.handleError(error, 'admin');
      }
    });
  }

  onNotification() {
    console.log('Navigate');
    this.router.navigate(['/admin/customer-management/notification-list']);
  }

  onChatMessages() {
    console.log('Navigate');
    this.router.navigate(['/admin/customer-management/chat-list']);
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
        this.router.navigate(['/authentication/admin']);
      }, error: (error: any) => {
        console.log(error);
        this.util.clearItem();
        this.router.navigate(['/authentication/admin']);
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
  selector: 'search-dialog',
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
