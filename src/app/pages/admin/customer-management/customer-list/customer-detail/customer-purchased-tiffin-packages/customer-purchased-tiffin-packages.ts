import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AdminCustomerPurchasedPackageInterface } from 'src/app/interfaces/admin.customer.purchased.packages.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-customer-purchased-tiffin-packages',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './customer-purchased-tiffin-packages.html',
})
export class CustomerPurchasedTiffinPackages implements AfterViewInit {

  @Input() userId!: string;
  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  list = new MatTableDataSource<AdminCustomerPurchasedPackageInterface>([]);
  displayedColumn = ['restaurant', 'package', 'schedule', 'sent', 'paid', 'status', 'days', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router,
  ) {
  }

  ngAfterViewInit() {
    console.log(`------ ${this.userId}`);
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'user': this.userId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/customer/purchasedTiffinPackages?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminCustomerPurchasedPackageInterface) => {
              if (item && item.restaurant && item.restaurant?.id) {
                if (item.restaurant?.translations) {
                  const translation = item.restaurant.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurant.displayName = translation?.title || item.restaurant.name;
                } else {
                  item.restaurant.displayName = item.restaurant?.name || '';
                }
              }
              if (item && item.package && item.package?.id) {
                if (item.package?.translations) {
                  const translation = item.package.translations.find((t) => t.code == this.util.appLocaleName());
                  item.package.displayName = translation?.title || item.package.name;
                } else {
                  item.package.displayName = item.package?.name || '';
                }
              }
              return item;
            }
          );
          this.list = new MatTableDataSource<AdminCustomerPurchasedPackageInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
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

  onView(purchased: AdminCustomerPurchasedPackageInterface) {
    this.router.navigate(['admin/order-management/user-purchased-tiffin-subscription-info/', purchased.id]);
  }

}
