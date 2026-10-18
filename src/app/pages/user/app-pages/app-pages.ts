import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-app-pages',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './app-pages.html',
})
export class AppPages implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  pageSlugs: string[] = [
    'about-us',
    'privacy-policy',
    'terms-and-conditions',
    'refund-policy',
    'shipping-policy',
    'cancellation-policy',
    'cookies',
    'help',
    'frequently-asked-questions',
    'dining-frequently-asked-questions'
  ];
  title: string = '';
  slug: string = '';
  description: string = '';
  isLoaded: boolean = false;

  safeDescription!: SafeHtml;
  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {

  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((params: ParamMap) => {
        const pageId = params.get('id');

        console.log('Current Page ID:', pageId);

        this.loadPageContent(pageId);
      });
  }

  loadPageContent(id: string | null): void {
    if (!id) return;

    this.slug = id;
    if (this.slug) {
      console.log(this.slug);
      if (this.pageSlugs.includes(this.slug)) {
        console.log('get page content');
        if (this.slug == 'about-us') {
          this.title = this.util.appTranslate('about_us');
        } else if (this.slug == 'privacy-policy') {
          this.title = this.util.appTranslate('privacy_policy');
        } else if (this.slug == 'terms-and-conditions') {
          this.title = this.util.appTranslate('terms_and_conditions');
        } else if (this.slug == 'refund-policy') {
          this.title = this.util.appTranslate('refund_policy');
        } else if (this.slug == 'shipping-policy') {
          this.title = this.util.appTranslate('shipping_policy');
        } else if (this.slug == 'cancellation-policy') {
          this.title = this.util.appTranslate('cancellation_policy');
        } else if (this.slug == 'cookies') {
          this.title = this.util.appTranslate('cookies');
        } else if (this.slug == 'help') {
          this.title = this.util.appTranslate('help');
        } else if (this.slug == 'frequently-asked-questions') {
          this.title = this.util.appTranslate('faqs');
        } else if (this.slug == 'dining-frequently-asked-questions') {
          this.title = this.util.appTranslate('dining_faqs');
        }
        this.getPageContent();
      } else {
        this.router.navigate(['']);
      }
    } else {
      this.router.navigate(['']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getPageContent() {
    this.isLoaded = false;
    this.api.get_public('v1/public/app_pages/content/' + this.slug).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(response);
        if (response && response.description && response.description != null && response.description != '') {
          this.description = this.util.htmlDecode(response.description);
          if (response?.translations) {
            const translation = response.translations.find((t: any) => t.code == this.util.appLocaleName());
            this.description = this.util.htmlDecode(translation?.value) || this.util.htmlDecode(response.description);
          }
          this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(this.description);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'public');
      }
    });
  }

}
