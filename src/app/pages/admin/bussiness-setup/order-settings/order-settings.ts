import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogReasons } from './dialog-reasons/dialog-reasons';
import { OrderCancellationReasonListInterface } from 'src/app/interfaces/order.cancellation.reasons.list.interface';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { DialogOrderRatingsMessages } from './dialog-order-ratings-messages/dialog-order-ratings-messages';
import { OrderRatingMessageListInterface } from 'src/app/interfaces/order.rating.message.list.interface';
import { DialogInvoiceInstruction } from './dialog-invoice-instruction/dialog-invoice-instruction';
import { AdminInvoiceInstructionInterface } from 'src/app/interfaces/admin.invoice.instruction.interface';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-order-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, GoogleMapsModule],
  templateUrl: './order-settings.html',
})
export class OrderSettings {
  @ViewChild('paginatorReasons', { read: MatPaginator, static: false }) paginatorReasons: MatPaginator;
  @ViewChild('paginatorRatings', { read: MatPaginator, static: false }) paginatorRatings: MatPaginator;
  @ViewChild('invoicePaginator', { read: MatPaginator, static: false }) invoicePaginator: MatPaginator;
  reasons = new MatTableDataSource<OrderCancellationReasonListInterface>([]);
  ratings = new MatTableDataSource<OrderRatingMessageListInterface>([]);
  invoices = new MatTableDataSource<AdminInvoiceInstructionInterface>([]);
  displayedColumnReason = ['name', 'type', 'status', 'action'];
  displayedColumnRating = ['name', 'type', 'rate', 'status', 'action'];
  displayedInvoiceColumn = ['name', 'status', 'action'];
  action: string = 'add';
  id: string = '';
  settingsForm = new FormGroup({
    deliveryVerification: new FormControl(false),
    homeDelivery: new FormControl(false),
    takeaway: new FormControl(false),
    repeatOrderOption: new FormControl(false),
    subscriptionOrder: new FormControl(false),
    includeChargesForSubscription: new FormControl(false),
    restaurantCanCancelTiffinSubscriptionPackage: new FormControl(false),
    userCanCancelTiffinSubscriptionPackage: new FormControl(false),
    scheduleDelivery: new FormControl(false),
    restaurantCanCancelOrder: new FormControl(false),
    driverCanCancelOrder: new FormControl(false),
    orderConfirmationModel: new FormControl('restaurant'),
    timeIntervalForScheduleDelivery: new FormGroup({
      value: new FormControl(0),
      type: new FormControl('min'),
    }),
    ratingStyle: new FormControl('emoji'),
    instantOrder: new FormControl(false),
    customerOrderDate: new FormControl(false),
    customerCanOrderWithinDays: new FormControl(0),
  });
  haveSubmitClicked: boolean = false;
  pageSizeReason: number = 5;
  currentPageReason: number = 0;
  isCancellationLoaded: boolean = false;
  pageSizeRating: number = 5;
  currentPageRating: number = 0;
  isRatingOrderLoaded: boolean = false;
  pageSizeInvoice: number = 5;
  currentPageInvoice: number = 0;
  isInvoiceLoaded: boolean = false;
  exportType: string = 'export';
  searchQueryCancellation: string = '';
  searchQueryOrderRating: string = '';
  searchQueryInvoice: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.getData();
  }

  getData() {
    this.isCancellationLoaded = false;
    this.isRatingOrderLoaded = false;
    this.isInvoiceLoaded = false;
    const spinnerRef = this.util.start('ts_fetching');
    const param: any = {
      'limit': this.pageSizeReason,
      'page': this.currentPageReason,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/order_settings/get?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isCancellationLoaded = true;
        this.isRatingOrderLoaded = true;
        this.isInvoiceLoaded = true;
        this.util.stop(spinnerRef);
        if (response && response.settings && response.settings.id) {
          const values = response.settings;
          this.id = values.id;
          this.action = 'edit';
          this.settingsForm.controls['customerCanOrderWithinDays'].setValue(values.customerCanOrderWithinDays);
          this.settingsForm.controls['customerOrderDate'].setValue(values.customerOrderDate);
          this.settingsForm.controls['deliveryVerification'].setValue(values.deliveryVerification);
          this.settingsForm.controls['driverCanCancelOrder'].setValue(values.driverCanCancelOrder);
          this.settingsForm.controls['homeDelivery'].setValue(values.homeDelivery);
          this.settingsForm.controls['instantOrder'].setValue(values.instantOrder);
          this.settingsForm.controls['orderConfirmationModel'].setValue(values.orderConfirmationModel);
          this.settingsForm.controls['repeatOrderOption'].setValue(values.repeatOrderOption);
          this.settingsForm.controls['restaurantCanCancelOrder'].setValue(values.restaurantCanCancelOrder);
          this.settingsForm.controls['scheduleDelivery'].setValue(values.scheduleDelivery);
          this.settingsForm.controls['subscriptionOrder'].setValue(values.subscriptionOrder);
          this.settingsForm.controls['includeChargesForSubscription'].setValue(values.includeChargesForSubscription);
          this.settingsForm.controls['restaurantCanCancelTiffinSubscriptionPackage'].setValue(values.restaurantCanCancelTiffinSubscriptionPackage);
          this.settingsForm.controls['userCanCancelTiffinSubscriptionPackage'].setValue(values.userCanCancelTiffinSubscriptionPackage);
          this.settingsForm.controls['takeaway'].setValue(values.takeaway);
          this.settingsForm.controls['ratingStyle'].setValue(values.ratingStyle);
          if (response && response.settings && response.settings.id && response.settings.timeIntervalForScheduleDelivery && response.settings.timeIntervalForScheduleDelivery instanceof Object) {
            this.settingsForm.controls['timeIntervalForScheduleDelivery'].controls['type'].setValue(response.settings.timeIntervalForScheduleDelivery.type);
            this.settingsForm.controls['timeIntervalForScheduleDelivery'].controls['value'].setValue(response.settings.timeIntervalForScheduleDelivery.value);
          }
        }
        if (response && response.reasons && response.reasons.results) {
          const mappedList = response.reasons.results.map(
            (item: OrderCancellationReasonListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.reasons = new MatTableDataSource<OrderCancellationReasonListInterface>(mappedList);
          console.log(this.reasons);
          this.paginatorReasons.length = response.reasons.totalResults;
          this.paginatorReasons.hidePageSize = response.reasons.totalResults <= 0 ? true : false;
        }

        if (response && response.ratings && response.ratings.results) {
          const mappedList = response.ratings.results.map(
            (item: OrderRatingMessageListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.ratings = new MatTableDataSource<OrderRatingMessageListInterface>(mappedList);
          console.log(this.ratings);
          this.paginatorRatings.length = response.ratings.totalResults;
          this.paginatorRatings.hidePageSize = response.ratings.totalResults <= 0 ? true : false;
        }

        if (response && response.invoices && response.invoices.results) {
          const mappedList = response.invoices.results.map(
            (item: AdminInvoiceInstructionInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.invoices = new MatTableDataSource<AdminInvoiceInstructionInterface>(mappedList);
          console.log(this.invoices);
          this.invoicePaginator.length = response.invoices.totalResults;
          this.invoicePaginator.hidePageSize = response.invoices.totalResults <= 0 ? true : false;
        }

      }, error: (error: any) => {
        console.log(error);
        this.isCancellationLoaded = true;
        this.isRatingOrderLoaded = true;
        this.isInvoiceLoaded = true;
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onSubmit() {
    console.log('on submit');
    console.log(this.settingsForm);
    console.log(this.settingsForm.getRawValue());
    if (this.settingsForm.valid) {
      if (this.action == 'add') {
        this.onSave();
      } else {
        this.onUpdate();
      }
    }
  }

  onSave() {
    console.log('on save');
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/admin/order_settings/save', this.settingsForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_order_setting_saved');
        if (response && response.id) {
          this.action = 'edit';
          this.id = response.id;
        }
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onUpdate() {
    console.log('on update');
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/admin/order_settings/update/' + this.id, this.settingsForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_order_setting_updated');
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  get f() {
    return this.settingsForm.controls;
  }

  onReset() {
    console.log('on reset');
    this.settingsForm.patchValue({
      deliveryVerification: false,
      homeDelivery: false,
      takeaway: false,
      repeatOrderOption: false,
      subscriptionOrder: false,
      includeChargesForSubscription: false,
      restaurantCanCancelTiffinSubscriptionPackage: false,
      userCanCancelTiffinSubscriptionPackage: false,
      scheduleDelivery: false,
      restaurantCanCancelOrder: false,
      driverCanCancelOrder: false,
      orderConfirmationModel: 'restaurant',
      timeIntervalForScheduleDelivery: {
        value: 0,
        type: 'min',
      },
      ratingStyle: 'emoji',
      instantOrder: false,
      customerOrderDate: false,
      customerCanOrderWithinDays: 0,
    });
    this.haveSubmitClicked = false;
  }

  onAddReason() {
    const dialogRef = this.dialog.open(DialogReasons, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getCancellationList();
      }
    });
  }

  onAddRatingMessage() {
    const dialogRef = this.dialog.open(DialogOrderRatingsMessages, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getRatingMessagesList();
      }
    });
  }

  getRatingMessagesList() {
    console.log('Get Rating List --');
    this.isRatingOrderLoaded = false;
    const param: any = {
      'limit': this.pageSizeRating,
      'page': this.currentPageRating,
      'search': this.searchQueryOrderRating,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/order_rating_message/getAll?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isRatingOrderLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: OrderRatingMessageListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.ratings = new MatTableDataSource<OrderRatingMessageListInterface>(mappedList);
          this.paginatorRatings.length = response.totalResults;
          this.paginatorRatings.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isRatingOrderLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  getCancellationList() {
    this.isCancellationLoaded = false;
    const param: any = {
      'limit': this.pageSizeReason,
      'page': this.currentPageReason,
      'search': this.searchQueryCancellation,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/order_cancel_reason/getAll?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isCancellationLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: OrderCancellationReasonListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.reasons = new MatTableDataSource<OrderCancellationReasonListInterface>(mappedList);
          this.paginatorReasons.length = response.totalResults;
          this.paginatorReasons.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isCancellationLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  getInvoiceInstructionList() {
    this.isInvoiceLoaded = false;
    const param: any = {
      'limit': this.pageSizeInvoice,
      'page': this.currentPageInvoice,
      'search': this.searchQueryInvoice,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/invoice/instruction/getAll?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isInvoiceLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminInvoiceInstructionInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.invoices = new MatTableDataSource<AdminInvoiceInstructionInterface>(mappedList);
          this.invoicePaginator.length = response.totalResults;
          this.invoicePaginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isInvoiceLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onRatingPageChange(event: PageEvent) {
    console.log('Rating Page---');
    console.log(event);
    this.currentPageRating = event.pageIndex + 1;
    this.pageSizeRating = event.pageSize;
    this.getRatingMessagesList();
  }

  onCancellationPageChange(event: PageEvent) {
    console.log(event);
    this.currentPageReason = event.pageIndex + 1;
    this.pageSizeReason = event.pageSize;
    this.getCancellationList();
  }

  onInvoicePageChange(event: PageEvent) {
    console.log(event);
    this.currentPageInvoice = event.pageIndex + 1;
    this.pageSizeInvoice = event.pageSize;
    this.getInvoiceInstructionList();
  }

  onCancellationStatusChange(event: MatSlideToggleChange, reason: OrderCancellationReasonListInterface) {
    console.log(event);
    console.log(reason);
    reason.status = event.checked;
    this.api.patch_private('v1/admin/order_cancel_reason/update/' + reason.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onRatingStatusChange(event: MatSlideToggleChange, message: OrderRatingMessageListInterface) {
    console.log(event);
    console.log(message);
    message.status = event.checked;
    this.api.patch_private('v1/admin/order_rating_message/update/' + message.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onEditCancalletion(reason: OrderCancellationReasonListInterface) {
    console.log(reason);
    const dialogRef = this.dialog.open(DialogReasons, {
      data: { action: 'edit', values: reason },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getCancellationList();
      }
    });
  }

  onEditRating(message: OrderRatingMessageListInterface) {
    console.log(message);
    const dialogRef = this.dialog.open(DialogOrderRatingsMessages, {
      data: { action: 'edit', values: message },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getRatingMessagesList();
      }
    });
  }

  onDeleteCancellation(reason: OrderCancellationReasonListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_reason_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/order_cancel_reason/delete/' + reason.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getCancellationList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'admin');
          }
        });
      }
    });
  }

  onDeleteRating(message: OrderRatingMessageListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_message_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/order_rating_message/delete/' + message.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getRatingMessagesList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'admin');
          }
        });
      }
    });
  }

  onAddInvoiceInstruction() {
    const dialogRef = this.dialog.open(DialogInvoiceInstruction, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getInvoiceInstructionList();
      }
    });
  }

  onInvoiceStatusChange(event: MatSlideToggleChange, invoice: AdminInvoiceInstructionInterface) {
    console.log(event);
    console.log(invoice);
    invoice.status = event.checked;
    this.api.patch_private('v1/admin/invoice/instruction/update/' + invoice.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onEditInvoice(invoice: AdminInvoiceInstructionInterface) {
    console.log(invoice);
    const dialogRef = this.dialog.open(DialogInvoiceInstruction, {
      data: { action: 'edit', values: invoice },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getInvoiceInstructionList();
      }
    });
  }

  onDeleteInstruction(invoice: AdminInvoiceInstructionInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_instruction_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/invoice/instruction/delete/' + invoice.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getInvoiceInstructionList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'admin');
          }
        });
      }
    });
  }

  onExportCollection(exportOption: string, kind: string) {
    console.log(exportOption, kind);
    if (exportOption != 'export') {
      if (kind == 'order_cancellation_reason') {
        const spinnerRef = this.util.start();
        const param: any = {
          'type': exportOption,
          'search': this.searchQueryCancellation,
        };
        let httpParams = new HttpParams();
        Object.keys(param).forEach((key: any) => {
          httpParams = httpParams.set(key, param[key]);
        });
        this.api.export_collection('v1/admin/order_cancel_reason/export?' + httpParams.toString()).subscribe({
          next: (blob: Blob) => {
            this.util.stop(spinnerRef);
            if (exportOption != 'raw') {
              const fileName = exportOption == 'excel' ? 'OrderCancellationReason.xlsx' : 'OrderCancellationReason.csv';
              this.api.download_export_file(blob, fileName);
            } else {
              const fileName = 'ordercancellationreasons.json';
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
      } else if (kind == 'order_rating_message') {
        console.log('Order Rating');
        const spinnerRef = this.util.start();
        const param: any = {
          'type': exportOption,
          'search': this.searchQueryOrderRating,
        };
        let httpParams = new HttpParams();
        Object.keys(param).forEach((key: any) => {
          httpParams = httpParams.set(key, param[key]);
        });
        this.api.export_collection('v1/admin/order_rating_message/export?' + httpParams.toString()).subscribe({
          next: (blob: Blob) => {
            this.util.stop(spinnerRef);
            if (exportOption != 'raw') {
              const fileName = exportOption == 'excel' ? 'OrderRatingMessages.xlsx' : 'OrderRatingMessages.csv';
              this.api.download_export_file(blob, fileName);
            } else {
              const fileName = 'orderratingmessages.json';
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
      } else if (kind == 'invoice_instructions') {
        console.log('Invoie Instructions');
        const spinnerRef = this.util.start();
        const param: any = {
          'type': exportOption,
          'search': this.searchQueryInvoice,
        };
        let httpParams = new HttpParams();
        Object.keys(param).forEach((key: any) => {
          httpParams = httpParams.set(key, param[key]);
        });
        this.api.export_collection('v1/admin/invoice_instruction/export?' + httpParams.toString()).subscribe({
          next: (blob: Blob) => {
            this.util.stop(spinnerRef);
            if (exportOption != 'raw') {
              const fileName = exportOption == 'excel' ? 'InvoiceInstructions.xlsx' : 'InvoiceInstructions.csv';
              this.api.download_export_file(blob, fileName);
            } else {
              const fileName = 'invoiceinstructions.json';
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
  }

  importCollection(kind: string) {
    console.log(kind);
    this.router.navigate(['admin/import-export-management/import-collection/', kind]);
  }

  onSearchCancellation() {
    console.log(`on search ${this.searchQueryCancellation}`);
    this.pageSizeReason = 5;
    this.currentPageReason = 0;
    this.paginatorReasons.firstPage();
    this.getCancellationList();
  }

  onSearchOrderRating() {
    console.log(`on search ${this.searchQueryOrderRating}`);
    this.pageSizeRating = 5;
    this.currentPageRating = 0;
    this.paginatorRatings.firstPage();
    this.getRatingMessagesList();
  }

  onSearchInvoice() {
    console.log(`on search ${this.searchQueryInvoice}`);
    this.pageSizeInvoice = 5;
    this.currentPageInvoice = 0;
    this.invoicePaginator.firstPage();
    this.getInvoiceInstructionList();
  }
}
