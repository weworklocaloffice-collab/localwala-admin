import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-jhatka-outlets',
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  templateUrl: './outlets.html',
})
export class JhatkaOutlets {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  displayedColumn: string[] = ['name', 'model', 'status', 'action'];
  partners: any[] = [];
  franchises: any[] = [];
  newPartner: any = { partnerCode: '', business: '', owner: '', name: '' };

  @ViewChild('paginator', { read: MatPaginator, static: false })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {
    this.getList();
    this.getPartners();
    this.getFranchises();
  }

  getPartners() {
    this.api.get_private('v1/jhatka/admin/partners').subscribe({
      next: (response: any) => {
        this.partners = response?.partners || [];
      },
      error: () => {},
    });
  }

  getFranchises() {
    this.api.get_private('v1/jhatka/admin/franchises').subscribe({
      next: (response: any) => {
        const body = response?.franchises ? response : { franchises: response };
        this.franchises = body.franchises || [];
      },
      error: () => {},
    });
  }

  createPartner() {
    const body = this.newPartner;
    if (!body.partnerCode || !body.business || !body.owner || !body.name) {
      return;
    }
    this.api.post_private('v1/jhatka/admin/partners', body).subscribe({
      next: () => {
        this.newPartner = { partnerCode: '', business: '', owner: '', name: '' };
        this.getPartners();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  setPartnerStatus(element: any, status: string) {
    this.api.patch_private(`v1/jhatka/admin/partners/${element.id}`, { status }).subscribe({
      next: () => this.getPartners(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  setFranchiseStatus(element: any, status: string) {
    const reason = status === 'terminated'
      ? window.prompt('Termination reason (recorded on the franchise):')
      : undefined;
    if (status === 'terminated' && !reason) {
      return;
    }
    this.api.patch_private(`v1/jhatka/admin/franchises/${element.id}`, { status, statusReason: reason }).subscribe({
      next: () => this.getFranchises(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      limit: this.pageSize,
      page: this.currentPage + 1,
      status: this.selectedStatus,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) {
        return;
      }
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/jhatka/admin/outlets?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        if (response && response.outlets) {
          this.list = response.outlets;
          if (this.paginator) {
            this.paginator.length = response.count ?? response.total ?? this.list.length;
          }
        }
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onStatusFilter() {
    this.currentPage = 0;
    this.getList();
  }

  setStatus(element: any, status: string) {
    this.api.patch_private(`v1/jhatka/admin/outlets/${element.id}`, { status }).subscribe({
      next: () => this.getList(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  newOutlet: any = {
    outletCode: '', business: '', businessModel: 'direct', name: '',
    addressLine1: '', city: '',
  };
  businessModels: string[] = ['direct', 'franchise', 'commission_partner'];

  createOutlet() {
    const form = this.newOutlet;
    if (!form.outletCode || !form.business || !form.businessModel || !form.name || !form.addressLine1 || !form.city) {
      return;
    }
    // Starts life as a draft — activation is a separate deliberate act.
    this.api.post_private('v1/jhatka/admin/outlets', {
      outletCode: form.outletCode,
      business: form.business,
      businessModel: form.businessModel,
      name: form.name,
      address: { line1: form.addressLine1 },
      city: form.city,
    }).subscribe({
      next: () => {
        this.newOutlet = {
          outletCode: '', business: '', businessModel: 'direct', name: '',
          addressLine1: '', city: '',
        };
        this.getList();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
