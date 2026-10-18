import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AdminUserAvatarListInterface } from 'src/app/interfaces/admin.user.avatar.list.interface';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-user-avatar-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './user-avatar-list.html',
})
export class UserAvatarList {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  avatars = new MatTableDataSource<AdminUserAvatarListInterface>([]);
  displayedColumn = ['name', 'isDefault', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';

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
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/user_avatar/list?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(response);
        if (response && response.results) {
          this.avatars = response.results;
          console.log(this.avatars);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        this.isLoaded = true;
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onDelete(avatar: AdminUserAvatarListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_avatar_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/user_avatar/delete/' + avatar.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'admin');
          }
        });
      }
    });
  }


  onStatusChange(event: MatSlideToggleChange, avatar: AdminUserAvatarListInterface) {
    console.log(event);
    console.log(avatar);
    this.api.patch_private('v1/admin/user_avatar/update/' + avatar.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }


  onDefaultChange(avatar: AdminUserAvatarListInterface) {
    console.log(avatar);
    const spinnerRef = this.util.start();
    this.api.patch_private('v1/admin/user_avatar/updateDefault/' + avatar.id, {}).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_default_avatar_updated');
        this.getList();
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onSave(avatarUrl: string) {
    this.api.post_private('v1/admin/user_avatar/save', { avatar: avatarUrl }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_avatar_added');
        this.getList();
      }, error: (error: any) => {
        this.util.handleError(error, 'admin');
      }
    });
  }

  onAddAvatar() {
    const dialogRef = this.dialog.open(SelectMediaDialog, {
      data: { value: '' },
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      height: "calc(100% - 30px)",
      width: "calc(100% - 30px)",
      maxWidth: "100%",
      maxHeight: "100%",
      panelClass: 'full-width-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event && result.event == 'select' && result.data && result.data != '') {
        console.log(result.data);
        this.onSave(result.data);
      }
    });
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      const spinnerRef = this.util.start();
      this.api.export_collection('v1/admin/user_avatar/export/' + exportOption).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'UserAvatar.xlsx' : 'UserAvatar.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'useravatars.json';
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
    this.router.navigate(['admin/import-export-management/import-collection/', 'user_avatar']);
  }

}
