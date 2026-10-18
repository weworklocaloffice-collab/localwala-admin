import { Component, ViewChild } from '@angular/core';
import { SupportChatCountArrayInterface } from 'src/app/interfaces/support.chat.count.array.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ApexChart, ChartComponent, ApexDataLabels, ApexLegend, ApexStroke, ApexTooltip, ApexAxisChartSeries, ApexXAxis, ApexYAxis, ApexGrid, ApexPlotOptions, ApexFill } from 'ng-apexcharts';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SupportTeamChatListInterface } from 'src/app/interfaces/support.team.chat.list.interface';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgIcon } from '@ng-icons/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

export interface TotalSaleChartOption {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  grid: ApexGrid;
}

@Component({
  selector: 'app-support-team-dashboard',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgApexchartsModule, NgIcon],
  templateUrl: './support-team-dashboard.html',
})
export class SupportTeamDashboard {

  @ViewChild('chatPaginator', { read: MatPaginator, static: false }) chatPaginator: MatPaginator;
  chatList = new MatTableDataSource<SupportTeamChatListInterface>([]);
  displayedColumn = ['id', 'type_id', 'customer', 'type', 'status', 'team', 'time', 'action'];
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public chatChartOption!: Partial<TotalSaleChartOption> | any;
  chatCount: SupportChatCountArrayInterface[] = [];
  chatType: string = 'all';
  isLoaded: boolean = false;
  pageSize: number = 5;
  currentPage: number = 0;
  openChats: number = 0;
  inProgressChats: number = 0;
  resolvedChats: number = 0;
  kpi: any = null;
  kpiAgents: any[] = [];
  kpiDays: number = 30;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router,
  ) {
    this.chatChartOption = {
      series: [0, 0, 0],
      chart: {
        toolbar: {
          show: false,
        },
        foreColor: '#adb0bb',
        fontFamily: "'DM Sans',sans-serif",
        type: 'donut',
        height: 280,
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        theme: 'dark',
        fillSeriesColor: false,
      },
      labels: [this.util.appTranslate('open'), this.util.appTranslate('in_progress'), this.util.appTranslate('resolved')],
      colors: ['#03c9d7', '#fb9778', '#ecf0f2'],
      stroke: {
        colors: ['transparent'],
      },
      plotOptions: {
        pie: {
          donut: {
            size: '78%',
            background: 'transparent',
            labels: {
              show: false,
              name: {
                show: true,
                fontSize: '18px',
                color: undefined,
                offsetY: -10,
              },
              value: {
                show: false,
                color: '#98aab4',
              },
              total: {
                show: false,
                label: this.util.appTranslate('our_visitors'),
                color: '#98aab4',
              },
            },
          },
        },
      },
    };
    const chatCount: SupportChatCountArrayInterface[] = [
      {
        "img": "assets/support/restaurant-complaint.png",
        "color": "primary",
        "title": this.util.appTranslate('restaurant_complaints'),
        "desc": this.util.numberFormat(0),
        "key": "fresh"
      },
      {
        "img": "assets/support/order-support.png",
        "color": "warning",
        "title": this.util.appTranslate('order_supports'),
        "desc": this.util.numberFormat(0),
        "key": "accepted"
      },
      {
        "img": "assets/support/dining-support.png",
        "color": "secondary",
        "title": this.util.appTranslate('dining_supports'),
        "desc": this.util.numberFormat(0),
        "key": "preparing"
      },
      {
        "img": "assets/support/subscription-support.png",
        "color": "error",
        "title": this.util.appTranslate('subscription_supports'),
        "desc": this.util.numberFormat(0),
        "key": "ready"
      },
      {
        "img": "assets/support/complaints-support.png",
        "color": "success",
        "title": this.util.appTranslate('complaints_supports'),
        "desc": this.util.numberFormat(0),
        "key": "handover"
      },
      {
        "img": "assets/support/report-support.png",
        "color": "primary",
        "title": this.util.appTranslate('report_supports'),
        "desc": this.util.numberFormat(0),
        "key": "fresh"
      },
    ];
    this.chatCount = chatCount;
    this.getDashboardDetail();
    this.getKpi();
  }

  getKpi() {
    this.api.get_private(`v1/support_team/stats/overview?days=${this.kpiDays}`).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.kpi = response;
          this.kpiAgents = response.agents || [];
        }
      },
      error: () => {},
    });
  }

  setKpiDays(days: number) {
    this.kpiDays = days;
    this.getKpi();
  }

  fmtDur(sec: number | null): string {
    if (sec === null || sec === undefined) return '-';
    if (sec < 60) return `${sec}s`;
    if (sec < 3600) return `${Math.round(sec / 60)}m`;
    return `${Math.round((sec / 3600) * 10) / 10}h`;
  }

  getDashboardDetail() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'filter': this.chatType,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/support_team/dashboard?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.success) {
          const diningChat = response.diningChat;
          const tiffinSubscriptionChat = response.tiffinSubscriptionChat;
          const complaintChat = response.complaintChat;
          const reportChat = response.reportChat;
          const orderChat = response.orderChat;
          const restaurantComplaint = response.restaurantComplaintChats;

          const openChat = response.openChat;
          const inProgressChat = response.inProgressChat;
          const resolvedChat = response.resolvedChat;

          this.openChats = openChat;
          this.inProgressChats = inProgressChat;
          this.resolvedChats = resolvedChat;

          this.chatChartOption = {
            series: [openChat, inProgressChat, resolvedChat],
            chart: {
              toolbar: {
                show: false,
              },
              foreColor: '#adb0bb',
              fontFamily: "'DM Sans',sans-serif",
              type: 'donut',
              height: 280,
            },
            legend: {
              show: false,
            },
            dataLabels: {
              enabled: false,
            },
            tooltip: {
              theme: 'dark',
              fillSeriesColor: false,
            },
            labels: [this.util.appTranslate('open'), this.util.appTranslate('in_progress'), this.util.appTranslate('resolved')],
            colors: ['#03c9d7', '#fb9778', '#ecf0f2'],
            stroke: {
              colors: ['transparent'],
            },
            plotOptions: {
              pie: {
                donut: {
                  size: '78%',
                  background: 'transparent',
                  labels: {
                    show: false,
                    name: {
                      show: true,
                      fontSize: '18px',
                      color: undefined,
                      offsetY: -10,
                    },
                    value: {
                      show: false,
                      color: '#98aab4',
                    },
                    total: {
                      show: false,
                      label: this.util.appTranslate('our_visitors'),
                      color: '#98aab4',
                    },
                  },
                },
              },
            },
          };
          const chatCount: SupportChatCountArrayInterface[] = [
            {
              "img": "assets/support/restaurant-complaint.png",
              "color": "primary",
              "title": this.util.appTranslate('restaurant_complaints'),
              "desc": this.util.numberFormat(restaurantComplaint),
              "key": "fresh"
            },
            {
              "img": "assets/support/order-support.png",
              "color": "warning",
              "title": this.util.appTranslate('order_supports'),
              "desc": this.util.numberFormat(orderChat),
              "key": "accepted"
            },
            {
              "img": "assets/support/dining-support.png",
              "color": "secondary",
              "title": this.util.appTranslate('dining_supports'),
              "desc": this.util.numberFormat(diningChat),
              "key": "preparing"
            },
            {
              "img": "assets/support/subscription-support.png",
              "color": "error",
              "title": this.util.appTranslate('subscription_supports'),
              "desc": this.util.numberFormat(tiffinSubscriptionChat),
              "key": "ready"
            },
            {
              "img": "assets/support/complaints-support.png",
              "color": "success",
              "title": this.util.appTranslate('complaints_supports'),
              "desc": this.util.numberFormat(complaintChat),
              "key": "handover"
            },
            {
              "img": "assets/support/report-support.png",
              "color": "primary",
              "title": this.util.appTranslate('report_supports'),
              "desc": this.util.numberFormat(reportChat),
              "key": "fresh"
            },
          ];
          this.chatCount = chatCount;

        }
        if (response && response.chats) {
          this.chatList = response.chats;
          this.chatPaginator.length = response.totalResults;
          this.chatPaginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'support-team');
      }
    });
  }

  onFilter(chatType: string) {
    console.log(chatType);
    this.chatType = chatType;
    this.pageSize = 5;
    this.currentPage = 0;
    this.getDashboardDetail();
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getDashboardDetail();
  }

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy hh:mm a');
  }

  onChat(item: SupportTeamChatListInterface) {
    console.log(item);
    this.router.navigate(['support-team/u/message', item.id]);
  }

}
