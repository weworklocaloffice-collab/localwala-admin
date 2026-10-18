import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-ls-provider-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './ls-provider-detail.html',
})
export class LsProviderDetail {
  isLoaded: boolean = false;
  provider: any = null;
  documents: any[] = [];
  offerings: any[] = [];
  bookings: any[] = [];

  constructor(
    public api: ApiService,
    public util: UtilService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.getDetail(id);
  }

  getDetail(id: string) {
    this.isLoaded = false;
    this.api.get_private('v1/local-services/admin/providers/' + id).subscribe({
      next: (response: any) => {
        this.provider = response.provider;
        this.getRelated(id);
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  getRelated(id: string) {
    const params = new HttpParams().set('provider', id).set('limit', 20).set('page', 0);
    const qs = params.toString();
    let done = 0;
    const finish = () => {
      done += 1;
      if (done >= 3) this.isLoaded = true;
    };
    this.api.get_private('v1/local-services/admin/providers/documents?' + qs).subscribe({
      next: (r: any) => { this.documents = r.results || []; finish(); },
      error: () => finish(),
    });
    this.api.get_private('v1/local-services/admin/providers/offerings?' + qs).subscribe({
      next: (r: any) => { this.offerings = r.results || []; finish(); },
      error: () => finish(),
    });
    this.api.get_private('v1/local-services/admin/bookings?' + qs).subscribe({
      next: (r: any) => { this.bookings = r.results || []; finish(); },
      error: () => finish(),
    });
  }
}
