import { Component } from '@angular/core';
import { CustomerLandingDummyInterface } from 'src/app/interfaces/customer.landing.dummay.service.interface';
import { CustomerLandingDummyReviewInterface } from 'src/app/interfaces/customer.landing.dummy.review.interface';
import { CustomerLandingFAQInterface } from 'src/app/interfaces/customer.landing.faqs.interface';
import { CustomerLandingPageAppFeatureInterface } from 'src/app/interfaces/customer.landing.page.app.feature.interface';
import { CustomerLandingPageCommanTranslationInterface } from 'src/app/interfaces/customer.landing.page.comman.translation.interface';
import { CustomerLandingPageFeatureBulletPointInterface } from 'src/app/interfaces/customer.landing.page.feature.bullet.point.interface';
import { CustomerLandingPageHeroMainTranslationInterface } from 'src/app/interfaces/customer.landing.page.hero.main.translation.interface';
import { CustomerLandingPageProjectFeatureTranslationInterface } from 'src/app/interfaces/customer.landing.page.project.feature.translation.interface';
import { CustoemrLandingPageReviewInterface } from 'src/app/interfaces/customer.landing.page.review.interface';
import { CustomerLandingPageServiceInterface } from 'src/app/interfaces/customer.landing.page.service.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-landing',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './landing.html',
})
export class Landing {

  isLoading: boolean = true;
  isDefault: boolean = true;
  currentFeatureId: string = 'customer';
  dummyServices: CustomerLandingDummyInterface[] = [];
  dummyFaqs: CustomerLandingDummyInterface[] = [];
  dummyReviews: CustomerLandingDummyReviewInterface[] = [];
  // Hero Content //
  haveHeroContent: boolean = false;
  heroHighlight: string = '';
  heroTitle: string = '';
  heroSubtitle: string = '';
  heroHeader: string = '';
  heroCover: string = '';
  heroHash1Img: string = '';
  heroHash1Txt: string = '';
  heroHash2Img: string = '';
  heroHash2Txt: string = '';
  heroHash3Img: string = '';
  heroHash3Txt: string = '';
  heroBtn1Enable: boolean = false;
  heroBtn1Cover: string = '';
  heroBtn1Href: string = '#';
  heroBtn2Enable: boolean = false;
  heroBtn2Cover: string = '';
  heroBtn2Href: string = '#';
  heroStatsOneCover: string = '';
  heroStatsOneTitle: string = '';
  heroStatsOneSubTitle: string = '';
  heroStatsTwoCover: string = '';
  heroStatsTwoTitle: string = '';
  heroStatsTwoSubTitle: string = '';
  heroStatsThreeCover: string = '';
  heroStatsThreeTitle: string = '';
  heroStatsThreeSubTitle: string = '';
  heroStatsFourCover: string = '';
  heroStatsFourTitle: string = '';
  heroStatsFourSubTitle: string = '';
  // Hero Content //

  // App Feature Content //
  haveAppFeature: boolean = false;
  appFeatureCover: string = '';
  appFeatureTitle: string = '';
  appFeatureSubTitle: string = '';
  appFeatureList: CustomerLandingPageAppFeatureInterface[] = [];
  // App Feature Content //

  // Project Feature Content //
  haveProjectFeature: boolean = false;
  projectFeatureTitle: string = '';
  projectFeatureSubTitle: string = '';

  projectFeature1BtnHref: string = '';
  projectFeature1BtnLbl: string = '';
  projectFeature1DetailCover: string = '';
  projectFeature1DetailSubTitle: string = '';
  projectFeature1DetailTitle: string = '';
  projectFeature1Icon: string = '';
  projectFeature1Title: string = '';
  projectFeature1SubTitle: string = '';
  projectFeature1Bullet: CustomerLandingPageFeatureBulletPointInterface[] = [];

  projectFeature2BtnHref: string = '';
  projectFeature2BtnLbl: string = '';
  projectFeature2DetailCover: string = '';
  projectFeature2DetailSubTitle: string = '';
  projectFeature2DetailTitle: string = '';
  projectFeature2Icon: string = '';
  projectFeature2Title: string = '';
  projectFeature2SubTitle: string = '';
  projectFeature2Bullet: CustomerLandingPageFeatureBulletPointInterface[] = [];

  projectFeature3BtnHref: string = '';
  projectFeature3BtnLbl: string = '';
  projectFeature3DetailCover: string = '';
  projectFeature3DetailSubTitle: string = '';
  projectFeature3DetailTitle: string = '';
  projectFeature3Icon: string = '';
  projectFeature3Title: string = '';
  projectFeature3SubTitle: string = '';
  projectFeature3Bullet: CustomerLandingPageFeatureBulletPointInterface[] = [];

