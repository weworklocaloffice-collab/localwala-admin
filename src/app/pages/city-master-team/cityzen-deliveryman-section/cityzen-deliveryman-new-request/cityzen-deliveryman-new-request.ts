import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CityzenDeliverymanJoiningRequestInterface } from 'src/app/interfaces/cityzen.deliveryman.joining.request.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-deliveryman-new-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './cityzen-deliveryman-new-request.html',
})
export class CityzenDeliverymanNewRequest {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  deliveryman = new MatTableDataSource<CityzenDeliverymanJoiningRequestInterface>([]);
  displayedColumn = ['name', 'contact', 'type', 'location', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  requestType: string = 'all';
  searchQuery: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'search': this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/deliveryman_joining_request/' + this.requestType + '/' + this.util.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: CityzenDeliverymanJoiningRequestInterface) => {
              if (item && item.locality && item.locality?.id) {
                if (item.locality?.translations) {
                  const translation = item.locality.translations.find((t) => t.code == this.util.appLocaleName());
                  item.locality.displayName = translation?.value || item.locality.name;
                } else {
                  item.locality.displayName = item.locality?.name || '';
                }
              }

              if (item && item.vehicleInfo && item.vehicleInfo?.id) {
                if (item.vehicleInfo?.translations) {
                  const translation = item.vehicleInfo.translations.find((t) => t.code == this.util.appLocaleName());
                  item.vehicleInfo.displayName = translation?.value || item.vehicleInfo.name;
                } else {
                  item.vehicleInfo.displayName = item.vehicleInfo?.name || '';
                }
              }
              return item;
            }
          );
          this.deliveryman = new MatTableDataSource<CityzenDeliverymanJoiningRequestInterface>(mappedList);
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

  onRequestTypeChange(requestType: string) {
    console.log(requestType);
    this.requestType = requestType;
    this.getList();
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onInfo(request: CityzenDeliverymanJoiningRequestInterface) {
    console.log(request);
    this.router.navigate(['cityzen-team/u/deliveryman-joining-request-detail', request.id]);
  }

  onDeleteRequest(request: CityzenDeliverymanJoiningRequestInterface) {
    console.log(request);
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_request_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/cityzen/delete_deliveryman_request/' + request.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'cityzen');
          }
        });
      }
    });
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
