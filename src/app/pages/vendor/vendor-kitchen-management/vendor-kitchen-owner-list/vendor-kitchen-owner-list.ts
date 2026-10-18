import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { VendorKitchenOwnerListInterface } from 'src/app/interfaces/vendor.kitchen.owner.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-vendor-kitchen-owner-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './vendor-kitchen-owner-list.html',
})
export class VendorKitchenOwnerList {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  owners = new MatTableDataSource<VendorKitchenOwnerListInterface>([]);
  displayedColumn = ['name', 'contact', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/vendor_web/kitchen_owner/list/' + this.util.getItem('_vendorId') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          this.owners = response.results;
          this.paginator.length = response.totalResults;
          console.log(this.owners);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onAddKitchenOwner() {
    this.router.navigate(['vendor/kitchen-owner-management/new-kitchen-owner']);
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }


  onStatusChange(event: MatSlideToggleChange, owner: VendorKitchenOwnerListInterface) {
    console.log(event);
    console.log(owner);
    owner.status = event.checked;
    this.api.patch_private('v1/vendor_web/kitchen_owner/update_kitchen_status/' + owner.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onEdit(owner: VendorKitchenOwnerListInterface) {
    console.log(owner);
    console.log(owner.id);
    this.router.navigate(['vendor/kitchen-owner-management/update-kitchen-owner', owner.id]);
  }

}
