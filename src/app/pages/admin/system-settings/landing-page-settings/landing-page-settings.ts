import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DialogLandingPageContent } from './dialog-landing-page-content/dialog-landing-page-content';
import { AdminLandingPageServiceInterface } from 'src/app/interfaces/admin.landing.page.service.interface';
import { AdminLandingPageFAQsInterface } from 'src/app/interfaces/admin.landing.page.faqs.interface';
import { AdminLandingReviewInterface } from 'src/app/interfaces/admin.landing.page.review.interface';
import { AdminLandingPageAppFeatureInterface } from 'src/app/interfaces/admin.landing.page.app.feature.interface';
import { AdminLandingPageFeatureBulletPointInterface } from 'src/app/interfaces/admin.landing.page.feature.bullet.point.interface';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-landing-page-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './landing-page-settings.html',
})
export class LandingPageSettings {

  tabIndex: number = 0;
  heroForm = new FormGroup({
    highlight: new FormControl('', [Validators.required]),
    title: new FormControl('', [Validators.required]),
    subtitle: new FormControl('', [Validators.required]),
    header: new FormControl('', [Validators.required]),
    btn1_enable: new FormControl(true),
    btn1_href: new FormControl('', [Validators.required]),
    btn1_cover: new FormControl('', [Validators.required]),
    btn2_enable: new FormControl(true),
    btn2_href: new FormControl('', [Validators.required]),
    btn2_cover: new FormControl('', [Validators.required]),
    cover: new FormControl('', [Validators.required]),
    hash1_img: new FormControl('', [Validators.required]),
    hash1_txt: new FormControl('', [Validators.required]),
    hash2_img: new FormControl('', [Validators.required]),
    hash2_txt: new FormControl('', [Validators.required]),
    hash3_img: new FormControl('', [Validators.required]),
    hash3_txt: new FormControl('', [Validators.required]),
    translations: new FormArray([]),
    stats_one: new FormGroup({
      cover: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      subtitle: new FormControl('', [Validators.required]),
      translations: new FormArray([]),
    }),
    stats_two: new FormGroup({
      cover: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      subtitle: new FormControl('', [Validators.required]),
      translations: new FormArray([]),
    }),
    stats_three: new FormGroup({
      cover: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      subtitle: new FormControl('', [Validators.required]),
      translations: new FormArray([]),
    }),
    stats_four: new FormGroup({
      cover: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      subtitle: new FormControl('', [Validators.required]),
      translations: new FormArray([]),
    }),
  });
  serviceForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    subtitle: new FormControl('', [Validators.required]),
    translations: new FormArray([]),
    services: new FormArray([]),
  });
  faqsForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    subtitle: new FormControl('', [Validators.required]),
    translations: new FormArray([]),
    questions: new FormArray([]),
  });
  reviewForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    subtitle: new FormControl('', [Validators.required]),
    translations: new FormArray([]),
    reviews: new FormArray([]),
  });
  scanQrForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    subtitle: new FormControl('', [Validators.required]),
    btn1_enable: new FormControl(true),
    btn1_href: new FormControl('', [Validators.required]),
    btn1_cover: new FormControl('', [Validators.required]),
    btn2_enable: new FormControl(true),
    btn2_href: new FormControl('', [Validators.required]),
    btn2_cover: new FormControl('', [Validators.required]),
    cover: new FormControl('', [Validators.required]),
    translations: new FormArray([]),
  });
  appFeaturesForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    subtitle: new FormControl('', [Validators.required]),
    cover: new FormControl('', [Validators.required]),
    translations: new FormArray([]),
    features: new FormArray([]),
  });
  projectFeatureForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    subtitle: new FormControl('', [Validators.required]),
    translations: new FormArray([]),
    firstFeature: new FormGroup({
      icon: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      subtitle: new FormControl('', [Validators.required]),
      btn_href: new FormControl('', [Validators.required]),
      btn_lbl: new FormControl('', [Validators.required]),
      detail_cover: new FormControl('', [Validators.required]),
      detail_title: new FormControl('', [Validators.required]),
      detail_subtitle: new FormControl('', [Validators.required]),
      detail_list: new FormArray([]),
      translations: new FormArray([]),
    }),
    secondFeature: new FormGroup({
      icon: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      subtitle: new FormControl('', [Validators.required]),
      btn_href: new FormControl('', [Validators.required]),
      btn_lbl: new FormControl('', [Validators.required]),
      detail_cover: new FormControl('', [Validators.required]),
      detail_title: new FormControl('', [Validators.required]),
      detail_subtitle: new FormControl('', [Validators.required]),
      detail_list: new FormArray([]),
      translations: new FormArray([]),
    }),
    thirdFeature: new FormGroup({
      icon: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      subtitle: new FormControl('', [Validators.required]),
      btn_href: new FormControl('', [Validators.required]),
      btn_lbl: new FormControl('', [Validators.required]),
      detail_cover: new FormControl('', [Validators.required]),
      detail_title: new FormControl('', [Validators.required]),
      detail_subtitle: new FormControl('', [Validators.required]),
      detail_list: new FormArray([]),
      translations: new FormArray([]),
    }),
    fourthFeature: new FormGroup({
      icon: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      subtitle: new FormControl('', [Validators.required]),
      btn_href: new FormControl('', [Validators.required]),
      btn_lbl: new FormControl('', [Validators.required]),
      detail_cover: new FormControl('', [Validators.required]),
      detail_title: new FormControl('', [Validators.required]),
      detail_subtitle: new FormControl('', [Validators.required]),
      detail_list: new FormArray([]),
      translations: new FormArray([]),
    }),
  });
  heroLanguages: any[] = [];
  statOneLanguages: any[] = [];
  statTwoLanguages: any[] = [];
  statThreeLanguages: any[] = [];
  statFourLanguages: any[] = [];
  serviceLanguages: any[] = [];
  faqsLanguages: any[] = [];
  reviewLanguages: any[] = [];
  scanQrLanguages: any[] = [];
  appFeatureLanguages: any[] = [];
  projectFeatureLanguages: any[] = [];
  firstFeatureLanguages: any[] = [];
  secondFeatureLanguages: any[] = [];
  thirdFeatureLanguages: any[] = [];
  fourthFeatureLanguages: any[] = [];
  serviceArray: AdminLandingPageServiceInterface[] = [];
  faqsArray: AdminLandingPageFAQsInterface[] = [];
  reviewArray: AdminLandingReviewInterface[] = [];
  appFeatureArray: AdminLandingPageAppFeatureInterface[] = [];
  firstBulletArray: AdminLandingPageFeatureBulletPointInterface[] = [];
  secondBulletArray: AdminLandingPageFeatureBulletPointInterface[] = [];
  thirdBulletArray: AdminLandingPageFeatureBulletPointInterface[] = [];
  fourthBulletArray: AdminLandingPageFeatureBulletPointInterface[] = [];
  displayedCommanColumn = ['name', 'action'];
  haveHeroSubmitClicked: boolean = false;
  haveServiceSubmitClicked: boolean = false;
  haveFaqsSubmitClicked: boolean = false;
  haveReviewSubmitClicked: boolean = false;
  haveScanQrSubmitClicked: boolean = false;
  haveAppFeatureSubmitClicked: boolean = false;
  haveProjectFeatureSubmitClicked: boolean = false;

  constructor(public util: UtilService, public api: ApiService, private dialog: MatDialog, private fb: FormBuilder) {
    console.log(this.heroForm.getRawValue());
    this.getContent();
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

  getContent() {
    console.log('Content');
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/landing_page/get_content/').subscribe({
      next: (response: any) => {
        let heroMainLocale: any[] = [];
        let heroStat1Locale: any[] = [];
        let heroStat2Locale: any[] = [];
        let heroStat3Locale: any[] = [];
        let heroStat4Locale: any[] = [];
        let serviceLocale: any[] = [];
        let faqsLocale: any[] = [];
        let reviewLocale: any[] = [];
        let scanQrLocale: any[] = [];
        let appFeatureLocale: any[] = [];
        let projectMainFeatureLocale: any[] = [];
        let projectFirstFeatureLocale: any[] = [];
        let projectSecondFeatureLocale: any[] = [];
        let projectThirdFeatureLocale: any[] = [];
        let projectFourthFeatureLocale: any[] = [];

        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success) {
          const heroContent = response && response.result && response.result.heroContent ? response.result.heroContent : null;
          if (heroContent) {
            const btn1_cover = heroContent && heroContent.btn1_cover ? heroContent.btn1_cover : '';
            const btn1_enable = heroContent && heroContent.btn1_enable ? heroContent.btn1_enable : false;
            const btn1_href = heroContent && heroContent.btn1_href ? heroContent.btn1_href : '';
            const btn2_cover = heroContent && heroContent.btn2_cover ? heroContent.btn2_cover : '';
            const btn2_enable = heroContent && heroContent.btn2_enable ? heroContent.btn2_enable : false;
            const btn2_href = heroContent && heroContent.btn2_href ? heroContent.btn2_href : '';
            const cover = heroContent && heroContent.cover ? heroContent.cover : '';
            const hash1_img = heroContent && heroContent.hash1_img ? heroContent.hash1_img : '';
            const hash1_txt = heroContent && heroContent.hash1_txt ? heroContent.hash1_txt : '';
            const hash2_img = heroContent && heroContent.hash2_img ? heroContent.hash2_img : '';
            const hash2_txt = heroContent && heroContent.hash2_txt ? heroContent.hash2_txt : '';
            const hash3_img = heroContent && heroContent.hash3_img ? heroContent.hash3_img : '';
            const hash3_txt = heroContent && heroContent.hash3_txt ? heroContent.hash3_txt : '';
            const header = heroContent && heroContent.header ? heroContent.header : '';
            const highlight = heroContent && heroContent.highlight ? heroContent.highlight : '';
            const subtitle = heroContent && heroContent.subtitle ? heroContent.subtitle : '';
            const title = heroContent && heroContent.title ? heroContent.title : '';

            this.heroForm.controls['btn1_enable'].setValue(btn1_enable);
            this.heroForm.controls['btn2_enable'].setValue(btn2_enable);

            if (btn1_enable) {
              this.heroForm.controls['btn1_cover'].setValue(btn1_cover);
              this.heroForm.controls['btn1_cover'].setValidators(Validators.required);
              this.heroForm.controls['btn1_cover'].enable();

              this.heroForm.controls['btn1_href'].setValue(btn1_href);
              this.heroForm.controls['btn1_href'].setValidators(Validators.required);
              this.heroForm.controls['btn1_href'].enable();
            } else {
              this.heroForm.controls['btn1_cover'].setValue('');
              this.heroForm.controls['btn1_cover'].clearValidators();
              this.heroForm.controls['btn1_cover'].disable();

              this.heroForm.controls['btn1_href'].setValue('');
              this.heroForm.controls['btn1_href'].clearValidators();
              this.heroForm.controls['btn1_href'].disable();
            }

            if (btn2_enable) {
              this.heroForm.controls['btn2_cover'].setValue(btn2_cover);
              this.heroForm.controls['btn2_cover'].setValidators(Validators.required);
              this.heroForm.controls['btn2_cover'].enable();

              this.heroForm.controls['btn2_href'].setValue(btn2_href);
              this.heroForm.controls['btn2_href'].setValidators(Validators.required);
              this.heroForm.controls['btn2_href'].enable();
            } else {
              this.heroForm.controls['btn2_cover'].setValue('');
              this.heroForm.controls['btn2_cover'].clearValidators();
              this.heroForm.controls['btn2_cover'].disable();

              this.heroForm.controls['btn2_href'].setValue('');
              this.heroForm.controls['btn2_href'].clearValidators();
              this.heroForm.controls['btn2_href'].disable();
            }

            this.heroForm.controls['cover'].setValue(cover);
            this.heroForm.controls['hash1_img'].setValue(hash1_img);
            this.heroForm.controls['hash1_txt'].setValue(hash1_txt);
            this.heroForm.controls['hash2_img'].setValue(hash2_img);
            this.heroForm.controls['hash2_txt'].setValue(hash2_txt);
            this.heroForm.controls['hash3_img'].setValue(hash3_img);
            this.heroForm.controls['hash3_txt'].setValue(hash3_txt);
            this.heroForm.controls['header'].setValue(header);
            this.heroForm.controls['highlight'].setValue(highlight);
            this.heroForm.controls['subtitle'].setValue(subtitle);
            this.heroForm.controls['title'].setValue(title);

            if (heroContent && heroContent.stats_one) {
              const content = heroContent.stats_one;
              const cover = content && content.cover ? content.cover : '';
              const subtitle = content && content.subtitle ? content.subtitle : '';
              const title = content && content.title ? content.title : '';
              this.heroForm.controls['stats_one'].controls['cover'].setValue(cover);
              this.heroForm.controls['stats_one'].controls['subtitle'].setValue(subtitle);
              this.heroForm.controls['stats_one'].controls['title'].setValue(title);
              if (content && content.translations && content.translations instanceof Array) {
                heroStat1Locale = content.translations;
              }
            }
            if (heroContent && heroContent.stats_two) {
              const content = heroContent.stats_two;
              const cover = content && content.cover ? content.cover : '';
              const subtitle = content && content.subtitle ? content.subtitle : '';
              const title = content && content.title ? content.title : '';
              this.heroForm.controls['stats_two'].controls['cover'].setValue(cover);
              this.heroForm.controls['stats_two'].controls['subtitle'].setValue(subtitle);
              this.heroForm.controls['stats_two'].controls['title'].setValue(title);
              if (content && content.translations && content.translations instanceof Array) {
                heroStat2Locale = content.translations;
              }
            }
            if (heroContent && heroContent.stats_three) {
              const content = heroContent.stats_three;
              const cover = content && content.cover ? content.cover : '';
              const subtitle = content && content.subtitle ? content.subtitle : '';
              const title = content && content.title ? content.title : '';
              this.heroForm.controls['stats_three'].controls['cover'].setValue(cover);
              this.heroForm.controls['stats_three'].controls['subtitle'].setValue(subtitle);
              this.heroForm.controls['stats_three'].controls['title'].setValue(title);
              if (content && content.translations && content.translations instanceof Array) {
                heroStat3Locale = content.translations;
              }
            }
            if (heroContent && heroContent.stats_four) {
              const content = heroContent.stats_four;
              const cover = content && content.cover ? content.cover : '';
              const subtitle = content && content.subtitle ? content.subtitle : '';
              const title = content && content.title ? content.title : '';
              this.heroForm.controls['stats_four'].controls['cover'].setValue(cover);
              this.heroForm.controls['stats_four'].controls['subtitle'].setValue(subtitle);
              this.heroForm.controls['stats_four'].controls['title'].setValue(title);
              if (content && content.translations && content.translations instanceof Array) {
                heroStat4Locale = content.translations;
              }
            }

            if (heroContent && heroContent.translations && heroContent.translations instanceof Array) {
              heroMainLocale = heroContent.translations;
            }
          }
          const serviceContent = response && response.result && response.result.serviceContent ? response.result.serviceContent : null;
          if (serviceContent) {
            const subtitle = serviceContent && serviceContent.subtitle ? serviceContent.subtitle : '';
            const title = serviceContent && serviceContent.title ? serviceContent.title : '';
            this.serviceForm.controls['subtitle'].setValue(subtitle);
            this.serviceForm.controls['title'].setValue(title);
            if (serviceContent && serviceContent.translations && serviceContent.translations instanceof Array) {
              serviceLocale = serviceContent.translations;
            }

            if (serviceContent && serviceContent.services && serviceContent.services instanceof Array) {
              const mappedList = serviceContent.services.map(
                (item: AdminLandingPageServiceInterface) => {
                  if (item.translations) {
                    const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                    item.displayTitle = translation?.title || item.title;
                    item.displaySubTitle = translation?.subtitle || item.subtitle;
                  } else {
                    item.displayTitle = item?.title || '';
                    item.displaySubTitle = item?.subtitle || '';
                  }
                  return item;
                }
              );
              this.serviceArray = mappedList;
              this.serviceArray = [...this.serviceArray];
              const services = this.serviceForm.get('services') as FormArray;
              services.clear();
              this.serviceArray.forEach((element) => {
                services.push(this.fb.group({ title: [element.title], subtitle: [element.subtitle], serial: [element.serial], translations: [element.translations] }));
              });
            }
          }

          const faqContent = response && response.result && response.result.faqContent ? response.result.faqContent : null;
          if (faqContent) {
            const subtitle = faqContent && faqContent.subtitle ? faqContent.subtitle : '';
            const title = faqContent && faqContent.title ? faqContent.title : '';
            this.faqsForm.controls['subtitle'].setValue(subtitle);
            this.faqsForm.controls['title'].setValue(title);
            if (faqContent && faqContent.translations && faqContent.translations instanceof Array) {
              faqsLocale = faqContent.translations;
            }
            if (faqContent && faqContent.questions && faqContent.questions instanceof Array) {
              const mappedList = faqContent.questions.map(
                (item: AdminLandingPageFAQsInterface) => {
                  if (item.translations) {
                    const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                    item.displayTitle = translation?.title || item.title;
                  } else {
                    item.displayTitle = item?.title || '';
                  }
                  return item;
                }
              );
              this.faqsArray = mappedList;
              this.faqsArray = [...this.faqsArray];
              const faqs = this.faqsForm.get('questions') as FormArray;
              faqs.clear();
              this.faqsArray.forEach((element) => {
                faqs.push(this.fb.group({ title: [element.title], subtitle: [element.subtitle], serial: [element.serial], translations: [element.translations] }));
              });
            }
          }

          const reviewContent = response && response.result && response.result.reviewContent ? response.result.reviewContent : null;
          if (reviewContent) {
            const subtitle = reviewContent && reviewContent.subtitle ? reviewContent.subtitle : '';
            const title = reviewContent && reviewContent.title ? reviewContent.title : '';
            this.reviewForm.controls['subtitle'].setValue(subtitle);
            this.reviewForm.controls['title'].setValue(title);
            if (reviewContent && reviewContent.translations && reviewContent.translations instanceof Array) {
              reviewLocale = reviewContent.translations;
            }

            if (reviewContent && reviewContent.reviews && reviewContent.reviews instanceof Array) {
              const mappedList = reviewContent.reviews.map(
                (item: AdminLandingReviewInterface) => {
                  if (item.translations) {
                    const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                    item.message = translation?.value || item.message;
                  } else {
                    item.message = item?.message || '';
                  }
                  return item;
                }
              );
              this.reviewArray = mappedList;
              this.reviewArray = [...this.reviewArray];
              const reviews = this.reviewForm.get('reviews') as FormArray;
              reviews.clear();
              this.reviewArray.forEach((element) => {
                reviews.push(this.fb.group({ image: [element.image], message: [element.message], occupation: [element.occupation], star: [element.star], userName: [element.userName], translations: [element.translations] }));
              });
            }
          }

          const scanQrContent = response && response.result && response.result.scanQrContent ? response.result.scanQrContent : null;
          if (scanQrContent) {
            const btn1_cover = scanQrContent && scanQrContent.btn1_cover ? scanQrContent.btn1_cover : '';
            const btn1_enable = scanQrContent && scanQrContent.btn1_enable ? scanQrContent.btn1_enable : false;
            const btn1_href = scanQrContent && scanQrContent.btn1_href ? scanQrContent.btn1_href : '';
            const btn2_cover = scanQrContent && scanQrContent.btn2_cover ? scanQrContent.btn2_cover : '';
            const btn2_enable = scanQrContent && scanQrContent.btn2_enable ? scanQrContent.btn2_enable : false;
            const btn2_href = scanQrContent && scanQrContent.btn2_href ? scanQrContent.btn2_href : '';
            const cover = scanQrContent && scanQrContent.cover ? scanQrContent.cover : '';

            const subtitle = scanQrContent && scanQrContent.subtitle ? scanQrContent.subtitle : '';
            const title = scanQrContent && scanQrContent.title ? scanQrContent.title : '';

            this.scanQrForm.controls['subtitle'].setValue(subtitle);
            this.scanQrForm.controls['title'].setValue(title);

            this.scanQrForm.controls['btn1_enable'].setValue(btn1_enable);
            this.scanQrForm.controls['btn2_enable'].setValue(btn2_enable);

            if (btn1_enable) {
              this.scanQrForm.controls['btn1_cover'].setValue(btn1_cover);
              this.scanQrForm.controls['btn1_cover'].setValidators(Validators.required);
              this.scanQrForm.controls['btn1_cover'].enable();

              this.scanQrForm.controls['btn1_href'].setValue(btn1_href);
              this.scanQrForm.controls['btn1_href'].setValidators(Validators.required);
              this.scanQrForm.controls['btn1_href'].enable();
            } else {
              this.scanQrForm.controls['btn1_cover'].setValue('');
              this.scanQrForm.controls['btn1_cover'].clearValidators();
              this.scanQrForm.controls['btn1_cover'].disable();

              this.scanQrForm.controls['btn1_href'].setValue('');
              this.scanQrForm.controls['btn1_href'].clearValidators();
              this.scanQrForm.controls['btn1_href'].disable();
            }

            if (btn2_enable) {
              this.scanQrForm.controls['btn2_cover'].setValue(btn2_cover);
              this.scanQrForm.controls['btn2_cover'].setValidators(Validators.required);
              this.scanQrForm.controls['btn2_cover'].enable();

              this.scanQrForm.controls['btn2_href'].setValue(btn2_href);
              this.scanQrForm.controls['btn2_href'].setValidators(Validators.required);
              this.scanQrForm.controls['btn2_href'].enable();
            } else {
              this.scanQrForm.controls['btn2_cover'].setValue('');
              this.scanQrForm.controls['btn2_cover'].clearValidators();
              this.scanQrForm.controls['btn2_cover'].disable();

              this.scanQrForm.controls['btn2_href'].setValue('');
              this.scanQrForm.controls['btn2_href'].clearValidators();
              this.scanQrForm.controls['btn2_href'].disable();
            }

            this.scanQrForm.controls['cover'].setValue(cover);
            if (scanQrContent && scanQrContent.translations && scanQrContent.translations instanceof Array) {
              scanQrLocale = scanQrContent.translations;
            }
          }

          const appFeatureContent = response && response.result && response.result.appFeatureContent ? response.result.appFeatureContent : null;
          if (appFeatureContent) {
            const subtitle = appFeatureContent && appFeatureContent.subtitle ? appFeatureContent.subtitle : '';
            const title = appFeatureContent && appFeatureContent.title ? appFeatureContent.title : '';
            const cover = appFeatureContent && appFeatureContent.cover ? appFeatureContent.cover : '';

            this.appFeaturesForm.controls['subtitle'].setValue(subtitle);
            this.appFeaturesForm.controls['title'].setValue(title);
            this.appFeaturesForm.controls['cover'].setValue(cover);

            if (appFeatureContent && appFeatureContent.translations && appFeatureContent.translations instanceof Array) {
              appFeatureLocale = appFeatureContent.translations;
            }

            if (appFeatureContent && appFeatureContent.features && appFeatureContent.features instanceof Array) {
              const mappedList = appFeatureContent.features.map(
                (item: AdminLandingPageAppFeatureInterface) => {
                  if (item.translations) {
                    const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                    item.displayTitle = translation?.title || item.title;
                    item.displaySubTitle = translation?.subtitle || item.subtitle;
                  } else {
                    item.displayTitle = item?.title || '';
                    item.displaySubTitle = item?.subtitle || '';
                  }
                  return item;
                }
              );
              this.appFeatureArray = mappedList;
              this.appFeatureArray = [...this.appFeatureArray];
              const feature = this.appFeaturesForm.get('features') as FormArray;
              feature.clear();
              this.appFeatureArray.forEach((element) => {
                feature.push(this.fb.group({ title: [element.title], subtitle: [element.subtitle], image: [element.image], translations: [element.translations] }));
              });
            }
          }

          const featureContent = response && response.result && response.result.featureContent ? response.result.featureContent : null;
          if (featureContent) {
            console.log(featureContent);
            const subtitle = featureContent && featureContent.subtitle ? featureContent.subtitle : '';
            const title = featureContent && featureContent.title ? featureContent.title : '';
            this.projectFeatureForm.controls['subtitle'].setValue(subtitle);
            this.projectFeatureForm.controls['title'].setValue(title);

            if (featureContent && featureContent.firstFeature) {
              const content = featureContent.firstFeature;
              const btn_href = content && content.btn_href ? content.btn_href : '';
              const btn_lbl = content && content.btn_lbl ? content.btn_lbl : '';
              const detail_cover = content && content.detail_cover ? content.detail_cover : '';
              const detail_subtitle = content && content.detail_subtitle ? content.detail_subtitle : '';
              const detail_title = content && content.detail_title ? content.detail_title : '';
              const icon = content && content.icon ? content.icon : '';
              const subtitle = content && content.subtitle ? content.subtitle : '';
              const title = content && content.title ? content.title : '';

              this.projectFeatureForm.controls['firstFeature'].controls['btn_href'].setValue(btn_href);
              this.projectFeatureForm.controls['firstFeature'].controls['btn_lbl'].setValue(btn_lbl);
              this.projectFeatureForm.controls['firstFeature'].controls['detail_cover'].setValue(detail_cover);
              this.projectFeatureForm.controls['firstFeature'].controls['detail_subtitle'].setValue(detail_subtitle);
              this.projectFeatureForm.controls['firstFeature'].controls['detail_title'].setValue(detail_title);
              this.projectFeatureForm.controls['firstFeature'].controls['icon'].setValue(icon);
              this.projectFeatureForm.controls['firstFeature'].controls['subtitle'].setValue(subtitle);
              this.projectFeatureForm.controls['firstFeature'].controls['title'].setValue(title);

              if (content && content.translations && content.translations instanceof Array) {
                projectFirstFeatureLocale = content.translations;
              }

              if (content && content.detail_list && content.detail_list instanceof Array) {
                const mappedList = content.detail_list.map(
                  (item: AdminLandingPageFeatureBulletPointInterface) => {
                    if (item.translations) {
                      const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                      item.displayName = translation?.value || item.lbl;
                    } else {
                      item.displayName = item?.lbl || '';
                    }
                    return item;
                  }
                );
                this.firstBulletArray = mappedList;
                this.firstBulletArray = [...this.firstBulletArray];
                const firstFeature = this.projectFeatureForm.get('firstFeature');
                if (firstFeature) {
                  const bullet = firstFeature.get('detail_list') as FormArray;
                  if (bullet) {
                    bullet.clear();
                    this.firstBulletArray.forEach((element) => {
                      bullet.push(this.fb.group({ lbl: [element.lbl], translations: [element.translations] }));
                    });
                  }
                }
                console.log(this.firstBulletArray);
              }
            }

            if (featureContent && featureContent.secondFeature) {
              const content = featureContent.secondFeature;
              const btn_href = content && content.btn_href ? content.btn_href : '';
              const btn_lbl = content && content.btn_lbl ? content.btn_lbl : '';
              const detail_cover = content && content.detail_cover ? content.detail_cover : '';
              const detail_subtitle = content && content.detail_subtitle ? content.detail_subtitle : '';
              const detail_title = content && content.detail_title ? content.detail_title : '';
              const icon = content && content.icon ? content.icon : '';
              const subtitle = content && content.subtitle ? content.subtitle : '';
              const title = content && content.title ? content.title : '';

              this.projectFeatureForm.controls['secondFeature'].controls['btn_href'].setValue(btn_href);
              this.projectFeatureForm.controls['secondFeature'].controls['btn_lbl'].setValue(btn_lbl);
              this.projectFeatureForm.controls['secondFeature'].controls['detail_cover'].setValue(detail_cover);
              this.projectFeatureForm.controls['secondFeature'].controls['detail_subtitle'].setValue(detail_subtitle);
              this.projectFeatureForm.controls['secondFeature'].controls['detail_title'].setValue(detail_title);
              this.projectFeatureForm.controls['secondFeature'].controls['icon'].setValue(icon);
              this.projectFeatureForm.controls['secondFeature'].controls['subtitle'].setValue(subtitle);
              this.projectFeatureForm.controls['secondFeature'].controls['title'].setValue(title);

              if (content && content.translations && content.translations instanceof Array) {
                projectSecondFeatureLocale = content.translations;
              }

              if (content && content.detail_list && content.detail_list instanceof Array) {
                const mappedList = content.detail_list.map(
                  (item: AdminLandingPageFeatureBulletPointInterface) => {
                    if (item.translations) {
                      const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                      item.displayName = translation?.value || item.lbl;
                    } else {
                      item.displayName = item?.lbl || '';
                    }
                    return item;
                  }
                );
                this.secondBulletArray = mappedList;
                this.secondBulletArray = [...this.secondBulletArray];
                const secondFeature = this.projectFeatureForm.get('secondFeature');
                if (secondFeature) {
                  const bullet = secondFeature.get('detail_list') as FormArray;
                  if (bullet) {
                    bullet.clear();
                    this.secondBulletArray.forEach((element) => {
                      bullet.push(this.fb.group({ lbl: [element.lbl], translations: [element.translations] }));
                    });
                  }
                }
                console.log(this.secondBulletArray);
              }
            }

            if (featureContent && featureContent.thirdFeature) {
              const content = featureContent.thirdFeature;
              const btn_href = content && content.btn_href ? content.btn_href : '';
              const btn_lbl = content && content.btn_lbl ? content.btn_lbl : '';
              const detail_cover = content && content.detail_cover ? content.detail_cover : '';
              const detail_subtitle = content && content.detail_subtitle ? content.detail_subtitle : '';
              const detail_title = content && content.detail_title ? content.detail_title : '';
              const icon = content && content.icon ? content.icon : '';
              const subtitle = content && content.subtitle ? content.subtitle : '';
              const title = content && content.title ? content.title : '';

              this.projectFeatureForm.controls['thirdFeature'].controls['btn_href'].setValue(btn_href);
              this.projectFeatureForm.controls['thirdFeature'].controls['btn_lbl'].setValue(btn_lbl);
              this.projectFeatureForm.controls['thirdFeature'].controls['detail_cover'].setValue(detail_cover);
              this.projectFeatureForm.controls['thirdFeature'].controls['detail_subtitle'].setValue(detail_subtitle);
              this.projectFeatureForm.controls['thirdFeature'].controls['detail_title'].setValue(detail_title);
              this.projectFeatureForm.controls['thirdFeature'].controls['icon'].setValue(icon);
              this.projectFeatureForm.controls['thirdFeature'].controls['subtitle'].setValue(subtitle);
              this.projectFeatureForm.controls['thirdFeature'].controls['title'].setValue(title);

              if (content && content.translations && content.translations instanceof Array) {
                projectThirdFeatureLocale = content.translations;
              }

              if (content && content.detail_list && content.detail_list instanceof Array) {
                const mappedList = content.detail_list.map(
                  (item: AdminLandingPageFeatureBulletPointInterface) => {
                    if (item.translations) {
                      const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                      item.displayName = translation?.value || item.lbl;
                    } else {
                      item.displayName = item?.lbl || '';
                    }
                    return item;
                  }
                );
                this.thirdBulletArray = mappedList;
                this.thirdBulletArray = [...this.thirdBulletArray];
                const thirdFeature = this.projectFeatureForm.get('thirdFeature');
                if (thirdFeature) {
                  const bullet = thirdFeature.get('detail_list') as FormArray;
                  if (bullet) {
                    bullet.clear();
                    this.thirdBulletArray.forEach((element) => {
                      bullet.push(this.fb.group({ lbl: [element.lbl], translations: [element.translations] }));
                    });
                  }
                }
                console.log(this.thirdBulletArray);
              }
            }

            if (featureContent && featureContent.fourthFeature) {
              const content = featureContent.fourthFeature;
              const btn_href = content && content.btn_href ? content.btn_href : '';
              const btn_lbl = content && content.btn_lbl ? content.btn_lbl : '';
              const detail_cover = content && content.detail_cover ? content.detail_cover : '';
              const detail_subtitle = content && content.detail_subtitle ? content.detail_subtitle : '';
              const detail_title = content && content.detail_title ? content.detail_title : '';
              const icon = content && content.icon ? content.icon : '';
              const subtitle = content && content.subtitle ? content.subtitle : '';
              const title = content && content.title ? content.title : '';

              this.projectFeatureForm.controls['fourthFeature'].controls['btn_href'].setValue(btn_href);
              this.projectFeatureForm.controls['fourthFeature'].controls['btn_lbl'].setValue(btn_lbl);
              this.projectFeatureForm.controls['fourthFeature'].controls['detail_cover'].setValue(detail_cover);
              this.projectFeatureForm.controls['fourthFeature'].controls['detail_subtitle'].setValue(detail_subtitle);
              this.projectFeatureForm.controls['fourthFeature'].controls['detail_title'].setValue(detail_title);
              this.projectFeatureForm.controls['fourthFeature'].controls['icon'].setValue(icon);
              this.projectFeatureForm.controls['fourthFeature'].controls['subtitle'].setValue(subtitle);
              this.projectFeatureForm.controls['fourthFeature'].controls['title'].setValue(title);

              if (content && content.translations && content.translations instanceof Array) {
                projectFourthFeatureLocale = content.translations;
              }

              if (content && content.detail_list && content.detail_list instanceof Array) {
                const mappedList = content.detail_list.map(
                  (item: AdminLandingPageFeatureBulletPointInterface) => {
                    if (item.translations) {
                      const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                      item.displayName = translation?.value || item.lbl;
                    } else {
                      item.displayName = item?.lbl || '';
                    }
                    return item;
                  }
                );
                this.fourthBulletArray = mappedList;
                this.fourthBulletArray = [...this.fourthBulletArray];
                const fourthFeature = this.projectFeatureForm.get('fourthFeature');
                if (fourthFeature) {
                  const bullet = fourthFeature.get('detail_list') as FormArray;
                  if (bullet) {
                    bullet.clear();
                    this.fourthBulletArray.forEach((element) => {
                      bullet.push(this.fb.group({ lbl: [element.lbl], translations: [element.translations] }));
                    });
                  }
                }
                console.log(this.fourthBulletArray);
              }
            }

            if (featureContent && featureContent.translations && featureContent.translations instanceof Array) {
              projectMainFeatureLocale = featureContent.translations;
            }
          }
        }

        if (Array.isArray(this.util.locales) && this.util.locales.length > 0) {
          this.heroLanguages = [];
          this.statOneLanguages = [];
          this.statTwoLanguages = [];
          this.statThreeLanguages = [];
          this.statFourLanguages = [];
          this.serviceLanguages = [];
          this.faqsLanguages = [];
          this.reviewLanguages = [];
          this.scanQrLanguages = [];
          this.appFeatureLanguages = [];
          this.projectFeatureLanguages = [];
          this.firstFeatureLanguages = [];
          this.secondFeatureLanguages = [];
          this.thirdFeatureLanguages = [];
          this.fourthFeatureLanguages = [];
          this.util.locales.forEach((element) => {
            const heroMainT = {
              code: element.code,
              name: element.name,
              nativeName: element.nativeName,
              highlight: '',
              title: '',
              subtitle: '',
              header: ''
            };
            const statComman1 = {
              code: element.code,
              name: element.name,
              nativeName: element.nativeName,
              title: '',
              subtitle: '',
            };
            const statComman2 = {
              code: element.code,
              name: element.name,
              nativeName: element.nativeName,
              title: '',
              subtitle: '',
            };
            const statComman3 = {
              code: element.code,
              name: element.name,
              nativeName: element.nativeName,
              title: '',
              subtitle: '',
            };
            const statComman4 = {
              code: element.code,
              name: element.name,
              nativeName: element.nativeName,
              title: '',
              subtitle: '',
            };
            const serviceT = {
              code: element.code,
              name: element.name,
              nativeName: element.nativeName,
              title: '',
              subtitle: '',
            };
            const faqsT = {
              code: element.code,
              name: element.name,
              nativeName: element.nativeName,
              title: '',
              subtitle: '',
            };
            const reviewT = {
              code: element.code,
              name: element.name,
              nativeName: element.nativeName,
              title: '',
              subtitle: '',
            };
            const scanQrT = {
              code: element.code,
              name: element.name,
              nativeName: element.nativeName,
              title: '',
              subtitle: '',
            };
            const appFeatureT = {
              code: element.code,
              name: element.name,
              nativeName: element.nativeName,
              title: '',
              subtitle: '',
            };
            const projectFeatureT = {
              code: element.code,
              name: element.name,
              nativeName: element.nativeName,
              title: '',
              subtitle: '',
            };
            const firstFeatureT = {
              code: element.code,
              name: element.name,
              nativeName: element.nativeName,
              title: '',
              subtitle: '',
              btnLbl: '',
              detailTitle: '',
              detailSubTitle: '',
            };
            const secondFeatureT = {
              code: element.code,
              name: element.name,
              nativeName: element.nativeName,
              title: '',
              subtitle: '',
              btnLbl: '',
              detailTitle: '',
              detailSubTitle: '',
            };
            const thirdFeatureT = {
              code: element.code,
              name: element.name,
              nativeName: element.nativeName,
              title: '',
              subtitle: '',
              btnLbl: '',
              detailTitle: '',
              detailSubTitle: '',
            };
            const fourthFeatureT = {
              code: element.code,
              name: element.name,
              nativeName: element.nativeName,
              title: '',
              subtitle: '',
              btnLbl: '',
              detailTitle: '',
              detailSubTitle: '',
            };
            this.heroLanguages.push(heroMainT);
            this.statOneLanguages.push(statComman1);
            this.statTwoLanguages.push(statComman2);
            this.statThreeLanguages.push(statComman3);
            this.statFourLanguages.push(statComman4);
            this.serviceLanguages.push(serviceT);
            this.faqsLanguages.push(faqsT);
            this.reviewLanguages.push(reviewT);
            this.scanQrLanguages.push(scanQrT);
            this.appFeatureLanguages.push(appFeatureT);
            this.projectFeatureLanguages.push(projectFeatureT);
            this.firstFeatureLanguages.push(firstFeatureT);
            this.secondFeatureLanguages.push(secondFeatureT);
            this.thirdFeatureLanguages.push(thirdFeatureT);
            this.fourthFeatureLanguages.push(fourthFeatureT);
          });

          this.heroLanguages.forEach((locale) => {
            heroMainLocale.forEach((translate) => {
              if (locale.code == translate.code) {
                locale.highlight = translate.highlight;
                locale.title = translate.title;
                locale.subtitle = translate.subtitle;
                locale.header = translate.header;
              }
            });
          });

          this.statOneLanguages.forEach((locale) => {
            heroStat1Locale.forEach((translate) => {
              if (locale.code == translate.code) {
                locale.title = translate.title;
                locale.subtitle = translate.subtitle;
              }
            });
          });

          this.statTwoLanguages.forEach((locale) => {
            heroStat2Locale.forEach((translate) => {
              if (locale.code == translate.code) {
                locale.title = translate.title;
                locale.subtitle = translate.subtitle;
              }
            });
          });

          this.statThreeLanguages.forEach((locale) => {
            heroStat3Locale.forEach((translate) => {
              if (locale.code == translate.code) {
                locale.title = translate.title;
                locale.subtitle = translate.subtitle;
              }
            });
          });

          this.statFourLanguages.forEach((locale) => {
            heroStat4Locale.forEach((translate) => {
              if (locale.code == translate.code) {
                locale.title = translate.title;
                locale.subtitle = translate.subtitle;
              }
            });
          });

          this.serviceLanguages.forEach((locale) => {
            serviceLocale.forEach((translate) => {
              if (locale.code == translate.code) {
                locale.title = translate.title;
                locale.subtitle = translate.subtitle;
              }
            });
          });

          this.faqsLanguages.forEach((locale) => {
            faqsLocale.forEach((translate) => {
              if (locale.code == translate.code) {
                locale.title = translate.title;
                locale.subtitle = translate.subtitle;
              }
            });
          });

          this.reviewLanguages.forEach((locale) => {
            reviewLocale.forEach((translate) => {
              if (locale.code == translate.code) {
                locale.title = translate.title;
                locale.subtitle = translate.subtitle;
              }
            });
          });

          this.scanQrLanguages.forEach((locale) => {
            scanQrLocale.forEach((translate) => {
              if (locale.code == translate.code) {
                locale.title = translate.title;
                locale.subtitle = translate.subtitle;
              }
            });
          });

          this.appFeatureLanguages.forEach((locale) => {
            appFeatureLocale.forEach((translate) => {
              if (locale.code == translate.code) {
                locale.title = translate.title;
                locale.subtitle = translate.subtitle;
              }
            });
          });

          this.projectFeatureLanguages.forEach((locale) => {
            projectMainFeatureLocale.forEach((translate) => {
              if (locale.code == translate.code) {
                locale.title = translate.title;
                locale.subtitle = translate.subtitle;
              }
            });
          });

          this.firstFeatureLanguages.forEach((locale) => {
            projectFirstFeatureLocale.forEach((translate) => {
              if (locale.code == translate.code) {
                locale.btnLbl = translate.btnLbl;
                locale.detailSubTitle = translate.detailSubTitle;
                locale.detailTitle = translate.detailTitle;
                locale.subtitle = translate.subtitle;
                locale.title = translate.title;
              }
            });
          });

          this.secondFeatureLanguages.forEach((locale) => {
            projectSecondFeatureLocale.forEach((translate) => {
              if (locale.code == translate.code) {
                locale.btnLbl = translate.btnLbl;
                locale.detailSubTitle = translate.detailSubTitle;
                locale.detailTitle = translate.detailTitle;
                locale.subtitle = translate.subtitle;
                locale.title = translate.title;
              }
            });
          });

          this.thirdFeatureLanguages.forEach((locale) => {
            projectThirdFeatureLocale.forEach((translate) => {
              if (locale.code == translate.code) {
                locale.btnLbl = translate.btnLbl;
                locale.detailSubTitle = translate.detailSubTitle;
                locale.detailTitle = translate.detailTitle;
                locale.subtitle = translate.subtitle;
                locale.title = translate.title;
              }
            });
          });

          this.fourthFeatureLanguages.forEach((locale) => {
            projectFourthFeatureLocale.forEach((translate) => {
              if (locale.code == translate.code) {
                locale.btnLbl = translate.btnLbl;
                locale.detailSubTitle = translate.detailSubTitle;
                locale.detailTitle = translate.detailTitle;
                locale.subtitle = translate.subtitle;
                locale.title = translate.title;
              }
            });
          });
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });

  }

  get heroF() {
    return this.heroForm.controls;
  }

  get heroStatsOne() {
    return this.heroForm.controls['stats_one'].controls;
  }

  get heroStatsTwo() {
    return this.heroForm.controls['stats_two'].controls;
  }

  get heroStatsThree() {
    return this.heroForm.controls['stats_three'].controls;
  }

  get heroStatsFour() {
    return this.heroForm.controls['stats_four'].controls;
  }

  get serviceF() {
    return this.serviceForm.controls;
  }

  get faqsF() {
    return this.faqsForm.controls;
  }

  get reviewF() {
    return this.reviewForm.controls;
  }

  get scanQrF() {
    return this.scanQrForm.controls;
  }

  get appFeatureF() {
    return this.appFeaturesForm.controls;
  }

  get projectFeatureF() {
    return this.projectFeatureForm.controls;
  }

  get projectFeatureFirst() {
    return this.projectFeatureForm.controls['firstFeature'].controls;
  }

  get projectFeatureSecond() {
    return this.projectFeatureForm.controls['secondFeature'].controls;
  }

  get projectFeatureThird() {
    return this.projectFeatureForm.controls['thirdFeature'].controls;
  }

  get projectFeatureFourth() {
    return this.projectFeatureForm.controls['fourthFeature'].controls;
  }

  heroOneBtnChange(event: MatSlideToggleChange) {
    console.log(event);
    this.heroForm.controls['btn1_enable'].setValue(event.checked);
    if (event.checked) {
      this.heroForm.controls['btn1_cover'].setValue('');
      this.heroForm.controls['btn1_cover'].setValidators(Validators.required);
      this.heroForm.controls['btn1_cover'].enable();

      this.heroForm.controls['btn1_href'].setValue('');
      this.heroForm.controls['btn1_href'].setValidators(Validators.required);
      this.heroForm.controls['btn1_href'].enable();
    } else {
      this.heroForm.controls['btn1_cover'].setValue('');
      this.heroForm.controls['btn1_cover'].clearValidators();
      this.heroForm.controls['btn1_cover'].disable();

      this.heroForm.controls['btn1_href'].setValue('');
      this.heroForm.controls['btn1_href'].clearValidators();
      this.heroForm.controls['btn1_href'].disable();
    }
  }

  heroTwoBtnChange(event: MatSlideToggleChange) {
    console.log(event);
    this.heroForm.controls['btn2_enable'].setValue(event.checked);
    if (event.checked) {
      this.heroForm.controls['btn2_cover'].setValue('');
      this.heroForm.controls['btn2_cover'].setValidators(Validators.required);
      this.heroForm.controls['btn2_cover'].enable();

      this.heroForm.controls['btn2_href'].setValue('');
      this.heroForm.controls['btn2_href'].setValidators(Validators.required);
      this.heroForm.controls['btn2_href'].enable();
    } else {
      this.heroForm.controls['btn2_cover'].setValue('');
      this.heroForm.controls['btn2_cover'].clearValidators();
      this.heroForm.controls['btn2_cover'].disable();

      this.heroForm.controls['btn2_href'].setValue('');
      this.heroForm.controls['btn2_href'].clearValidators();
      this.heroForm.controls['btn2_href'].disable();
    }
  }

  onImageClick(formName: string, formValue: string) {
    console.log(formName, formValue);
    const dialogRef = this.dialog.open(SelectMediaDialog, {
      data: { value: '' },
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      height: "calc(100% - 30px)",
      width: "calc(100% - 30px)",
      maxWidth: "100%",
      maxHeight: "100%",
      panelClass: 'full-width-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event && result.event == 'select' && result.data && result.data != '') {
        if (formName == 'hero') {
          if (formValue == 'cover') {
            this.heroForm.controls['cover'].setValue(result.data);
          } else if (formValue == 'btn1_cover') {
            this.heroForm.controls['btn1_cover'].setValue(result.data);
          } else if (formValue == 'btn2_cover') {
            this.heroForm.controls['btn2_cover'].setValue(result.data);
          } else if (formValue == 'stat_one') {
            this.heroForm.controls['stats_one'].controls['cover'].setValue(result.data);
          } else if (formValue == 'stat_two') {
            this.heroForm.controls['stats_two'].controls['cover'].setValue(result.data);
          } else if (formValue == 'stat_three') {
            this.heroForm.controls['stats_three'].controls['cover'].setValue(result.data);
          } else if (formValue == 'stat_four') {
            this.heroForm.controls['stats_four'].controls['cover'].setValue(result.data);
          } else if (formValue == 'hash1_img') {
            this.heroForm.controls['hash1_img'].setValue(result.data);
          } else if (formValue == 'hash2_img') {
            this.heroForm.controls['hash2_img'].setValue(result.data);
          } else if (formValue == 'hash3_img') {
            this.heroForm.controls['hash3_img'].setValue(result.data);
          }
        } else if (formName == 'scanQr') {
          if (formValue == 'cover') {
            this.scanQrForm.controls['cover'].setValue(result.data);
          } else if (formValue == 'btn1_cover') {
            this.scanQrForm.controls['btn1_cover'].setValue(result.data);
          } else if (formValue == 'btn2_cover') {
            this.scanQrForm.controls['btn2_cover'].setValue(result.data);
          }
        } else if (formName == 'appfeature') {
          if (formValue == 'cover') {
            this.appFeaturesForm.controls['cover'].setValue(result.data);
          }
        } else if (formName == 'projectfirstfeature') {
          if (formValue == 'cover') {
            this.projectFeatureForm.controls['firstFeature'].controls['detail_cover'].setValue(result.data);
          } else if (formValue == 'icon') {
            this.projectFeatureForm.controls['firstFeature'].controls['icon'].setValue(result.data);
          }
        } else if (formName == 'projectsecondfeature') {
          if (formValue == 'cover') {
            this.projectFeatureForm.controls['secondFeature'].controls['detail_cover'].setValue(result.data);
          } else if (formValue == 'icon') {
            this.projectFeatureForm.controls['secondFeature'].controls['icon'].setValue(result.data);
          }
        } else if (formName == 'projectthirdfeature') {
          if (formValue == 'cover') {
            this.projectFeatureForm.controls['thirdFeature'].controls['detail_cover'].setValue(result.data);
          } else if (formValue == 'icon') {
            this.projectFeatureForm.controls['thirdFeature'].controls['icon'].setValue(result.data);
          }
        } else if (formName == 'projectfourthfeature') {
          if (formValue == 'cover') {
            this.projectFeatureForm.controls['fourthFeature'].controls['detail_cover'].setValue(result.data);
          } else if (formValue == 'icon') {
            this.projectFeatureForm.controls['fourthFeature'].controls['icon'].setValue(result.data);
          }
        }
      }
    });
  }

  onHeroSubmit() {
    console.log('on submit');
    const mainLocale = this.heroForm.get('translations') as FormArray;
    mainLocale.clear();
    this.heroLanguages.forEach((element) => {
      mainLocale.push(this.fb.group(
        {
          name: [element.name],
          code: [element.code],
          nativeName: [element.nativeName],
          highlight: [element.highlight],
          title: [element.title],
          subtitle: [element.subtitle],
          header: [element.header],
        }
      ));
    });

    const statOneForm = this.heroForm.get('stats_one');
    const statOneLocale = statOneForm?.get('translations') as FormArray;
    statOneLocale?.clear();
    this.statOneLanguages.forEach((element) => {
      statOneLocale?.push(this.fb.group(
        {
          name: [element.name],
          code: [element.code],
          nativeName: [element.nativeName],
          title: [element.title],
          subtitle: [element.subtitle],
        }
      ));
    });

    const statTwoForm = this.heroForm.get('stats_two');
    const statTwoLocale = statTwoForm?.get('translations') as FormArray;
    statTwoLocale?.clear();
    this.statTwoLanguages.forEach((element) => {
      statTwoLocale?.push(this.fb.group(
        {
          name: [element.name],
          code: [element.code],
          nativeName: [element.nativeName],
          title: [element.title],
          subtitle: [element.subtitle],
        }
      ));
    });

    const statThreeForm = this.heroForm.get('stats_three');
    const statThreeLocale = statThreeForm?.get('translations') as FormArray;
    statThreeLocale?.clear();
    this.statThreeLanguages.forEach((element) => {
      statThreeLocale?.push(this.fb.group(
        {
          name: [element.name],
          code: [element.code],
          nativeName: [element.nativeName],
          title: [element.title],
          subtitle: [element.subtitle],
        }
      ));
    });

    const statFourForm = this.heroForm.get('stats_four');
    const statFourLocale = statFourForm?.get('translations') as FormArray;
    statFourLocale?.clear();
    this.statFourLanguages.forEach((element) => {
      statFourLocale?.push(this.fb.group(
        {
          name: [element.name],
          code: [element.code],
          nativeName: [element.nativeName],
          title: [element.title],
          subtitle: [element.subtitle],
        }
      ));
    });

    console.log(this.heroForm);
    console.log(this.heroForm.getRawValue());
    this.haveHeroSubmitClicked = true;
    if (this.heroForm.valid) {
      console.log('OK');
      const spinnerRef = this.util.start('ts_saving');
      this.api.post_private('v1/admin/landing_page/save_hero_content/', this.heroForm.getRawValue()).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_setting_saved');
        }, error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  onHeroReset() {
    console.log('reset');
    this.heroForm.reset({
      highlight: '',
      title: '',
      subtitle: '',
      header: '',
      btn1_enable: true,
      btn1_href: '',
      btn1_cover: '',
      btn2_enable: true,
      btn2_href: '',
      btn2_cover: '',
      cover: '',
      hash1_img: '',
      hash1_txt: '',
      hash2_img: '',
      hash2_txt: '',
      hash3_img: '',
      hash3_txt: '',
      translations: [],
      stats_one: {
        cover: '',
        title: '',
        subtitle: '',
        translations: []
      },
      stats_two: {
        cover: '',
        title: '',
        subtitle: '',
        translations: []
      },
      stats_three: {
        cover: '',
        title: '',
        subtitle: '',
        translations: []
      },
      stats_four: {
        cover: '',
        title: '',
        subtitle: '',
        translations: []
      }
    });
    const heroLanguages = this.heroLanguages.map((item) => {
      item.highlight = '';
      item.title = '';
      item.subtitle = '';
      item.header = '';
      return item;
    });
    this.heroLanguages = heroLanguages;

    const statOneLanguages = this.statOneLanguages.map((item) => {
      item.title = '';
      item.subtitle = '';
      return item;
    });
    this.statOneLanguages = statOneLanguages;

    const statTwoLanguages = this.statTwoLanguages.map((item) => {
      item.title = '';
      item.subtitle = '';
      return item;
    });
    this.statTwoLanguages = statTwoLanguages;

    const statThreeLanguages = this.statThreeLanguages.map((item) => {
      item.title = '';
      item.subtitle = '';
      return item;
    });
    this.statThreeLanguages = statThreeLanguages;

    const statFourLanguages = this.statFourLanguages.map((item) => {
      item.title = '';
      item.subtitle = '';
      return item;
    });
    this.statFourLanguages = statFourLanguages;

    this.haveHeroSubmitClicked = false;
  }

  onServiceSubmit() {
    console.log('on submit');
    const mainLocale = this.serviceForm.get('translations') as FormArray;
    mainLocale.clear();
    this.serviceLanguages.forEach((element) => {
      mainLocale.push(this.fb.group(
        {
          name: [element.name],
          code: [element.code],
          nativeName: [element.nativeName],
          title: [element.title],
          subtitle: [element.subtitle],
        }
      ));
    });
    console.log(this.serviceForm);
    console.log(this.serviceForm.getRawValue());
    this.haveServiceSubmitClicked = true;
    if (this.serviceForm.valid) {
      console.log('OK');
      const spinnerRef = this.util.start('ts_saving');
      this.api.post_private('v1/admin/landing_page/save_service_content/', this.serviceForm.getRawValue()).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_setting_saved');
        }, error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  addService() {
    const dialogRef = this.dialog.open(DialogLandingPageContent, {
      disableClose: true,
      data: { action: 'create', from: 'service' },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.serviceArray.push(result.data);
        const mappedList = this.serviceArray.map(
          (item: AdminLandingPageServiceInterface, index: number) => {
            item.serial = index + 1;
            if (item.translations) {
              const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
              item.displayTitle = translation?.title || item.title;
              item.displaySubTitle = translation?.subtitle || item.subtitle;
            } else {
              item.displayTitle = item?.title || '';
              item.displaySubTitle = item?.subtitle || '';
            }
            return item;
          }
        );
        this.serviceArray = mappedList;
        this.serviceArray = [...this.serviceArray];
        console.log(this.serviceArray);
        const services = this.serviceForm.get('services') as FormArray;
        services.clear();
        this.serviceArray.forEach((element) => {
          services.push(this.fb.group({ title: [element.title], subtitle: [element.subtitle], serial: [element.serial], translations: [element.translations] }));
        });
      }
    });
  }

  onDeleteService(service: AdminLandingPageServiceInterface) {
    this.serviceArray = this.serviceArray.filter(x => x.displayTitle != service.displayTitle);
    this.serviceArray = [...this.serviceArray];
    const services = this.serviceForm.get('services') as FormArray;
    services.clear();
    this.serviceArray.forEach((element) => {
      services.push(this.fb.group({ title: [element.title], subtitle: [element.subtitle], serial: [element.serial], translations: [element.translations] }));
    });
  }

  onEditService(service: AdminLandingPageServiceInterface) {
    const dialogRef = this.dialog.open(DialogLandingPageContent, {
      disableClose: true,
      data: { action: 'edit', from: 'service', value: service },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'edit') {
        const index = this.serviceArray.findIndex((element) => element.title == service.title);
        if (index != -1) {
          this.serviceArray[index] = result.data;
          this.serviceArray = [...this.serviceArray];
          const mappedList = this.serviceArray.map(
            (item: AdminLandingPageServiceInterface) => {
              item.serial = service.serial;
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayTitle = translation?.title || item.title;
                item.displaySubTitle = translation?.subtitle || item.subtitle;
              } else {
                item.displayTitle = item?.title || '';
                item.displaySubTitle = item?.subtitle || '';
              }
              return item;
            }
          );
          this.serviceArray = mappedList;
          const services = this.serviceForm.get('services') as FormArray;
          services.clear();
          this.serviceArray.forEach((element) => {
            services.push(this.fb.group({ title: [element.title], subtitle: [element.subtitle], serial: [element.serial], translations: [element.translations] }));
          });
        }
      }
    });
  }

  onServiceReset() {
    console.log('reset');
    (this.serviceForm.get('translations') as FormArray).clear();
    (this.serviceForm.get('services') as FormArray).clear();

    this.serviceForm.reset({
      title: '',
      subtitle: '',
      translations: [],
      services: []
    });

    this.serviceForm.markAsPristine();
    this.serviceForm.markAsUntouched();
    this.serviceForm.updateValueAndValidity();

    const serviceLanguages = this.serviceLanguages.map((item) => {
      item.title = '';
      item.subtitle = '';
      return item;
    });
    this.serviceLanguages = serviceLanguages;
    this.serviceArray = [];
    this.haveServiceSubmitClicked = false;
  }

  addFaqs() {
    const dialogRef = this.dialog.open(DialogLandingPageContent, {
      disableClose: true,
      data: { action: 'create', from: 'faqs' },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.faqsArray.push(result.data);
        const mappedList = this.faqsArray.map(
          (item: AdminLandingPageFAQsInterface, index: number) => {
            item.serial = index + 1;
            if (item.translations) {
              const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
              item.displayTitle = translation?.title || item.title;
            } else {
              item.displayTitle = item?.title || '';
            }
            return item;
          }
        );
        this.faqsArray = mappedList;
        this.faqsArray = [...this.faqsArray];
        console.log(this.faqsArray);
        const faqs = this.faqsForm.get('questions') as FormArray;
        faqs.clear();
        this.faqsArray.forEach((element) => {
          faqs.push(this.fb.group({ title: [element.title], subtitle: [element.subtitle], serial: [element.serial], translations: [element.translations] }));
        });
      }
    });
  }

  onDeleteFaqs(faq: AdminLandingPageFAQsInterface) {
    console.log(faq);
    this.faqsArray = this.faqsArray.filter(x => x.displayTitle != faq.displayTitle);
    this.faqsArray = [...this.faqsArray];
    const faqs = this.faqsForm.get('questions') as FormArray;
    faqs.clear();
    this.faqsArray.forEach((element) => {
      faqs.push(this.fb.group({ title: [element.title], subtitle: [element.subtitle], serial: [element.serial], translations: [element.translations] }));
    });
  }

  onEditFaqs(faq: AdminLandingPageFAQsInterface) {
    console.log(faq);
    const dialogRef = this.dialog.open(DialogLandingPageContent, {
      disableClose: true,
      data: { action: 'edit', from: 'faqs', value: faq },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'edit') {
        const index = this.faqsArray.findIndex((element) => element.title == faq.title);
        if (index != -1) {
          this.faqsArray[index] = result.data;
          this.faqsArray = [...this.faqsArray];
          const mappedList = this.faqsArray.map(
            (item: AdminLandingPageServiceInterface) => {
              item.serial = faq.serial;
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayTitle = translation?.title || item.title;
                item.displaySubTitle = translation?.subtitle || item.subtitle;
              } else {
                item.displayTitle = item?.title || '';
                item.displaySubTitle = item?.subtitle || '';
              }
              return item;
            }
          );
          this.faqsArray = mappedList;
          this.faqsArray = [...this.faqsArray];
          console.log(this.faqsArray);
          const faqs = this.faqsForm.get('questions') as FormArray;
          faqs.clear();
          this.faqsArray.forEach((element) => {
            faqs.push(this.fb.group({ title: [element.title], subtitle: [element.subtitle], serial: [element.serial], translations: [element.translations] }));
          });
        }
      }
    });
  }

  onFaqsSubmit() {
    console.log('on submit');
    const mainLocale = this.faqsForm.get('translations') as FormArray;
    mainLocale.clear();
    this.faqsLanguages.forEach((element) => {
      mainLocale.push(this.fb.group(
        {
          name: [element.name],
          code: [element.code],
          nativeName: [element.nativeName],
          title: [element.title],
          subtitle: [element.subtitle],
        }
      ));
    });
    console.log(this.faqsForm);
    console.log(this.faqsForm.getRawValue());
    this.haveFaqsSubmitClicked = true;
    if (this.faqsForm.valid) {
      console.log('OK');
      const spinnerRef = this.util.start('ts_saving');
      this.api.post_private('v1/admin/landing_page/save_faqs_content/', this.faqsForm.getRawValue()).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_setting_saved');
        }, error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  onFaqsReset() {
    console.log('reset');
    (this.faqsForm.get('translations') as FormArray).clear();
    (this.faqsForm.get('questions') as FormArray).clear();

    this.faqsForm.reset({
      title: '',
      subtitle: '',
      translations: [],
      questions: []
    });

    this.faqsForm.markAsPristine();
    this.faqsForm.markAsUntouched();
    this.faqsForm.updateValueAndValidity();

    const faqsLanguages = this.faqsLanguages.map((item) => {
      item.title = '';
      item.subtitle = [];
      return item;
    });
    this.faqsLanguages = faqsLanguages;

    this.faqsArray = [];

    this.haveFaqsSubmitClicked = false;
  }

  onAddReview() {
    const dialogRef = this.dialog.open(DialogLandingPageContent, {
      disableClose: true,
      data: { action: 'create', from: 'review' },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.reviewArray.push(result.data);
        const mappedList = this.reviewArray.map(
          (item: AdminLandingReviewInterface) => {
            if (item.translations) {
              const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
              item.displayName = translation?.value || item.message;
            } else {
              item.displayName = item?.message || '';
            }
            return item;
          }
        );
        this.reviewArray = mappedList;
        this.reviewArray = [...this.reviewArray];
        console.log(this.reviewArray);
        const reviews = this.reviewForm.get('reviews') as FormArray;
        reviews.clear();
        this.reviewArray.forEach((element) => {
          reviews.push(this.fb.group({ image: [element.image], message: [element.message], occupation: [element.occupation], star: [element.star], userName: [element.userName], translations: [element.translations] }));
        });
      }
    });
  }

  onEditReview(review: AdminLandingReviewInterface) {
    console.log(review);
    const dialogRef = this.dialog.open(DialogLandingPageContent, {
      disableClose: true,
      data: { action: 'edit', from: 'review', value: review },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'edit') {
        const index = this.reviewArray.findIndex((element) => element.userName == review.userName);
        if (index != -1) {
          this.reviewArray[index] = result.data;
          this.reviewArray = [...this.reviewArray];
          const mappedList = this.reviewArray.map(
            (item: AdminLandingReviewInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.message;
              } else {
                item.displayName = item?.message || '';
              }
              return item;
            }
          );
          this.reviewArray = mappedList;
          this.reviewArray = [...this.reviewArray];
          console.log(this.reviewArray);
          const reviews = this.reviewForm.get('reviews') as FormArray;
          reviews.clear();
          this.reviewArray.forEach((element) => {
            reviews.push(this.fb.group({ image: [element.image], message: [element.message], occupation: [element.occupation], star: [element.star], userName: [element.userName], translations: [element.translations] }));
          });
        }
      }
    });
  }

  onDeleteReview(review: AdminLandingReviewInterface) {
    console.log(review);
    this.reviewArray = this.reviewArray.filter(x => x.userName != review.userName);
    this.reviewArray = [...this.reviewArray];
    const reviews = this.reviewForm.get('reviews') as FormArray;
    reviews.clear();
    this.reviewArray.forEach((element) => {
      reviews.push(this.fb.group({ image: [element.image], message: [element.message], occupation: [element.occupation], star: [element.star], userName: [element.userName], translations: [element.translations] }));
    });
  }

  onReviewSubmit() {
    console.log('on submit');
    const mainLocale = this.reviewForm.get('translations') as FormArray;
    mainLocale.clear();
    this.reviewLanguages.forEach((element) => {
      mainLocale.push(this.fb.group(
        {
          name: [element.name],
          code: [element.code],
          nativeName: [element.nativeName],
          title: [element.title],
          subtitle: [element.subtitle],
        }
      ));
    });
    console.log(this.reviewForm);
    console.log(this.reviewForm.getRawValue());
    this.haveReviewSubmitClicked = true;
    if (this.reviewForm.valid) {
      console.log('OK');
      const spinnerRef = this.util.start('ts_saving');
      this.api.post_private('v1/admin/landing_page/save_review_content/', this.reviewForm.getRawValue()).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_setting_saved');
        }, error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  onReviewReset() {
    console.log('reset');
    (this.reviewForm.get('translations') as FormArray).clear();
    (this.reviewForm.get('reviews') as FormArray).clear();

    this.reviewForm.reset({
      title: '',
      subtitle: '',
      translations: [],
      reviews: []
    });

    this.reviewForm.markAsPristine();
    this.reviewForm.markAsUntouched();
    this.reviewForm.updateValueAndValidity();

    const reviewLanguages = this.reviewLanguages.map((item) => {
      item.title = '';
      item.subtitle = '';
      return item;
    });
    this.reviewLanguages = reviewLanguages;
    this.reviewArray = [];
    this.haveReviewSubmitClicked = false;
  }

  scanQrOneBtnChange(event: MatSlideToggleChange) {
    console.log(event);
    this.scanQrForm.controls['btn1_enable'].setValue(event.checked);
    if (event.checked) {
      this.scanQrForm.controls['btn1_cover'].setValue('');
      this.scanQrForm.controls['btn1_cover'].setValidators(Validators.required);
      this.scanQrForm.controls['btn1_cover'].enable();

      this.scanQrForm.controls['btn1_href'].setValue('');
      this.scanQrForm.controls['btn1_href'].setValidators(Validators.required);
      this.scanQrForm.controls['btn1_href'].enable();
    } else {
      this.scanQrForm.controls['btn1_cover'].setValue('');
      this.scanQrForm.controls['btn1_cover'].clearValidators();
      this.scanQrForm.controls['btn1_cover'].disable();

      this.scanQrForm.controls['btn1_href'].setValue('');
      this.scanQrForm.controls['btn1_href'].clearValidators();
      this.scanQrForm.controls['btn1_href'].disable();
    }
  }

  scanQrTwoBtnChange(event: MatSlideToggleChange) {
    console.log(event);
    this.scanQrForm.controls['btn2_enable'].setValue(event.checked);
    if (event.checked) {
      this.scanQrForm.controls['btn2_cover'].setValue('');
      this.scanQrForm.controls['btn2_cover'].setValidators(Validators.required);
      this.scanQrForm.controls['btn2_cover'].enable();

      this.scanQrForm.controls['btn2_href'].setValue('');
      this.scanQrForm.controls['btn2_href'].setValidators(Validators.required);
      this.scanQrForm.controls['btn2_href'].enable();
    } else {
      this.scanQrForm.controls['btn2_cover'].setValue('');
      this.scanQrForm.controls['btn2_cover'].clearValidators();
      this.scanQrForm.controls['btn2_cover'].disable();

      this.scanQrForm.controls['btn2_href'].setValue('');
      this.scanQrForm.controls['btn2_href'].clearValidators();
      this.scanQrForm.controls['btn2_href'].disable();
    }
  }

  onScanQrSubmit() {
    console.log('submit');
    const mainLocale = this.scanQrForm.get('translations') as FormArray;
    mainLocale.clear();
    this.scanQrLanguages.forEach((element) => {
      mainLocale.push(this.fb.group(
        {
          name: [element.name],
          code: [element.code],
          nativeName: [element.nativeName],
          title: [element.title],
          subtitle: [element.subtitle],
        }
      ));
    });
    console.log(this.scanQrForm);
    console.log(this.scanQrForm.getRawValue());
    this.haveScanQrSubmitClicked = true;
    if (this.scanQrForm.valid) {
      console.log('OK');
      const spinnerRef = this.util.start('ts_saving');
      this.api.post_private('v1/admin/landing_page/save_scan_qr_content/', this.scanQrForm.getRawValue()).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_setting_saved');
        }, error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  onScanQrReset() {
    console.log('reset');
    (this.scanQrForm.get('translations') as FormArray).clear();

    this.scanQrForm.reset({
      title: '',
      subtitle: '',
      btn1_enable: true,
      btn1_href: '',
      btn1_cover: '',
      btn2_enable: true,
      btn2_href: '',
      btn2_cover: '',
      cover: '',
      translations: []
    });

    this.scanQrForm.markAsPristine();
    this.scanQrForm.markAsUntouched();
    this.scanQrForm.updateValueAndValidity();
    const localeMapped = this.scanQrLanguages.map((item) => {
      item.title = '';
      item.subtitle = '';
      return item;
    });
    this.scanQrLanguages = localeMapped;

    this.haveScanQrSubmitClicked = false;
  }

  onAddAppFeature() {
    if (this.appFeatureArray.length < 10) {
      const dialogRef = this.dialog.open(DialogLandingPageContent, {
        disableClose: true,
        data: { action: 'create', from: 'appfeature' },
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
        if (result && result.event == 'add') {
          this.appFeatureArray.push(result.data);
          const mappedList = this.appFeatureArray.map(
            (item: AdminLandingPageAppFeatureInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayTitle = translation?.title || item.title;
                item.displaySubTitle = translation?.subtitle || item.subtitle;
              } else {
                item.displayTitle = item?.title || '';
                item.displaySubTitle = item?.subtitle || '';
              }
              return item;
            }
          );
          this.appFeatureArray = mappedList;
          this.appFeatureArray = [...this.appFeatureArray];
          console.log(this.appFeatureArray);
          const feature = this.appFeaturesForm.get('features') as FormArray;
          feature.clear();
          this.appFeatureArray.forEach((element) => {
            feature.push(this.fb.group({ title: [element.title], subtitle: [element.subtitle], image: [element.image], translations: [element.translations] }));
          });
        }
      });
    } else {
      this.util.onError('ts_feature_limit_error', '');
    }
  }

  onEditAppFeature(feature: AdminLandingPageAppFeatureInterface) {
    console.log(feature);
    const dialogRef = this.dialog.open(DialogLandingPageContent, {
      disableClose: true,
      data: { action: 'edit', from: 'appfeature', value: feature },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'edit') {
        const index = this.appFeatureArray.findIndex((element) => element.title == feature.title);
        if (index != -1) {
          this.appFeatureArray[index] = result.data;
          this.appFeatureArray = [...this.appFeatureArray];
          const mappedList = this.appFeatureArray.map(
            (item: AdminLandingPageAppFeatureInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayTitle = translation?.title || item.title;
                item.displaySubTitle = translation?.subtitle || item.subtitle;
              } else {
                item.displayTitle = item?.title || '';
                item.displaySubTitle = item?.subtitle || '';
              }
              return item;
            }
          );
          this.appFeatureArray = mappedList;
          this.appFeatureArray = [...this.appFeatureArray];
          console.log(this.appFeatureArray);
          const feature = this.appFeaturesForm.get('features') as FormArray;
          feature.clear();
          this.appFeatureArray.forEach((element) => {
            feature.push(this.fb.group({ title: [element.title], subtitle: [element.subtitle], image: [element.image], translations: [element.translations] }));
          });
        }
      }
    });
  }

  onDeleteAppFeature(feature: AdminLandingPageAppFeatureInterface) {
    console.log(feature);
    this.appFeatureArray = this.appFeatureArray.filter(x => x.title != feature.title);
    this.appFeatureArray = [...this.appFeatureArray];
    const features = this.appFeaturesForm.get('features') as FormArray;
    features.clear();
    this.appFeatureArray.forEach((element) => {
      features.push(this.fb.group({ title: [element.title], subtitle: [element.subtitle], image: [element.image], translations: [element.translations] }));
    });
  }

  onAppFeatureSubmit() {
    console.log('on submit');
    const mainLocale = this.appFeaturesForm.get('translations') as FormArray;
    mainLocale.clear();
    this.appFeatureLanguages.forEach((element) => {
      mainLocale.push(this.fb.group(
        {
          name: [element.name],
          code: [element.code],
          nativeName: [element.nativeName],
          title: [element.title],
          subtitle: [element.subtitle],
        }
      ));
    });
    console.log(this.appFeaturesForm);
    console.log(this.appFeaturesForm.getRawValue());
    this.haveAppFeatureSubmitClicked = true;
    if (this.appFeaturesForm.valid) {
      console.log('OK');
      const spinnerRef = this.util.start('ts_saving');
      this.api.post_private('v1/admin/landing_page/save_app_feature_content/', this.appFeaturesForm.getRawValue()).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_setting_saved');
        }, error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  onAppFeatureReset() {
    console.log('reset');
    (this.appFeaturesForm.get('translations') as FormArray).clear();
    (this.appFeaturesForm.get('features') as FormArray).clear();

    this.appFeaturesForm.reset({
      title: '',
      subtitle: '',
      cover: '',
      translations: [],
      features: []
    });

    this.appFeaturesForm.markAsPristine();
    this.appFeaturesForm.markAsUntouched();
    this.appFeaturesForm.updateValueAndValidity();

    const appFeatureLanguages = this.appFeatureLanguages.map((item) => {
      item.title = '';
      item.subtitle = '';
      return item;
    });
    this.appFeatureLanguages = appFeatureLanguages;
    this.appFeatureArray = [];
    this.haveAppFeatureSubmitClicked = false;
  }

  onAddFeatureBullet(formIndex: number) {
    console.log(`Add ${formIndex} Feature`);
    const dialogRef = this.dialog.open(DialogLandingPageContent, {
      disableClose: true,
      data: { action: 'create', from: 'bullet' },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        if (formIndex == 1) {
          this.firstBulletArray.push(result.data);
          const mappedList = this.firstBulletArray.map(
            (item: AdminLandingPageFeatureBulletPointInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.lbl;
              } else {
                item.displayName = item?.lbl || '';
              }
              return item;
            }
          );
          this.firstBulletArray = mappedList;
          this.firstBulletArray = [...this.firstBulletArray];
          console.log(this.firstBulletArray);
          const firstFeature = this.projectFeatureForm.get('firstFeature');
          if (firstFeature) {
            const bullet = firstFeature.get('detail_list') as FormArray;
            bullet.clear();
            this.firstBulletArray.forEach((element) => {
              bullet.push(this.fb.group({ lbl: [element.lbl], translations: [element.translations] }));
            });
          }
        } else if (formIndex == 2) {
          this.secondBulletArray.push(result.data);
          const mappedList = this.secondBulletArray.map(
            (item: AdminLandingPageFeatureBulletPointInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.lbl;
              } else {
                item.displayName = item?.lbl || '';
              }
              return item;
            }
          );
          this.secondBulletArray = mappedList;
          this.secondBulletArray = [...this.secondBulletArray];
          console.log(this.secondBulletArray);
          const secondFeature = this.projectFeatureForm.get('secondFeature');
          if (secondFeature) {
            const bullet = secondFeature.get('detail_list') as FormArray;
            bullet.clear();
            this.secondBulletArray.forEach((element) => {
              bullet.push(this.fb.group({ lbl: [element.lbl], translations: [element.translations] }));
            });
          }
        } else if (formIndex == 3) {
          this.thirdBulletArray.push(result.data);
          const mappedList = this.thirdBulletArray.map(
            (item: AdminLandingPageFeatureBulletPointInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.lbl;
              } else {
                item.displayName = item?.lbl || '';
              }
              return item;
            }
          );
          this.thirdBulletArray = mappedList;
          this.thirdBulletArray = [...this.thirdBulletArray];
          console.log(this.thirdBulletArray);
          const thirdFeature = this.projectFeatureForm.get('thirdFeature');
          if (thirdFeature) {
            const bullet = thirdFeature.get('detail_list') as FormArray;
            if (bullet) {
              bullet.clear();
              this.thirdBulletArray.forEach((element) => {
                bullet.push(this.fb.group({ lbl: [element.lbl], translations: [element.translations] }));
              });
            }
          }
        } else if (formIndex == 4) {
          this.fourthBulletArray.push(result.data);
          const mappedList = this.fourthBulletArray.map(
            (item: AdminLandingPageFeatureBulletPointInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.lbl;
              } else {
                item.displayName = item?.lbl || '';
              }
              return item;
            }
          );
          this.fourthBulletArray = mappedList;
          this.fourthBulletArray = [...this.fourthBulletArray];
          console.log(this.fourthBulletArray);
          const fourthFeature = this.projectFeatureForm.get('fourthFeature');
          if (fourthFeature) {
            const bullet = fourthFeature.get('detail_list') as FormArray;
            if (bullet) {
              bullet.clear();
              this.fourthBulletArray.forEach((element) => {
                bullet.push(this.fb.group({ lbl: [element.lbl], translations: [element.translations] }));
              });
            }
          }
        }
      }
    });
  }

  onFeatureBulletEdit(bullet: AdminLandingPageFeatureBulletPointInterface, featureIndex: number) {
    console.log(bullet, featureIndex);
    const dialogRef = this.dialog.open(DialogLandingPageContent, {
      disableClose: true,
      data: { action: 'edit', from: 'bullet', value: bullet },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'edit') {
        if (featureIndex == 1) {
          const index = this.firstBulletArray.findIndex((element) => element.lbl == bullet.lbl);
          if (index != -1) {
            this.firstBulletArray[index] = result.data;
            this.firstBulletArray = [...this.firstBulletArray];
            const mappedList = this.firstBulletArray.map(
              (item: AdminLandingPageFeatureBulletPointInterface) => {
                if (item.translations) {
                  const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                  item.displayName = translation?.value || item.lbl;
                } else {
                  item.displayName = item?.lbl || '';
                }
                return item;
              }
            );
            this.firstBulletArray = mappedList;
            this.firstBulletArray = [...this.firstBulletArray];
            const firstFeature = this.projectFeatureForm.get('firstFeature');
            if (firstFeature) {
              const bullet = firstFeature.get('detail_list') as FormArray;
              bullet.clear();
              this.firstBulletArray.forEach((element) => {
                bullet.push(this.fb.group({ lbl: [element.lbl], translations: [element.translations] }));
              });
            }
          }
        } else if (featureIndex == 2) {
          const index = this.secondBulletArray.findIndex((element) => element.lbl == bullet.lbl);
          if (index != -1) {
            this.secondBulletArray[index] = result.data;
            this.secondBulletArray = [...this.secondBulletArray];
            const mappedList = this.secondBulletArray.map(
              (item: AdminLandingPageFeatureBulletPointInterface) => {
                if (item.translations) {
                  const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                  item.displayName = translation?.value || item.lbl;
                } else {
                  item.displayName = item?.lbl || '';
                }
                return item;
              }
            );
            this.secondBulletArray = mappedList;
            this.secondBulletArray = [...this.secondBulletArray];
            const secondFeature = this.projectFeatureForm.get('secondFeature');
            if (secondFeature) {
              const bullet = secondFeature.get('detail_list') as FormArray;
              if (bullet) {
                bullet.clear();
                this.secondBulletArray.forEach((element) => {
                  bullet.push(this.fb.group({ lbl: [element.lbl], translations: [element.translations] }));
                });
              }
            }
          }
        } else if (featureIndex == 3) {
          const index = this.thirdBulletArray.findIndex((element) => element.lbl == bullet.lbl);
          if (index != -1) {
            this.thirdBulletArray[index] = result.data;
            this.thirdBulletArray = [...this.thirdBulletArray];
            const mappedList = this.thirdBulletArray.map(
              (item: AdminLandingPageFeatureBulletPointInterface) => {
                if (item.translations) {
                  const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                  item.displayName = translation?.value || item.lbl;
                } else {
                  item.displayName = item?.lbl || '';
                }
                return item;
              }
            );
            this.thirdBulletArray = mappedList;
            this.thirdBulletArray = [...this.thirdBulletArray];
            const thirdFeature = this.projectFeatureForm.get('thirdFeature');
            if (thirdFeature) {
              const bullet = thirdFeature.get('detail_list') as FormArray;
              if (bullet) {
                bullet.clear();
                this.thirdBulletArray.forEach((element) => {
                  bullet.push(this.fb.group({ lbl: [element.lbl], translations: [element.translations] }));
                });
              }
            }
          }
        } else if (featureIndex == 4) {
          const index = this.fourthBulletArray.findIndex((element) => element.lbl == bullet.lbl);
          if (index != -1) {
            this.fourthBulletArray[index] = result.data;
            this.fourthBulletArray = [...this.fourthBulletArray];
            const mappedList = this.fourthBulletArray.map(
              (item: AdminLandingPageFeatureBulletPointInterface) => {
                if (item.translations) {
                  const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                  item.displayName = translation?.value || item.lbl;
                } else {
                  item.displayName = item?.lbl || '';
                }
                return item;
              }
            );
            this.fourthBulletArray = mappedList;
            this.fourthBulletArray = [...this.fourthBulletArray];
            const fourthFeature = this.projectFeatureForm.get('fourthFeature');
            if (fourthFeature) {
              const bullet = fourthFeature.get('detail_list') as FormArray;
              if (bullet) {
                bullet.clear();
                this.fourthBulletArray.forEach((element) => {
                  bullet.push(this.fb.group({ lbl: [element.lbl], translations: [element.translations] }));
                });
              }
            }
          }
        }
      }
    });
  }

  onFeatureBulletDelete(bulletItem: AdminLandingPageFeatureBulletPointInterface, featureIndex: number) {
    console.log(bulletItem, featureIndex);
    if (featureIndex == 1) {
      this.firstBulletArray = this.firstBulletArray.filter(x => x.lbl != bulletItem.lbl);
      this.firstBulletArray = [...this.firstBulletArray];
      const firstFeature = this.projectFeatureForm.get('firstFeature');
      if (firstFeature) {
        const bullet = firstFeature.get('detail_list') as FormArray;
        if (bullet) {
          bullet.clear();
          this.firstBulletArray.forEach((element) => {
            bullet.push(this.fb.group({ lbl: [element.lbl], translations: [element.translations] }));
          });
        }
      }
    } else if (featureIndex == 2) {
      this.secondBulletArray = this.secondBulletArray.filter(x => x.lbl != bulletItem.lbl);
      this.secondBulletArray = [...this.secondBulletArray];
      const secondFeature = this.projectFeatureForm.get('secondFeature');
      if (secondFeature) {
        const bullet = secondFeature.get('detail_list') as FormArray;
        if (bullet) {
          bullet.clear();
          this.secondBulletArray.forEach((element) => {
            bullet.push(this.fb.group({ lbl: [element.lbl], translations: [element.translations] }));
          });
        }
      }
    } else if (featureIndex == 3) {
      this.thirdBulletArray = this.thirdBulletArray.filter(x => x.lbl != bulletItem.lbl);
      this.thirdBulletArray = [...this.thirdBulletArray];
      const thirdFeature = this.projectFeatureForm.get('thirdFeature');
      if (thirdFeature) {
        const bullet = thirdFeature.get('detail_list') as FormArray;
        if (bullet) {
          bullet.clear();
          this.thirdBulletArray.forEach((element) => {
            bullet.push(this.fb.group({ lbl: [element.lbl], translations: [element.translations] }));
          });
        }
      }
    } else if (featureIndex == 4) {
      this.fourthBulletArray = this.fourthBulletArray.filter(x => x.lbl != bulletItem.lbl);
      this.fourthBulletArray = [...this.fourthBulletArray];
      const fourthFeature = this.projectFeatureForm.get('fourthFeature');
      if (fourthFeature) {
        const bullet = fourthFeature.get('detail_list') as FormArray;
        if (bullet) {
          bullet.clear();
          this.fourthBulletArray.forEach((element) => {
            bullet.push(this.fb.group({ lbl: [element.lbl], translations: [element.translations] }));
          });
        }
      }
    }
  }

  onProjectFeatureSubmit() {
    console.log('submit');
    const mainLocale = this.projectFeatureForm.get('translations') as FormArray;
    mainLocale.clear();
    this.projectFeatureLanguages.forEach((element) => {
      mainLocale.push(this.fb.group(
        {
          name: [element.name],
          code: [element.code],
          nativeName: [element.nativeName],
          title: [element.title],
          subtitle: [element.subtitle],
        }
      ));
    });

    const firstFeature = this.projectFeatureForm.get('firstFeature');
    const firstLocale = firstFeature?.get('translations') as FormArray;
    firstLocale?.clear();
    this.firstFeatureLanguages.forEach((element) => {
      firstLocale?.push(this.fb.group(
        {
          name: [element.name],
          code: [element.code],
          nativeName: [element.nativeName],
          title: [element.title],
          subtitle: [element.subtitle],
          btnLbl: [element.btnLbl],
          detailTitle: [element.detailTitle],
          detailSubTitle: [element.detailSubTitle],
        }
      ));
    });

    const secondFeature = this.projectFeatureForm.get('secondFeature');
    const secondLocale = secondFeature?.get('translations') as FormArray;
    secondLocale?.clear();
    this.secondFeatureLanguages.forEach((element) => {
      secondLocale?.push(this.fb.group(
        {
          name: [element.name],
          code: [element.code],
          nativeName: [element.nativeName],
          title: [element.title],
          subtitle: [element.subtitle],
          btnLbl: [element.btnLbl],
          detailTitle: [element.detailTitle],
          detailSubTitle: [element.detailSubTitle],
        }
      ));
    });

    const thirdFeature = this.projectFeatureForm.get('thirdFeature');
    const thirdLocale = thirdFeature?.get('translations') as FormArray;
    thirdLocale?.clear();
    this.thirdFeatureLanguages.forEach((element) => {
      thirdLocale?.push(this.fb.group(
        {
          name: [element.name],
          code: [element.code],
          nativeName: [element.nativeName],
          title: [element.title],
          subtitle: [element.subtitle],
          btnLbl: [element.btnLbl],
          detailTitle: [element.detailTitle],
          detailSubTitle: [element.detailSubTitle],
        }
      ));
    });

    const fourthFeature = this.projectFeatureForm.get('fourthFeature');
    const fourthLocale = fourthFeature?.get('translations') as FormArray;
    fourthLocale?.clear();
    this.fourthFeatureLanguages.forEach((element) => {
      fourthLocale?.push(this.fb.group(
        {
          name: [element.name],
          code: [element.code],
          nativeName: [element.nativeName],
          title: [element.title],
          subtitle: [element.subtitle],
          btnLbl: [element.btnLbl],
          detailTitle: [element.detailTitle],
          detailSubTitle: [element.detailSubTitle],
        }
      ));
    });

    console.log(this.projectFeatureForm);
    console.log(this.projectFeatureForm.getRawValue());
    this.haveProjectFeatureSubmitClicked = true;
    if (this.projectFeatureForm.valid) {
      console.log('OK');
      const spinnerRef = this.util.start('ts_saving');
      this.api.post_private('v1/admin/landing_page/save_feature_content/', this.projectFeatureForm.getRawValue()).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_setting_saved');
        }, error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  onProjectFeatureReset() {
    console.log('reset');
    (this.projectFeatureForm.get('translations') as FormArray).clear();

    (this.projectFeatureForm.get(`firstFeature.detail_list`) as FormArray).clear();
    (this.projectFeatureForm.get(`firstFeature.translations`) as FormArray).clear();

    (this.projectFeatureForm.get(`secondFeature.detail_list`) as FormArray).clear();
    (this.projectFeatureForm.get(`secondFeature.translations`) as FormArray).clear();

    (this.projectFeatureForm.get(`thirdFeature.detail_list`) as FormArray).clear();
    (this.projectFeatureForm.get(`thirdFeature.translations`) as FormArray).clear();

    (this.projectFeatureForm.get(`fourthFeature.detail_list`) as FormArray).clear();
    (this.projectFeatureForm.get(`fourthFeature.translations`) as FormArray).clear();

    this.projectFeatureForm.reset({
      title: '',
      subtitle: '',
      translations: [],
      firstFeature: {
        icon: '',
        title: '',
        subtitle: '',
        btn_href: '',
        btn_lbl: '',
        detail_cover: '',
        detail_title: '',
        detail_subtitle: '',
        detail_list: [],
        translations: []
      },
      secondFeature: {
        icon: '',
        title: '',
        subtitle: '',
        btn_href: '',
        btn_lbl: '',
        detail_cover: '',
        detail_title: '',
        detail_subtitle: '',
        detail_list: [],
        translations: []
      },
      thirdFeature: {
        icon: '',
        title: '',
        subtitle: '',
        btn_href: '',
        btn_lbl: '',
        detail_cover: '',
        detail_title: '',
        detail_subtitle: '',
        detail_list: [],
        translations: []
      },
      fourthFeature: {
        icon: '',
        title: '',
        subtitle: '',
        btn_href: '',
        btn_lbl: '',
        detail_cover: '',
        detail_title: '',
        detail_subtitle: '',
        detail_list: [],
        translations: []
      }
    });

    this.projectFeatureForm.markAsPristine();
    this.projectFeatureForm.markAsUntouched();
    this.projectFeatureForm.updateValueAndValidity();

    const projectFeatureLanguages = this.projectFeatureLanguages.map((item) => {
      item.title = '';
      item.subtitle = '';
      return item;
    });
    this.projectFeatureLanguages = projectFeatureLanguages;


    const firstFeatureLanguages = this.firstFeatureLanguages.map((item) => {
      item.title = '';
      item.subtitle = '';
      item.btnLbl = '';
      item.detailTitle = '';
      item.detailSubTitle = '';
      return item;
    });
    this.firstFeatureLanguages = firstFeatureLanguages;

    const secondFeatureLanguages = this.secondFeatureLanguages.map((item) => {
      item.title = '';
      item.subtitle = '';
      item.btnLbl = '';
      item.detailTitle = '';
      item.detailSubTitle = '';
      return item;
    });
    this.secondFeatureLanguages = secondFeatureLanguages;

    const thirdFeatureLanguages = this.thirdFeatureLanguages.map((item) => {
      item.title = '';
      item.subtitle = '';
      item.btnLbl = '';
      item.detailTitle = '';
      item.detailSubTitle = '';
      return item;
    });
    this.thirdFeatureLanguages = thirdFeatureLanguages;

    const fourthFeatureLanguages = this.fourthFeatureLanguages.map((item) => {
      item.title = '';
      item.subtitle = '';
      item.btnLbl = '';
      item.detailTitle = '';
      item.detailSubTitle = '';
      return item;
    });
    this.fourthFeatureLanguages = fourthFeatureLanguages;

    this.firstBulletArray = [];
    this.secondBulletArray = [];
    this.thirdBulletArray = [];
    this.fourthBulletArray = [];

    this.haveProjectFeatureSubmitClicked = false;
  }

}
