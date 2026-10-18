import { Component, OnDestroy, ViewChild } from '@angular/core';
import { DateTime } from 'luxon';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subscription } from 'rxjs';
import { VendorChatListInterface } from 'src/app/interfaces/vendor.chat.list.interface';
import { VendorChatMessageInterface } from 'src/app/interfaces/vendor.chat.message.interface';
import { VendorSupportChatListInterface } from 'src/app/interfaces/vendor.support.chat.list.interface';
import { VendorSupportChatMessageInterface } from 'src/app/interfaces/vendor.support.chat.message.interface';
import { ApiService } from 'src/app/services/api-service';
import { ChatService } from 'src/app/services/chat-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-vendor-chat-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgScrollbarModule, NgIcon],
  templateUrl: './vendor-chat-list.html',
})
export class VendorChatList implements OnDestroy {

  @ViewChild('chatMessageScroll') chatMessageScroll!: NgScrollbar;
  sidePanelOpened = true;
  uid: string = '';
  isChatListLoaded: boolean = false;
  isSupportChatListLoaded: boolean = false;
  isLoadMoreChatList: boolean = false;
  isLoadMoreSupportChatList: boolean = false;
  currentChatType: string = 'regular';
  chatList: VendorChatListInterface[] = [];
  chatListDummy: VendorChatListInterface[] = [];
  supportChatList: VendorSupportChatListInterface[] = [];
  supportChatListDummy: VendorSupportChatListInterface[] = [];
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
  receiverId: string = '';
  regularChatMessages: VendorChatMessageInterface[] = [];
  supportChatMessages: VendorSupportChatMessageInterface[] = [];
  roomId: string = '';
  supportType: string = '';
  supportTypeId: string = '';
  loadMoreRegularChats: boolean = false;
  loadMoreSupportChats: boolean = false;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private chatService: ChatService
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
    this.api.get_private('v1/vendor_web/support_chat_room/list/' + this.util.getItem('_uid')).subscribe({
      next: (response: any) => {
        this.isSupportChatListLoaded = true;
        console.log(response);
        if (response && response.success) {
          this.supportChatList = response.chats;
          this.supportChatListDummy = response.chats;
        }
        console.log(this.chatList);
      }, error: (error: any) => {
        console.log(error);
        this.isSupportChatListLoaded = true;
        this.util.handleError(error, 'vendor');
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

  ngAfterViewInit() {
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
    const param = {
      'limit': this.pageSizeChatMessage,
      'page': this.currentPageChatMessage,
      'receiverId': this.receiverId,
      'senderId': this.uid
    };
    this.api.post_private('v1/vendor_web/chat_room/fetchMessages/', param).subscribe({
      next: (response: any) => {
        console.log(response);
        this.loadMoreRegularChats = false;
        if (response && response.success && response.roomID) {
          this.roomId = response.roomID;
          this.regularChatMessages = response.chats;
          this.totalResultChatMessage = response.totalResults;
          this.serverResultChatMessage = response.chats.length;
          this.regularChatMessages = this.regularChatMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
      }, error: (error: any) => {
        console.log(error);
        this.loadMoreRegularChats = false;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  loadMoreSupportChatMessages() {
    console.log('Load More Support Chat Message');
    this.loadMoreSupportChats = true;
    this.pageSizeSupportChatMessage = Number(this.pageSizeSupportChatMessage) * 2;
    const param = {
      'limit': this.pageSizeSupportChatMessage,
      'page': this.currentPageSupportChatMessage,
      'type': this.supportType,
      'typeId': this.supportTypeId,
      'user': this.util.getItem('_uid')
    };
    this.api.post_private('v1/vendor_web/support_chat_room/fetchMessages/', param).subscribe({
      next: (response: any) => {
        console.log(response);
        this.loadMoreSupportChats = false;
        if (response && response.success && response.roomID) {
          this.roomId = response.roomID;
          this.supportChatMessages = response.chats;
          this.totalResultSupportChatMessage = response.totalResults;
          this.serverResultSupportChatMessage = response.chats.length;
          this.supportChatMessages = this.supportChatMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
      }, error: (error: any) => {
        console.log(error);
        this.loadMoreSupportChats = false;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  getChatList() {
    this.isChatListLoaded = false;
    this.api.get_private('v1/vendor_web/chat_room/list/' + this.util.getItem('_uid')).subscribe({
      next: (response: any) => {
        this.isChatListLoaded = true;
        console.log(response);
        if (response && response.success) {
          this.chatList = response.chats;
          this.chatListDummy = response.chats;
        }
        console.log(this.chatList);
      }, error: (error: any) => {
        console.log(error);
        this.isChatListLoaded = true;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onChatSelect(item: VendorChatListInterface) {
    console.log(item);
    this.chatInitialize = true;
    this.receiverImages = [];
    this.receiverName = '';
    this.chatId = item.id;
    if (this.uid == item.senderId) {
      this.receiverId = item.receiverInfo.id;
      this.receiverImages.push(item.receiverInfo?.image);
      this.receiverName = `${item.receiverInfo?.firstName} ${item.receiverInfo?.lastName}`;
    } else {
      this.receiverId = item.senderInfo.id;
      this.receiverImages.push(item.senderInfo?.image);
      this.receiverName = `${item.senderInfo?.firstName} ${item.senderInfo?.lastName}`;
    }
    this.getRegularChatMessages();
  }

  getRegularChatMessages() {
    console.log(`Chat Id --> ${this.chatId}`);
    this.regularChatInitialize = false;
    const param = {
      'limit': this.pageSizeChatMessage,
      'page': this.currentPageChatMessage,
      'receiverId': this.receiverId,
      'senderId': this.uid
    };
    this.api.post_private('v1/vendor_web/chat_room/fetchMessages/', param).subscribe({
      next: (response: any) => {
        console.log(response);
        this.regularChatInitialize = true;

        if (response && response.success && response.roomID) {
          this.roomId = response.roomID;
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
        this.util.handleError(error, 'vendor');
      }
    });
  }

  getSupportChatMessages() {
    this.supportChatInitialize = false;
    const param = {
      'limit': this.pageSizeSupportChatMessage,
      'page': this.currentPageSupportChatMessage,
      'type': this.supportType,
      'typeId': this.supportTypeId,
      'user': this.util.getItem('_uid')
    };
    this.api.post_private('v1/vendor_web/support_chat_room/fetchMessages/', param).subscribe({
      next: (response: any) => {
        console.log(response);
        this.supportChatInitialize = true;

        if (response && response.success && response.roomID) {
          this.roomId = response.roomID;
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
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onSupportChatSelect(item: VendorSupportChatListInterface) {
    console.log(item);
    this.chatInitialize = true;
    this.receiverImages = [];
    this.receiverName = '';
    this.supportType = item.supportType;
    if (item.supportType == 'orders') {
      this.supportTypeId = item.orders;
    } else if (item.supportType == 'dining') {
      this.supportTypeId = item.booking;
    } else if (item.supportType == 'tiffin_subscription') {
      this.supportTypeId = item.purchaseSubscription;
    } else if (item.supportType == 'complaints') {
      this.supportTypeId = item.complaints;
    } else if (item.supportType == 'reports') {
      this.supportTypeId = item.reportIssue;
    } else if (item.supportType == 'restaurant_complaints') {
      this.supportTypeId = item.restaurantComplaints;
    }
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
      this.api.post_private('v1/vendor_web/chat_room/sendMessage/', serverParam).subscribe({
        next: (response: any) => {
          console.log(response);
        }, error: (error: any) => {
          console.log(error);
          this.util.handleError(error, 'vendor');
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
      this.api.post_private('v1/vendor_web/support_chat_room/sendMessage/', serverParam).subscribe({
        next: (response: any) => {
          console.log(response);
        }, error: (error: any) => {
          console.log(error);
          this.util.handleError(error, 'vendor');
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

}
