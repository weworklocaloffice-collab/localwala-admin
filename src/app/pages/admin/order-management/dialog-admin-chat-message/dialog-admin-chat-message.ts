import { HttpParams } from '@angular/common/http';
import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subscription } from 'rxjs';
import { AdminRegularChatConversionInterface } from 'src/app/interfaces/admin.regular.chat.conversion.interface';
import { ApiService } from 'src/app/services/api-service';
import { ChatService } from 'src/app/services/chat-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-dialog-admin-chat-message',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgScrollbarModule],
  templateUrl: './dialog-admin-chat-message.html',
})
export class DialogAdminChatMessage {

  @ViewChild('chatMessageScroll') chatMessageScroll!: NgScrollbar;
  uid: string = '';
  receiver: string = '';
  email: string = '';
  image: string = '';
  mobile: string = '';
  fullMobile: string = '';
  name: string = '';
  role: string = '';
  isLoading: boolean = false;
  pageSize: number = 100;
  currentPage: number = 0;
  totalResultChatMessage: number = 0;
  serverResultChatMessage: number = 0;
  roomID: string = '';
  chats: AdminRegularChatConversionInterface[] = [];
  loadMoreChats: boolean = false;
  private messageSubscription!: Subscription;
  msg: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    public dialogRef: MatDialogRef<DialogAdminChatMessage>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private chatService: ChatService,
  ) {
    this.uid = this.util.getItem('_uid');
    console.log(this.data);
    const formatMobileNumber = (number: string): string => {
      const cleanNumber = number.replace(/\D/g, '');
      return cleanNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    };
    this.receiver = this.data.id;
    this.email = this.data.email;
    this.image = this.data.image;
    this.mobile = `+${this.data.countryCode}-${formatMobileNumber(this.data.mobile)}`;
    this.fullMobile = `+${this.data.countryCode}${this.data.mobile}`;
    this.name = this.data.name;
    if (this.data.role == 'user') {
      this.role = this.util.appTranslate('user');
    } else if (this.data.role == 'driver') {
      this.role = this.util.appTranslate('system_deliveryman');
    } else if (this.data.role == 'vendor') {
      this.role = this.util.appTranslate('restaurant');
    } else if (this.data.role == 'vendorDriver') {
      this.role = this.util.appTranslate('vendor_deliveryman');
    } else if (this.data.role == 'vendorOutlet') {
      this.role = this.util.appTranslate('restaurant_outlet');
    } else if (this.data.role == 'cityMaster') {
      this.role = this.util.appTranslate('cityzen_team');
    } else if (this.data.role == 'supportTeam') {
      this.role = this.util.appTranslate('support_team');
    } else if (this.data.role == 'guest') {
      this.role = this.util.appTranslate('dd_guest');
    } else if (this.data.role == 'waiter') {
      this.role = this.util.appTranslate('waiter');
    } else if (this.data.role == 'accountant') {
      this.role = this.util.appTranslate('accountant_team');
    } else if (this.data.role == 'kitchen') {
      this.role = this.util.appTranslate('kitchen_owner');
    }
    this.getChatMessage();
  }

  onClose() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.chatService.disconnect();
    this.dialogRef.close();
  }

  getChatMessage() {
    const param = {
      'senderId': this.uid,
      'receiverId': this.receiver,
      'limit': this.pageSize,
      'page': this.currentPage,
    }
    this.isLoading = true;
    this.api.post_private('v1/admin/chat_room/fetch_messages/', param).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoading = false;
        if (response && response.success && response.roomID) {
          this.roomID = response.roomID;
          this.totalResultChatMessage = response.totalResults;
          this.serverResultChatMessage = response.chats.length;
          this.chats = response.chats;
          this.chats = this.chats.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          setTimeout(() => this.scrollToBottom(), 100);
          if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
            this.chatService.disconnect();
          }

          this.chatService.connectToServer(this.roomID);

          this.messageSubscription = this.chatService.receiveMessage().subscribe((data: any) => {
            console.log('Message received: ', data);

            const param = {
              "roomId": this.roomID,
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
              this.chats.push(param);
            }
            setTimeout(() => this.scrollToBottom(), 100);
          });
        }
      }, error: (error: any) => {
        this.isLoading = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

  scrollToBottom(): void {
    try {
      if (this.chatMessageScroll) {
        this.chatMessageScroll.scrollTo({ bottom: 0, duration: 300 });
      }
    } catch (err) {
      console.error('Scrolling failed:', err);
    }
  }

  loadMoreMessages() {
    if (this.serverResultChatMessage < this.totalResultChatMessage) {
      this.pageSize = Number(this.pageSize) * 2;
      const param: any = {
        'limit': this.pageSize,
        'page': this.currentPage,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.loadMoreChats = true;
      this.api.get_private('v1/admin/regular_chat_messages/' + this.roomID + '?' + httpParams.toString()).subscribe({
        next: (response: any) => {
          console.log(response);
          this.loadMoreChats = false;
          if (response && response.success && response.roomId) {
            this.roomID = response.roomId;
            this.chats = response.chats;
            this.totalResultChatMessage = response.totalResults;
            this.serverResultChatMessage = response.chats.length;
            this.chats = this.chats.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          }
        }, error: (error: any) => {
          console.log(error);
          this.loadMoreChats = false;
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  ngAfterViewInit() {
    const viewportChatMessages = this.chatMessageScroll.nativeElement;
    viewportChatMessages.addEventListener('scrollend', () => {
      if (viewportChatMessages.scrollTop <= 0) {
        console.log(`----- Load More Messages -----`);
        this.loadMoreMessages();
      }
    }, { passive: true });
  }

  getDateFormatted(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('LLL dd, yyyy');
  }

  sendMessage() {
    console.log(`send message --> ${this.msg}`);
    if (this.msg && this.msg != null && this.msg != '') {
      const randomId = Date.now().toString();
      this.chatService.sendMessage(this.roomID, this.uid, this.msg, randomId, this.util.getItem('_authFirstName'), this.util.getItem('_authLastName'), this.util.getItem('_authCoverImage'));
      const param = {
        "roomId": this.roomID,
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
      this.chats.push(param);
      this.scrollToBottom();
      const serverParam = {
        'room': this.roomID,
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
    }
  }

  ngOnDestroy() {
    console.log('destroy');
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.chatService.disconnect();
  }

}