  projectFeature4BtnHref: string = '';
  projectFeature4BtnLbl: string = '';
  projectFeature4DetailCover: string = '';
  projectFeature4DetailSubTitle: string = '';
  projectFeature4DetailTitle: string = '';
  projectFeature4Icon: string = '';
  projectFeature4Title: string = '';
  projectFeature4SubTitle: string = '';
  projectFeature4Bullet: CustomerLandingPageFeatureBulletPointInterface[] = [];
  // Project Feature Content //

  // Service Content //
  haveServiceContent: boolean = false;
  serviceTitle: string = '';
  serviceSubTitle: string = '';
  servicesList: CustomerLandingPageServiceInterface[] = [];
  // Service Content //

  // FAQs Content //
  haveFaqContent: boolean = false;
  faqTitle: string = '';
  faqSubTitle: string = '';
  faqList: CustomerLandingFAQInterface[] = [];
  // FAQs Content //

  // Review Content //
  haveReviewContent: boolean = false;
  reviewTitle: string = '';
  reviewSubTitle: string = '';
  reviewList: CustoemrLandingPageReviewInterface[] = [];
  // Review Content //

  // Scan QR Content //
  haveScanQrContent: boolean = false;
  scanQrBtn1Cover: string = '';
  scanQrBtn1Eenable: boolean = false;
  scanQrBtn1Href: string = '';
  scanQrBtn2Cover: string = '';
  scanQrBtn2Eenable: boolean = false;
  scanQrBtn2Href: string = '';
  scanQrCover: string = '';
  scanQrTitle: string = '';
  scanQrSubTitle: string = '';
  // Scan QR Content //
  constructor(
    public util: UtilService,
    public api: ApiService,
    private sanitizer: DomSanitizer
  ) {
    this.getContent();
  }

