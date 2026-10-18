import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Customer detail — one customer's applications at this bank (plan §13.2).
 * Assembled from GET /customers + GET /applications: no new backend.
 * A bank sees ONLY its own applications (BR-10 adjacency, token-scoped).
 */
@Component({
  selector: 'app-bank-customer-detail',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './customer-detail.html',
})
export class CustomerDetail implements OnInit, OnDestroy {
  isLoaded: boolean = false;
  customer: any = null;
  apps: any[] = [];
  id: string = '';
  sub: any = null;
  displayedColumn: string[] = ['app', 'amount', 'status'];

  constructor(
    public api: ApiService,
    public util: UtilService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  load() {
    this.isLoaded = false;
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.api.get_private('v1/realestate/bank/applications').subscribe({
      next: (response: any) => {
        const all = Array.isArray(response) ? response : [];
        const mine = all.filter((a: any) => String(a.customer?._id || a.customer) === String(this.id));
        this.apps = mine;
        const first = mine[0];
        this.customer = (first && first.customer && typeof first.customer === 'object' && first.customer._id
          ? first.customer
          : { _id: this.id });
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }
}
