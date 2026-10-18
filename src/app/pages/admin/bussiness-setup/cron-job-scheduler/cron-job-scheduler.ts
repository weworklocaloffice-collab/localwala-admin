import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DateTime } from 'luxon';
import { AdminCronSchedulerListInterface } from 'src/app/interfaces/admin.cron.scheduler.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cron-job-scheduler',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cron-job-scheduler.html',
})
export class CronJobScheduler {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  cronJob = new MatTableDataSource<AdminCronSchedulerListInterface>([]);
  displayedColumn = ['start', 'end', 'status'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  isRunning: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService
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
    this.api.get_private('v1/admin/cronScheduler/getInfo?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.isRunning != null && response.isRunning == true) {
          this.isRunning = true;
          console.log(`Is Running --> ${this.isRunning}`);
        } else {
          this.isRunning = false;
        }
        if (response && response.results) {
          this.cronJob = response.results;
          console.log(this.cronJob);
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

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  getFormatedDate(date: string) {
    return DateTime.fromJSDate(new Date(date)).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy hh:mm a');
  }

  startScheduler() {
    console.log('Start Scheduler');
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/cronScheduler/start').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success) {
          this.getList();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  stopScheduler() {
    console.log('Stop Scheduler');
    console.log('Start Scheduler');
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/cronScheduler/stop').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success) {
          this.getList();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

}
