import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-team-queues',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './team-queues.html',
})
export class TeamQueues implements OnDestroy {
  queues: any[] = [];
  policies: any[] = [];
  allAgents: any[] = [];
  isLoaded = false;
  forbidden = false;
  addMemberSel: Record<string, string> = {};
  broadcastMsg = '';
  broadcastBusy = false;
  langOptions = ['en', 'hi', 'ar', 'es'];
  roleFilter = 'all';
  dayKeys = [
    { k: 'mon', l: 'Mon' },
    { k: 'tue', l: 'Tue' },
    { k: 'wed', l: 'Wed' },
    { k: 'thu', l: 'Thu' },
    { k: 'fri', l: 'Fri' },
    { k: 'sat', l: 'Sat' },
    { k: 'sun', l: 'Sun' },
  ];
  timezones = ['Asia/Kolkata', 'UTC', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'America/New_York'];
  whOpen: Record<string, boolean> = {};

  // --- Working hours -------------------------------------------------------
  // Minutes-from-midnight, because that is what the API validates and what the
  // SLA clock consumes. Everything user-facing converts at the edges.
  wh(q: any, day: string): [number, number][] {
    const wh = (q && q.workingHours) || {};
    return (wh.days && wh.days[day]) || [];
  }
  whTz(q: any): string {
    return ((q && q.workingHours) && q.workingHours.timezone) || 'Asia/Kolkata';
  }
  whIs24x7(q: any): boolean {
    return Object.keys((q && q.workingHours && q.workingHours.days) || {}).length === 0;
  }
  toMin(v: string): number {
    const [h, m] = String(v || '00:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }
  toHHMM(mins: number): string {
    const m = Math.max(0, Math.min(1440, mins || 0));
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  }
  setWhWindow(q: any, day: string, idx: number, which: 0 | 1, value: string) {
    const id = q._id || q.id;
    if (!this.whOpen[id + ':' + day]) this.whOpen[id + ':' + day] = true;
    const days = { ...(((q.workingHours || {}).days) || {}) };
    const list = [...(days[day] || [])];
    if (!list[idx]) list[idx] = [540, 1080];
    list[idx] = [...list[idx]];
    list[idx][which] = this.toMin(value);
    // Reversed bounds would be rejected by the server; fix it here so the user
    // sees the swap instead of a raw 400.
    if (list[idx][0] >= list[idx][1]) {
      list[idx][which === 0 ? 1 : 0] = which === 0 ? this.toMin(value) + 60 : this.toMin(value) - 60;
    }
    days[day] = list;
    q.workingHours = { ...(q.workingHours || {}), timezone: this.whTz(q), days };
  }
  addWhWindow(q: any, day: string) {
    const days = { ...(((q.workingHours || {}).days) || {}) };
    const list = [...(days[day] || [])];
    list.push([540, 1080]);
    days[day] = list;
    q.workingHours = { ...(q.workingHours || {}), timezone: this.whTz(q), days };
    this.whOpen[(q._id || q.id) + ':' + day] = true;
  }
  removeWhWindow(q: any, day: string, idx: number) {
    const days = { ...(((q.workingHours || {}).days) || {}) };
    const list = [...(days[day] || [])];
    list.splice(idx, 1);
    if (list.length) days[day] = list;
    else delete days[day];
    q.workingHours = { ...(q.workingHours || {}), timezone: this.whTz(q), days };
  }
  toggleWhDay(q: any, day: string) {
    const days = { ...(((q.workingHours || {}).days) || {}) };
    if (days[day]) delete days[day];
    else days[day] = [[540, 1080]];
    q.workingHours = { ...(q.workingHours || {}), timezone: this.whTz(q), days };
  }
  setWhTz(q: any, tz: string) {
    q.workingHours = { ...(q.workingHours || {}), timezone: tz, days: (q.workingHours || {}).days || {} };
  }
  saveWh(q: any) {
    this.saveQueue(q, { workingHours: { timezone: this.whTz(q), days: (q.workingHours || {}).days || {} } });
  }

  // --- Shifts ---------------------------------------------------------------
  // One shift row per agent, edited in place. Same minutes-from-midnight shape
  // as queue working hours so both use one mental model.
  shifts: any[] = [];
  shiftEdit: any = null;
  shiftSaving = false;

  loadShifts() {
    this.api.get_private('v1/support_team/shifts').subscribe({
      next: (r: any) => {
        this.shifts = (r && r.shifts) || [];
      },
      error: () => {
        this.shifts = [];
      },
    });
  }

  shiftFor(agentId: string): any {
    return this.shifts.find((s) => s.agentId && String(s.agentId._id || s.agentId) === String(agentId));
  }

  // Shift summary for the roster row: "Off shift", "On shift 09:00-18:00", or
  // "Not scheduled". Shown inline so nobody has to open the editor to find out.
  shiftLabel(agentId: string): string {
    const s = this.shiftFor(agentId);
    if (!s) return this.util.appTranslate('shift_none');
    const days = (s.days && Object.keys(s.days).length) || 0;
    if (!days) return this.util.appTranslate('shift_none');
    if (s.autoOffline === false) return this.util.appTranslate('shift_manual');
    const min = this.shiftMinutesLeft(s);
    if (min > 0) return `${this.util.appTranslate('shift_starts_in')} ${min}m`;
    const win = this.shiftCurrentWindow(s);
    if (win) return `${win[0]}-${win[1]}`;
    return this.util.appTranslate('shift_offshift');
  }

  private shiftWindows(s: any): [number, number][] {
    const day = this.dayKeyNow((s && s.timezone) || 'Asia/Kolkata');
    const list = (((s || {}).days || {})[day]) || [];
    return list.map((w: any) => [w[0], w[1]]).sort((a: any, b: any) => a[0] - b[0]);
  }

  // Local weekday/minute without pulling in a date library: Intl gives us both.
  private dayKeyNow(tz: string): string {
    try {
      const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' });
      const parts: any = {};
      for (const p of fmt.formatToParts(new Date())) parts[p.type] = p.value;
      return String(parts.weekday || '').toLowerCase().slice(0, 3);
    } catch {
      return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];
    }
  }

  private nowMinute(tz: string): number {
    try {
      const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit' });
      const parts: any = {};
      for (const p of fmt.formatToParts(new Date())) parts[p.type] = p.value;
      return (parseInt(parts.hour, 10) % 24) * 60 + parseInt(parts.minute, 10);
    } catch {
      const d = new Date();
      return d.getHours() * 60 + d.getMinutes();
    }
  }

  private shiftCurrentWindow(s: any): [number, number] | null {
    const m = this.nowMinute((s && s.timezone) || 'Asia/Kolkata');
    const w = this.shiftWindows(s).find((win) => m >= win[0] && m < win[1]);
    return w ? [w[0], w[1]] : null;
  }

  private shiftMinutesLeft(s: any): number {
    const m = this.nowMinute((s && s.timezone) || 'Asia/Kolkata');
    const up = this.shiftWindows(s).find(([start]) => start > m);
    return up ? up[0] - m : 0;
  }

  openShiftEditor(a: any) {
    const existing = this.shiftFor(a.id);
    this.shiftEdit = {
      agentId: a.id,
      name: a.name,
      timezone: (existing && existing.timezone) || 'Asia/Kolkata',
      autoOffline: existing ? existing.autoOffline !== false : true,
      days: JSON.parse(JSON.stringify((existing && existing.days) || {})),
    };
  }

  shiftDays(shift: any): string[] {
    return this.dayKeys.filter((d: any) => ((shift.days || {})[d.k] || []).length > 0).map((d: any) => d.k);
  }

  shiftToggleDay(shift: any, day: string) {
    if (shift.days[day]) delete shift.days[day];
    else shift.days[day] = [[540, 1080]];
  }

  shiftWindowsOf(shift: any, day: string): any[] {
    return (shift.days || {})[day] || [];
  }

  shiftAddWindow(shift: any, day: string) {
    if (!shift.days[day]) shift.days[day] = [];
    shift.days[day].push([540, 1080]);
  }

  shiftRemoveWindow(shift: any, day: string, idx: number) {
    shift.days[day].splice(idx, 1);
    if (!shift.days[day].length) delete shift.days[day];
  }

  shiftSetWindow(shift: any, day: string, idx: number, which: number, value: string) {
    if (!shift.days[day] || !shift.days[day][idx]) shift.days[day][idx] = [540, 1080];
    const w = shift.days[day][idx];
    const mins = this.toMin(value);
    if (which === 0) {
      w[0] = mins;
      if (w[0] >= w[1]) w[1] = w[0] + 60;
    } else {
      w[1] = mins;
      if (w[0] >= w[1]) w[0] = Math.max(0, w[1] - 60);
    }
  }

  saveShift() {
    if (!this.shiftEdit || this.shiftSaving) return;
    this.shiftSaving = true;
    this.api
      .post_private(`v1/support_team/shifts/${this.shiftEdit.agentId}`, {
        name: this.shiftEdit.name,
        timezone: this.shiftEdit.timezone,
        autoOffline: this.shiftEdit.autoOffline,
        days: this.shiftEdit.days,
      })
      .subscribe({
        next: () => {
          this.shiftSaving = false;
          this.shiftEdit = null;
          this.loadShifts();
        },
        error: (error: any) => {
          this.shiftSaving = false;
          this.util.handleError(error, 'support-team');
        },
      });
  }

  removeShift() {
    if (!this.shiftEdit || this.shiftSaving) return;
    this.shiftSaving = true;
    this.api.delete_private(`v1/support_team/shifts/${this.shiftEdit.agentId}`).subscribe({
      next: () => {
        this.shiftSaving = false;
        this.shiftEdit = null;
        this.loadShifts();
      },
      error: (error: any) => {
        this.shiftSaving = false;
        this.util.handleError(error, 'support-team');
      },
    });
  }

  coverage: any = null;

  loadCoverage() {
    this.api.get_private('v1/support_team/coverage').subscribe({
      next: (r: any) => {
        this.coverage = r;
      },
      error: () => {
        this.coverage = null;
      },
    });
  }

  // --- Support QA ------------------------------------------------------------
  // Sampling is risk-weighted server-side: the queue is ordered by what is most
  // worth reviewing, not by what is newest.
  qaSample: any[] = [];
  qaBusy = false;
  qaOpen = false;
  qaScores: Record<string, Record<string, number>> = {};
  qaComment: Record<string, string> = {};
  qaQualityRows: any[] = [];
  criteria = ['accuracy', 'empathy', 'resolution', 'compliance'];

  loadQa() {
    this.api.get_private('v1/support_team/qa/quality?days=30').subscribe({
      next: (r: any) => {
        this.qaQualityRows = (r && r.agents) || [];
      },
      error: () => {
        this.qaQualityRows = [];
      },
    });
  }

  loadQaSample() {
    if (this.qaBusy) return;
    this.qaBusy = true;
    this.api.get_private('v1/support_team/qa/sample?limit=10&days=30').subscribe({
      next: (r: any) => {
        this.qaBusy = false;
        this.qaSample = (r && r.tickets) || [];
        this.qaOpen = true;
      },
      error: (error: any) => {
        this.qaBusy = false;
        this.util.handleError(error, 'support-team');
      },
    });
  }

  setScore(roomId: string, criterion: string, value: number) {
    this.qaScores[roomId] = { ...(this.qaScores[roomId] || {}), [criterion]: Number(value) };
  }

  scoreOf(roomId: string, criterion: string): number {
    const s = this.qaScores[roomId] || {};
    return s[criterion] || 0;
  }

  canSubmitQa(roomId: string): boolean {
    return this.criteria.some((c) => this.scoreOf(roomId, c) > 0);
  }

  submitQa(roomId: string) {
    this.api.post_private('v1/support_team/qa/review', {
      roomId,
      scores: this.qaScores[roomId] || {},
      comment: this.qaComment[roomId] || '',
    }).subscribe({
      next: () => {
        this.qaScores = { ...this.qaScores, [roomId]: {} };
        this.qaComment = { ...this.qaComment, [roomId]: '' };
        this.qaSample = this.qaSample.filter((t) => t.roomId !== roomId);
        this.loadQa();
      },
      error: (error: any) => this.util.handleError(error, 'support-team'),
    });
  }

  qualityFor(agentId: string): any {
    return this.qaQualityRows.find((q) => q.agentId === agentId) || null;
  }

  visibleAgents(): any[] {
    if (this.roleFilter === 'agent') return this.allAgents.filter((a) => a.role !== 'supportSupervisor');
    if (this.roleFilter === 'supervisor') return this.allAgents.filter((a) => a.role === 'supportSupervisor');
    return this.allAgents;
  }

  supervisorsOnly(): any[] {
    return this.allAgents.filter((a) => a.role === 'supportSupervisor');
  }

  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {
    this.load();
    this.loadShifts();
    this.loadCoverage();
    this.loadQa();
    // Presence goes stale while watching: refresh the roster on the same
    // cadence as heartbeats, otherwise the supervisor judges yesterday's
    // online flags.
    this.rosterTimer = setInterval(() => {
      this.loadRoster();
      this.loadCoverage();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.rosterTimer) clearInterval(this.rosterTimer);
  }

  private rosterTimer: any = null;

  loadRoster() {
    this.api.get_private('v1/support_team/agents/all').subscribe({
      next: (response: any) => {
        this.allAgents = (response && response.agents) || [];
      },
      error: () => {},
    });
  }

  isSupervisor(): boolean {
    return (localStorage.getItem('_authRole') || '') === 'supportSupervisor';
  }

  // Server sends a resolved `status`; the raw pair stays as a fallback for a
  // cached bundle that predates it.
  statusOf(a: any): string {
    if (a.status) return a.status;
    return !a.online ? 'offline' : a.availability || 'available';
  }

  statusColor(a: any): string {
    const status = this.statusOf(a);
    if (status === 'available') return '#2ecc71';
    if (status === 'busy') return '#f39c12';
    return '#e74c3c';
  }

  statusLabel(a: any): string {
    const status = this.statusOf(a);
    if (status === 'busy') return this.util.appTranslate('busy');
    if (status === 'available') return this.util.appTranslate('available');
    return this.util.appTranslate('offline');
  }

  // Seconds since the agent's last heartbeat, for the supervisor's "seen Xs
  // ago" hint. The presence API already treats >90s as offline, so this is the
  // same truth the routing engine uses — not a second opinion.
  lastSeenAge(a: any): string {
    if (!a.lastSeen) return this.util.appTranslate('never');
    const secs = Math.max(0, Math.round((Date.now() - new Date(a.lastSeen).getTime()) / 1000));
    if (secs < 10) return this.util.appTranslate('just_now');
    if (secs < 60) return secs + 's';
    const mins = Math.round(secs / 60);
    if (mins < 60) return mins + 'm';
    return Math.round(mins / 60) + 'h';
  }

  // Supervisor override from the roster. Optimistic flip so the UI reacts on
  // click, then the 30s roster poll reconciles with the server's answer.
  busyAgentId = '';

  setAgentStatus(a: any, availability: string) {
    if (!a || this.busyAgentId) return;
    const prev = this.statusOf(a);
    a.status = availability;
    a.availability = availability;
    a.online = availability !== 'offline';
    this.busyAgentId = a.id;
    this.api.post_private('v1/support_team/agents/availability', { agent: a.id, availability }).subscribe({
      next: () => {
        this.busyAgentId = '';
        this.loadRoster();
      },
      error: (error: any) => {
        a.status = prev;
        a.availability = prev;
        this.busyAgentId = '';
        this.util.handleError(error, 'support-team');
        this.loadRoster();
      },
    });
  }

  load() {
    this.isLoaded = false;
    this.api.get_private('v1/support_team/queues').subscribe({
      next: (response: any) => {
        this.queues = (response && response.queues) || [];
        this.isLoaded = true;
      },
      error: () => {
        this.isLoaded = true;
      },
    });
    this.api.get_private('v1/support_team/agents/all').subscribe({
      next: (response: any) => {
        this.allAgents = (response && response.agents) || [];
      },
      error: (error: any) => {
        if (error && (error.status === 403 || error.status === 401)) this.forbidden = true;
      },
    });
    this.api.get_private('v1/support_team/sla-policies').subscribe({
      next: (response: any) => {
        this.policies = (response && response.policies) || [];
      },
      error: () => {},
    });
  }

  memberIds(q: any): string[] {
    return (q.members || []).map((m: any) => String(m._id || m.id || m));
  }

  addMember(q: any) {
    const id = this.addMemberSel[q._id || q.id];
    if (!id) return;
    const ids = [...new Set([...this.memberIds(q), String(id)])];
    this.saveQueue(q, { members: ids });
  }

  removeMember(q: any, memberId: string) {
    const ids = this.memberIds(q).filter((m) => m !== String(memberId));
    this.saveQueue(q, { members: ids });
  }

  setWip(q: any, delta: number) {
    const next = Math.min(20, Math.max(1, (q.wipLimit || 3) + delta));
    this.saveQueue(q, { wipLimit: next });
  }

  toggleQueue(q: any) {
    this.saveQueue(q, { isActive: !q.isActive });
  }

  saveQueue(q: any, patch: any) {
    const id = q._id || q.id;
    this.api.patch_private(`v1/support_team/queues/${id}`, patch).subscribe({
      next: () => this.load(),
      error: (error: any) => this.util.handleError(error, 'support-team'),
    });
  }

  savePolicy(p: any) {
    const id = p._id || p.id;
    this.api
      .patch_private(`v1/support_team/sla-policies/${id}`, {
        firstResponseSec: p.firstResponseSec,
        resolutionSec: p.resolutionSec,
        escalationMode: p.escalationMode || 'off',
        escalateAfterSec: p.escalateAfterSec,
        escalateTo: p.escalateTo || [],
      })
      .subscribe({
        next: () => this.load(),
        error: (error: any) => this.util.handleError(error, 'support-team'),
      });
  }

  sendBroadcast() {
    const text = (this.broadcastMsg || '').trim();
    if (!text || this.broadcastBusy) return;
    this.broadcastBusy = true;
    this.api.post_private('v1/support_team/broadcast', { message: text }).subscribe({
      next: (response: any) => {
        this.broadcastBusy = false;
        this.broadcastMsg = '';
        this.util.onSuccess('ts_status_updated');
      },
      error: (error: any) => {
        this.broadcastBusy = false;
        this.util.handleError(error, 'support-team');
      },
    });
  }

  hasLang(agent: any, lang: string): boolean {
    return ((agent && agent.languages) || []).includes(lang);
  }

  toggleLang(agent: any, lang: string) {
    const current: string[] = [...((agent && agent.languages) || [])];
    const i = current.indexOf(lang);
    if (i > -1) current.splice(i, 1);
    else current.push(lang);
    agent.languages = current;
    this.api.patch_private(`v1/support_team/agents/${agent.id}/languages`, { languages: current }).subscribe({
      next: () => {},
      error: (error: any) => {
        this.util.handleError(error, 'support-team');
        this.load();
      },
    });
  }
}
