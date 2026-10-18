import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { SupportTeamChatListInterface } from 'src/app/interfaces/support.team.chat.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-support-team-chat-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './support-team-chat-list.html',
})
export class SupportTeamChatList {

  @ViewChild('chatPaginator', { read: MatPaginator, static: false }) chatPaginator: MatPaginator;
  chatList = new MatTableDataSource<SupportTeamChatListInterface>([]);
  displayedColumn = ['id', 'type_id', 'customer', 'type', 'status', 'team', 'time', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  searchTerm: string = '';
  searchResults: any[] = [];
  searching: boolean = false;
  private searchDebounce: any = null;
  filterAgent: string = '';
  filterFrom: string = '';
  filterTo: string = '';
  agentOptions: any[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {
    this.getList();
    this.getAgents();
  }

  getAgents() {
    this.api.get_private('v1/support_team/stats/overview?days=90').subscribe({
      next: (response: any) => {
        this.agentOptions = (response && response.agents) || [];
      },
      error: () => {},
    });
  }

  onFilterChange() {
    this.currentPage = 0;
    this.getList();
  }

  clearFilters() {
    this.filterAgent = '';
    this.filterFrom = '';
    this.filterTo = '';
    this.onFilterChange();
  }

  exportFiltered() {
    let params = new HttpParams();
    if (this.filterAgent) params = params.set('agent', this.filterAgent);
    if (this.filterFrom) params = params.set('from', this.filterFrom);
    if (this.filterTo) params = params.set('to', this.filterTo);
    window.open(`${this.api.baseUrl}v1/support_team/stats/tickets/export?${params.toString()}`, '_blank');
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    if (this.filterAgent) param['agent'] = this.filterAgent;
    if (this.filterFrom) param['from'] = this.filterFrom;
    if (this.filterTo) param['to'] = this.filterTo;
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/support_team/support_team_chat_list/' + localStorage.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          this.chatList = response.results;
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

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy hh:mm a');
  }

  onChat(item: SupportTeamChatListInterface) {
    console.log(item);
    this.router.navigate(['support-team/u/message', item.id]);
  }

  // Global server-side message search. Debounced; 2+ chars.
  onSearch(term: string) {
    this.searchTerm = term;
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    if (!term || term.trim().length < 2) {
      this.searchResults = [];
      return;
    }
    this.searchDebounce = setTimeout(() => {
      this.searching = true;
      let httpParams = new HttpParams().set('q', term.trim()).set('limit', 20);
      this.api.get_private('v1/support_team/chat/search?' + httpParams.toString()).subscribe({
        next: (response: any) => {
          this.searching = false;
          this.searchResults = (response && response.matches) || [];
        },
        error: () => {
          this.searching = false;
          this.searchResults = [];
        },
      });
    }, 400);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
  }

  openMatch(m: any) {
    if (m && m.roomId) this.router.navigate(['support-team/u/message', m.roomId]);
  }

}
