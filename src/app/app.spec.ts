import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideToastr } from 'ngx-toastr';
import { App } from './app';

/**
 * A smoke test for the app shell.
 *
 * The scaffold version of this spec imported `App` and nothing else, so it failed on
 * a missing `ToastConfig` — the real providers live in `app.config.ts`, which the
 * spec never supplied. Its second assertion looked for an `<h1>` reading
 * "Hello, foodbite-web-angular", which is the CLI's default template and has never
 * been in `app.html`. Both were leftovers that had been failing since the project
 * was generated.
 *
 * `app.html` is a bare `<router-outlet>`, so what can honestly be asserted is that
 * the app constructs and renders one.
 */
describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideToastr(),
        provideTranslateService({
          loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
        }),
      ],
    }).compileComponents();
  });

  it('creates', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('defaults the theme to light when none is stored', () => {
    // `App` reads `_appTheme` from storage and falls back, so a fresh session must
    // not be left without one.
    localStorage.removeItem('_appTheme');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(localStorage.getItem('_appTheme')).toBe('light');
  });
});
