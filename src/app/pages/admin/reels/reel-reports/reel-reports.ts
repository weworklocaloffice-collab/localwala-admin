import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { AdminReelReport, ReportDecision } from 'src/app/interfaces/admin.reels.interface';

const REPORT_STATUSES = ['OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED'];
const DECISIONS: ReportDecision[] = ['REVIEWING', 'DISMISS', 'HIDE_REEL', 'REMOVE_REEL'];

@Component({
  selector: 'app-reel-reports',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './reel-reports.html',
})
export class ReelReports {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  reports = new MatTableDataSource<AdminReelReport>([]);
  displayedColumn = ['reel', 'reporter', 'reason', 'status', 'created', 'action'];
  pageSize: number = 10;
  currentPage: number = 1;
  isLoaded: boolean = false;
  activeStatus: string = '';
  focusReel: string = '';

  readonly statuses = REPORT_STATUSES;
  readonly decisions = DECISIONS;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
  ) {
    this.focusReel = this.route.snapshot.queryParamMap.get('reel') || '';
    this.getList();
  }

  reporterLabel(report: AdminReelReport): string {
    const user: any = report.reporterId;
    if (user && typeof user === 'object') {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || String(user._id || user.id || '');
    }
    return String(user || '');
  }

  reelLabel(report: AdminReelReport): string {
    const reel: any = report.reelId;
    if (reel && typeof reel === 'object') {
      return String(reel.description || reel._id || reel.id || '').slice(0, 60);
    }
    return String(reel || '');
  }

  getList() {
    this.isLoaded = false;
    const param: any = { limit: this.pageSize, page: this.currentPage };
    if (this.activeStatus) param['status'] = this.activeStatus;
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/reels/reports?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        if (response && response.results) {
          let rows: AdminReelReport[] = response.results;
          if (this.focusReel) {
            rows = rows.filter((row) => String((row.reelId as any)?._id || row.reelId) === this.focusReel);
          }
          this.reports = new MatTableDataSource<AdminReelReport>(rows);
          this.paginator.length = response.totalResults || 0;
        }
      }, error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onTabChange(index: number) {
    this.activeStatus = index === 0 ? '' : this.statuses[index - 1];
    this.currentPage = 1;
    this.paginator.firstPage();
    this.getList();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  review(report: AdminReelReport, decision: ReportDecision) {
    const spinnerRef = this.util.start();
    this.api.post_private('v1/admin/reels/reports/' + report.id + '/review', { decision }).subscribe({
      next: () => {
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_status_updated');
        this.getList();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

}
