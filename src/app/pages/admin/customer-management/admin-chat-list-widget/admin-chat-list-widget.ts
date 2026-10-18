import { Component, OnDestroy, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { DateTime } from 'luxon';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subscription } from 'rxjs';
import { AdminRegularChatConversionInterface } from 'src/app/interfaces/admin.regular.chat.conversion.interface';
import { AdminRegularChatListInterface } from 'src/app/interfaces/admin.regular.chat.list.interface';
import { AdminSupportChatConversionInterface } from 'src/app/interfaces/admin.support.chat.conversion.interface';
import { AdminSupportChatInterface } from 'src/app/interfaces/admin.support.chat.interface';
import { ApiService } from 'src/app/services/api-service';
import { ChatService } from 'src/app/services/chat-service';
import { UtilService } from 'src/app/services/util-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-admin-chat-list-widget',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgScrollbarModule, NgIcon],
  templateUrl: './admin-chat-list-widget.html',
})
export class AdminChatListWidget implements OnDestroy {

  @ViewChild('chatListScroll') chatListScroll!: NgScrollbar;
  @ViewChild('chatMessageScroll') chatMessageScroll!: NgScrollbar;
  sidePanelOpened = true;
  uid: string = '';
  isChatListLoaded: boolean = false;
  isSupportChatListLoaded: boolean = false;
  isLoadMoreChatList: boolean = false;
  isLoadMoreSupportChatList: boolean = false;
  currentChatType: string = 'regular';
  chatList: AdminRegularChatListInterface[] = [];
  chatListDummy: AdminRegularChatListInterface[] = [];
  supportChatList: AdminSupportChatInterface[] = [];
  supportChatListDummy: AdminSupportChatInterface[] = [];
  pageSizeChat: number = 10;
  currentPageChat: number = 0;
  totalResultsChat: number = 0;
  serverResultsChat: number = 0;
  pageSizeSupportChat: number = 10;
  currentPageSupportChat: number = 0;
  totalResultsSupportChat: number = 0;
  serverResultSupportChat: number = 0;
  pageSizeChatMessage: number = 10;
  currentPageChatMessage: number = 0;
  totalResultChatMessage: number = 0;
  serverResultChatMessage: number = 0;
  pageSizeSupportChatMessage: number = 10;
  currentPageSupportChatMessage: number = 0;
  totalResultSupportChatMessage: number = 0;
  serverResultSupportChatMessage: number = 0;
  searchQuery: string = '';
  msg: string = '';
  chatId: string = '';
  supportChatId: string = '';
  chatInitialize: boolean = false;
  regularChatInitialize: boolean = false;
  supportChatInitialize: boolean = false;
  receiverImages: string[] = [];
  receiverName: string = '';
  private messageSubscription!: Subscription;
  regularChatMessages: AdminRegularChatConversionInterface[] = [];
  supportChatMessages: AdminSupportChatConversionInterface[] = [];
  roomId: string = '';
  loadMoreRegularChats: boolean = false;
  loadMoreSupportChats: boolean = false;
  exportTypeList: string = 'export';
  exportTypeMessages: string = 'export';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private chatService: ChatService,
    private router: Router
  ) {
    this.uid = this.util.getItem('_uid');
    console.log(this.uid);
    this.getChatList();
  }

  onChatChange(type: string) {
    console.log(type);
    if (this.currentChatType != type) {
      this.chatId = '';
      this.roomId = '';
      this.supportChatId = '';
      this.chatInitialize = false;
      this.regularChatInitialize = false;
      this.supportChatInitialize = false;
      this.currentChatType = type;
      if (this.currentChatType == 'regular') {
        this.getChatList();
      } else {
        this.getSupportChatList();
      }
    }
  }

  getSupportChatList() {
    console.log('Support Chat List');
    this.isSupportChatListLoaded = false;
    const param: any = {
      'limit': this.pageSizeSupportChat,
      'page': this.currentPageSupportChat,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/support_chat_list?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isSupportChatListLoaded = true;
        console.log(response);
        if (response && response.success) {
          this.supportChatList = response.results;
          this.supportChatListDummy = response.results;
          this.totalResultsSupportChat = response.totalResults;
          this.serverResultSupportChat = response.results.length;
        }
        console.log(this.chatList);
      }, error: (error: any) => {
        console.log(error);
        this.isSupportChatListLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  isOver(): boolean {
    return window.matchMedia(`(max-width: 960px)`).matches;
  }

  ngOnDestroy() {
    console.log('destroy');
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.chatService.disconnect();
  }

  loadMore() {
    console.log('Load More...');
    if (this.currentChatType == 'regular') {
      if (this.serverResultsChat < this.totalResultsChat) {
        console.log('Fetch More.........');
        this.pageSizeChat = Number(this.pageSizeChat) * 2;
        const param: any = {
          'limit': this.pageSizeChat,
          'page': this.currentPageChat,
        };
        let httpParams = new HttpParams();
        Object.keys(param).forEach((key: any) => {
          httpParams = httpParams.set(key, param[key]);
        });
        this.isLoadMoreChatList = true;
        this.api.get_private('v1/admin/regular_chat_list?' + httpParams.toString()).subscribe({
          next: (response: any) => {
            this.isLoadMoreChatList = false;
            console.log(response);
            if (response && response.success) {
              this.chatList = response.results;
              this.chatListDummy = response.results;
              this.totalResultsChat = response.totalResults;
              this.serverResultsChat = response.results.length;
            }
            console.log(this.chatList);
          }, error: (error: any) => {
            console.log(error);
            this.isLoadMoreChatList = false;
            this.util.handleError(error, 'admin');
          }
        });
      }
    } else {
      if (this.serverResultSupportChat < this.totalResultsSupportChat) {
        this.pageSizeSupportChat = Number(this.pageSizeSupportChat) * 2;
        const param: any = {
          'limit': this.pageSizeSupportChat,
          'page': this.currentPageSupportChat,
        };
        let httpParams = new HttpParams();
        Object.keys(param).forEach((key: any) => {
          httpParams = httpParams.set(key, param[key]);
        });
        this.isLoadMoreSupportChatList = true;
        this.api.get_private('v1/admin/support_chat_list?' + httpParams.toString()).subscribe({
          next: (response: any) => {
            this.isLoadMoreSupportChatList = false;
            console.log(response);
            if (response && response.success) {
              this.supportChatList = response.results;
              this.supportChatListDummy = response.results;
              this.totalResultsSupportChat = response.totalResults;
              this.serverResultSupportChat = response.results.length;
            }
            console.log(this.chatList);
          }, error: (error: any) => {
            console.log(error);
            this.isLoadMoreSupportChatList = false;
            this.util.handleError(error, 'admin');
          }
        });
      }
    }

  }

  ngAfterViewInit() {
    const viewportChatList = this.chatListScroll.nativeElement;
    viewportChatList.addEventListener('scrollend', () => {
      this.loadMore();
    }, { passive: true });

    const viewportChatMessages = this.chatMessageScroll.nativeElement;
    viewportChatMessages.addEventListener('scrollend', () => {
      if (viewportChatMessages.scrollTop <= 0) {
        console.log(`----- Load More Messages -----`);
        if (this.currentChatType == 'regular') {
          if (this.serverResultChatMessage < this.totalResultChatMessage) {
            this.loadMoreRegularChatMessages()
          }
        } else {
          if (this.serverResultSupportChatMessage < this.totalResultSupportChatMessage) {
            this.loadMoreSupportChatMessages();
          }
        }
      }
    }, { passive: true });
  }

  loadMoreRegularChatMessages() {
    this.loadMoreRegularChats = true;
    this.pageSizeChatMessage = Number(this.pageSizeChatMessage) * 2;
    const param: any = {
      'limit': this.pageSizeChatMessage,
      'page': this.currentPageChatMessage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/regular_chat_messages/' + this.chatId + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.loadMoreRegularChats = false;
        if (response && response.success && response.roomId) {
          this.roomId = response.roomId;
          this.regularChatMessages = response.chats;
          this.totalResultChatMessage = response.totalResults;
          this.serverResultChatMessage = response.chats.length;
          this.regularChatMessages = this.regularChatMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
      }, error: (error: any) => {
        console.log(error);
        this.loadMoreRegularChats = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

  loadMoreSupportChatMessages() {
    console.log('Load More Support Chat Message');
    this.loadMoreSupportChats = true;
    this.pageSizeSupportChatMessage = Number(this.pageSizeSupportChatMessage) * 2;
    const param: any = {
      'limit': this.pageSizeSupportChatMessage,
      'page': this.currentPageSupportChatMessage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/support_chat_messages/' + this.supportChatId + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.loadMoreSupportChats = false;
        if (response && response.success && response.roomId) {
          this.roomId = response.roomId;
          this.supportChatMessages = response.chats;
          this.totalResultSupportChatMessage = response.totalResults;
          this.serverResultSupportChatMessage = response.chats.length;
          this.supportChatMessages = this.supportChatMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
      }, error: (error: any) => {
        console.log(error);
        this.loadMoreSupportChats = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

  getChatList() {
    this.isChatListLoaded = false;
    const param: any = {
      'limit': this.pageSizeChat,
      'page': this.currentPageChat,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/regular_chat_list?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isChatListLoaded = true;
        console.log(response);
        if (response && response.success) {
          this.chatList = response.results;
          this.chatListDummy = response.results;
          this.totalResultsChat = response.totalResults;
          this.serverResultsChat = response.results.length;
        }
        console.log(this.chatList);
      }, error: (error: any) => {
        console.log(error);
        this.isChatListLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onChatSelect(item: AdminRegularChatListInterface) {
    console.log(item);
    this.chatInitialize = true;
    this.receiverImages = [];
    this.receiverName = '';

    this.receiverImages.push(item.senderInfo?.image);
    this.receiverImages.push(item.receiverInfo?.image);

    const receiverNameList: string[] = [];
    receiverNameList.push(`${item.senderInfo?.firstName} ${item.senderInfo?.lastName}`);
    receiverNameList.push(`${item.receiverInfo?.firstName} ${item.receiverInfo?.lastName}`);
    this.receiverName = receiverNameList.join(', ');
    this.chatId = item.id;
    this.getRegularChatMessages();
  }

  getRegularChatMessages() {
    console.log(`Chat Id --> ${this.chatId}`);
    this.regularChatInitialize = false;
    const param: any = {
      'limit': this.pageSizeChatMessage,
      'page': this.currentPageChatMessage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/regular_chat_messages/' + this.chatId + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.regularChatInitialize = true;

        if (response && response.success && response.roomId) {
          this.roomId = response.roomId;
          this.regularChatMessages = response.chats;
          this.totalResultChatMessage = response.totalResults;
          this.serverResultChatMessage = response.chats.length;
          this.regularChatMessages = this.regularChatMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          setTimeout(() => {
            this.scrollToBottom();
          }, 2);
          if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
            this.chatService.disconnect();
          }

          this.chatService.connectToServer(this.roomId);
          this.messageSubscription = this.chatService.receiveMessage().subscribe((data: any) => {
            console.log('Message received: ', data);
            const param = {
              "roomId": this.roomId,
              "senderId": data.senderId,
              "message": data.message,
              "messageType": data.messageType,
              "createdAt": data.currentDate,
              "id": data.randomId,
              'sender': {
                'id': data.senderId,
                'image': data && data.senderCover && data.senderCover != null && data.senderCover != '' ? data.senderCover : '',
                'firstName': data && data.senderFirstName && data.senderFirstName != null && data.senderFirstName != '' ? data.senderFirstName : '',
                'lastName': data && data.senderLastName && data.senderLastName != null && data.senderLastName != '' ? data.senderLastName : '',
                'role': data.role
              }
            };
            if (param.senderId != this.uid) {
              this.regularChatMessages.push(param);
            }
            this.scrollToBottom();
          });
        }

      }, error: (error: any) => {
        console.log(error);
        this.regularChatInitialize = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  getSupportChatMessages() {
    this.supportChatInitialize = false;
    const param: any = {
      'limit': this.pageSizeSupportChatMessage,
      'page': this.currentPageSupportChatMessage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/support_chat_messages/' + this.supportChatId + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.supportChatInitialize = true;

        if (response && response.success && response.roomId) {
          this.roomId = response.roomId;
          this.supportChatMessages = response.chats;
          this.totalResultSupportChatMessage = response.totalResults;
          this.serverResultSupportChatMessage = response.chats.length;
          this.supportChatMessages = this.supportChatMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          setTimeout(() => {
            this.scrollToBottom();
          }, 2);
          if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
            this.chatService.disconnect();
          }

          this.chatService.connectToServer(this.roomId);
          this.messageSubscription = this.chatService.receiveMessage().subscribe((data: any) => {
            console.log('Message received: ', data);
            const param = {
              "roomId": this.roomId,
              "senderId": data.senderId,
              "message": data.message,
              "messageType": data.messageType,
              "createdAt": data.currentDate,
              "id": data.randomId,
              'sender': {
                'id': data.senderId,
                'image': data && data.senderCover && data.senderCover != null && data.senderCover != '' ? data.senderCover : '',
                'firstName': data && data.senderFirstName && data.senderFirstName != null && data.senderFirstName != '' ? data.senderFirstName : '',
                'lastName': data && data.senderLastName && data.senderLastName != null && data.senderLastName != '' ? data.senderLastName : '',
                'role': data.role
              }
            };
            if (param.senderId != this.uid) {
              this.supportChatMessages.push(param);
            }
            this.scrollToBottom();
          });
        }
      }, error: (error: any) => {
        console.log(error);
        this.supportChatInitialize = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onSupportChatSelect(item: AdminSupportChatInterface) {
    console.log(item);
    this.chatInitialize = true;
    this.receiverImages = [];
    this.receiverName = '';
    const receiverNameList: string[] = [];
    item.team.forEach((element) => {
      this.receiverImages.push(element?.image);
      receiverNameList.push(`${element?.firstName} ${element.lastName}`);
    });
    this.receiverImages.push(item.customer?.image);
    receiverNameList.push(`${item.customer?.firstName} ${item.customer?.lastName}`);
    this.receiverName = receiverNameList.join(', ');
    this.supportChatId = item.id;
    this.getSupportChatMessages();
  }

  scrollToBottom(): void {
    try {
      const element = document.getElementById('chatBox');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
      }
    } catch (err) {
      console.error('Scrolling failed:', err);
    }
  }

  sendMessage() {
    console.log(`send message --> ${this.msg}`);
    if (this.currentChatType == 'regular') {
      console.log('send regular message');
      const randomId = Date.now().toString();
      this.chatService.sendMessage(this.roomId, this.uid, this.msg, randomId, this.util.getItem('_authFirstName'), this.util.getItem('_authLastName'), this.util.getItem('_authCoverImage'));
      const param = {
        "roomId": this.roomId,
        "senderId": this.uid,
        "message": this.msg,
        "messageType": 'text',
        "createdAt": DateTime.now().toISO(),
        "id": randomId,
        'sender': {
          'id': this.uid,
          'image': this.util.getItem('_authCoverImage'),
          'firstName': this.util.getItem('_authFirstName'),
          'lastName': this.util.getItem('_authLastName'),
          'role': localStorage.getItem('_authRole') || '',
        }
      };
      this.regularChatMessages.push(param);
      this.scrollToBottom();
      const serverParam = {
        'room': this.roomId,
        'sender': this.uid,
        'msg': this.msg,
        'msgType': 'text'
      }
      this.msg = '';
      this.api.post_private('v1/admin/chat_room/send_regular_message/', serverParam).subscribe({
        next: (response: any) => {
          console.log(response);
        }, error: (error: any) => {
          console.log(error);
          this.util.handleError(error, 'admin');
        }
      });
    } else {
      console.log('send support message');
      const randomId = Date.now().toString();
      this.chatService.sendMessage(this.roomId, this.uid, this.msg, randomId, this.util.getItem('_authFirstName'), this.util.getItem('_authLastName'), this.util.getItem('_authCoverImage'));
      const param = {
        "roomId": this.roomId,
        "senderId": this.uid,
        "message": this.msg,
        "messageType": 'text',
        "createdAt": DateTime.now().toISO(),
        "id": randomId,
        'sender': {
          'id': this.uid,
          'image': this.util.getItem('_authCoverImage'),
          'firstName': this.util.getItem('_authFirstName'),
          'lastName': this.util.getItem('_authLastName'),
          'role': localStorage.getItem('_authRole') || '',
        }
      };
      this.supportChatMessages.push(param);
      this.scrollToBottom();
      const serverParam = {
        'room': this.roomId,
        'sender': this.uid,
        'msg': this.msg,
        'msgType': 'text'
      }
      this.msg = '';
      this.api.post_private('v1/admin/chat_room/send_support_message/', serverParam).subscribe({
        next: (response: any) => {
          console.log(response);
        }, error: (error: any) => {
          console.log(error);
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  onSearch(searchItem: string) {
    console.log(searchItem);
    if (this.currentChatType == 'regular') {
      if (searchItem != '') {
        this.chatList = this.chatListDummy.filter((item) => {
          const haystack = [
            item.senderInfo?.firstName,
            item.senderInfo?.lastName,
            item.receiverInfo?.firstName,
            item.receiverInfo?.lastName,
          ].filter(Boolean).join(' ').toLowerCase();
          return haystack.includes(searchItem);
        });
      } else {
        this.chatList = this.chatListDummy;
      }
    } else {
      if (searchItem != '') {
        console.log(this.supportChatListDummy);
        this.supportChatList = this.supportChatListDummy.filter((item) => {
          const haystack = [item.customer?.firstName, item.customer?.lastName]
            .filter(Boolean).join(' ').toLowerCase();
          return haystack.includes(searchItem);
        });
      } else {
        this.supportChatList = this.supportChatListDummy;
      }
    }
  }

  getDateFormatted(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('LLL dd, yyyy');
  }

  chatName(chats: AdminRegularChatListInterface): string {
    const name = this.util.trimText(chats.receiverInfo.firstName + ' ' + chats.receiverInfo.lastName + ' & ' + chats.senderInfo.firstName + ' ' + chats.senderInfo.lastName, 20)
    return name;
  }

  importCollection(kind: string) {
    this.router.navigate(['admin/import-export-management/import-collection/', kind]);
  }

  onExportListCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      console.log('exportCollection Now');
      if (this.currentChatType == 'regular') {
        const spinnerRef = this.util.start();
        const param: any = {
          'type': exportOption,
        };
        let httpParams = new HttpParams();
        Object.keys(param).forEach((key: any) => {
          httpParams = httpParams.set(key, param[key]);
        });
        this.api.export_collection('v1/admin/regular_chat_list/export?' + httpParams.toString()).subscribe({
          next: (blob: Blob) => {
            this.util.stop(spinnerRef);
            if (exportOption != 'raw') {
              const fileName = exportOption == 'excel' ? 'RegularChatList.xlsx' : 'RegularChatList.csv';
              this.api.download_export_file(blob, fileName);
            } else {
              const fileName = 'regular_chat_list.json';
              this.api.download_export_file(blob, fileName);
            }
            this.exportTypeList = 'export';
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.exportTypeList = 'export';
            this.util.handleError(error, 'admin');
          }
        });
      } else {
        const spinnerRef = this.util.start();
        const param: any = {
          'type': exportOption,
        };
        let httpParams = new HttpParams();
        Object.keys(param).forEach((key: any) => {
          httpParams = httpParams.set(key, param[key]);
        });
        this.api.export_collection('v1/admin/support_chat_list/export?' + httpParams.toString()).subscribe({
          next: (blob: Blob) => {
            this.util.stop(spinnerRef);
            if (exportOption != 'raw') {
              const fileName = exportOption == 'excel' ? 'SupportChatList.xlsx' : 'SupportChatList.csv';
              this.api.download_export_file(blob, fileName);
            } else {
              const fileName = 'support_chat_list.json';
              this.api.download_export_file(blob, fileName);
            }
            this.exportTypeList = 'export';
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.exportTypeList = 'export';
            this.util.handleError(error, 'admin');
          }
        });
      }
    }
  }

  onExportMessageCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      console.log('exportCollection Now');
      if (this.currentChatType == 'regular') {
        const spinnerRef = this.util.start();
        const param: any = {
          'type': exportOption,
        };
        let httpParams = new HttpParams();
        Object.keys(param).forEach((key: any) => {
          httpParams = httpParams.set(key, param[key]);
        });
        this.api.export_collection('v1/admin/regular_chat_message/export?' + httpParams.toString()).subscribe({
          next: (blob: Blob) => {
            this.util.stop(spinnerRef);
            if (exportOption != 'raw') {
              const fileName = exportOption == 'excel' ? 'RegularChatMessages.xlsx' : 'RegularChatMessages.csv';
              this.api.download_export_file(blob, fileName);
            } else {
              const fileName = 'regular_chat_messages.json';
              this.api.download_export_file(blob, fileName);
            }
            this.exportTypeMessages = 'export';
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.exportTypeMessages = 'export';
            this.util.handleError(error, 'admin');
          }
        });
      } else {
        const spinnerRef = this.util.start();
        const param: any = {
          'type': exportOption,
        };
        let httpParams = new HttpParams();
        Object.keys(param).forEach((key: any) => {
          httpParams = httpParams.set(key, param[key]);
        });
        this.api.export_collection('v1/admin/support_chat_message/export?' + httpParams.toString()).subscribe({
          next: (blob: Blob) => {
            this.util.stop(spinnerRef);
            if (exportOption != 'raw') {
              const fileName = exportOption == 'excel' ? 'SupportChatMessages.xlsx' : 'SupportChatMessages.csv';
              this.api.download_export_file(blob, fileName);
            } else {
              const fileName = 'support_chat_messages.json';
              this.api.download_export_file(blob, fileName);
            }
            this.exportTypeMessages = 'export';
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.exportTypeMessages = 'export';
            this.util.handleError(error, 'admin');
          }
        });
      }
    }
  }

}
