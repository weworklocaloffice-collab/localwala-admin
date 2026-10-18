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
import { AppNavItemSupportTeamComponent } from './vertical/sidebar/nav-item/nav-item.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { SupportTeamSidebarComponent } from './vertical/sidebar/sidebar.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { SupportTeamHeaderComponent } from './vertical/header/header.component';
import { UtilService } from 'src/app/services/util-service';
import { WebPushService } from 'src/app/services/web-push-service';
import { ApiService } from 'src/app/services/api-service';
import { environment } from 'src/environments/environment';
import { DateTime } from 'luxon';

const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';
const MONITOR_VIEW = 'screen and (min-width: 1024px)';
const BELOWMONITOR = 'screen and (max-width: 1023px)';

@Component({
  selector: 'support-team-full',
  imports: [
    RouterModule,
    AppNavItemSupportTeamComponent,
    MaterialModule,
    CommonModule,
    SupportTeamSidebarComponent,
    NgScrollbarModule,
    SupportTeamHeaderComponent,
  ],
  templateUrl: './support-team.component.html',
  styleUrls: [],
  encapsulation: ViewEncapsulation.None
})
export class SupportTeamComponent implements OnInit {
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

  appName: string = '';
  appVersion: string = '';
  currentYear: string = '';

  constructor(
    private settings: CoreService,
    private mediaMatcher: MediaMatcher,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private navService: NavService,
    public util: UtilService,
    private webPush: WebPushService,
    private api: ApiService
  ) {
    this.appName = environment.appName;
    this.appVersion = environment.version;
    this.currentYear = DateTime.now().setLocale(this.util.appLocaleName()).toFormat('yyyy')

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

  ngOnInit(): void {
    // Register this browser for web push (no-op until VAPID is configured).
    this.webPush.start().catch(() => {});
    // App-wide presence heartbeat: queue/thread beat only while open, so an
    // agent sitting on dashboard/history looked offline everywhere. One
    // heartbeat here covers the whole layout; pages keep their own room pins.
    this.beatPresence();
    this.presenceTimer = setInterval(() => this.beatPresence(), 30000);
  }

  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
    if (this.presenceTimer) clearInterval(this.presenceTimer);
  }

  private presenceTimer: any = null;
  private presenceFails = 0;
  connLost = false;

  private beatPresence() {
    this.api
      .post_private('v1/support_team/presence/heartbeat', { agent: this.util.getItem('_uid') || '' })
      .subscribe({
        next: () => {
          this.presenceFails = 0;
          this.connLost = false;
        },
        error: () => {
          // Three consecutive misses = the server is unreachable or the
          // session died. Surface it: silent presence death looks exactly
          // like an offline agent everywhere else.
          this.presenceFails += 1;
          if (this.presenceFails >= 3) this.connLost = true;
        },
      });
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
