import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { VendorPayoutMethodListInterface } from 'src/app/interfaces/vendor.payout.method.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogVendorPayoutAccount } from './dialog-vendor-payout-account/dialog-vendor-payout-account';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-payout-accounts',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './payout-accounts.html',
})
export class PayoutAccounts {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  methods = new MatTableDataSource<VendorPayoutMethodListInterface>([]);
  displayedColumn = ['name', 'credential', 'isDefault', 'action'];
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
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/vendor_web/payoutMethod/myPayoutList/' + this.util.getItem('_vendorId') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(response);
        if (response && response.methods) {
          const mappedList = response.methods.map(
            (item: VendorPayoutMethodListInterface) => {
              if (item && item.method && item.method?.id) {
                if (item.method?.translations) {
                  const translation = item.method.translations.find((t) => t.code == this.util.appLocaleName());
                  item.method.displayName = translation?.title || item.method.name;
                } else {
                  item.method.displayName = item.method?.name || '';
                }
              }
              return item;
            }
          );
          this.methods = new MatTableDataSource<VendorPayoutMethodListInterface>(mappedList);
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

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onAddMethod() {
    const dialogRef = this.dialog.open(DialogVendorPayoutAccount, {
      data: { action: 'add' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getList();
      }
    });
  }

  onDefaultChange(event: MatSlideToggleChange, item: VendorPayoutMethodListInterface) {
    console.log(item);
    const spinnerRef = this.util.start();
    const param = {
      'id': item.id,
      'restaurant': this.util.getItem('_vendorId'),
      'isDefault': event.checked
    }
    this.api.patch_private('v1/vendor_web/payoutMethod/updateDefault/', param).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_default_method_updated');
        this.getList();
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onEditMethod(item: VendorPayoutMethodListInterface) {
    console.log(item);
    const dialogRef = this.dialog.open(DialogVendorPayoutAccount, {
      data: { action: 'edit', id: item.id },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getList();
      }
    });
  }

  onDelete(item: VendorPayoutMethodListInterface) {
    console.log(item);
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_payout_method_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/vendor_web/payoutMethod/deleteMethod/' + item.id + '/' + this.util.getItem('_vendorId')).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'vendor');
          }
        });
      }
    });
  }

}
