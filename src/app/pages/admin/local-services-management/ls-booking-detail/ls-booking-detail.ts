import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { LsStatusBadge } from '../ls-status-badge/ls-status-badge';

@Component({
  selector: 'app-ls-booking-detail',
  standalone: true,
  imports: [CommonModule, MaterialModule, LsStatusBadge],
  templateUrl: './ls-booking-detail.html',
})
export class LsBookingDetail {
  isLoaded = false;
  booking: any = null;
  history: any[] = [];

  constructor(
    public api: ApiService,
    public util: UtilService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.getDetail(id);
  }

  getDetail(id: string) {
    this.isLoaded = false;
    this.api.get_private('v1/local-services/admin/bookings/' + id).subscribe({
      next: (response: any) => {
        this.booking = response.booking;
        this.history = response.history || [];
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  back() {
    this.router.navigate(['/admin/local-services-management/bookings']);
  }
}