  getContent() {
    console.log('Get Content');
    this.isLoading = true;
    this.api.get_public('v1/public/landing_page/get_content/').subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log(response);
        if (response && response.success) {

          const heroContent = response && response.result && response.result.heroContent ? response.result.heroContent : null;
          if (heroContent) {
            this.haveHeroContent = true;
            this.heroHighlight = heroContent && heroContent.highlight ? heroContent.highlight : '';
            this.heroTitle = heroContent && heroContent.title ? heroContent.title : '';
            this.heroSubtitle = heroContent && heroContent.subtitle ? heroContent.subtitle : '';
            this.heroHeader = heroContent && heroContent.header ? heroContent.header : '';
            this.heroCover = heroContent && heroContent.cover ? heroContent.cover : '';
            this.heroHash1Img = heroContent && heroContent.hash1_img ? heroContent.hash1_img : '';
            this.heroHash1Txt = heroContent && heroContent.hash1_txt ? heroContent.hash1_txt : '';
            this.heroHash2Img = heroContent && heroContent.hash2_img ? heroContent.hash2_img : '';
            this.heroHash2Txt = heroContent && heroContent.hash2_txt ? heroContent.hash2_txt : '';
            this.heroHash3Img = heroContent && heroContent.hash3_img ? heroContent.hash3_img : '';
            this.heroHash3Txt = heroContent && heroContent.hash3_txt ? heroContent.hash3_txt : '';

            this.heroBtn1Cover = heroContent && heroContent.btn1_cover ? heroContent.btn1_cover : '';
            this.heroBtn1Enable = heroContent && heroContent.btn1_enable ? true : false;
            this.heroBtn1Href = heroContent && heroContent.btn1_href ? heroContent.btn1_href : '';
            this.heroBtn2Cover = heroContent && heroContent.btn2_cover ? heroContent.btn2_cover : '';
            this.heroBtn2Enable = heroContent && heroContent.btn2_enable ? true : heroContent.btn2_enable;
            this.heroBtn2Href = heroContent && heroContent.btn2_href ? heroContent.btn2_href : '';

            if (heroContent && heroContent.stats_one) {
              const content = heroContent.stats_one;
              const cover = content && content.cover ? content.cover : '';
              const subtitle = content && content.subtitle ? content.subtitle : '';
              const title = content && content.title ? content.title : '';
              this.heroStatsOneCover = cover;
              this.heroStatsOneTitle = title;
              this.heroStatsOneSubTitle = subtitle;
              if (content && content.translations && content.translations instanceof Array) {
                const tLocale: CustomerLandingPageCommanTranslationInterface[] = content.translations;
                const translation = tLocale.find((t) => t.code == this.util.appLocaleName());
                this.heroStatsOneTitle = translation?.title || title;
                this.heroStatsOneSubTitle = translation?.subtitle || subtitle;
              }
            }

            if (heroContent && heroContent.stats_two) {
              const content = heroContent.stats_two;
              const cover = content && content.cover ? content.cover : '';
              const subtitle = content && content.subtitle ? content.subtitle : '';
              const title = content && content.title ? content.title : '';
              this.heroStatsTwoCover = cover;
              this.heroStatsTwoTitle = title;
              this.heroStatsTwoSubTitle = subtitle;
              if (content && content.translations && content.translations instanceof Array) {
                const tLocale: CustomerLandingPageCommanTranslationInterface[] = content.translations;
                const translation = tLocale.find((t) => t.code == this.util.appLocaleName());
                this.heroStatsTwoTitle = translation?.title || title;
                this.heroStatsTwoSubTitle = translation?.subtitle || subtitle;
              }
            }

            if (heroContent && heroContent.stats_three) {
              const content = heroContent.stats_three;
              const cover = content && content.cover ? content.cover : '';
              const subtitle = content && content.subtitle ? content.subtitle : '';
              const title = content && content.title ? content.title : '';
              this.heroStatsThreeCover = cover;
              this.heroStatsThreeTitle = title;
              this.heroStatsThreeSubTitle = subtitle;
              if (content && content.translations && content.translations instanceof Array) {
                const tLocale: CustomerLandingPageCommanTranslationInterface[] = content.translations;
                const translation = tLocale.find((t) => t.code == this.util.appLocaleName());
                this.heroStatsThreeTitle = translation?.title || title;
                this.heroStatsThreeSubTitle = translation?.subtitle || subtitle;
              }
            }

            if (heroContent && heroContent.stats_four) {
              const content = heroContent.stats_four;
              const cover = content && content.cover ? content.cover : '';
              const subtitle = content && content.subtitle ? content.subtitle : '';
              const title = content && content.title ? content.title : '';
              this.heroStatsFourCover = cover;
              this.heroStatsFourTitle = title;
              this.heroStatsFourSubTitle = subtitle;
              if (content && content.translations && content.translations instanceof Array) {
                const tLocale: CustomerLandingPageCommanTranslationInterface[] = content.translations;
                const translation = tLocale.find((t) => t.code == this.util.appLocaleName());
                this.heroStatsFourTitle = translation?.title || title;
                this.heroStatsFourSubTitle = translation?.subtitle || subtitle;
              }
            }

            if (heroContent && heroContent.translations && heroContent.translations instanceof Array) {
              const tLocale: CustomerLandingPageHeroMainTranslationInterface[] = heroContent.translations;
              const translation = tLocale.find((t) => t.code == this.util.appLocaleName());
              this.heroHighlight = translation?.highlight || heroContent.highlight;
              this.heroTitle = translation?.title || heroContent.title;
              this.heroSubtitle = translation?.subtitle || heroContent.subtitle;
              this.heroHeader = translation?.header || heroContent.header;
            }
          }

          const appFeatureContent = response && response.result && response.result.appFeatureContent ? response.result.appFeatureContent : null;
          if (appFeatureContent) {
            this.haveAppFeature = true;
            this.appFeatureCover = appFeatureContent && appFeatureContent.cover ? appFeatureContent.cover : '';
            this.appFeatureTitle = appFeatureContent && appFeatureContent.title ? appFeatureContent.title : '';
            this.appFeatureSubTitle = appFeatureContent && appFeatureContent.subtitle ? appFeatureContent.subtitle : '';

            if (appFeatureContent && appFeatureContent.translations && appFeatureContent.translations instanceof Array) {
              const tLocale: CustomerLandingPageCommanTranslationInterface[] = appFeatureContent.translations;
              const translation = tLocale.find((t) => t.code == this.util.appLocaleName());
              this.appFeatureTitle = translation?.title || appFeatureContent.title;
              this.appFeatureSubTitle = translation?.subtitle || appFeatureContent.subtitle;
            }

            if (appFeatureContent && appFeatureContent.features && appFeatureContent.features instanceof Array) {
              const mappedList = appFeatureContent.features.map(
                (item: CustomerLandingPageAppFeatureInterface) => {
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
              this.appFeatureList = mappedList;
            }
          }

          const featureContent = response && response.result && response.result.featureContent ? response.result.featureContent : null;
          if (featureContent) {
            this.haveProjectFeature = true;
            this.projectFeatureTitle = featureContent && featureContent.title ? featureContent.title : '';
            this.projectFeatureSubTitle = featureContent && featureContent.subtitle ? featureContent.subtitle : '';

            if (featureContent && featureContent.translations && featureContent.translations instanceof Array) {
              const tLocale: CustomerLandingPageCommanTranslationInterface[] = featureContent.translations;
              const translation = tLocale.find((t) => t.code == this.util.appLocaleName());
              this.projectFeatureTitle = translation?.title || featureContent.title;
              this.projectFeatureSubTitle = translation?.subtitle || featureContent.subtitle;
            }

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

              this.projectFeature1BtnHref = btn_href;
              this.projectFeature1BtnLbl = btn_lbl;
              this.projectFeature1DetailCover = detail_cover;
              this.projectFeature1DetailSubTitle = detail_subtitle;
              this.projectFeature1DetailTitle = detail_title;
              this.projectFeature1Icon = icon;
              this.projectFeature1Title = title;
              this.projectFeature1SubTitle = subtitle;

              if (content && content.translations && content.translations instanceof Array) {
                const tLocale: CustomerLandingPageProjectFeatureTranslationInterface[] = content.translations;
                const translation = tLocale.find((t) => t.code == this.util.appLocaleName());
                this.projectFeature1BtnLbl = translation?.btnLbl || btn_lbl;
                this.projectFeature1DetailSubTitle = translation?.detailSubTitle || detail_subtitle;
                this.projectFeature1DetailTitle = translation?.detailTitle || detail_title;
                this.projectFeature1Title = translation?.title || title;
                this.projectFeature1SubTitle = translation?.subtitle || subtitle;
              }

              if (content && content.detail_list && content.detail_list instanceof Array) {
                const mappedList = content.detail_list.map(
                  (item: CustomerLandingPageFeatureBulletPointInterface) => {
                    if (item.translations) {
                      const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                      item.displayTitle = translation?.value || item.lbl;
                    } else {
                      item.displayTitle = item?.lbl || '';
                    }
                    return item;
                  }
                );
                this.projectFeature1Bullet = mappedList;
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

              this.projectFeature2BtnHref = btn_href;
              this.projectFeature2BtnLbl = btn_lbl;
              this.projectFeature2DetailCover = detail_cover;
              this.projectFeature2DetailSubTitle = detail_subtitle;
              this.projectFeature2DetailTitle = detail_title;
              this.projectFeature2Icon = icon;
              this.projectFeature2Title = title;
              this.projectFeature2SubTitle = subtitle;

              if (content && content.translations && content.translations instanceof Array) {
                const tLocale: CustomerLandingPageProjectFeatureTranslationInterface[] = content.translations;
                const translation = tLocale.find((t) => t.code == this.util.appLocaleName());
                this.projectFeature2BtnLbl = translation?.btnLbl || btn_lbl;
                this.projectFeature2DetailSubTitle = translation?.detailSubTitle || detail_subtitle;
                this.projectFeature2DetailTitle = translation?.detailTitle || detail_title;
                this.projectFeature2Title = translation?.title || title;
                this.projectFeature2SubTitle = translation?.subtitle || subtitle;
              }

              if (content && content.detail_list && content.detail_list instanceof Array) {
                const mappedList = content.detail_list.map(
                  (item: CustomerLandingPageFeatureBulletPointInterface) => {
                    if (item.translations) {
                      const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                      item.displayTitle = translation?.value || item.lbl;
                    } else {
                      item.displayTitle = item?.lbl || '';
                    }
                    return item;
                  }
                );
                this.projectFeature2Bullet = mappedList;
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

              this.projectFeature3BtnHref = btn_href;
              this.projectFeature3BtnLbl = btn_lbl;
              this.projectFeature3DetailCover = detail_cover;
              this.projectFeature3DetailSubTitle = detail_subtitle;
              this.projectFeature3DetailTitle = detail_title;
              this.projectFeature3Icon = icon;
              this.projectFeature3Title = title;
              this.projectFeature3SubTitle = subtitle;

              if (content && content.translations && content.translations instanceof Array) {
                const tLocale: CustomerLandingPageProjectFeatureTranslationInterface[] = content.translations;
                const translation = tLocale.find((t) => t.code == this.util.appLocaleName());
                this.projectFeature3BtnLbl = translation?.btnLbl || btn_lbl;
                this.projectFeature3DetailSubTitle = translation?.detailSubTitle || detail_subtitle;
                this.projectFeature3DetailTitle = translation?.detailTitle || detail_title;
                this.projectFeature3Title = translation?.title || title;
                this.projectFeature3SubTitle = translation?.subtitle || subtitle;
              }

              if (content && content.detail_list && content.detail_list instanceof Array) {
                const mappedList = content.detail_list.map(
                  (item: CustomerLandingPageFeatureBulletPointInterface) => {
                    if (item.translations) {
                      const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                      item.displayTitle = translation?.value || item.lbl;
                    } else {
                      item.displayTitle = item?.lbl || '';
                    }
                    return item;
                  }
                );
                this.projectFeature3Bullet = mappedList;
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

              this.projectFeature4BtnHref = btn_href;
              this.projectFeature4BtnLbl = btn_lbl;
              this.projectFeature4DetailCover = detail_cover;
              this.projectFeature4DetailSubTitle = detail_subtitle;
              this.projectFeature4DetailTitle = detail_title;
              this.projectFeature4Icon = icon;
              this.projectFeature4Title = title;
              this.projectFeature4SubTitle = subtitle;

              if (content && content.translations && content.translations instanceof Array) {
                const tLocale: CustomerLandingPageProjectFeatureTranslationInterface[] = content.translations;
                const translation = tLocale.find((t) => t.code == this.util.appLocaleName());
                this.projectFeature4BtnLbl = translation?.btnLbl || btn_lbl;
                this.projectFeature4DetailSubTitle = translation?.detailSubTitle || detail_subtitle;
                this.projectFeature4DetailTitle = translation?.detailTitle || detail_title;
                this.projectFeature4Title = translation?.title || title;
                this.projectFeature4SubTitle = translation?.subtitle || subtitle;
              }

              if (content && content.detail_list && content.detail_list instanceof Array) {
                const mappedList = content.detail_list.map(
                  (item: CustomerLandingPageFeatureBulletPointInterface) => {
                    if (item.translations) {
                      const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                      item.displayTitle = translation?.value || item.lbl;
                    } else {
                      item.displayTitle = item?.lbl || '';
                    }
                    return item;
                  }
                );
                this.projectFeature4Bullet = mappedList;
              }
            }

          }

          const serviceContent = response && response.result && response.result.serviceContent ? response.result.serviceContent : null;
          if (serviceContent) {
            this.haveServiceContent = true;

            this.serviceTitle = serviceContent && serviceContent.title ? serviceContent.title : '';
            this.serviceSubTitle = serviceContent && serviceContent.subtitle ? serviceContent.subtitle : '';

            if (serviceContent && serviceContent.services && serviceContent.services instanceof Array) {
              const mappedList = serviceContent.services.map(
                (item: CustomerLandingPageServiceInterface) => {
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
              const sortedArray = mappedList.sort((a: CustomerLandingPageServiceInterface, b: CustomerLandingPageServiceInterface) => {
                return a.serial - b.serial;
              });
              this.servicesList = sortedArray;
            }

            if (serviceContent && serviceContent.translations && serviceContent.translations instanceof Array) {
              const tLocale: CustomerLandingPageCommanTranslationInterface[] = serviceContent.translations;
              const translation = tLocale.find((t) => t.code == this.util.appLocaleName());
              this.serviceTitle = translation?.title || serviceContent.title;
              this.serviceSubTitle = translation?.subtitle || serviceContent.subtitle;
            }
          }

          const faqContent = response && response.result && response.result.faqContent ? response.result.faqContent : null;
          if (faqContent) {
            this.haveFaqContent = true;
            this.faqTitle = faqContent && faqContent.title ? faqContent.title : '';
            this.faqSubTitle = faqContent && faqContent.subtitle ? faqContent.subtitle : '';

            if (faqContent && faqContent.translations && faqContent.translations instanceof Array) {
              const tLocale: CustomerLandingPageCommanTranslationInterface[] = faqContent.translations;
              const translation = tLocale.find((t) => t.code == this.util.appLocaleName());
              this.faqTitle = translation?.title || faqContent.title;
              this.faqSubTitle = translation?.subtitle || faqContent.subtitle;
            }

            if (faqContent && faqContent.questions && faqContent.questions instanceof Array) {
              const mappedList = faqContent.questions.map(
                (item: CustomerLandingFAQInterface) => {
                  let subtitle = '';
                  if (item.translations) {
                    const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                    item.displayTitle = translation?.title || item.title;
                    subtitle = translation?.subtitle || item.subtitle;
                  } else {
                    item.displayTitle = item?.title || '';
                    subtitle = item?.subtitle || '';
                  }
                  subtitle = this.util.htmlDecode(subtitle);
                  item.displaySubTitle = this.sanitizer.bypassSecurityTrustHtml(subtitle);
                  return item;
                }
              );

              const sortedArray = mappedList.sort((a: CustomerLandingFAQInterface, b: CustomerLandingFAQInterface) => {
                return a.serial - b.serial;
              });

              this.faqList = sortedArray;
            }
          }

          const reviewContent = response && response.result && response.result.reviewContent ? response.result.reviewContent : null;
          if (reviewContent) {
            this.haveReviewContent = true;
            this.reviewTitle = reviewContent && reviewContent.title ? reviewContent.title : '';
            this.reviewSubTitle = reviewContent && reviewContent.subtitle ? reviewContent.subtitle : '';

            if (reviewContent && reviewContent.translations && reviewContent.translations instanceof Array) {
              const tLocale: CustomerLandingPageCommanTranslationInterface[] = reviewContent.translations;
              const translation = tLocale.find((t) => t.code == this.util.appLocaleName());
              this.reviewTitle = translation?.title || reviewContent.title;
              this.reviewSubTitle = translation?.subtitle || reviewContent.subtitle;
            }

            if (reviewContent && reviewContent.reviews && reviewContent.reviews instanceof Array) {
              const mappedList = reviewContent.reviews.map(
                (item: CustoemrLandingPageReviewInterface) => {
                  if (item.translations) {
                    const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                    item.displayMessage = translation?.value || item.message;
                  } else {
                    item.displayMessage = item?.message || '';
                  }
                  return item;
                }
              );

              this.reviewList = mappedList;
            }
          }

          const scanQrContent = response && response.result && response.result.scanQrContent ? response.result.scanQrContent : null;
          if (scanQrContent) {
            this.haveScanQrContent = true;
            this.scanQrTitle = scanQrContent && scanQrContent.title ? scanQrContent.title : '';
            this.scanQrSubTitle = scanQrContent && scanQrContent.subtitle ? scanQrContent.subtitle : '';
            this.scanQrCover = scanQrContent && scanQrContent.cover ? scanQrContent.cover : '';

            this.scanQrBtn1Cover = scanQrContent && scanQrContent.btn1_cover ? scanQrContent.btn1_cover : '';
            this.scanQrBtn1Eenable = scanQrContent && scanQrContent.btn1_enable ? true : false;
            this.scanQrBtn1Href = scanQrContent && scanQrContent.btn1_href ? scanQrContent.btn1_href : '';

            this.scanQrBtn2Cover = scanQrContent && scanQrContent.btn2_cover ? scanQrContent.btn2_cover : '';
            this.scanQrBtn2Eenable = scanQrContent && scanQrContent.btn2_enable ? true : false;
            this.scanQrBtn2Href = scanQrContent && scanQrContent.btn2_href ? scanQrContent.btn2_href : '';

            if (scanQrContent && scanQrContent.translations && scanQrContent.translations instanceof Array) {
              const tLocale: CustomerLandingPageCommanTranslationInterface[] = scanQrContent.translations;
              const translation = tLocale.find((t) => t.code == this.util.appLocaleName());
              this.scanQrTitle = translation?.title || scanQrContent.title;
              this.scanQrSubTitle = translation?.subtitle || scanQrContent.subtitle;
            }
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoading = false;
        this.util.handleError(error, 'public');
      }
    });
    this.getDummayContent();
  }

  getDummayContent() {
    this.api.getLocalAssets('dummy.service.json').then((response: any) => {
      if (response) {
        this.dummyServices = response;
      }
    }).catch((error: any) => {
      console.log(error);
      this.util.onError('ts_something_went_wrong', '');
    });

    this.api.getLocalAssets('dummy.faqs.json').then((response: any) => {
      if (response) {
        this.dummyFaqs = response;
      }
    }).catch((error: any) => {
      console.log(error);
      this.util.onError('ts_something_went_wrong', '');
    });

    this.api.getLocalAssets('dummay.review.json').then((response: any) => {
      if (response) {
        this.dummyReviews = response;
      }
    }).catch((error: any) => {
      console.log(error);
      this.util.onError('ts_something_went_wrong', '');
    });
  }

  onFeatureView(id: string) {
    this.currentFeatureId = id;
  }

}
