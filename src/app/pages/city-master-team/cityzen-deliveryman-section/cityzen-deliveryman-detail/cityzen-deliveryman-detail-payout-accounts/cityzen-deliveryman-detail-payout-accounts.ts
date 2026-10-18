import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CityzenDeliverymanPayoutAccountListInterface } from 'src/app/interfaces/cityzen.deliveryman.payout.account.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-deliveryman-detail-payout-accounts',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-deliveryman-detail-payout-accounts.html',
})
export class CityzenDeliverymanDetailPayoutAccounts implements AfterViewInit {

  @Input() driverId!: string;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  methods = new MatTableDataSource<CityzenDeliverymanPayoutAccountListInterface>([]);
  displayedColumn = ['name', 'credential'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
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
    this.api.get_private('v1/cityzen/deliveryman_detail_payout_accounts?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.methods) {
          const mappedList = response.methods.map(
            (item: CityzenDeliverymanPayoutAccountListInterface) => {
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
          this.methods = new MatTableDataSource<CityzenDeliverymanPayoutAccountListInterface>(mappedList);
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

}
