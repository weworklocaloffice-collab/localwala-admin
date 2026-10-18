import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MatDialog } from '@angular/material/dialog';
import { CityzenMediaFileListInterface } from 'src/app/interfaces/cityzen.media.files.list.interface';
import { HttpParams } from '@angular/common/http';
import { DialogCityzenMediaInfoDetail } from './dialog-cityzen-media-info-detail/dialog-cityzen-media-info-detail';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-cityzen-media-files',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgScrollbarModule],
  templateUrl: './cityzen-media-files.html',
})
export class CityzenMediaFiles {

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
    this.getList();
  }

  getList() {
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/media_files_list/' + this.util.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        this.isLoadingMore = false;
        if (response && response.media && response.success) {
          this.listOfMedias = response.media;
          this.totalResults = response.totalResults;
          this.serverResults = response.media.length;
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
