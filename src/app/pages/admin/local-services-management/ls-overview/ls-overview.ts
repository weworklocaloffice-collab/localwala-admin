import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-ls-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, NgApexchartsModule],
  templateUrl: './ls-overview.html',
})
export class LsOverview {
  periods = [
    { key: '7d', label: 'ls_period_7d' },
    { key: '30d', label: 'ls_period_30d' },
    { key: '90d', label: 'ls_period_90d' },
    { key: 'all', label: 'ls_period_all' },
  ];
  selectedPeriod = '30d';

  isLoaded = false;
  hasError = false;
  data: any = null;
  Math = Math;

  queues: any = { applications: 0, documents: 0, offerings: 0, refunds: 0, total: 0 };

  chartDonut: any = {
    series: [0],
    chart: { type: 'donut', height: 260, toolbar: { show: false } },
    labels: [],
    colors: ['#5d87ff', '#13deb9', '#ffae1f', '#fa896b', '#7c8fac', '#a78bfa', '#f472b6', '#38bdf8', '#facc15', '#fb7185'],
    legend: { position: 'bottom', fontSize: '12px' },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v: any) => v } },
  };

  chartBar: any = {
    series: [{ name: 'GBV', data: [] }],
    chart: { type: 'bar', height: 260, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    xaxis: { categories: [] },
    colors: ['#5d87ff'],
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v: any) => '₹' + v } },
  };

  chartLine: any = {
    series: [{ name: 'Bookings', data: [] }, { name: 'GBV', data: [] }],
    chart: { type: 'line', height: 260, toolbar: { show: false } },
    xaxis: { categories: [] },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#5d87ff', '#13deb9'],
    dataLabels: { enabled: false },
    legend: { position: 'top' },
    yaxis: [{ title: { text: 'Bookings' } }, { opposite: true, title: { text: 'GBV ₹' } }],
  };

  constructor(public api: ApiService, public util: UtilService, private router: Router) {}

  ngOnInit() {
    this.load();
  }

  periodRange(): { from: string; to: string } | null {
    const now = new Date();
    const to = now.toISOString();
    let from: string | null = null;
    if (this.selectedPeriod === '7d') from = new Date(now.getTime() - 7 * 86400000).toISOString();
    else if (this.selectedPeriod === '30d') from = new Date(now.getTime() - 30 * 86400000).toISOString();
    else if (this.selectedPeriod === '90d') from = new Date(now.getTime() - 90 * 86400000).toISOString();
    return from ? { from, to } : null;
  }

  load() {
    this.isLoaded = false;
    this.hasError = false;
    const r = this.periodRange();
    const url = r ? `v1/local-services/admin/dashboard?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}` : 'v1/local-services/admin/dashboard';
    this.api.get_private(url).subscribe({
      next: (res: any) => {
        this.data = res;
        this.queues = res.queues || this.queues;
        this.buildCharts(res);
        this.isLoaded = true;
      },
      error: (err: any) => {
        this.isLoaded = true;
        this.hasError = true;
        this.util.handleError(err, 'admin');
      },
    });
  }

  onPeriodChange() {
    this.load();
  }

  refresh() {
    this.load();
  }

  buildCharts(res: any) {
    const byStatus = (res.current && res.current.bookings && res.current.bookings.byStatus) || {};
    const labels = Object.keys(byStatus);
    this.chartDonut = {
      ...this.chartDonut,
      series: labels.map((k) => byStatus[k]),
      labels,
    };

    const cats = (res.categories || []).slice(0, 6);
    this.chartBar = {
      ...this.chartBar,
      series: [{ name: 'GBV', data: cats.map((c: any) => c.grossBookingValue) }],
      xaxis: { categories: cats.map((c: any) => c.categoryKey) },
    };

    const series = res.series || [];
    this.chartLine = {
      ...this.chartLine,
      series: [
        { name: 'Bookings', data: series.map((s: any) => s.bookings) },
        { name: 'GBV', data: series.map((s: any) => s.grossBookingValue) },
      ],
      xaxis: { categories: series.map((s: any) => s.date.slice(5)) },
    };
  }

  kpi(key: string): any {
    return this.data && this.data.kpis ? this.data.kpis[key] : null;
  }

  fmt(n: any): string {
    if (n == null) return '0';
    return Number(n).toLocaleString();
  }

  money(n: any): string {
    if (n == null) return '0';
    return Number(n).toFixed(2);
  }

  humanize(s: string): string {
    if (!s) return '';
    return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  colorFor(status: string): string {
    const map: any = {
      DRAFT: '#7c8fac',
      REQUESTED: '#5d87ff',
      PENDING_PROVIDER: '#ffae1f',
      ACCEPTED: '#5d87ff',
      PAYMENT_PENDING: '#ffae1f',
      CONFIRMED: '#13deb9',
      IN_PROGRESS: '#5d87ff',
      COMPLETED: '#13deb9',
      CANCELLED: '#fa896b',
      NO_SHOW: '#fa896b',
      DISPUTED: '#ffae1f',
    };
    return map[status] || '#7c8fac';
  }

  queueCards() {
    return [
      { key: 'applications', label: 'ls_queue_applications', count: this.queues.applications, route: '/admin/local-services-management/applications' },
      { key: 'documents', label: 'ls_queue_documents', count: this.queues.documents, route: '/admin/local-services-management/moderation' },
      { key: 'offerings', label: 'ls_queue_offerings', count: this.queues.offerings, route: '/admin/local-services-management/moderation' },
      { key: 'refunds', label: 'ls_queue_refunds', count: this.queues.refunds, route: '/admin/local-services-management/refunds' },
    ];
  }

  go(route: string) {
    this.router.navigate([route]);
  }

  totalPending(): number {
    return this.queues.total || 0;
  }

  topProviders(): any[] {
    return (this.data && this.data.topProviders) || [];
  }

  funnel(): any {
    return (this.data && this.data.funnel) || {};
  }

  refundRate(): number {
    return (this.data && this.data.refundRate) || 0;
  }
}
