import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CityzenMediaFileListInterface } from 'src/app/interfaces/cityzen.media.files.list.interface';
import { DialogCityzenMediaInfoDetail } from 'src/app/pages/city-master-team/cityzen-promotion-management/cityzen-media-files/dialog-cityzen-media-info-detail/dialog-cityzen-media-info-detail';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-cityzen-customer-detail-media-files',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgScrollbarModule],
  templateUrl: './cityzen-customer-detail-media-files.html',
})
export class CityzenCustomerDetailMediaFiles implements AfterViewInit {

  @Input() userId!: string;
  listOfMedias: CityzenMediaFileListInterface[] = [];
  pageSize: number = 40;
  currentPage: number = 0;
  totalResults: number = 0;
  serverResults: number = 0;
  isLoaded: boolean = false;
  isLoadingMore: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
  ) {

  }

  ngAfterViewInit() {
    console.log(`------ ${this.userId}`);
    this.getList();
  }

  getList() {
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'user': this.userId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/customer_detail_media_files?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        this.isLoadingMore = false;
        if (response && response.results && response.success) {
          this.listOfMedias = response.results;
          this.totalResults = response.totalResults;
          this.serverResults = response.results.length;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.isLoadingMore = false;
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onMediaInfo(item: CityzenMediaFileListInterface) {
    console.log(item);
    const dialogRef = this.dialog.open(DialogCityzenMediaInfoDetail, {
      data: { values: item },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'delete') {
        this.getList();
      }
    });
  }

  onLoadMore() {
    this.pageSize = Number(this.pageSize) * 2;
    console.log(this.pageSize);
    this.isLoadingMore = true;
    this.getList();
  }

}
