import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-jhatka-taxonomy',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './taxonomy.html',
})
export class JhatkaTaxonomy {
  isLoaded: boolean = false;
  categories: any[] = [];
  products: any[] = [];
  variants: any[] = [];
  search: string = '';
  selectedProduct: string = '';
  newCategory: any = { key: 'chicken', name: '', sortOrder: 0 };
  newProduct: any = { category: '', code: '', name: '', hsnCode: '' };
  newVariant: any = { product: '', sku: '', name: '', measurementMode: 'WEIGHT', pricePerUnit: null, priceBasis: 'per_kg' };
  categoryKeys: string[] = ['chicken', 'mutton', 'fish_seafood', 'eggs'];

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {
    this.getAll();
  }

  getAll() {
    this.isLoaded = false;
    this.api.get_private('v1/jhatka/admin/taxonomy').subscribe({
      next: (response: any) => {
        this.categories = response?.categories || [];
        this.getProducts();
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  getProducts() {
    let httpParams = new HttpParams();
    if (this.search) {
      httpParams = httpParams.set('search', this.search);
    }
    this.api.get_private('v1/jhatka/admin/taxonomy/products?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        this.products = response?.products || [];
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  getVariants() {
    let httpParams = new HttpParams();
    if (this.selectedProduct) {
      httpParams = httpParams.set('product', this.selectedProduct);
    }
    this.api.get_private('v1/jhatka/admin/taxonomy/variants?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.variants = response?.variants || [];
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  onProductFilter() {
    this.getVariants();
  }

  onSearch() {
    this.getProducts();
  }

  createCategory() {
    if (!this.newCategory.name) {
      return;
    }
    this.api.post_private('v1/jhatka/admin/taxonomy/categories', this.newCategory).subscribe({
      next: () => {
        this.newCategory = { key: 'chicken', name: '', sortOrder: 0 };
        this.getAll();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  createProduct() {
    if (!this.newProduct.name || !this.newProduct.code || !this.newProduct.category) {
      return;
    }
    this.api.post_private('v1/jhatka/admin/taxonomy/products', this.newProduct).subscribe({
      next: () => {
        this.newProduct = { category: '', code: '', name: '', hsnCode: '' };
        this.getProducts();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  createVariant() {
    if (!this.newVariant.product || !this.newVariant.sku || !this.newVariant.name || this.newVariant.pricePerUnit === null) {
      return;
    }
    this.api.post_private('v1/jhatka/admin/taxonomy/variants', this.newVariant).subscribe({
      next: () => {
        this.newVariant = { product: '', sku: '', name: '', measurementMode: 'WEIGHT', pricePerUnit: null, priceBasis: 'per_kg' };
        this.getProducts();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  toggleProductStatus(element: any) {
    const id = element._id || element.id;
    const next = element.status === true || element.status === 'true' ? false : true;
    this.api.patch_private(`v1/jhatka/admin/taxonomy/products/${id}`, { status: next }).subscribe({
      next: () => this.getProducts(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  editVariantPrice(element: any) {
    const id = element._id || element.id;
    const raw = window.prompt(`Price per unit (Rs) for ${element.sku || element.name}:`, String(element.pricePerUnit ?? ''));
    if (raw === null) {
      return;
    }
    const pricePerUnit = Number(raw);
    if (!Number.isFinite(pricePerUnit) || pricePerUnit <= 0) {
      this.util.handleError({ message: 'Price must be a positive number' }, 'admin');
      return;
    }
    this.api.patch_private(`v1/jhatka/admin/taxonomy/variants/${id}`, { pricePerUnit }).subscribe({
      next: () => this.getProducts(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  toggleVariantStatus(element: any) {
    const id = element._id || element.id;
    const next = element.status === true || element.status === 'true' ? false : true;
    this.api.patch_private(`v1/jhatka/admin/taxonomy/variants/${id}`, { status: next }).subscribe({
      next: () => this.getProducts(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
