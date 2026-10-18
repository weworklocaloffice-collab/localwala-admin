import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { CoreService } from 'src/app/services/core.service';
import { AppSettings } from 'src/app/config';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { navItems } from './vertical/sidebar/sidebar-data';
import { NavService } from '../../services/nav.service';
import { AppNavItemVendorComponent } from './vertical/sidebar/nav-item/nav-item.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { VendorSidebarComponent } from './vertical/sidebar/sidebar.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { VendorHeaderComponent } from './vertical/header/header.component';
import { UtilService } from 'src/app/services/util-service';
import { environment } from 'src/environments/environment';
import { DateTime } from 'luxon';
import { NavItem } from './vertical/sidebar/nav-item/nav-item';

const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';
const MONITOR_VIEW = 'screen and (min-width: 1024px)';
const BELOWMONITOR = 'screen and (max-width: 1023px)';

@Component({
  selector: 'vendor-full',
  imports: [
    RouterModule,
    AppNavItemVendorComponent,
    MaterialModule,
    CommonModule,
    VendorSidebarComponent,
    NgScrollbarModule,
    VendorHeaderComponent,
  ],
  templateUrl: './vendor.component.html',
  styleUrls: [],
  encapsulation: ViewEncapsulation.None
})
export class VendorComponent implements OnInit {
  navItems = navItems;

  @ViewChild('leftsidenav')
  public sidenav: MatSidenav;
  resView = false;
  @ViewChild('content', { static: true }) content!: MatSidenavContent;
  //get options from service
  options = this.settings.getOptions();
  private layoutChangesSubscription = Subscription.EMPTY;
  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private htmlElement!: HTMLHtmlElement;

  get isOver(): boolean {
    return this.isMobileScreen;
  }

  get isTablet(): boolean {
    return this.resView;
  }

  sideMenuItems: NavItem[] = [];

  appName: string = '';
  appVersion: string = '';
  currentYear: string = '';

  constructor(
    private settings: CoreService,
    private mediaMatcher: MediaMatcher,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private navService: NavService,
    public util: UtilService
  ) {
    this.appName = environment.appName;
    this.appVersion = environment.version;
    this.currentYear = DateTime.now().setLocale(this.util.appLocaleName()).toFormat('yyyy')

    const _vendorPOS = this.util.getItem('_vendorPOS');
    const _vendorOwnDriver = this.util.getItem('_vendorOwnDriver');
    const _vendorMultiOutlet = this.util.getItem('_vendorMultiOutlet');
    const _vendorPreBooking = this.util.getItem('_vendorPreBooking');
    const _vendorTableOrder = this.util.getItem('_vendorTableOrder');
    const _vendorTiffinSubscription = this.util.getItem('_vendorTiffinSubscription');
    const _vendorOwnWaiter = this.util.getItem('_vendorOwnWaiter');
    const _vendorOwnKitchen = this.util.getItem('_vendorOwnKitchen');
    const _authRole = localStorage.getItem('_authRole');

    navItems.forEach(element => {
      if (!element.isPrivate) {
        this.sideMenuItems.push(element);
      } else if (_vendorPOS == 'true' && element.key == 'pos' && element.isPrivate == true) {
        this.sideMenuItems.push(element);
      } else if (_vendorTableOrder == 'true' && element.key == 'tableOrder' && element.isPrivate == true) {
        this.sideMenuItems.push(element);
      } else if (_vendorOwnWaiter == 'true' && element.key == 'waiter' && element.isPrivate == true) {
        this.sideMenuItems.push(element);
      } else if (_vendorOwnKitchen == 'true' && element.key == 'kitchen' && element.isPrivate == true) {
        this.sideMenuItems.push(element);
      } else if (_vendorPreBooking == 'true' && element.key == 'preBooking' && element.isPrivate == true) {
        this.sideMenuItems.push(element);
      } else if (_vendorMultiOutlet == 'true' && element.key == 'multiOutlet' && element.isPrivate == true && _authRole == 'vendor') {
        this.sideMenuItems.push(element);
      } else if (_vendorOwnDriver == 'true' && element.key == 'ownDriver' && element.isPrivate == true) {
        this.sideMenuItems.push(element);
      } else if (_vendorTiffinSubscription == 'true' && element.key == 'tiffin' && element.isPrivate == true) {
        this.sideMenuItems.push(element);
      }
    });

    this.htmlElement = document.querySelector('html')!;
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW, MONITOR_VIEW, BELOWMONITOR])
      .subscribe((state) => {
        // SidenavOpened must be reset true when layout changes
        this.options.sidenavOpened = true;
        this.isMobileScreen = state.breakpoints[BELOWMONITOR];
        if (this.options.sidenavCollapsed == false) {
          this.options.sidenavCollapsed = state.breakpoints[TABLET_VIEW];
        }
        this.isContentWidthFixed = state.breakpoints[MONITOR_VIEW];
        this.resView = state.breakpoints[BELOWMONITOR];
      });

    // Initialize project theme with options
    this.receiveOptions(this.options);

    // This is for scroll to top
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((e) => {
        this.content.scrollTo({ top: 0 });
      });
  }

  ngOnInit(): void { }

  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
  }

  toggleCollapsed() {
    this.isContentWidthFixed = false;
    this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
    this.resetCollapsedState();
  }

  resetCollapsedState(timer = 400) {
    setTimeout(() => this.settings.setOptions(this.options), timer);
  }

  onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }

  onSidenavOpenedChange(isOpened: boolean) {
    this.isCollapsedWidthFixed = !this.isOver;
    this.options.sidenavOpened = isOpened;
    this.settings.setOptions(this.options);
  }

  receiveOptions(options: AppSettings): void {
    // this.options = options;
    this.toggleDarkTheme(options);
    this.toggleColorsTheme(options);
  }

  toggleDarkTheme(options: AppSettings) {
    if (options.theme === 'dark') {
      this.htmlElement.classList.add('dark-theme');
      this.htmlElement.classList.remove('light-theme');
      this.util.setItem('_appTheme', 'dark');
    } else {
      this.htmlElement.classList.remove('dark-theme');
      this.htmlElement.classList.add('light-theme');
      this.util.setItem('_appTheme', 'light');
    }
  }

  toggleColorsTheme(options: AppSettings) {
    // Remove any existing theme class dynamically
    this.htmlElement.classList.forEach((className) => {
      if (className.endsWith('_theme')) {
        this.htmlElement.classList.remove(className);
      }
    });

    // Add the selected theme class
    this.htmlElement.classList.add(options.activeTheme);
  }
}
