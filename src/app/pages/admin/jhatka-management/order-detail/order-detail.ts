import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { PaisePipe } from '../paise.pipe';

@Component({
  selector: 'app-jhatka-order-detail',
  imports: [CommonModule, FormsModule, MaterialModule, PaisePipe],
  templateUrl: './order-detail.html',
})
export class JhatkaOrderDetail {
  isLoaded: boolean = false;
  order: any = null;
  history: any[] = [];
  confirmations: any[] = [];
  varianceFlags: any[] = [];
  refunds: any[] = [];
  review: any = null;
  complaints: any[] = [];
  preparationTickets: any[] = [];
  integrity: any = null;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private route: ActivatedRoute,
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.getDetail(id);
    }
  }

  getDetail(id: string) {
    this.isLoaded = false;
    this.api.get_private(`v1/jhatka/admin/orders/${id}`).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        this.order = response?.order || null;
        this.history = response?.history || [];
        this.confirmations = response?.confirmations || [];
        this.varianceFlags = response?.varianceFlags || [];
        this.refunds = response?.refunds || [];
        this.review = response?.review || null;
        this.complaints = response?.complaints || [];
        this.preparationTickets = response?.preparationTickets || [];
        this.integrity = response?.integrity || null;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }
}
