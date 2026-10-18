import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { AdminDeliverymanReviewsInterface, Hashtag } from 'src/app/interfaces/admin.deliveryman.reviews.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-driver-details-reviews',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './driver-details-reviews.html',
})
export class DriverDetailsReviews implements AfterViewInit {

  @Input() driverId!: string;
  @ViewChild('deliverymanReviewPaginator', { read: MatPaginator, static: false }) deliverymanReviewPaginator: MatPaginator;
  reviews: AdminDeliverymanReviewsInterface[] = [];
  pageSize: number = 5;
  currentPage: number = 0;
  totalReview: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {
  }

  ngAfterViewInit() {
    console.log(`------ ${this.driverId}`);
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'deliveryman': this.driverId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/deliveryman_detail/reviews?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          this.reviews = response.results;
          this.deliverymanReviewPaginator.length = response.totalResults;
          this.deliverymanReviewPaginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onOrderDetail(id: string) {
    this.router.navigate(['admin/order-management/order-details', id]);
  }

  onUserDetail(id: string) {
    this.router.navigate(['admin/customer-management/customer-detail', id]);
  }

  getTranslatedDeliverymanHashtag(hash: Hashtag): string {
    const found = hash.translations?.find(t => t.code == this.util.appLocaleName());
    return found?.value || hash.displayName || hash.name;
  }

}
