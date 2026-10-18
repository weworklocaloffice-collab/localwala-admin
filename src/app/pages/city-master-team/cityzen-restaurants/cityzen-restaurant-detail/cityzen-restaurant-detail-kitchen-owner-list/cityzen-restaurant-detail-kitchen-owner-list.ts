import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CityzenVendorKitchenOwnerListInterface } from 'src/app/interfaces/cityzen.vendor.kitchen.owner.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-restaurant-detail-kitchen-owner-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './cityzen-restaurant-detail-kitchen-owner-list.html',
})
export class CityzenRestaurantDetailKitchenOwnerList implements AfterViewInit {

  @Input() restaurantId!: string;
  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  owners = new MatTableDataSource<CityzenVendorKitchenOwnerListInterface>([]);
  displayedColumn = ['name', 'contact', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {
  }

  ngAfterViewInit() {
    console.log(`------ ${this.restaurantId}`);
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'restaurant': this.restaurantId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/vendor_detail/kitchen_owner_list?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          this.owners = response.results;
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onStatusChange(event: MatSlideToggleChange, owner: CityzenVendorKitchenOwnerListInterface) {
    console.log(event);
    console.log(owner);
    owner.status = event.checked;
    this.api.patch_private('v1/cityzen/kitchen_owner/update_kitchen_status/' + owner.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onEdit(owner: CityzenVendorKitchenOwnerListInterface) {
    console.log(owner);
    console.log(owner.id);
    this.router.navigate(['cityzen-team/u/edit-restaurant-kitchen-owner', owner.id]);
  }

}
