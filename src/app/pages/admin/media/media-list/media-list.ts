import { Component } from '@angular/core';
import { AdminMediaListInterface } from 'src/app/interfaces/admin.media.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogMediaInfo } from './dialog-media-info/dialog-media-info';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-media-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgScrollbarModule],
  templateUrl: './media-list.html',
})
export class MediaList {

  listOfMedias: AdminMediaListInterface[] = [];
  pageSize: number = 40;
  currentPage: number = 0;
  totalResults: number = 0;
  serverResults: number = 0;
  exportType: string = 'export';
  isLoaded: boolean = false;
  isLoadingMore: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.getList();
  }

  getList() {
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'sortBy': 'createdAt:desc'
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/medias/getMediaList?' + httpParams.toString()).subscribe({
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
        this.util.handleError(error, 'admin');
      }
    });
  }

  onMediaInfo(item: AdminMediaListInterface) {
    console.log(item);
    const dialogRef = this.dialog.open(DialogMediaInfo, {
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

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      const spinnerRef = this.util.start();
      this.api.export_collection('v1/admin/medias/export/' + exportOption).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'Medias.xlsx' : 'Medias.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'media.json';
            this.api.download_export_file(blob, fileName);
          }
          this.exportType = 'export';
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.exportType = 'export';
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  importCollection() {
    this.router.navigate(['admin/import-export-management/import-collection/', 'media_files']);
  }

}
