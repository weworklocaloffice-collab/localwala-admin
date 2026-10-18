import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { StoresListBase } from './stores-list-base';

/**
 * `StoresListBase` — the shared behaviour behind every Local Stores admin list.
 *
 * ## What is worth testing here
 *
 * **The envelope reader.** The stores admin routes do not agree on one shape: some answer
 * `{ applications, total }`, some `{ items, total }`, some `{ results, totalResults }`. The
 * base accepts all of them rather than hard-coding one, because a screen that assumes the
 * wrong key renders an EMPTY TABLE against a valid 200 — no error, no console warning, just
 * a list that looks like there is nothing in it. That failure is invisible in review and is
 * the reason this file exists.
 *
 * **The query builder.** Unset filters are dropped entirely, not sent empty. Several admin
 * filters are validated as ObjectIds server-side, so `?category=` is a 400 rather than "no
 * filter" — a screen that sends it fails outright instead of showing everything.
 *
 * **Page indexing.** `currentPage` is 0-based (it is bound to the paginator) and the wire
 * is 1-based, so the builder adds one. Getting this wrong is the single most common list
 * bug: page one is never reachable.
 */

/** Captures the URL `ApiService` is asked for, without any HTTP. */
class SpyApi {
  lastUrl = '';
  response: any = { items: [], total: 0 };
  fail: any = null;

  get_private = vi.fn((url: string) => {
    this.lastUrl = url;
    return this.fail ? throwError(() => this.fail) : of(this.response);
  });
}

/** Stands in for the paginator the template would supply. */
const paginatorStub = () => ({ length: 0, hidePageSize: false }) as any;

class TestStoresList extends StoresListBase {
  constructor(api: any, util: any, dialogRef: any) {
    super(api, util, dialogRef);
    this.path = 'applications';
    this.displayedColumn = ['name'];
  }
}

/**
 * A screen whose scope is not yet chosen.
 *
 * This exists instead of assigning to `extraQuery` in a test, because `extraQuery` is a
 * GETTER with no setter — assigning to it throws, which is the same TS2611 problem the base
 * class doc describes for subclasses. An unset scope is expressed by returning null and
 * undefined values, which is what this screen actually does before a filter is chosen.
 */
class UnsetScopeStoresList extends TestStoresList {
  override get extraQuery(): any {
    return { outlet: null, chain: undefined };
  }
}

/** A screen that narrows itself to one parent, exercising the `extraQuery` getter. */
class ScopedStoresList extends TestStoresList {
  constructor(api: any, util: any, dialogRef: any) {
    super(api, util, dialogRef);
    this.path = 'products';
  }
  override get extraQuery(): any {
    return { outlet: 'OUTLET123' };
  }
}

