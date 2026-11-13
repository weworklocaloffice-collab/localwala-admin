import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { StoresTaxonomyBase } from '../taxonomy-base';
import { DialogBrand } from './dialog-brand/dialog-brand';
import { DialogBrandMerge } from './dialog-brand-merge/dialog-brand-merge';
import { DialogBrandCertifications } from './dialog-brand-certifications/dialog-brand-certifications';

/**
 * Brand registry.
 *
 * §5.7 resolves the specification's ambiguity — Brand is a first-class collection, not an
 * attribute template — because brand search, filtering, logos and moderation all need one.
 *
 * Approval is not offered as a status toggle here. The service refuses to approve a brand
 * with no category, and an inline toggle would let an operator flip it and read a failure
 * afterwards. Approval goes through the detail flow where categories are visible.
 */
@Component({
  selector: 'app-stores-brands',
  imports: [CommonModule, FormsModule, MaterialModule, RouterModule],
  templateUrl: './brands.html',
})
export class Brands extends StoresTaxonomyBase {
  categories: any[] = [];
  selectedCategory: string = '';

  constructor(
    api: ApiService,
    util: UtilService,
    public override dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    this.path = 'brands';
    this.listTitleKey = 'stores_brands_list';
    this.displayedColumn = ['name', 'categories', 'aliases', 'status', 'verified', 'action'];
    // Brand create/edit carries taxonomy (categories) because an approved brand
    // with no category is refused server-side. Certifications stay Phase-13.
    this.dialog = DialogBrand;
  }

  override ngOnInit() {
    super.ngOnInit();
    this.api.get_private('v1/admin/stores/catalog/categories?limit=200').subscribe({
      next: (response: any) => {
        this.categories = (response && response.results ? response.results : []).filter(
          (c: any) => c.status !== false,
        );
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  override onCreate() {
    const ref = this.dialogRef.open(DialogBrand, {
      data: {
        action: 'create',
        categories: this.selectedCategory ? [this.selectedCategory] : [],
      },
      disableClose: true,
    });
    ref.afterClosed().subscribe((result: any) => {
      if (result && result.event === 'add') {
        this.util.onSuccess(this.util.appTranslate('stores_brand_added'));
        this.getList();
      }
    });
  }

  override onEdit(element: any) {
    const ref = this.dialogRef.open(DialogBrand, {
      data: { action: 'edit', values: element },
      disableClose: true,
    });
    ref.afterClosed().subscribe((result: any) => {
      if (result && result.event === 'update') {
        this.util.onSuccess(this.util.appTranslate('stores_brand_updated'));
        this.getList();
      }
    });
  }

  hasChainCertification(element: any): boolean {
    const now = new Date();
    const certs = element?.certifications || [];
    return certs.some((c: any) =>
      c.status === 'approved' &&
      (!c.validFrom || new Date(c.validFrom) <= now) &&
      (!c.validTo || new Date(c.validTo) > now) &&
      c.chain
    );
  }

  onCertifications(element: any) {
    const ref = this.dialogRef.open(DialogBrandCertifications, {
      data: { values: element },
      disableClose: true,
      width: '760px',
    });
    ref.afterClosed().subscribe((result: any) => {
      if (result && result.event === 'update') {
        this.getList();
      }
    });
  }

  onMerge(element: any) {
    const ref = this.dialogRef.open(DialogBrandMerge, {
      data: { values: element },
      disableClose: true,
      width: '560px',
    });
    ref.afterClosed().subscribe((result: any) => {
      if (result && result.event === 'merge') {
        this.util.onSuccess(this.util.appTranslate('stores_brand_merged'));
        this.getList();
      }
    });
  }
}