import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogDeliveryInstruction } from './dialog-delivery-instruction/dialog-delivery-instruction';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DeliveryInstructionListInterface } from 'src/app/interfaces/delivery.instruction.list.interface';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { DialogGratitude } from './dialog-gratitude/dialog-gratitude';
import { DeliveryGratitudeListInterface } from 'src/app/interfaces/delivery.gratitude.list.interface';
import { DriverIncentiveListInterface } from 'src/app/interfaces/driver.incentive.list.interface';
import { DialogDriverIncentive } from './dialog-driver-incentive/dialog-driver-incentive';
import { DialogOfflineMessages } from './dialog-offline-messages/dialog-offline-messages';
import { DriverOfflineMessagesListInterface } from 'src/app/interfaces/driver.offline.messages.list.interface';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-driver-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './driver-settings.html',
})
export class DriverSettings {
  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  @ViewChild('paginatorGratitude', { read: MatPaginator, static: false }) paginatorGratitude: MatPaginator;
  @ViewChild('paginatorIncentive', { read: MatPaginator, static: false }) paginatorIncentive: MatPaginator;
  @ViewChild('paginatorOfflineMessage', { read: MatPaginator, static: false }) paginatorOfflineMessage: MatPaginator;
  instructions = new MatTableDataSource<DeliveryInstructionListInterface>([]);
  gratitudes = new MatTableDataSource<DeliveryGratitudeListInterface>([]);
  incentive = new MatTableDataSource<DriverIncentiveListInterface>([]);
  offlineMessages = new MatTableDataSource<DriverOfflineMessagesListInterface>([]);
  displayedColumn = ['name', 'status', 'action'];
  displayedColumnGratitude = ['price', 'mostTripped', 'status', 'action'];
  displayedColumnIncentive = ['orders', 'price', 'status', 'action'];
  displayedOfflineMessageColumn = ['name', 'status', 'action'];
  action: string = 'add';
  id: string = '';
  settingForm = new FormGroup({
    driverLoginWith: new FormControl('email_password'),
    driverResetPasswordWith: new FormControl('email_otp'),
    selfRegistration: new FormControl(false),
    cashInHand: new FormControl(false),
    minCashInHand: new FormControl({ value: 0, disabled: true }),
    maxCashInHand: new FormControl({ value: 0, disabled: true }),
    getTip: new FormControl(false),
    showEarning: new FormControl(false),
    maxOrderLimit: new FormControl(-1),
    pickupProof: new FormControl(false),
    deliveryProof: new FormControl(false),
    canInitiateChat: new FormControl(false),
    canInitiateCall: new FormControl(false),
    earningModel: new FormControl('salaried'),
    salaryAmount: new FormControl(0, [Validators.required]),
    earningOnOrder: new FormControl({ value: 'fixed', disabled: true }),
    distanceRadiusForFixed: new FormControl({ value: 0, disabled: true }),
    earningFixedDistanceAmount: new FormControl({ value: 0, disabled: true }),
    earningAmount: new FormControl({ value: 0, disabled: true }),
    earningSurplusDistanceAmount: new FormControl({ value: 0, disabled: true }),
    haveIncentive: new FormControl(true),
  });
  haveSubmitClicked: boolean = false;
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  pageSizeGratitude: number = 5;
  currentPageGratitude: number = 0;
  isGratitudeLoaded: boolean = false;
  pageSizeIncentive: number = 5;
  currentPageIncetive: number = 0;
  isIncentiveLoaded: boolean = false;
  pageSizeOfflineMessage: number = 5;
  currentPageOfflineMessage: number = 0;
  isOfflineMessageLoaded: boolean = false;
  exportType: string = 'export';
  searchQueryInstruction: string = '';
  searchQueryGratitude: string = '';
  searchQueryIncentive: string = '';
  searchQueryOffline: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.getData();
  }

  getData() {
    this.isLoaded = false;
    this.isGratitudeLoaded = false;
    const spinnerRef = this.util.start('ts_fetching');
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/driver_settings/get?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        this.isGratitudeLoaded = true;
        this.isIncentiveLoaded = true;
        this.isOfflineMessageLoaded = true;
        this.util.stop(spinnerRef);
        if (response && response.settings && response.settings.id) {
          this.id = response.settings.id;
          this.action = 'edit';
          this.settingForm.controls['canInitiateCall'].setValue(response.settings.canInitiateCall);
          this.settingForm.controls['canInitiateChat'].setValue(response.settings.canInitiateChat);
          this.settingForm.controls['cashInHand'].setValue(response.settings.cashInHand);
          this.settingForm.controls['pickupProof'].setValue(response.settings.pickupProof);
          this.settingForm.controls['deliveryProof'].setValue(response.settings.deliveryProof);
          this.settingForm.controls['driverLoginWith'].setValue(response.settings.driverLoginWith);
          this.settingForm.controls['driverResetPasswordWith'].setValue(response.settings.driverResetPasswordWith);
          this.settingForm.controls['getTip'].setValue(response.settings.getTip);
          this.settingForm.controls['maxCashInHand'].setValue(response.settings.maxCashInHand);
          this.settingForm.controls['maxOrderLimit'].setValue(response.settings.maxOrderLimit);
          this.settingForm.controls['minCashInHand'].setValue(response.settings.minCashInHand);
          this.settingForm.controls['selfRegistration'].setValue(response.settings.selfRegistration);
          this.settingForm.controls['showEarning'].setValue(response.settings.showEarning);

          if (response && response.settings && response.settings.cashInHand == true) {
            this.settingForm.controls['minCashInHand'].enable();
            this.settingForm.controls['minCashInHand'].setValidators([Validators.required]);
            this.settingForm.controls['maxCashInHand'].enable();
            this.settingForm.controls['maxCashInHand'].setValidators([Validators.required]);
          } else {
            this.settingForm.controls['minCashInHand'].disable();
            this.settingForm.controls['minCashInHand'].clearValidators();
            this.settingForm.controls['maxCashInHand'].disable();
            this.settingForm.controls['maxCashInHand'].clearValidators();
          }


          this.settingForm.controls['earningModel'].setValue(response.settings.earningModel);
          this.settingForm.controls['salaryAmount'].setValue(response.settings.salaryAmount);
          this.settingForm.controls['distanceRadiusForFixed'].setValue(response.settings.distanceRadiusForFixed);
          this.settingForm.controls['earningOnOrder'].setValue(response.settings.earningOnOrder);
          this.settingForm.controls['earningFixedDistanceAmount'].setValue(response.settings.earningFixedDistanceAmount);
          this.settingForm.controls['earningAmount'].setValue(response.settings.earningAmount);
          this.settingForm.controls['earningSurplusDistanceAmount'].setValue(response.settings.earningSurplusDistanceAmount);
          this.settingForm.controls['haveIncentive'].setValue(response.settings.haveIncentive);


          if (response && response.settings && response.settings.earningModel == 'salaried') {
            this.settingForm.controls['salaryAmount'].enable();
            this.settingForm.controls['salaryAmount'].setValidators([Validators.required]);

            this.settingForm.controls['earningOnOrder'].disable();
            this.settingForm.controls['earningOnOrder'].clearValidators();

            this.settingForm.controls['earningFixedDistanceAmount'].disable();
            this.settingForm.controls['earningFixedDistanceAmount'].clearValidators();

            this.settingForm.controls['earningAmount'].disable();
            this.settingForm.controls['earningAmount'].clearValidators();

            this.settingForm.controls['earningSurplusDistanceAmount'].disable();
            this.settingForm.controls['earningSurplusDistanceAmount'].clearValidators();

            this.settingForm.controls['distanceRadiusForFixed'].disable();
            this.settingForm.controls['distanceRadiusForFixed'].clearValidators();
          } else {
            this.settingForm.controls['salaryAmount'].disable();
            this.settingForm.controls['salaryAmount'].clearValidators();


            this.settingForm.controls['earningOnOrder'].enable();
            this.settingForm.controls['earningOnOrder'].setValidators([Validators.required]);

            if (response.settings.earningOnOrder == 'fixed') {
              this.settingForm.controls['earningAmount'].enable();
              this.settingForm.controls['earningAmount'].setValidators([Validators.required]);
            } else {
              this.settingForm.controls['earningAmount'].disable();
              this.settingForm.controls['earningAmount'].clearValidators();

              this.settingForm.controls['distanceRadiusForFixed'].enable();
              this.settingForm.controls['distanceRadiusForFixed'].setValidators([Validators.required]);

              this.settingForm.controls['earningFixedDistanceAmount'].enable();
              this.settingForm.controls['earningFixedDistanceAmount'].setValidators([Validators.required]);
              this.settingForm.controls['earningSurplusDistanceAmount'].enable();
              this.settingForm.controls['earningSurplusDistanceAmount'].setValidators([Validators.required]);
            }
          }

        }

        if (response && response.instruction && response.instruction.results) {
          const mappedList = response.instruction.results.map(
            (item: DeliveryInstructionListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.instructions = new MatTableDataSource<DeliveryInstructionListInterface>(mappedList);
          console.log(this.instructions);
          this.paginator.length = response.instruction.totalResults;
          this.paginator.hidePageSize = response.instruction.totalResults <= 0 ? true : false;
        }

        if (response && response.gratitude && response.gratitude.results) {
          this.gratitudes = response.gratitude.results;
          console.log(this.gratitudes);
          this.paginatorGratitude.length = response.gratitude.totalResults;
          this.paginatorGratitude.hidePageSize = response.gratitude.totalResults <= 0 ? true : false;
        }

        if (response && response.incentives && response.incentives.results) {
          this.incentive = response.incentives.results;
          console.log(this.incentive);
          this.paginatorIncentive.length = response.incentives.totalResults;
          this.paginatorIncentive.hidePageSize = response.incentives.totalResults <= 0 ? true : false;
        }

        if (response && response.offlines && response.offlines.results) {
          const mappedList = response.offlines.results.map(
            (item: DriverOfflineMessagesListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.offlineMessages = new MatTableDataSource<DriverOfflineMessagesListInterface>(mappedList);
          console.log(this.offlineMessages);
          this.paginatorOfflineMessage.length = response.offlines.totalResults;
          this.paginatorOfflineMessage.hidePageSize = response.offlines.totalResults <= 0 ? true : false;
        }

      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.isGratitudeLoaded = true;
        this.isIncentiveLoaded = true;
        this.isOfflineMessageLoaded = true;
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onSubmit() {
    console.log('on submit');
    console.log(this.settingForm);
    console.log(this.settingForm.getRawValue());
    this.haveSubmitClicked = true;
    if (this.settingForm.valid) {
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
    this.api.post_private('v1/admin/driver_settings/save', this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_deliveryman_setting_saved');
        if (response && response.id) {
          this.id = response.id;
          this.action = 'edit';
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
    this.api.patch_private('v1/admin/driver_settings/update/' + this.id, this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_deliveryman_setting_updated');
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onReset() {
    console.log('reset');
    this.settingForm.patchValue({
      driverLoginWith: 'email_password',
      driverResetPasswordWith: 'email_otp',
      selfRegistration: false,
      cashInHand: false,
      minCashInHand: 0,
      maxCashInHand: 0,
      getTip: false,
      showEarning: false,
      maxOrderLimit: -1,
      pickupProof: false,
      deliveryProof: false,
      canInitiateChat: false,
      canInitiateCall: false,
      earningModel: 'salaried',
      salaryAmount: 0,
      earningOnOrder: 'fixed',
      distanceRadiusForFixed: 0,
      earningFixedDistanceAmount: 0,
      earningAmount: 0,
      earningSurplusDistanceAmount: 0,
      haveIncentive: true,
    });
    this.settingForm.get('minCashInHand')?.disable();
    this.settingForm.get('maxCashInHand')?.disable();
    this.settingForm.get('earningOnOrder')?.disable();
    this.settingForm.get('distanceRadiusForFixed')?.disable();
    this.settingForm.get('earningFixedDistanceAmount')?.disable();
    this.settingForm.get('earningAmount')?.disable();
    this.settingForm.get('earningSurplusDistanceAmount')?.disable();
    this.haveSubmitClicked = false;
  }

  get f() {
    return this.settingForm.controls;
  }

  onCashInHandChangeEvent(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == true) {
      this.settingForm.controls['minCashInHand'].enable();
      this.settingForm.controls['minCashInHand'].setValidators([Validators.required]);
      this.settingForm.controls['maxCashInHand'].enable();
      this.settingForm.controls['maxCashInHand'].setValidators([Validators.required]);
    } else {
      this.settingForm.controls['minCashInHand'].disable();
      this.settingForm.controls['minCashInHand'].clearValidators();
      this.settingForm.controls['maxCashInHand'].disable();
      this.settingForm.controls['maxCashInHand'].clearValidators();
    }
  }

  onEarningModelChangeEvent(event: MatSelectChange) {
    console.log(event);
    if (event && event.value && event.value == 'order') {
      this.settingForm.controls['salaryAmount'].disable();
      this.settingForm.controls['salaryAmount'].clearValidators();

      this.settingForm.controls['earningOnOrder'].enable();
      this.settingForm.controls['earningOnOrder'].setValidators([Validators.required]);

      if (this.settingForm.controls['earningOnOrder'].value == 'fixed') {
        this.settingForm.controls['earningAmount'].enable();
        this.settingForm.controls['earningAmount'].setValidators([Validators.required]);
      } else {
        this.settingForm.controls['earningAmount'].disable();
        this.settingForm.controls['earningAmount'].clearValidators();

        this.settingForm.controls['distanceRadiusForFixed'].enable();
        this.settingForm.controls['distanceRadiusForFixed'].setValidators([Validators.required]);

        this.settingForm.controls['earningFixedDistanceAmount'].enable();
        this.settingForm.controls['earningFixedDistanceAmount'].setValidators([Validators.required]);

        this.settingForm.controls['earningSurplusDistanceAmount'].enable();
        this.settingForm.controls['earningSurplusDistanceAmount'].setValidators([Validators.required]);
      }
    } else {
      this.settingForm.controls['salaryAmount'].enable();
      this.settingForm.controls['salaryAmount'].setValidators([Validators.required]);

      this.settingForm.controls['distanceRadiusForFixed'].disable();
      this.settingForm.controls['distanceRadiusForFixed'].clearValidators();

      this.settingForm.controls['earningOnOrder'].disable();
      this.settingForm.controls['earningOnOrder'].clearValidators();

      this.settingForm.controls['earningFixedDistanceAmount'].disable();
      this.settingForm.controls['earningFixedDistanceAmount'].clearValidators();

      this.settingForm.controls['earningAmount'].disable();
      this.settingForm.controls['earningAmount'].clearValidators();

      this.settingForm.controls['earningSurplusDistanceAmount'].disable();
      this.settingForm.controls['earningSurplusDistanceAmount'].clearValidators();
    }
  }

  onEarningOnOrderChangeEvent(event: MatSelectChange) {
    console.log(event);
    if (event && event.value && event.value == 'fixed') {
      this.settingForm.controls['earningAmount'].enable();
      this.settingForm.controls['earningAmount'].setValidators([Validators.required]);

      this.settingForm.controls['earningFixedDistanceAmount'].disable();
      this.settingForm.controls['earningFixedDistanceAmount'].clearValidators();

      this.settingForm.controls['earningSurplusDistanceAmount'].disable();
      this.settingForm.controls['earningSurplusDistanceAmount'].clearValidators();

      this.settingForm.controls['distanceRadiusForFixed'].disable();
      this.settingForm.controls['distanceRadiusForFixed'].clearValidators();

    } else {
      this.settingForm.controls['earningAmount'].disable();
      this.settingForm.controls['earningAmount'].clearValidators();

      this.settingForm.controls['distanceRadiusForFixed'].enable();
      this.settingForm.controls['distanceRadiusForFixed'].setValidators([Validators.required]);

      this.settingForm.controls['earningFixedDistanceAmount'].enable();
      this.settingForm.controls['earningFixedDistanceAmount'].setValidators([Validators.required]);

      this.settingForm.controls['earningSurplusDistanceAmount'].enable();
      this.settingForm.controls['earningSurplusDistanceAmount'].setValidators([Validators.required]);
    }
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'search': this.searchQueryInstruction,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/delivery_instruction/get?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: DeliveryInstructionListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.instructions = new MatTableDataSource<DeliveryInstructionListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  getGratitudeList() {
    this.isGratitudeLoaded = false;
    const param: any = {
      'limit': this.pageSizeGratitude,
      'page': this.currentPageGratitude,
      'search': this.searchQueryGratitude,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/gratitude/get?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isGratitudeLoaded = true;
        console.log(response);
        if (response && response.results) {
          this.gratitudes = response.results;
          this.paginatorGratitude.length = response.totalResults;
          this.paginatorGratitude.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isGratitudeLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  getIncentiveList() {
    this.isIncentiveLoaded = false;
    const param: any = {
      'limit': this.pageSizeIncentive,
      'page': this.currentPageIncetive,
      'search': this.searchQueryIncentive,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/driver_incentive/get?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isIncentiveLoaded = true;
        console.log(response);
        if (response && response.results) {
          this.incentive = response.results;
          this.paginatorIncentive.length = response.totalResults;
          this.paginatorIncentive.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isIncentiveLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onAddInstruction() {
    const dialogRef = this.dialog.open(DialogDeliveryInstruction, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getList();
      }
    });
  }

  onAddGratitude() {
    const dialogRef = this.dialog.open(DialogGratitude, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getGratitudeList();
      }
    });
  }

  getOfflineMessage() {
    this.isOfflineMessageLoaded = false;
    const param: any = {
      'limit': this.pageSizeOfflineMessage,
      'page': this.currentPageOfflineMessage,
      'search': this.searchQueryOffline,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/driver_offline_messages/get?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isOfflineMessageLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: DriverOfflineMessagesListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.offlineMessages = new MatTableDataSource<DriverOfflineMessagesListInterface>(mappedList);
          this.paginatorOfflineMessage.length = response.totalResults;
          this.paginatorOfflineMessage.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isOfflineMessageLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onAddIncentive() {
    const dialogRef = this.dialog.open(DialogDriverIncentive, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getIncentiveList();
      }
    });
  }

  onAddOfflineMessage() {
    const dialogRef = this.dialog.open(DialogOfflineMessages, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getOfflineMessage();
      }
    });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onGratitudePageChange(event: PageEvent) {
    console.log(event);
    this.currentPageGratitude = event.pageIndex + 1;
    this.pageSizeGratitude = event.pageSize;
    this.getGratitudeList();
  }

  onIncentivePageChange(event: PageEvent) {
    console.log(event);
    this.currentPageIncetive = event.pageIndex + 1;
    this.pageSizeIncentive = event.pageSize;
    this.getIncentiveList();
  }

  onOfflineMessagePageChange(event: PageEvent) {
    console.log(event);
    this.currentPageOfflineMessage = event.pageIndex + 1;
    this.pageSizeOfflineMessage = event.pageSize;
    this.getOfflineMessage();
  }

  onStatusChange(event: MatSlideToggleChange, instruction: DeliveryInstructionListInterface) {
    console.log(event);
    console.log(instruction);
    instruction.status = event.checked;
    this.api.patch_private('v1/admin/delivery_instruction/update/' + instruction.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onGratitudeStatusChange(event: MatSlideToggleChange, gratitude: DeliveryGratitudeListInterface) {
    console.log(event);
    console.log(gratitude);
    gratitude.status = event.checked;
    this.api.patch_private('v1/admin/gratitude/update/' + gratitude.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onIncentiveStatusChange(event: MatSlideToggleChange, incentive: DriverIncentiveListInterface) {
    console.log(event);
    console.log(incentive);
    incentive.status = event.checked;
    this.api.patch_private('v1/admin/driver_incentive/updateStatus/' + incentive.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onOfflineMessageStatusChange(event: MatSlideToggleChange, message: DriverOfflineMessagesListInterface) {
    console.log(event);
    console.log(message);
    message.status = event.checked;
    this.api.patch_private('v1/admin/driver_offline_messages/update/' + message.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onGratitudeTippedChange(event: MatSlideToggleChange, gratitude: DeliveryGratitudeListInterface) {
    console.log(event);
    console.log(gratitude);
    gratitude.mostTipped = event.checked;
    this.api.patch_private('v1/admin/gratitude/update/' + gratitude.id, { mostTipped: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_most_tipped_updated');
        this.getGratitudeList();
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onEdit(instruction: DeliveryInstructionListInterface) {
    console.log(instruction);
    const dialogRef = this.dialog.open(DialogDeliveryInstruction, {
      data: { action: 'edit', values: instruction },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getList();
      }
    });
  }

  onGratitudeEdit(gratitude: DeliveryGratitudeListInterface) {
    console.log(gratitude);
    const dialogRef = this.dialog.open(DialogGratitude, {
      data: { action: 'edit', values: gratitude },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getGratitudeList();
      }
    });
  }

  onIncentiveEdit(incentive: DriverIncentiveListInterface) {
    console.log(incentive);
    const dialogRef = this.dialog.open(DialogDriverIncentive, {
      data: { action: 'edit', values: incentive },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getIncentiveList();
      }
    });
  }

  onOfflineMessageEdit(message: DriverOfflineMessagesListInterface) {
    console.log(message);
    const dialogRef = this.dialog.open(DialogOfflineMessages, {
      data: { action: 'edit', values: message },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getOfflineMessage();
      }
    });
  }

  onDelete(instruction: DeliveryInstructionListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_instruction_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/delivery_instruction/delete/' + instruction.id).subscribe({
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

  onGratitudeDelete(gratitude: DeliveryGratitudeListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_gratitude_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/gratitude/delete/' + gratitude.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getGratitudeList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'admin');
          }
        });
      }
    });
  }

  onIncentiveDelete(incentive: DriverIncentiveListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_incentive_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/driver_incentive/delete/' + incentive.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getIncentiveList();
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'admin');
          }
        });
      }
    });
  }

  onOfflineMessageDelete(message: DriverOfflineMessagesListInterface) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_offline_message_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/driver_offline_messages/delete/' + message.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.getOfflineMessage();
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
      if (kind == 'delivery_instruction') {
        const spinnerRef = this.util.start();
        const param: any = {
          'type': exportOption,
          'search': this.searchQueryInstruction,
        };
        let httpParams = new HttpParams();
        Object.keys(param).forEach((key: any) => {
          httpParams = httpParams.set(key, param[key]);
        });
        this.api.export_collection('v1/admin/delivery_instruction/export?' + httpParams.toString()).subscribe({
          next: (blob: Blob) => {
            this.util.stop(spinnerRef);
            if (exportOption != 'raw') {
              const fileName = exportOption == 'excel' ? 'DeliveryInstructions.xlsx' : 'DeliveryInstructions.csv';
              this.api.download_export_file(blob, fileName);
            } else {
              const fileName = 'deliveryinstructions.json';
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
      } else if (kind == 'delivery_gratitude') {
        const spinnerRef = this.util.start();
        const param: any = {
          'type': exportOption,
          'search': this.searchQueryGratitude,
        };
        let httpParams = new HttpParams();
        Object.keys(param).forEach((key: any) => {
          httpParams = httpParams.set(key, param[key]);
        });
        this.api.export_collection('v1/admin/gratitude/export?' + httpParams.toString()).subscribe({
          next: (blob: Blob) => {
            this.util.stop(spinnerRef);
            if (exportOption != 'raw') {
              const fileName = exportOption == 'excel' ? 'DeliveryGratitude.xlsx' : 'DeliveryGratitude.csv';
              this.api.download_export_file(blob, fileName);
            } else {
              const fileName = 'deliverygratitudes.json';
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
      } else if (kind == 'driver_incentive') {
        const spinnerRef = this.util.start();
        const param: any = {
          'type': exportOption,
          'search': this.searchQueryIncentive,
        };
        let httpParams = new HttpParams();
        Object.keys(param).forEach((key: any) => {
          httpParams = httpParams.set(key, param[key]);
        });
        this.api.export_collection('v1/admin/driver_incentive/export?' + httpParams.toString()).subscribe({
          next: (blob: Blob) => {
            this.util.stop(spinnerRef);
            if (exportOption != 'raw') {
              const fileName = exportOption == 'excel' ? 'DeliverymanIncentive.xlsx' : 'DeliverymanIncentive.csv';
              this.api.download_export_file(blob, fileName);
            } else {
              const fileName = 'driverincentives.json';
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
      } else if (kind == 'driver_offline_messsage') {
        const spinnerRef = this.util.start();
        const param: any = {
          'type': exportOption,
          'search': this.searchQueryOffline,
        };
        let httpParams = new HttpParams();
        Object.keys(param).forEach((key: any) => {
          httpParams = httpParams.set(key, param[key]);
        });
        this.api.export_collection('v1/admin/driver_offline_messages/export?' + httpParams.toString()).subscribe({
          next: (blob: Blob) => {
            this.util.stop(spinnerRef);
            if (exportOption != 'raw') {
              const fileName = exportOption == 'excel' ? 'DeliverymanOfflineMessages.xlsx' : 'DeliverymanOfflineMessages.csv';
              this.api.download_export_file(blob, fileName);
            } else {
              const fileName = 'driverofflinemessages.json';
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

  onSearchInstruction() {
    console.log(`on search ${this.searchQueryInstruction}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

  onSearchGratitude() {
    console.log(`on search ${this.searchQueryGratitude}`);
    this.pageSizeGratitude = 5;
    this.currentPageGratitude = 0;
    this.paginatorGratitude.firstPage();
    this.getGratitudeList();
  }

  onSearchIncentive() {
    console.log(`on search ${this.searchQueryIncentive}`);
    this.pageSizeIncentive = 5;
    this.currentPageIncetive = 0;
    this.paginatorIncentive.firstPage();
    this.getIncentiveList();
  }

  onSearchOffline() {
    console.log(`on search ${this.searchQueryOffline}`);
    this.pageSizeOfflineMessage = 5;
    this.currentPageOfflineMessage = 0;
    this.paginatorOfflineMessage.firstPage();
    this.getOfflineMessage();
  }
}
