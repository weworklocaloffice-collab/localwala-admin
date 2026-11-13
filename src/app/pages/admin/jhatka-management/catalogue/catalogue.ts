import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { JhatkaAdminService } from '../jhatka-admin.service';
import { JhatkaCategory, JhatkaProduct, JhatkaVariant } from '../jhatka.models';
import { PaisePipe } from '../paise.pipe';
import { JhatkaCategoryDialog } from './category-dialog/category-dialog';
import { JhatkaProductDialog } from './product-dialog/product-dialog';
import { JhatkaVariantDialog } from './variant-dialog/variant-dialog';

@Component({
  selector: 'app-jhatka-catalogue',
  imports: [CommonModule, FormsModule, MaterialModule, PaisePipe],
  templateUrl: './catalogue.html',
  styles: [
    `
      .page-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 18px;
      }
      .eyebrow {
        color: var(--mat-sys-primary);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .page-title {
        font-size: 28px;
        line-height: 1.2;
        font-weight: 700;
        margin: 4px 0 6px;
      }
      .page-copy {
        color: var(--mat-sys-on-surface-variant);
        font-size: 14px;
        max-width: 760px;
        margin: 0;
      }
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 18px;
      }
      .kpi-card {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 14px;
        padding: 16px;
        background: var(--mat-sys-surface-container-lowest);
      }
      .kpi-label {
        color: var(--mat-sys-on-surface-variant);
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .kpi-value {
        font-size: 22px;
        line-height: 1.2;
        font-weight: 700;
        margin-top: 6px;
      }
      .kpi-hint {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        margin-top: 4px;
      }
      .filter-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        padding: 14px 16px;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 14px;
        background: var(--mat-sys-surface-container-lowest);
        margin-bottom: 16px;
      }
      .filter-bar mat-form-field {
        width: 190px;
      }
      .filter-bar .search-field {
        width: 280px;
      }
      .table-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 12px;
      }
      .table-title {
        font-size: 16px;
        font-weight: 700;
      }
      .table-sub {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        margin-top: 2px;
      }
      .entity-cell {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .entity-image {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        object-fit: cover;
        background: var(--mat-sys-surface-container-high);
        display: grid;
        place-items: center;
        color: var(--mat-sys-on-surface-variant);
        font-size: 13px;
        font-weight: 700;
        flex: 0 0 auto;
      }
      .entity-name {
        font-size: 13px;
        font-weight: 600;
      }
      .entity-meta {
        font-size: 11px;
        color: var(--mat-sys-on-surface-variant);
        margin-top: 2px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        padding: 3px 8px;
        border-radius: 7px;
        background: var(--mat-sys-surface-container-high);
        color: var(--mat-sys-on-surface-variant);
        font-size: 11px;
        font-weight: 600;
      }
      .status-cell {
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
      }
      .status-text {
        font-size: 12px;
        font-weight: 600;
        min-width: 44px;
      }
      .status-on {
        color: #157a3b;
      }
      .status-off {
        color: #b42318;
      }
      .cell-muted {
        color: var(--mat-sys-on-surface-variant);
        font-size: 11px;
        margin-top: 2px;
      }
      .empty-state {
        text-align: center;
        padding: 36px 16px;
        color: var(--mat-sys-on-surface-variant);
      }
      .empty-icon {
        width: 54px;
        height: 54px;
        border-radius: 16px;
        display: inline-grid;
        place-items: center;
        background: var(--mat-sys-surface-container-high);
        margin-bottom: 10px;
      }
      .page-nav {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
        padding-top: 12px;
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
      }
      .launch-roots {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .table-responsive {
        width: 100%;
        overflow-x: auto;
      }
      @media (max-width: 1000px) {
        .kpi-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 720px) {
        .kpi-grid {
          grid-template-columns: 1fr;
        }
        .filter-bar mat-form-field,
        .filter-bar .search-field {
          width: 100%;
        }
      }
    `,
  ],
})
export class JhatkaCatalogue {
  stats: Record<string, number | undefined> = {};
  categories: JhatkaCategory[] = [];
  launchRoots: string[] = [];
  products: JhatkaProduct[] = [];
  allProducts: JhatkaProduct[] = [];
  variants: JhatkaVariant[] = [];

