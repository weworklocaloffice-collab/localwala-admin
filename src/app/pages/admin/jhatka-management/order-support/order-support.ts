import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-jhatka-order-support',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './order-support.html',
})
export class JhatkaOrderSupport {
  isLoaded: boolean = false;
  reviews: any[] = [];
  complaints: any[] = [];
  variableWeight: any[] = [];

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {
    this.getAll();
  }

  pickList(response: any, keys: string[]): any[] {
    if (!response) {
      return [];
    }
    for (const key of keys) {
      if (Array.isArray(response[key])) {
        return response[key];
      }
    }
    return [];
  }

  getAll() {
    this.isLoaded = false;
    const calls: Array<[string, (list: any[]) => void]> = [
      ['v1/jhatka/admin/orders/reviews', (list) => (this.reviews = list)],
      ['v1/jhatka/admin/orders/complaints', (list) => (this.complaints = list)],
      ['v1/jhatka/admin/orders/variable-weight', (list) => (this.variableWeight = list)],
    ];
    let pending = calls.length;
    const done = () => {
      pending -= 1;
      if (pending <= 0) {
        this.isLoaded = true;
      }
    };
    calls.forEach(([url, assign]) => {
      this.api.get_private(url).subscribe({
        next: (response: any) => {
          assign(this.pickList(response, ['reviews', 'complaints', 'orders', 'lines', 'items']));
          done();
        },
        error: (error: any) => {
          this.util.handleError(error, 'admin');
          done();
        },
      });
    });
  }

  decideReview(element: any, action: string) {
    this.api.patch_private(`v1/jhatka/admin/orders/reviews/${element.id}`, { action }).subscribe({
      next: () => this.getAll(),
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