describe('StoresListBase', () => {
  let api: SpyApi;
  let component: TestStoresList;
  let handled: any[];

  beforeEach(() => {
    api = new SpyApi();
    handled = [];
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
    vi.spyOn(util, 'handleError').mockImplementation((...args: any[]) => {
      handled.push(args);
    });
    const dialog = TestBed.inject(MatDialog);
    component = new TestStoresList(api, util, dialog);
    component.paginator = paginatorStub();
  });

  /** The query string the builder produced, without the leading `?`. */
  const queryOf = (url: string) => url.split('?')[1] || '';
  const paramOf = (url: string, key: string) => {
    // `HttpParams` is immutable: `set` returns a NEW instance, so the result has to be
    // reassigned. Discarding it leaves the original empty and every lookup null.
    let params = new HttpParams();
    for (const pair of queryOf(url).split('&').filter(Boolean)) {
      const [k, v] = pair.split('=');
      params = params.set(k, decodeURIComponent(v || ''));
    }
    return params.get(key);
  };

  it('always scopes to the stores admin path', () => {
    component.getList();
    expect(api.lastUrl.startsWith('v1/admin/stores/applications?')).toBe(true);
  });

  describe('page indexing', () => {
    it('sends page 1 for the first page', () => {
      // The paginator is 0-based and the wire is 1-based. Without the +1 the first page of
      // results is unreachable and the table looks permanently empty.
      component.currentPage = 0;
      component.getList();
      expect(paramOf(api.lastUrl, 'page')).toBe('1');
    });

    it('sends page n+1 for the nth paginator page', () => {
      component.currentPage = 4;
      component.getList();
      expect(paramOf(api.lastUrl, 'page')).toBe('5');
    });
  });

  describe('unset filters are dropped, not sent empty', () => {
    it('omits an empty search', () => {
      component.searchQuery = '';
      component.getList();
      expect(api.lastUrl).not.toContain('search=');
    });

    it('sends a search when one is typed', () => {
      component.searchQuery = 'kirana';
      component.getList();
      expect(paramOf(api.lastUrl, 'search')).toBe('kirana');
    });

    it('always sends limit', () => {
      component.pageSize = 25;
      component.getList();
      expect(paramOf(api.lastUrl, 'limit')).toBe('25');
    });

    it('drops a null and an undefined filter rather than serialising them', () => {
      // `?outlet=null` is not the same as no filter — it is a literal string that fails
      // ObjectId validation with a 400 that blames the filter rather than the caller.
      const unset = new UnsetScopeStoresList(api, TestBed.inject(UtilService), TestBed.inject(MatDialog));
      unset.paginator = paginatorStub();
      unset.getList();
      expect(api.lastUrl).not.toContain('outlet');
      expect(api.lastUrl).not.toContain('chain');
    });
  });

  describe('extraQuery', () => {
    it('merges a subclass scope into the request', () => {
      const scoped = new ScopedStoresList(api, TestBed.inject(UtilService), TestBed.inject(MatDialog));
      scoped.paginator = paginatorStub();
      scoped.getList();
      expect(paramOf(api.lastUrl, 'outlet')).toBe('OUTLET123');
      expect(api.lastUrl.startsWith('v1/admin/stores/products?')).toBe(true);
    });
  });

  describe('envelope reading', () => {
    const cases: Array<[string, any, any[]]> = [
      ['items', { items: [{ _id: 'a' }], total: 1 }, ['_id']],
      ['applications', { applications: [{ _id: 'b' }], total: 1 }, ['_id']],
      ['results', { results: [{ _id: 'c' }], totalResults: 1 }, ['_id']],
      ['taxConfigurations', { taxConfigurations: [{ _id: 'd' }], total: 1 }, ['_id']],
      ['chains', { chains: [{ _id: 'e' }], total: 1 }, ['_id']],
    ];

    for (const [name, response, expected] of cases) {
      it(`unwraps a { ${name} } envelope`, () => {
        const rows = component.rows(response);
        expect(Array.isArray(rows)).toBe(true);
        expect(rows.length).toBe(1);
        expect(Object.keys(rows[0])).toEqual(expected);
      });
    }

    it('returns an empty array for a missing response, never undefined', () => {
      // A template iterating `undefined` throws; every row would need a guard.
      expect(component.rows(null)).toEqual([]);
      expect(component.rows(undefined)).toEqual([]);
      expect(component.rows({})).toEqual([]);
    });

    it('prefers `items` when an envelope carries more than one list key', () => {
      const rows = component.rows({ items: [{ _id: 'fromItems' }], results: [{ _id: 'fromResults' }] });
      expect(rows[0]._id).toBe('fromItems');
    });
  });

  describe('total', () => {
    it('reads `total`', () => {
      expect(component.total({ items: [], total: 42 })).toBe(42);
    });

    it('reads `totalResults` when that is all the envelope carries', () => {
      expect(component.total({ results: [], totalResults: 7 })).toBe(7);
    });

    it('prefers `total` when BOTH are present', () => {
      // A stores envelope carrying `totalResults` as well is the dairy shape leaking in;
      // `total` is the authoritative page size for stores.
      expect(component.total({ items: [], total: 3, totalResults: 99 })).toBe(3);
    });

    it('falls back to the row count when neither key is present', () => {
      expect(component.total({ items: [{ _id: 'a' }, { _id: 'b' }] })).toBe(2);
    });

    it('is zero for a missing response', () => {
      expect(component.total(null)).toBe(0);
    });
  });

  describe('loading and failure', () => {
    it('sets the list from the response and finishes loading', () => {
      api.response = { items: [{ _id: 'a' }], total: 1 };
      component.getList();
      expect(component.list.length).toBe(1);
      expect(component.isLoaded).toBe(true);
    });

    it('sets the paginator length from the envelope total', () => {
      api.response = { items: [{ _id: 'a' }], total: 99 };
      component.getList();
      expect(component.paginator.length).toBe(99);
    });

    it('hides the page-size control when there is nothing to page', () => {
      api.response = { items: [], total: 0 };
      component.getList();
      expect(component.paginator.hidePageSize).toBe(true);
    });

    it('stops loading, clears the list and reports the error on failure', () => {
      // Leaving `isLoaded` false is how a screen spins forever on a 500 instead of showing
      // an empty table and a toast.
      api.fail = { status: 500, message: 'boom' };
      component.getList();
      expect(component.isLoaded).toBe(true);
      expect(component.list).toEqual([]);
      expect(handled.length).toBe(1);
    });

    it('does not throw when the paginator is absent', () => {
      // `paginator` is a @ViewChild; it does not exist before render, and `ngOnInit` runs
      // before the view is built.
      component.paginator = undefined as any;
      api.response = { items: [{ _id: 'a' }], total: 1 };
      expect(() => component.getList()).not.toThrow();
    });
  });
});