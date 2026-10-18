import { Component, Inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CityzenMediaListDialogInterface } from 'src/app/interfaces/cityzen.media.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-media-images-dialog',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-media-images-dialog.html',
})
export class CityzenMediaImagesDialog {

  listOfMedias: CityzenMediaListDialogInterface[] = [];
  pageSize: number = 40;
  currentPage: number = 0;
  selectedMedia: string = '';
  fileURL: any = 'assets/images/placeholder.png';
  fileTarget: any;
  uploadingImage: boolean = false;
  totalResults: number = 0;
  serverResults: number = 0;
  tabIndex: number = 0;
  isLoaded: boolean = false;
  isLoadingMore: boolean = false;

  constructor(
    public api: ApiService,
    public util: UtilService,
    public dialogRef: MatDialogRef<CityzenMediaImagesDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.value) {
      this.selectedMedia = this.data.value;
    }
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
    this.api.get_private('v1/cityzen/media_files/' + this.util.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        this.isLoadingMore = false;
        if (response && response.results) {
          this.listOfMedias = response.results;
          this.totalResults = response.totalResults;
          this.serverResults = response.results.length;
          console.log(this.listOfMedias);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.isLoadingMore = false;
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onLoadMore() {
    this.pageSize = Number(this.pageSize) * 2;
    console.log(this.pageSize);
    this.isLoadingMore = true;
    this.getList();
  }

  onSave() {
    this.dialogRef.close({ selected: '' });
  }

  onMediaSelect(path: string) {
    this.selectedMedia = path;
  }

  onSelect() {
    if (this.selectedMedia && this.selectedMedia != null && this.selectedMedia != '') {
      this.dialogRef.close({ event: 'select', data: this.selectedMedia });
    }
  }

  onFileChoose(event: any) {
    console.log(event);
    if (event.target.files && event.target.files[0]) {
      this.fileTarget = event.target.files[0];
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]);

      reader.onload = (event: any) => {
        this.fileURL = event.target.result;
      }
    }
  }

  uploadImage() {
    if (this.fileTarget) {
      const mimeType = this.fileTarget.type;
      if (mimeType.match(/image\/*/) == null) {
        this.util.onError('ts_please_upload_image_files', '');
        return;
      }
      const spinnerRef = this.util.start('ts_uploading');
      this.api.uploadFile(this.fileTarget).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          if (response && response.path) {
            this.dialogRef.close({ event: 'select', data: response.path });
          }
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'cityzen');
        }
      });
    }
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
    if (tabChangeEvent.index == 1 && !this.isLoaded) {
      this.getList();
    }
  }

  onReset() {
    this.fileTarget = null;
    this.fileURL = 'assets/images/placeholder.png';
  }

}
