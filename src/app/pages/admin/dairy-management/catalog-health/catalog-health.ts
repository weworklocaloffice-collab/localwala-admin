import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-catalog-health',
  imports: [CommonModule, MaterialModule],
  templateUrl: './catalog-health.html',
})
export class CatalogHealth {
  isLoaded: boolean = false;
  health: any = null;

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.getHealth();
  }

  getHealth() {
    this.api.get_private('v1/dairy/admin/catalog/health').subscribe({
      next: (response: any) => {
        this.health = response && response.health ? response.health : response;
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  /**
   * The three orphan counts, named.
   *
   * Returned as bare numbers rather than a list by the API, so they are named here.
   * A health check that only reports counts is not much use without knowing which
   * count means which problem.
   */
  get issues(): { key: string; label: string; value: number }[] {
    if (!this.health) {
      return [];
    }
    return [
      {
        key: 'orphanProductSku',
        label: this.util.appTranslate('dairy_health_orphans'),
        value: this.health.orphanProductSku || 0,
      },
      {
        key: 'skusWithoutProduct',
        label: this.util.appTranslate('dairy_health_sku_no_product'),
        value: this.health.skusWithoutProduct || 0,
      },
      {
        key: 'productsWithoutSku',
        label: this.util.appTranslate('dairy_health_product_no_sku'),
        value: this.health.productsWithoutSku || 0,
      },
    ];
  }

  get issueCount(): number {
    return this.issues.reduce((total, issue) => total + issue.value, 0);
  }
}
