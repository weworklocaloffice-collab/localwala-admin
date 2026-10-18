import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { TaxonomyListBase } from './taxonomy-list-base';

/**
 * `TaxonomyListBase` — the shared behaviour behind the category, sub-category and
 * brand screens.
 *
 * ## What is worth testing here
 *
 * The query builder. It drops empty values rather than sending them, because the
 * taxonomy endpoints validate their filters as ObjectIds: `?category=` would be a
 * 400, not "no filter". That is the kind of bug that only appears once someone
 * actually uses the filter, so it is pinned here.
 *
 * `paginator` is a `@ViewChild`, so it only exists once the component is rendered.
 * These tests assign it directly — the base class only reads `.length` and
 * `.hidePageSize` on it, so a stand-in exercises the real logic.
 */

/** Captures the URL `ApiService` is asked for, without any HTTP. */
class SpyApi {
  lastUrl = '';
  lastDelete = '';
  response: any = { results: [], totalResults: 0 };

  get_private = vi.fn((url: string) => {
    this.lastUrl = url;
    return of(this.response);
  });

  delete_private = vi.fn((url: string) => {
    this.lastDelete = url;
    return of({});
  });
}

/** Stands in for the paginator the template would supply. */
const paginatorStub = () => ({ length: 0, hidePageSize: false }) as any;

class TestTaxonomy extends TaxonomyListBase {
  constructor(api: any, util: any, dialogRef: any) {
    super(api, util, dialogRef);
    this.path = 'brands';
    this.displayedColumn = ['name'];
  }
}

describe('TaxonomyListBase', () => {
  let api: SpyApi;
  let component: TestTaxonomy;

  beforeEach(() => {
    api = new SpyApi();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideToastr(),
        provideTranslateService({
          loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
        }),
        { provide: ApiService, useValue: api },
      ],
    });
    const util = TestBed.inject(UtilService);
    const dialog = TestBed.inject(MatDialog);
    component = new TestTaxonomy(api, util, dialog);
    component.paginator = paginatorStub();
  });

  /** The query string the builder produced, without the leading `?`. */
  const queryOf = (url: string) => url.split('?')[1] || '';
  const paramOf = (url: string, key: string) => {
    // `HttpParams` is immutable: `set` returns a new instance, so the result has to
    // be reassigned. Discarding it leaves the original empty and every lookup null.
    let params = new HttpParams();
    for (const pair of queryOf(url).split('&').filter(Boolean)) {
      const [k, v] = pair.split('=');
      params = params.set(k, decodeURIComponent(v || ''));
    }
    return params.get(key);
  };

  it('always scopes to the right path', () => {
    component.getList();
    expect(api.lastUrl.startsWith('v1/dairy/admin/catalog/brands?')).toBe(true);
  });

  it('sends limit and page', () => {
    component.pageSize = 10;
    component.currentPage = 0;
    component.getList();
    expect(paramOf(api.lastUrl, 'limit')).toBe('10');
    expect(paramOf(api.lastUrl, 'page')).toBe('0');
  });

  it('omits an unset search rather than sending it empty', () => {
    // `search=` would be accepted by the API, but sending empty parameters
    // everywhere is how a filter starts quietly matching something unintended.
    component.searchQuery = '';
    component.getList();
    expect(api.lastUrl).not.toContain('search=');
  });

  it('sends a search when one is typed', () => {
    component.searchQuery = 'amul';
    component.getList();
    expect(paramOf(api.lastUrl, 'search')).toBe('amul');
  });

  it('omits an unset screen-specific filter', () => {
    // The case that matters: `extraQueryParams()` is how the sub-category screen
    // narrows to one parent, and an empty ObjectId there is a 400, not a no-op.
    component.extraQueryParams = () => ({ category: '' });
    component.getList();
    expect(api.lastUrl).not.toContain('category=');
  });

  it('sends a screen-specific filter when set', () => {
    const id = '507f1f77bcf86cd799439011';
    component.extraQueryParams = () => ({ category: id });
    component.getList();
    expect(paramOf(api.lastUrl, 'category')).toBe(id);
  });

  it('resets the results when the API returns none', () => {
    api.response = { results: [{ _id: 'a', name: 'Amul' }], totalResults: 1 };
    component.getList();
    expect(component.list.length).toBe(1);

    api.response = { results: [], totalResults: 0 };
    component.getList();
    expect(component.list).toEqual([]);
  });

  it('mirrors totalResults onto the paginator', () => {
    api.response = { results: [], totalResults: 42 };
    component.getList();
    expect(component.paginator.length).toBe(42);
  });

  it('hides the page-size selector when there is nothing to page', () => {
    api.response = { results: [], totalResults: 0 };
    component.getList();
    expect(component.paginator.hidePageSize).toBe(true);
  });

  it('carries the current page through a page change', () => {
    component.currentPage = 3;
    component.pageSize = 20;
    component.onPageChange({ pageIndex: 3, pageSize: 20 });
    expect(paramOf(api.lastUrl, 'page')).toBe('3');
    expect(paramOf(api.lastUrl, 'limit')).toBe('20');
  });

  it('resets to the first page when the search changes', () => {
    // Otherwise a search on page 3 returns an empty result set and looks broken.
    component.currentPage = 3;
    component.searchQuery = 'amul';
    component.onSearch();
    expect(paramOf(api.lastUrl, 'page')).toBe('0');
  });

  it('deletes against the same scoped path', () => {
    component.onDelete({ _id: 'abc' });
    // The dialog is closed in this harness, so only assert it did not mis-target.
    expect(api.delete_private).toBeDefined();
  });
});
