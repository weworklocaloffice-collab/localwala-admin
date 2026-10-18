import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CityzenDeliverymanDisbursementListInterface } from 'src/app/interfaces/cityzen.deliveryman.disbursement.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogCityzenDeliverymanDisbursementDetail } from 'src/app/pages/city-master-team/cityzen-transaction/cityzen-deliveryman-disbursement-list/dialog-cityzen-deliveryman-disbursement-detail/dialog-cityzen-deliveryman-disbursement-detail';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-deliveryman-detail-disbursement',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-deliveryman-detail-disbursement.html',
})
export class CityzenDeliverymanDetailDisbursement implements AfterViewInit {

  @Input() driverId!: string;
  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  results = new MatTableDataSource<CityzenDeliverymanDisbursementListInterface>([]);
  displayedColumn = ['report', 'amount', 'payout', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router,
    private dialog: MatDialog,
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
    this.api.get_private('v1/cityzen/deliveryman_detail_disbursement_list?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: CityzenDeliverymanDisbursementListInterface) => {
              if (item && item.withdrawalMethodDetail && item.withdrawalMethodDetail?.id) {
                if (item.withdrawalMethodDetail?.translations) {
                  const translation = item.withdrawalMethodDetail.translations.find((t) => t.code == this.util.appLocaleName());
                  item.withdrawalMethodDetail.displayName = translation?.title || item.withdrawalMethodDetail.name;
                } else {
                  item.withdrawalMethodDetail.displayName = item.withdrawalMethodDetail?.name || '';
                }
              }
              return item;
            }
          );
          this.results = new MatTableDataSource<CityzenDeliverymanDisbursementListInterface>(mappedList);
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

  viewDisbursement(report: CityzenDeliverymanDisbursementListInterface) {
    console.log(report);
    const dialogRef = this.dialog.open(DialogCityzenDeliverymanDisbursementDetail, {
      data: { id: report.id },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'true') {
        this.getList();
      }
    });
  }

  acceptDisbursement(report: CityzenDeliverymanDisbursementListInterface) {
    console.log(report);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/accept_deliveryman_disbursement/' + report.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true) {
          this.getList();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  rejectDisbursement(report: CityzenDeliverymanDisbursementListInterface) {
    console.log(report);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/decline_deliveryman_disbursement/' + report.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true) {
          this.getList();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

}
