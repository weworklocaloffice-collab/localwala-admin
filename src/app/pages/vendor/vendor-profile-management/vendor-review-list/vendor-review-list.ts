import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DateTime } from 'luxon';
import { VendorReviewListInterface } from 'src/app/interfaces/vendor.review.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogVendorReview } from './dialog-vendor-review/dialog-vendor-review';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-vendor-review-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './vendor-review-list.html',
})
export class VendorReviewList {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  reviews = new MatTableDataSource<VendorReviewListInterface>([]);
  displayedColumn = ['name', 'star', 'verified', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
  ) {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param = {
      'id': this.util.getItem('_vendorId'),
      'page': this.currentPage,
      'limit': this.pageSize
    }
    this.api.post_private('v1/vendor_web/restaurant/reviews/', param).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(response);
        if (response && response.reviews) {
          this.reviews = response.reviews;
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  getTime(date: string) {
    return DateTime.fromISO(date, { zone: 'utc' }).toLocal().setLocale(this.util.appLocaleName()).toRelative();
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  openDetail(detail: VendorReviewListInterface) {
    console.log(detail);
    this.dialog.open(DialogVendorReview, {
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      data: { values: detail },
    });
  }

}
