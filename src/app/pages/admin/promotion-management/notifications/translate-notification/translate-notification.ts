import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { OrderNotificationTranslationListInterface } from 'src/app/interfaces/order.notification.translation.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { DialogNotificationTranslate } from './dialog-notification-translate/dialog-notification-translate';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-translate-notification',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './translate-notification.html',
})
export class TranslateNotification {

  list = new MatTableDataSource<OrderNotificationTranslationListInterface>([]);
  displayedColumn = ['name', 'action'];

  constructor(
    public api: ApiService,
    private dialog: MatDialog,
    public util: UtilService,
  ) {
    this.api.getLocalAssets('order.notification.json').then((response: any) => {
      console.log(response);
      this.list = response;
    }).catch((error: any) => {
      console.log(error);
    });
  }

  onEdit(notification: OrderNotificationTranslationListInterface) {
    console.log(notification);
    const dialogRef = this.dialog.open(DialogNotificationTranslate, {
      data: { values: notification },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
    });
  }

}
