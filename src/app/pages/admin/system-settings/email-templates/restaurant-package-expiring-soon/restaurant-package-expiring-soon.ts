import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { SafeHtmlPipe } from 'src/app/pipe/safe-html.pipe';

import { EmailTemplatePreviewBase } from '../email-template-preview-base';

@Component({
  selector: 'app-restaurant-package-expiring-soon',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, AngularEditorModule, SafeHtmlPipe],
  templateUrl: './restaurant-package-expiring-soon.html',
})
export class RestaurantPackageExpiringSoon extends EmailTemplatePreviewBase {

  slug: string = '';
  action: string = 'add';
  name: string = '';
  templateForm = new FormGroup({
    slug: new FormControl('', [Validators.required]),
    icon: new FormControl('', [Validators.required]),
    title: new FormControl('', [Validators.required]),
    content: new FormControl('', [Validators.required]),
    footerContent: new FormControl('', [Validators.required]),
    copyRightContent: new FormControl('', [Validators.required]),
    btnLbl: new FormControl(''),
    btnUrl: new FormControl(''),
    bannerImage: new FormControl(''),
    bannerUrl: new FormControl(''),
    websiteURL: new FormControl('', [Validators.required]),
    htmlContent: new FormControl('', [Validators.required]),
    aboutPage: new FormControl(true),
    privacyPage: new FormControl(true),
    termsPage: new FormControl(true),
    refundPage: new FormControl(true),
    shippingPage: new FormControl(true),
    cancellationPage: new FormControl(true),
    cookiesPage: new FormControl(true),
    helpPage: new FormControl(true),
    faqsPage: new FormControl(true),
    fbLink: new FormControl(true),
    instaLink: new FormControl(true),
    xLink: new FormControl(true),
    ytLink: new FormControl(true),
    llLink: new FormControl(true),
    piLink: new FormControl(true),
    gpLink: new FormControl(true),
    asLink: new FormControl(true),
    vmLink: new FormControl(true),
    translations: new FormArray([]),
  });
  haveSubmitClicked: boolean = false;
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: "15rem",
    minHeight: "5rem",
    placeholder: "Enter text here...",
    translate: "no",
    defaultParagraphSeparator: "p",
    defaultFontName: "Arial",
    sanitize: true,
    toolbarHiddenButtons: [
      ['insertImage', 'insertVideo']
    ]
  };
  languages: any[] = [];
  translations: any[] = [];
  domainUrl: string = '';
  topImageLogo = '';

  appstoreIcon: string = '';
  facebookIcon: string = '';
  instagramIcon: string = '';
  linkedinIcon: string = '';
  pinterestIcon: string = '';
  playstoreIcon: string = '';
  twitterIcon: string = '';
  vimeoIcon: string = '';
  youtubeIcon: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    cdr: ChangeDetectorRef,
  ) {
    super(cdr);
    this.domainUrl = window.location.origin + '/';
    this.config.placeholder = this.util.appTranslate('enter_text_here');
    this.slug = 'restaurant-package-expire-soon-email';
    this.templateForm.controls['slug'].setValue(this.slug);
    this.templateForm.controls['icon'].setValue('NA');
    this.templateForm.getRawValue();
    this.name = this.util.titleize(this.slug);
    this.templateForm.controls['websiteURL'].setValue(this.domainUrl);
    this.getContent();
    this.locale();
  }

  locale() {
    if (Array.isArray(this.util.locales) && this.util.locales.length > 0) {
      this.languages = [];
      this.util.locales.forEach((element) => {
        const locale = {
          code: element.code,
          name: element.name,
          nativeName: element.nativeName,
          title: '',
          content: '',
          footer: '',
          copyright: '',
        };
        this.languages.push(locale);
      });
      this.languages.forEach((locale) => {
        this.translations.forEach((translate) => {
          if (locale.code == translate.code) {
            locale.title = translate.title;
            locale.content = this.util.htmlDecode(translate.content);
            locale.footer = translate.footer;
            locale.copyright = translate.copyright;
          }
        });
      });
    }
  }

  getContent() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/email_templates/' + this.slug).subscribe({
      next: (dataResponse: any) => {
        console.log(dataResponse);
        this.util.stop(spinnerRef);
        if (dataResponse && dataResponse.template && dataResponse.template.id) {
          const response = dataResponse.template;
          this.action = 'edit';
          this.templateForm.controls['aboutPage'].setValue(response.aboutPage);
          this.templateForm.controls['asLink'].setValue(response.asLink);
          this.templateForm.controls['bannerImage'].setValue(response.bannerImage);
          this.templateForm.controls['bannerUrl'].setValue(response.bannerUrl);
          this.templateForm.controls['btnLbl'].setValue(response.btnLbl);
          this.templateForm.controls['btnUrl'].setValue(response.btnUrl);
          this.templateForm.controls['cancellationPage'].setValue(response.cancellationPage);
          this.templateForm.controls['content'].setValue(this.util.htmlDecode(response.content));
          this.templateForm.controls['cookiesPage'].setValue(response.cookiesPage);
          this.templateForm.controls['copyRightContent'].setValue(response.copyRightContent);
          this.templateForm.controls['faqsPage'].setValue(response.faqsPage);
          this.templateForm.controls['fbLink'].setValue(response.fbLink);
          this.templateForm.controls['footerContent'].setValue(response.footerContent);
          this.templateForm.controls['gpLink'].setValue(response.gpLink);
          this.templateForm.controls['helpPage'].setValue(response.helpPage);
          this.templateForm.controls['instaLink'].setValue(response.instaLink);
          this.templateForm.controls['llLink'].setValue(response.llLink);
          this.templateForm.controls['piLink'].setValue(response.piLink);
          this.templateForm.controls['privacyPage'].setValue(response.privacyPage);
          this.templateForm.controls['refundPage'].setValue(response.refundPage);
          this.templateForm.controls['shippingPage'].setValue(response.shippingPage);
          this.templateForm.controls['termsPage'].setValue(response.termsPage);
          this.templateForm.controls['title'].setValue(response.title);
          this.templateForm.controls['vmLink'].setValue(response.vmLink);
          this.templateForm.controls['xLink'].setValue(response.xLink);
          this.templateForm.controls['ytLink'].setValue(response.ytLink);
          this.translations = response.translations;

          if (this.templateForm.controls['fbLink'].value == false) {
            const elementRef = document.getElementById('emailSocialLinkFB');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          if (this.templateForm.controls['instaLink'].value == false) {
            const elementRef = document.getElementById('emailSocialLinkInsta');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          if (this.templateForm.controls['xLink'].value == false) {
            const elementRef = document.getElementById('emailSocialLinkX');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          if (this.templateForm.controls['ytLink'].value == false) {
            const elementRef = document.getElementById('emailSocialLinkYT');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          if (this.templateForm.controls['llLink'].value == false) {
            const elementRef = document.getElementById('emailSocialLinkLL');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          if (this.templateForm.controls['piLink'].value == false) {
            const elementRef = document.getElementById('emailSocialLinkPL');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          if (this.templateForm.controls['gpLink'].value == false) {
            const elementRef = document.getElementById('emailSocialLinkGP');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          if (this.templateForm.controls['asLink'].value == false) {
            const elementRef = document.getElementById('emailSocialLinkAS');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          if (this.templateForm.controls['vmLink'].value == false) {
            const elementRef = document.getElementById('emailSocialLinkVM');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          /////////////////////////////////////////////////////////////////////////////////
          if (this.templateForm.controls['aboutPage'].value == false) {
            const elementRef = document.getElementById('pageAbout');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          if (this.templateForm.controls['privacyPage'].value == false) {
            const elementRef = document.getElementById('pagePrivacy');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          if (this.templateForm.controls['refundPage'].value == false) {
            const elementRef = document.getElementById('pageRefund');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          if (this.templateForm.controls['cancellationPage'].value == false) {
            const elementRef = document.getElementById('pageCancellation');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          if (this.templateForm.controls['termsPage'].value == false) {
            const elementRef = document.getElementById('pageTerms');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          if (this.templateForm.controls['shippingPage'].value == false) {
            const elementRef = document.getElementById('pageShipping');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          if (this.templateForm.controls['cookiesPage'].value == false) {
            const elementRef = document.getElementById('pageCookie');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          if (this.templateForm.controls['helpPage'].value == false) {
            const elementRef = document.getElementById('pageHelp');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }

          if (this.templateForm.controls['faqsPage'].value == false) {
            const elementRef = document.getElementById('pageFaqs');
            if (elementRef) {
              elementRef.style.display = 'none';
            }
          }
          /////////////////////////////////////////////////////////////////////////////////
          this.locale();
        }
        if (dataResponse && dataResponse.media) {
          if (dataResponse.media && dataResponse.media.mediaUrls) {
            const mediaUrls = dataResponse.media.mediaUrls;
            this.appstoreIcon = mediaUrls.appstore;
            this.facebookIcon = mediaUrls.facebook;
            this.instagramIcon = mediaUrls.instagram;
            this.linkedinIcon = mediaUrls.linkedin;
            this.pinterestIcon = mediaUrls.pinterest;
            this.playstoreIcon = mediaUrls.playstore;
            this.twitterIcon = mediaUrls.twitter;
            this.vimeoIcon = mediaUrls.vimeo;
            this.youtubeIcon = mediaUrls.youtube;
            this.topImageLogo = mediaUrls.subscriptionExpireSoon;
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onReset() {
    console.log('on reset');
    this.templateForm.patchValue({
      slug: '',
      icon: '',
      title: '',
      content: '',
      footerContent: '',
      copyRightContent: '',
      btnLbl: '',
      btnUrl: '',
      bannerImage: '',
      bannerUrl: '',
      websiteURL: '',
      htmlContent: '',
      aboutPage: true,
      privacyPage: true,
      termsPage: true,
      refundPage: true,
      shippingPage: true,
      cancellationPage: true,
      cookiesPage: true,
      helpPage: true,
      faqsPage: true,
      fbLink: true,
      instaLink: true,
      xLink: true,
      ytLink: true,
      llLink: true,
      piLink: true,
      gpLink: true,
      asLink: true,
      vmLink: true
    });
    (this.templateForm.get('translations') as FormArray).clear();
    const localeMapped = this.languages.map((item) => {
      item.title = '';
      item.content = '';
      item.footer = '';
      item.copyright = '';
      return item;
    });
    this.templateForm.controls['slug'].setValue(this.slug);
    this.templateForm.controls['icon'].setValue('NA');
    this.templateForm.controls['websiteURL'].setValue(this.domainUrl);
    this.languages = localeMapped;
    this.haveSubmitClicked = false;
    console.log(this.templateForm.getRawValue());
  }

  get f() {
    return this.templateForm.controls;
  }

  onSubmit() {
    console.log('on submit');
    console.log(this.templateForm);
    console.log(this.templateForm.getRawValue());
    this.haveSubmitClicked = true;
    const locale = this.templateForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], title: [element.title], content: [element.content], footer: [element.footer], copyright: [element.copyright] }));
    });
    this.templateForm.controls['htmlContent'].patchValue('NA');
    if (this.templateForm.valid) {
      if (this.action == 'add') {
        this.onSave();
      } else {
        this.onUpdate();
      }
    }
  }

  onSave() {
    console.log('on save');
    const spinnerRef = this.util.start('ts_saving');
    const emailHtmlContent = this.captureEmailContent();
    if (emailHtmlContent) {
      this.templateForm.controls['htmlContent'].patchValue(emailHtmlContent);
    }
    this.api.post_private('v1/admin/email_templates/save', this.templateForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_content_saved');
        if (response && response.id) {
          this.action = 'edit';
        }
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onUpdate() {
    console.log('on update');
    const spinnerRef = this.util.start('ts_saving');
    const emailHtmlContent = this.captureEmailContent();
    if (emailHtmlContent) {
      this.templateForm.controls['htmlContent'].patchValue(emailHtmlContent);
    }
    this.api.patch_private('v1/admin/email_templates/update/' + this.slug, this.templateForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_content_updated');
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onLinkChange(event: MatCheckboxChange, pageElRef: string) {
    const elementRef = document.getElementById(pageElRef);
    if (elementRef) {
      if (event.checked) {
        elementRef.style.display = 'inline-block';
      } else {
        elementRef.style.display = 'none';
      }
    }
  }

  onSocialLinkChange(event: MatCheckboxChange, pageElRef: string) {
    const elementRef = document.getElementById(pageElRef);
    if (elementRef) {
      if (event.checked) {
        elementRef.style.display = 'inline-block';
      } else {
        elementRef.style.display = 'none';
      }
    }
  }
}
