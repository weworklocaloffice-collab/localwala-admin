import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { ToastrService, provideToastr } from 'ngx-toastr';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { UtilService } from './util-service';

/**
 * `UtilService.hasRight()`, which decides whether a control is rendered.
 *
 * This is the one place the admin panel consults before showing or hiding a button,
 * and its failure modes are asymmetric:
 *
 *   - saying "no" to someone who *does* hold the right hides a control they need,
 *     and nothing tells them why it is missing
 *   - saying "yes" to someone who does not hold it shows a control that fails with
 *     a 403, which is a much clearer outcome
 *
 * So it fails **open**: an absent or unreadable cache grants the view. The API
 * enforces every right regardless, so this is presentation only and cannot leak
 * access. That reasoning is the thing worth pinning, because the tempting
 * implementation — treat "no cache" as "no rights" — would quietly lock operators
 * out of their own panel after a cache-clearing deploy.
 */
describe('UtilService.hasRight', () => {
  let util: UtilService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideToastr(),
        provideTranslateService({
          loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
        }),
      ],
    });
    util = TestBed.inject(UtilService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('grants a right the operator holds', () => {
    localStorage.setItem(
      '_adminRights',
      JSON.stringify(['dairy_catalog_manage', 'dairy_vertical_manage']),
    );
    expect(util.hasRight('dairy_catalog_manage')).toBe(true);
    expect(util.hasRight('dairy_vertical_manage')).toBe(true);
  });

  it('withholds a right the operator does not hold', () => {
    localStorage.setItem('_adminRights', JSON.stringify(['dairy_catalog_manage']));
    expect(util.hasRight('dairy_vertical_manage')).toBe(false);
  });

  it('fails open when the cache is absent', () => {
    // No `_adminRights` at all — e.g. before the guard has run. Showing the button
    // costs a 403; hiding it removes functionality with no explanation.
    expect(util.hasRight('dairy_vertical_manage')).toBe(true);
  });

  it('treats an empty cache as authoritative, not missing', () => {
    localStorage.setItem('_adminRights', '[]');
    // A populated cache means "this operator holds these rights, and there are
    // none". That is a real answer from the guard, so it is obeyed.
    //
    // Failing open here would be wrong: it would grant every dairy control to an
    // operator whose role genuinely has none, turning a 403 on click into a screen
    // full of dead buttons. Failing open is only correct when the answer is
    // *unknown* — absent, corrupt, or the wrong shape.
    expect(util.hasRight('dairy_vertical_manage')).toBe(false);
  });

  it('fails open when the cache is corrupt', () => {
    localStorage.setItem('_adminRights', '{not json');
    expect(util.hasRight('dairy_vertical_manage')).toBe(true);
  });

  it('fails open when the cache is JSON but not an array', () => {
    localStorage.setItem('_adminRights', JSON.stringify({ dairy_vertical_manage: true }));
    // A shape change in the guard must not lock everyone out.
    expect(util.hasRight('dairy_vertical_manage')).toBe(true);
  });

  it('still withholds when the cache is a valid array that omits the right', () => {
    // The fail-open cases must not weaken the case that actually matters: a
    // populated cache is authoritative.
    localStorage.setItem('_adminRights', JSON.stringify(['some_other_right']));
    expect(util.hasRight('dairy_vertical_manage')).toBe(false);
  });
});
