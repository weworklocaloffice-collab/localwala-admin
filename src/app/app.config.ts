import { provideAppInitializer, ApplicationConfig, provideZoneChangeDetection, provideBrowserGlobalErrorListeners, isDevMode, importProvidersFrom, inject } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withComponentInputBinding, TitleStrategy } from '@angular/router';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

import { ToastrModule } from 'ngx-toastr';
import { provideToastr } from 'ngx-toastr';
import { provideClientHydration } from '@angular/platform-browser';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { NgScrollbarModule } from 'ngx-scrollbar';
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { provideIcons } from '@ng-icons/core';
import * as tablerIcons from '@ng-icons/tabler-icons';
import { HttpRequestInterceptor } from './services/interceptor';
import { PaginatorIntlService } from './services/paginator-intl-service';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AppTitlePrefix } from './pipe/app-title.pipe';


export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideToastr(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideBrowserGlobalErrorListeners(),
    provideIcons(tablerIcons),
    provideRouter(routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withComponentInputBinding()
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideHttpClient(withInterceptorsFromDi()),
    provideClientHydration(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json',
        useHttpBackend: true   // 👈 VERY IMPORTANT
      }),
    }),
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      const savedLang = localStorage.getItem('_appLocale') || 'en';

      translate.setDefaultLang('en');
      return firstValueFrom(translate.use(savedLang));
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true
    },
    {
      provide: MatPaginatorIntl,
      useExisting: PaginatorIntlService
    },
    {
      provide: TitleStrategy,
      useClass: AppTitlePrefix
    },
    importProvidersFrom(
      FormsModule,
      ToastrModule.forRoot(),
      ReactiveFormsModule,
      MaterialModule,
      NgScrollbarModule,
    )
  ]
};
