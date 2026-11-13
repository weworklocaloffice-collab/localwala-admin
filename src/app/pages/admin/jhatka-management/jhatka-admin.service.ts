import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api-service';
import {
  JhatkaBusiness,
  JhatkaCategory,
  JhatkaCityRef,
  JhatkaOutlet,
  JhatkaOutletDetailResponse,
  JhatkaOutletStats,
  JhatkaProduct,
  JhatkaVariant,
} from './jhatka.models';

@Injectable({ providedIn: 'root' })
export class JhatkaAdminService {
  constructor(private api: ApiService) {}

  idOf(value: any): string {
    return value?._id || value?.id || (typeof value === 'string' ? value : '');
  }

  private params(values: Record<string, any>): HttpParams {
    let params = new HttpParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }

  getOutletStats(): Observable<JhatkaOutletStats> {
    return this.api.get_private('v1/jhatka/admin/outlets/stats');
  }

  getOutlets(query: Record<string, any> = {}): Observable<any> {
    return this.api.get_private('v1/jhatka/admin/outlets?' + this.params(query).toString());
  }

  getOutlet(id: string): Observable<JhatkaOutletDetailResponse> {
    return this.api.get_private(`v1/jhatka/admin/outlets/${id}`);
  }

  createOutlet(body: Record<string, any>): Observable<{ outlet: JhatkaOutlet }> {
    return this.api.post_private('v1/jhatka/admin/outlets', body);
  }

  getNextOutletCode(cityId: string): Observable<{ outletCode: string }> {
    return this.api.get_private(`v1/jhatka/admin/outlets/next-code?city=${encodeURIComponent(cityId)}`);
  }

  updateOutlet(id: string, body: Record<string, any>): Observable<{ outlet: JhatkaOutlet }> {
    return this.api.patch_private(`v1/jhatka/admin/outlets/${id}`, body);
  }

  setOutletStatus(id: string, status: string, statusReason?: string) {
    return this.updateOutlet(id, { status, statusReason });
  }

  getBusinesses(search = ''): Observable<{ businesses: JhatkaBusiness[]; count: number }> {
    return this.api.get_private(
      'v1/jhatka/admin/businesses?' + this.params({ search, limit: 200 }).toString()
    );
  }

  createBusiness(body: Record<string, any>): Observable<{ business: JhatkaBusiness }> {
    return this.api.post_private('v1/jhatka/admin/businesses', body);
  }

  getCities(): Observable<JhatkaCityRef[]> {
    return this.api.get_private('v1/admin/cities/listAllCities');
  }

  getLocalities(cityId: string): Observable<JhatkaCityRef[]> {
    return this.api.get_private(`v1/admin/localities/getByCityId/${cityId}`);
  }

  getCatalogueStats(): Observable<Record<string, number>> {
    return this.api.get_private('v1/jhatka/admin/taxonomy/stats');
  }

  getCategories(): Observable<{ categories: JhatkaCategory[]; count: number; launchRoots?: string[] }> {
    return this.api.get_private('v1/jhatka/admin/taxonomy');
  }

  getProducts(query: Record<string, any> = {}): Observable<{ products: JhatkaProduct[]; count: number }> {
    return this.api.get_private(
      'v1/jhatka/admin/taxonomy/products?' + this.params(query).toString()
    );
  }

  getVariants(query: Record<string, any> = {}): Observable<{ variants: JhatkaVariant[]; count: number }> {
    return this.api.get_private(
      'v1/jhatka/admin/taxonomy/variants?' + this.params(query).toString()
    );
  }

  createCategory(body: Record<string, any>) {
    return this.api.post_private('v1/jhatka/admin/taxonomy/categories', body);
  }

  updateCategory(id: string, body: Record<string, any>) {
    return this.api.patch_private(`v1/jhatka/admin/taxonomy/categories/${id}`, body);
  }

  createProduct(body: Record<string, any>) {
    return this.api.post_private('v1/jhatka/admin/taxonomy/products', body);
  }

  updateProduct(id: string, body: Record<string, any>) {
    return this.api.patch_private(`v1/jhatka/admin/taxonomy/products/${id}`, body);
  }

  createVariant(body: Record<string, any>) {
    return this.api.post_private('v1/jhatka/admin/taxonomy/variants', body);
  }

  updateVariant(id: string, body: Record<string, any>) {
    return this.api.patch_private(`v1/jhatka/admin/taxonomy/variants/${id}`, body);
  }

  getPartners(): Observable<{ partners: any[]; count: number }> {
    return this.api.get_private('v1/jhatka/admin/partners');
  }

  getFranchises(): Observable<any> {
    return this.api.get_private('v1/jhatka/admin/franchises');
  }

  createPartner(body: Record<string, any>) {
    return this.api.post_private('v1/jhatka/admin/partners', body);
  }

  setPartnerStatus(id: string, status: string, statusReason?: string) {
    return this.api.patch_private(`v1/jhatka/admin/partners/${id}`, { status, statusReason });
  }

  setFranchiseStatus(id: string, status: string, statusReason?: string) {
    return this.api.patch_private(`v1/jhatka/admin/franchises/${id}`, { status, statusReason });
  }
}