  categorySearch = '';
  productSearch = '';
  productCategory = '';
  productStatus = '';
  productPage = 1;
  productPageSize = 50;
  productCount = 0;

  variantProduct = '';
  variantStatus = '';
  variantPage = 1;
  variantPageSize = 50;
  variantCount = 0;

  activeTab = 0;
  isLoadingCategories = true;
  isLoadingProducts = true;
  isLoadingVariants = true;
  busyId = '';

  constructor(
    public admin: JhatkaAdminService,
    public appApi: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {
    this.getStats();
    this.getCategories();
    this.loadProducts();
    this.loadVariants();
    this.loadAllProducts();
  }

  get filteredCategories(): JhatkaCategory[] {
    const query = this.categorySearch.toLowerCase().trim();
    if (!query) {
      return this.categories;
    }
    return this.categories.filter((category) => {
      const parent = this.categoryName(category.parent);
      return `${category.name} ${category.key} ${parent}`.toLowerCase().includes(query);
    });
  }

  get hasNextProducts(): boolean {
    return this.productCount === this.productPageSize;
  }

  get hasNextVariants(): boolean {
    return this.variantCount === this.variantPageSize;
  }

  get productCountLabel(): string {
    return `${this.productCount} product${this.productCount === 1 ? '' : 's'} on this page`;
  }

  get variantCountLabel(): string {
    return `${this.variantCount} variant${this.variantCount === 1 ? '' : 's'} on this page`;
  }

  get inactiveTotal(): number {
    return (this.stats['inactiveProducts'] || 0) + (this.stats['inactiveVariants'] || 0);
  }

  getStats() {
    this.admin.getCatalogueStats().subscribe({
      next: (stats) => (this.stats = stats || {}),
      error: (error) => this.util.handleError(error, 'admin'),
    });
  }

  getCategories() {
    this.isLoadingCategories = true;
    this.admin.getCategories().subscribe({
      next: (response) => {
        this.categories = response?.categories || [];
        this.launchRoots = response?.launchRoots || [];
        this.isLoadingCategories = false;
      },
      error: (error) => {
        this.isLoadingCategories = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  loadProducts() {
    this.isLoadingProducts = true;
    this.admin
      .getProducts({
        page: this.productPage,
        limit: this.productPageSize,
        search: this.productSearch,
        category: this.productCategory,
        status: this.productStatus,
      })
      .subscribe({
        next: (response) => {
          this.products = response?.products || [];
          this.productCount = response?.count || 0;
          this.isLoadingProducts = false;
        },
        error: (error) => {
          this.isLoadingProducts = false;
          this.util.handleError(error, 'admin');
        },
      });
  }

  loadAllProducts() {
    this.admin.getProducts({ limit: 200 }).subscribe({
      next: (response) => (this.allProducts = response?.products || []),
      error: (error) => this.util.handleError(error, 'admin'),
    });
  }

  loadVariants() {
    this.isLoadingVariants = true;
    this.admin
      .getVariants({
        page: this.variantPage,
        limit: this.variantPageSize,
        product: this.variantProduct,
        status: this.variantStatus,
      })
      .subscribe({
        next: (response) => {
          this.variants = response?.variants || [];
          this.variantCount = response?.count || 0;
          this.isLoadingVariants = false;
        },
        error: (error) => {
          this.isLoadingVariants = false;
          this.util.handleError(error, 'admin');
        },
      });
  }

  onProductFilters() {
    this.productPage = 1;
    this.loadProducts();
  }

  onVariantFilters() {
    this.variantPage = 1;
    this.loadVariants();
  }

  productPageChange(delta: number) {
    const next = this.productPage + delta;
    if (next < 1 || (delta > 0 && !this.hasNextProducts)) {
      return;
    }
    this.productPage = next;
    this.loadProducts();
  }

  variantPageChange(delta: number) {
    const next = this.variantPage + delta;
    if (next < 1 || (delta > 0 && !this.hasNextVariants)) {
      return;
    }
    this.variantPage = next;
    this.loadVariants();
  }

  openCategory(category?: JhatkaCategory) {
    this.dialog
      .open(JhatkaCategoryDialog, {
        data: {
          category,
          categories: this.categories,
          launchRoots: this.launchRoots,
        },
        width: '540px',
        maxWidth: 'calc(100vw - 32px)',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.saved) {
          this.getCategories();
          this.getStats();
          this.loadProducts();
          this.loadAllProducts();
        }
      });
  }

  openProduct(product?: JhatkaProduct) {
    this.dialog
      .open(JhatkaProductDialog, {
        data: { product, categories: this.categories },
        width: '640px',
        maxWidth: 'calc(100vw - 32px)',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.saved) {
          this.loadProducts();
          this.loadAllProducts();
          this.getStats();
        }
      });
  }

  openVariant(variant?: JhatkaVariant) {
    this.dialog
      .open(JhatkaVariantDialog, {
        data: { variant, products: this.allProducts },
        width: '680px',
        maxWidth: 'calc(100vw - 32px)',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.saved) {
          this.loadVariants();
          this.getStats();
        }
      });
  }

  toggleCategory(category: JhatkaCategory, enabled: boolean) {
    const id = this.admin.idOf(category);
    if (!id || this.busyId) {
      return;
    }
    this.busyId = id;
    this.admin.updateCategory(id, { status: enabled }).subscribe({
      next: () => {
        this.busyId = '';
        this.getCategories();
        this.getStats();
        this.util.onSuccess('ts_status_updated');
      },
      error: (error) => {
        this.busyId = '';
        this.getCategories();
        this.util.handleError(error, 'admin');
      },
    });
  }

  toggleProduct(product: JhatkaProduct, enabled: boolean) {
    const id = this.admin.idOf(product);
    if (!id || this.busyId) {
      return;
    }
    this.busyId = id;
    this.admin.updateProduct(id, { status: enabled }).subscribe({
      next: () => {
        this.busyId = '';
        this.loadProducts();
        this.loadAllProducts();
        this.getStats();
        this.util.onSuccess('ts_status_updated');
      },
      error: (error) => {
        this.busyId = '';
        this.loadProducts();
        this.util.handleError(error, 'admin');
      },
    });
  }

  toggleVariant(variant: JhatkaVariant, enabled: boolean) {
    const id = this.admin.idOf(variant);
    if (!id || this.busyId) {
      return;
    }
    this.busyId = id;
    this.admin.updateVariant(id, { status: enabled }).subscribe({
      next: () => {
        this.busyId = '';
        this.loadVariants();
        this.getStats();
        this.util.onSuccess('ts_status_updated');
      },
      error: (error) => {
        this.busyId = '';
        this.loadVariants();
        this.util.handleError(error, 'admin');
      },
    });
  }

  categoryName(value: JhatkaCategory | string | undefined | null): string {
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      return this.categories.find((category) => this.admin.idOf(category) === value)?.name || '';
    }
    return value.name;
  }

  productName(value: JhatkaProduct | string | undefined | null): string {
    if (!value) {
      return 'Not linked';
    }
    if (typeof value === 'string') {
      return this.allProducts.find((product) => this.admin.idOf(product) === value)?.name || 'Product';
    }
    return value.name;
  }

  categoryMode(category: JhatkaCategory): string {
    if (!category.defaultMeasurementMode) {
      return 'Inherited';
    }
    return category.defaultMeasurementMode === 'WEIGHT' ? 'Weight' : 'Count';
  }

  isActive(entity: JhatkaCategory | JhatkaProduct | JhatkaVariant): boolean {
    return entity.status !== false;
  }

  initials(value?: string): string {
    return (value || '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  mediaHref(path?: string): string {
    if (!path) {
      return '';
    }
    return /^https?:\/\//i.test(path) ? path : this.appApi.mediaUrl + path;
  }

  packLabel(variant: JhatkaVariant): string {
    const pack = variant.packSize;
    if (!pack?.value) {
      return 'Not set';
    }
    return `${pack.value} ${pack.unit || ''}`.trim();
  }

  basisLabel(basis: string): string {
    return (basis || '').replace('_', ' ');
  }

  trackById(index: number, row: any): string {
    return this.admin.idOf(row) || String(index);
  }
}
