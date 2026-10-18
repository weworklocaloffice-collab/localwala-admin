import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subscription } from 'rxjs';
import { SupportTeamChatMessageInteface } from 'src/app/interfaces/support.team.chat.message.interface';
import { ApiService } from 'src/app/services/api-service';
import { ChatService } from 'src/app/services/chat-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-support-chat-message-widget',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgScrollbarModule],
  templateUrl: './support-chat-message-widget.html',
})
export class SupportChatMessageWidget implements OnDestroy {

  @ViewChild('chatMessageScroll') chatMessageScroll!: NgScrollbar;
  sidePanelOpened = true;
  uid: string = '';
  roomId: string = '';
  chatMessages: SupportTeamChatMessageInteface[] = [];
  private messageSubscription!: Subscription;
  private failedSubscription!: Subscription;
  private typingSubscription!: Subscription;
  private readSubscription!: Subscription;
  private heartbeat: any = null;
  otherPartyTyping = false;
  private lastTyperId: string | null = null;
  // Collision lock: other agents with this ticket open right now.
  viewers: any[] = [];
  private viewersPoll: any = null;
  handoverState: string = 'bot';
  priority: string = 'medium';
  slaDueAt: string | null = null;
  pendingTransfer: any = null;
  transferBusy: boolean = false;
  // Thread find: server-side match ids + jump/highlight.
  threadQuery: string = '';
  threadMatches: string[] = [];
  threadMatchIdx: number = -1;
  highlightId: string | null = null;
  private threadSearchDebounce: any = null;
  // Order picker: customer's recent entities; tap pins the ticket subject.
  recentOrders: any[] = [];
  pinBusy: boolean = false;
  assignedAgentName: string = '';
  orderSnapshot: any = null;
  // Every state change on the ticket appends here server-side. Agents and
  // supervisors previously had no way to see who touched a ticket, when it
  // was transferred, or whether the SLA breached.
  auditTrail: Array<{ action: string; at: string; by?: string; meta?: any }> = [];
  msg: string = '';
  isChatMessageLoaded: boolean = false;
  supportFor: string = '';
  supportForId: string = '';
  supportStarted: string = '';
  userId: string = '';
  userFirstName: string = '';
  userLastName: string = '';
  userImage: string = '';
  userRole: string = '';
  userMobile: string = '';
  userEmail: string = '';
  supportTeamFirstName: string = '';
  supportTeamLastName: string = '';
  supportTeamImage: string = '';
  haveRestaurantInfo: boolean = false;
  restaurantName: string = '';
  restaurantAddress: string = '';
  restaurantImage: string = '';
  restaurantOwnerName: string = '';
  restaurantOwnerEmail: string = '';
  restaurantOwnerPhone: string = '';
  restaurantOwnerType: string = '';
  orderNo: number = 0;
  orderGrandTotal: number = 0;
  orderType: string = '';
  orderStatus: string = 'created';
  bookingId: string = '';
  bookingGrandTotal: number = 0;
  bookingStatus: string = 'created';
  packageId: string = '';
  packageGrandTotal: number = 0;
  packageStatus: string = 'created';
  complaintId: string = '';
  complaintTitle: string = '';
  complaintBrief: string = '';
  complaintIssueWith: string = '';
  complaintReason: string = '';
  reportId: string = '';
  reportMessage: string = '';
  reportReason: string = '';
  loadMoreChats: boolean = false;
  pageSize: number = 10;
  currentPage: number = 0;
  totalResults: number = 0;
  serverResults: number = 0;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private chatService: ChatService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private dialog: MatDialog,
  ) {
    this.uid = this.util.getItem('_uid');
    this.roomId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.roomId != '') {
      this.getInitialDetail();
      // 1s ticker for the first-response countdown.
      if (!this.ticker) this.ticker = setInterval(() => { this.nowMs = Date.now(); }, 1000);
    } else {
      this.util.onError('ts_something_went_wrong', '');
    }
  }

  getInitialDetail() {
    const param: any = {
      'roomId': this.roomId,
      'supportTeam': this.uid,
      'limit': this.pageSize,
      'page': this.currentPage,
    };

    this.api.post_private('v1/support_team/chat_message_initial/', param).subscribe({
      next: (response: any) => {
        this.isChatMessageLoaded = true;
        if (response && response.success) {
          const detail = response.chats;
          const info = response.info;
          if (info && info._id && info._id != '') {
            this.supportFor = info.supportType;
            this.handoverState = info.handoverState || 'bot';
            this.priority = info.priority || 'medium';
            this.slaDueAt = info.slaDueAt || null;
            this.firstResponseAt = info.firstResponseAt || null;
            this.firstResponseDueAt = info.firstResponseDueAt || null;
            this.orderSnapshot = info.orderSnapshot || null;
            if (info.assignedAgent && info.assignedAgent.firstName) {
              this.assignedAgentName = `${info.assignedAgent.firstName} ${info.assignedAgent.lastName}`;
            }
            if (Array.isArray(info.audit)) {
              this.auditTrail = info.audit
                .slice()
                .sort((a: any, b: any) => new Date(b.at).getTime() - new Date(a.at).getTime());
            }
            // Transfer-with-accept: an offer naming THIS agent renders the
            // accept/decline banner; anything else is informational only.
            this.pendingTransfer = info.pendingTransfer || null;
            this.supportStarted = DateTime.fromISO(info.createdAt).setLocale(this.util.appLocaleName()).toFormat('MMM dd, yyyy hh:mm a');
            if (this.supportFor == 'orders') {
              this.supportForId = info.orders;
            } else if (this.supportFor == 'dining') {
              this.supportForId = info.booking;
            } else if (this.supportFor == 'tiffin_subscription') {
              this.supportForId = info.purchaseSubscription;
            } else if (this.supportFor == 'complaints') {
              this.supportForId = info.complaints;
            } else if (this.supportFor == 'reports') {
              this.supportForId = info.reportIssue;
            } else if (this.supportFor == 'restaurant_complaints') {
              this.supportForId = info.restaurantComplaints;
            }
          }

          const orderInfo = response.orderInfo;
          if (orderInfo && orderInfo != null && orderInfo.id && orderInfo.id != null && orderInfo.id != '') {
            this.orderNo = orderInfo.orderNo;
            this.orderGrandTotal = orderInfo.grandTotal;
            this.orderStatus = orderInfo.status;
            this.orderType = orderInfo.orderTo == 'homedelivery' ? this.util.appTranslate('home_delivery') : this.util.appTranslate('takeaway');
          }

          const bookingInfo = response.bookingInfo;
          if (bookingInfo && bookingInfo != null && bookingInfo.id && bookingInfo.id != null && bookingInfo.id != '') {
            this.bookingId = bookingInfo.id;
            this.bookingGrandTotal = bookingInfo.grandTotal;
            this.bookingStatus = bookingInfo.status;
          }

          const packageInfo = response.packageInfo;
          if (packageInfo && packageInfo != null && packageInfo.id && packageInfo.id != null && packageInfo.id != '') {
            this.packageId = packageInfo.id;
            this.packageGrandTotal = packageInfo.grandTotal;
            this.packageStatus = packageInfo.status;
          }

          const complaintInfo = response.complaintInfo;
          if (complaintInfo && complaintInfo != null && complaintInfo.id && complaintInfo.id != null && complaintInfo.id != '') {
            this.complaintId = complaintInfo.id;
            this.complaintTitle = complaintInfo.title;
            this.complaintBrief = complaintInfo.brief;
            this.complaintIssueWith = complaintInfo.issueWith;
            if (complaintInfo && complaintInfo.reasons && complaintInfo.reasons.id && complaintInfo.reasons.id != '') {
              this.complaintReason = complaintInfo.reasons.name;
              if (complaintInfo && complaintInfo.reasons && complaintInfo.reasons.translations && Array.isArray(complaintInfo.reasons.translations)) {
                if (complaintInfo.reasons.translations) {
                  const translation = complaintInfo.reasons.translations.find((t: any) => t.code == this.util.appLocaleName());
                  this.complaintReason = translation?.value || complaintInfo.reasons.name;
                }
              }
            }
          }

          const restaurantComplaintInfo = response.restaurantComplaintInfo;
          if (restaurantComplaintInfo && restaurantComplaintInfo != null && restaurantComplaintInfo.id && restaurantComplaintInfo.id != null && restaurantComplaintInfo.id != '') {
            this.complaintId = restaurantComplaintInfo.id;
            this.complaintTitle = restaurantComplaintInfo.title;
            this.complaintBrief = restaurantComplaintInfo.brief;
            this.complaintIssueWith = restaurantComplaintInfo.issueWith;
            if (restaurantComplaintInfo && restaurantComplaintInfo.reasons && restaurantComplaintInfo.reasons.id && restaurantComplaintInfo.reasons.id != '') {
              this.complaintReason = restaurantComplaintInfo.reasons.name;
              if (restaurantComplaintInfo && restaurantComplaintInfo.reasons && restaurantComplaintInfo.reasons.translations && Array.isArray(restaurantComplaintInfo.reasons.translations)) {
                if (restaurantComplaintInfo.reasons.translations) {
                  const translation = restaurantComplaintInfo.reasons.translations.find((t: any) => t.code == this.util.appLocaleName());
                  this.complaintReason = translation?.value || restaurantComplaintInfo.reasons.name;
                }
              }
            }
          }

          const reportInfo = response.reportInfo;
          if (reportInfo && reportInfo != null && reportInfo.id && reportInfo.id != null && reportInfo.id != '') {
            this.reportId = reportInfo.id;
            this.reportMessage = reportInfo.message;
            if (reportInfo && reportInfo.reasons && reportInfo.reasons.id && reportInfo.reasons.id != '') {
              this.reportReason = reportInfo.reasons.name;
              if (reportInfo && reportInfo.reasons && reportInfo.reasons.translations && Array.isArray(reportInfo.reasons.translations)) {
                if (reportInfo.reasons.translations) {
                  const translation = reportInfo.reasons.translations.find((t: any) => t.code == this.util.appLocaleName());
                  this.reportReason = translation?.value || reportInfo.reasons.name;
                }
              }
            }
          }

          const userInfo = response.userInfo;
          if (userInfo && userInfo.id && userInfo.id != '') {
            this.userId = userInfo.id;
            this.userEmail = userInfo.email;
            this.userFirstName = userInfo.firstName;
            this.userLastName = userInfo.lastName;
            this.userRole = userInfo.role;
            this.userImage = userInfo.image;
            this.userMobile = `+${userInfo.countryCode} ${userInfo.mobile}`;
          }
          const supportTeam = response.supportTeam;
          if (supportTeam && supportTeam.id && supportTeam.id != '') {
            this.supportTeamFirstName = supportTeam.firstName;
            this.supportTeamLastName = supportTeam.lastName;
            this.supportTeamImage = supportTeam.image;
          }

          const restaurantInfo = response.restaurantInfo;
          if (restaurantInfo && restaurantInfo != null && restaurantInfo.id != null && restaurantInfo.id != '') {
            this.haveRestaurantInfo = true;
            this.restaurantName = restaurantInfo.name;
            this.restaurantAddress = restaurantInfo.address;
            this.restaurantImage = restaurantInfo.cover;
            const userDetail = restaurantInfo.userInfo;
            if (userDetail && userDetail != null && userDetail.id != null && userDetail.id != '') {
              this.restaurantOwnerName = `${userDetail.firstName} ${userDetail.lastName}`;
              this.restaurantOwnerEmail = userDetail.email;
              this.restaurantOwnerPhone = `+${userDetail.countryCode} ${userDetail.mobile}`;
              this.restaurantOwnerType = userDetail.role;
            }

            if (response && response.restaurantInfo && response.restaurantInfo?.translations && Array.isArray(response.restaurantInfo?.translations)) {
              const translation = response.restaurantInfo.translations.find((t: any) => t.code == this.util.appLocaleName());
              this.restaurantName = translation?.title || response.restaurantInfo.name;
              this.restaurantAddress = translation?.address || response.restaurantInfo.address;
            }
          }

          this.chatMessages = detail.chats;
          this.chatMessages = this.chatMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          this.totalResults = detail.totalResults;
          this.serverResults = detail.chats.length;
          // Agent opened the thread: everything on screen is seen.
          this.markSeen();
          this.loadRecentOrders();
          setTimeout(() => {
            this.scrollToBottom();
          }, 2);

          // Subscribe ONCE for the life of the component. The old code called
          // disconnect()+resubscribe inside getInitialDetail, which tore down and
          // rebuilt the socket on every refresh and dropped messages in flight.
          if (!this.messageSubscription) {
            this.chatService.connectToServer(this.roomId);
            this.startHeartbeat();
            this.fetchViewers();
            if (!this.viewersPoll) {
              this.viewersPoll = setInterval(() => this.fetchViewers(), 15000);
            }
            this.loadMacros();
            this.messageSubscription = this.chatService.receiveMessage().subscribe((data: any) => {
              // Customer-side arrival: ping + toast so an agent on another
              // tab still notices. Own echoes stay silent.
              if (data && data.senderId && data.senderId !== this.uid) {
                this.pingNewMessage();
                // Customer wrote while we watch: seen immediately.
                this.markSeen(data.messageId || data.randomId);
                if (typeof document !== 'undefined' && document.hidden) {
                  const preview = String(data.message || '').slice(0, 80);
                  this.util.onInfo(`New customer message: ${preview}`, 'support_chat');
                }
              }
              const canonical: SupportTeamChatMessageInteface = {
                roomId: this.roomId,
                senderId: data.senderId,
                message: data.message,
                messageType: data.messageType,
                createdAt: data.currentDate,
                id: data.messageId || data.randomId,
                senderRole: 'agent',
                visibility: 'public',
                pending: false,
                sender: {
                  id: data.senderId,
                  image: data.senderCover || '',
                  firstName: data.senderFirstName || '',
                  lastName: data.senderLastName || '',
                  role: data.role,
                },
              };
              // Reconcile by randomId when this is our own optimistic echo,
              // otherwise just append.
              if (data.senderId === this.uid && this.chatMessages.some((m: any) => m.id === data.randomId && m.pending)) {
                this.reconcile(data.randomId, canonical);
              } else {
                this.chatMessages.push(canonical);
                this.scrollToBottom();
              }
            });

            this.failedSubscription = this.chatService.messageFailed().subscribe((data: any) => {
              const idx = this.chatMessages.findIndex((m: any) => m.id === data.randomId);
              if (idx > -1) {
                this.chatMessages.splice(idx, 1);
              }
              this.util.onError('ts_something_went_wrong', '');
            });

            this.typingSubscription = this.chatService.typingMessage().subscribe((data: any) => {
              if (data && data.chatRoomId === this.roomId && data.userId !== this.uid) {
                this.otherPartyTyping = !!data.isTyping;
                this.lastTyperId = data.isTyping ? data.userId : null;
              }
            });

            // Customer read our replies: flip own ticks to read.
            this.readSubscription = this.chatService.readReceipt().subscribe((data: any) => {
              if (data && data.chatRoomId === this.roomId) {
                let changed = false;
                for (const m of this.chatMessages) {
                  if (m.senderId === this.uid && m.readStatus !== 'read') {
                    m.readStatus = 'read';
                    changed = true;
                  }
                }
                if (changed) this.chatMessages = [...this.chatMessages];
              }
            });
          }
        }
      }, error: (error: any) => {
        this.isChatMessageLoaded = true;
        this.util.handleError(error, 'support-team');
      }
    });
  }

  getStatusColor(orderStatus: string) {
    const okOrderStatus = ['created', 'accepted', 'preparing'];
    const successOrderStatus = ['delivered', 'ready', 'handover', 'ongoing'];
    const failedOrderStatus = ['cancelled', 'rejected', 'refunded', 'partially_refunded', 'pending_payments'];
    if (okOrderStatus.includes(orderStatus)) {
      return 'primary';
    } else if (successOrderStatus.includes(orderStatus)) {
      return 'success';
    } else if (failedOrderStatus.includes(orderStatus)) {
      return 'error';
    }
    return 'warning';
  }

  onBack() {
    this.location.back();
  }

  isOver(): boolean {
    return window.matchMedia(`(max-width: 960px)`).matches;
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.failedSubscription) {
      this.failedSubscription.unsubscribe();
    }
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
    }
    if (this.readSubscription) {
      this.readSubscription.unsubscribe();
    }
    if (this.viewersPoll) {
      clearInterval(this.viewersPoll);
      this.viewersPoll = null;
    }
    if (this.ticker) {
      clearInterval(this.ticker);
      this.ticker = null;
    }
    // Free the collision lock without offlining: someone else may still be
    // working this ticket.
    this.api.post_private('v1/support_team/presence/leave-room', { agent: this.uid, roomId: this.roomId }).subscribe({
      error: () => {},
    });
    this.stopHeartbeat();
    this.chatService.disconnect();
  }

  // Collision lock: agents currently viewing this ticket (excluding self).
  // While locked the composer is read-only so two agents never answer the
  // same customer twice.
  private fetchViewers() {
    if (!this.roomId) return;
    this.api.get_private(`v1/support_team/chat/viewers/${this.roomId}`).subscribe({
      next: (response: any) => {
        const all = (response && response.viewers) || [];
        this.viewers = all.filter((v: any) => v.id !== this.uid);
      },
      error: () => {},
    });
  }

  get lockedBy(): any | null {
    return (this.viewers || []).length ? this.viewers[0] : null;
  }

  lockedByName(): string {
    const v = this.lockedBy;
    if (!v) return '';
    const name = `${v.firstName || ''} ${v.lastName || ''}`.trim();
    return name || 'Another agent';
  }

  typingLabel(): string {
    if (!this.otherPartyTyping) return '';
    if (this.lastTyperId && this.lastTyperId !== this.userId) {
      const v = (this.viewers || []).find((x: any) => x.id === this.lastTyperId);
      const name = v ? `${v.firstName || ''} ${v.lastName || ''}`.trim() : 'Another agent';
      return `${name || 'Another agent'} is replying`;
    }
    return this.util.appTranslate('typing');
  }

  ngAfterViewInit() {
    const viewport = this.chatMessageScroll.nativeElement;
    viewport.addEventListener('scrollend', () => {
      if (viewport.scrollTop <= 0) {
        this.loadMoreChatMessage();
      }
    }, { passive: true });
  }

  loadMoreChatMessage() {
    if (this.loadMoreChats || this.serverResults >= this.totalResults) return;
    this.loadMoreChats = true;
    // Append the NEXT page. The old code did `pageSize = pageSize * 2` and
    // re-requested page 0, re-downloading the whole thread each scroll and
    // discarding the scroll position (O(n^2) over the conversation).
    this.currentPage += 1;
    const param: any = {
      'roomId': this.roomId,
      'supportTeam': this.uid,
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    this.api.post_private('v1/support_team/fetche_more_result/', param).subscribe({
      next: (response: any) => {
        this.loadMoreChats = false;
        if (response && response.success) {
          const older = response.chats.chats || [];
          const seen = new Set(this.chatMessages.map((m: any) => m.id));
          const fresh = older.filter((m: any) => !seen.has(m.id));
          this.chatMessages = [...fresh, ...this.chatMessages].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          this.totalResults = response.chats.totalResults;
          this.serverResults = this.chatMessages.length;
        }
      }, error: (error: any) => {
        this.loadMoreChats = false;
        this.util.handleError(error, 'support-team');
      }
    });
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
    // Collision lock: a locked ticket is read-only — except supervisors, who
    // barge by design. Never send into another agent's conversation otherwise.
    if (this.lockedBy && !this.isSupervisor()) return;
    if (!this.msg || this.msg.trim() === '') return;
    const text = this.msg.trim();
    // One id, generated once, used for BOTH the optimistic bubble and the wire.
    // Previously the socket generated its own randomId and the view generated a
    // different one, so the same text landed in the DB twice with no way to tell
    // the copies apart.
    const randomId = `r${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

    this.msg = '';
    this.sendTyping(false);

    this.chatMessages.push(this.buildLocalMessage(this.uid, text, randomId, 'agent'));
    this.scrollToBottom();
    // Sending ends this agent's typing stream. The old `true` left the
    // customer's "agent is typing" indicator stuck on after every reply.
    this.sendTyping(false);

    // The socket persists AND emits (see api/src/index.js). The REST send is
    // deliberately NOT also fired — calling both wrote two rows per message.
    this.chatService.sendMessage(
      this.roomId,
      this.uid,
      text,
      randomId,
      this.supportTeamFirstName,
      this.supportTeamLastName,
      this.supportTeamImage
    );
  }

  // Canonical-shaped local echo. `pending` is dropped once the socket echoes back
  // the server-assigned messageId.
  private buildLocalMessage(senderId: string, message: string, id: string, senderRole: string): any {
    return {
      roomId: this.roomId,
      senderId,
      message,
      messageType: 'text',
      createdAt: DateTime.now().toISO(),
      id,
      senderRole,
      visibility: 'public',
      pending: true,
      sender: {
        id: senderId,
        image: this.supportTeamImage,
        firstName: this.supportTeamFirstName,
        lastName: this.supportTeamLastName,
        role: localStorage.getItem('_authRole') || '',
      },
    };
  }

  // No-asset notification ping (WebAudio two-tone). Browsers require a user
  // gesture before audio; failure is silent by design.
  private audioCtx: AudioContext | null = null;

  private pingNewMessage() {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      this.audioCtx = this.audioCtx || new AC();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume().catch(() => {});
      const t = this.audioCtx.currentTime;
      [880, 1320].forEach((freq, i) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.25, t + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 0.1);
        osc.connect(gain).connect(this.audioCtx!.destination);
        osc.start(t + i * 0.12);
        osc.stop(t + i * 0.12 + 0.12);
      });
    } catch {
      // Audio unavailable: toast still fires.
    }
  }

  // Reconcile an optimistic bubble with the server echo instead of appending a
  // second copy.
  private reconcile(randomId: string, canonical: any) {
    const idx = this.chatMessages.findIndex((m: any) => m.id === randomId && m.pending);
    if (idx > -1) {
      this.chatMessages[idx] = { ...this.chatMessages[idx], ...canonical, pending: false };
    } else {
      this.chatMessages.push(canonical);
    }
    this.scrollToBottom();
  }

  sendTyping(isTyping: boolean) {
    this.chatService.sendTyping(this.roomId, isTyping);
  }

  offeredToMe(): boolean {
    const to = this.pendingTransfer && (this.pendingTransfer.toAgent?._id || this.pendingTransfer.toAgent);
    return !!to && String(to) === String(this.uid) && !this.offerExpired();
  }

  offerExpired(): boolean {
    if (!this.pendingTransfer || !this.pendingTransfer.expiresAt) return false;
    return new Date(this.pendingTransfer.expiresAt).getTime() <= Date.now();
  }

  offeredByName(): string {
    const by = this.pendingTransfer && this.pendingTransfer.byAgent;
    if (!by) return '';
    const name = `${by.firstName || ''} ${by.lastName || ''}`.trim();
    return name || 'Another agent';
  }

  // Who the offer is waiting on. Populated only when the sender named the
  // receiver inline; otherwise we show the id's short form so a supervisor can
// // at least identify the ticket, not read "awaiting receiver" forever.
  pendingOfferName(): string {
    const to = this.pendingTransfer && (this.pendingTransfer.toAgentName || this.pendingTransfer.toAgent);
    if (!to) return '';
    if (typeof to === 'object') {
      const name = `${to.firstName || ''} ${to.lastName || ''}`.trim();
      if (name) return name;
      return String(to._id || '').slice(-6);
    }
    return String(to).slice(-6);
  }

  // Supervisor override on an offer addressed to someone else: drop the offer
  // so the ticket is not parked behind an agent who never answers.
  cancelOffer() {
    if (this.transferBusy) return;
    this.transferBusy = true;
    this.api.post_private(`v1/support_team/chat/transfer/${this.roomId}/cancel-offer`, {}).subscribe({
      next: () => {
        this.transferBusy = false;
        this.getInitialDetail();
      },
      error: (error: any) => {
        this.transferBusy = false;
        this.util.handleError(error, 'support-team');
      },
    });
  }

  // Supervisor takes the ticket directly while an offer is pending.
  takeOverOffered() {
    if (this.transferBusy) return;
    const to = this.pendingTransfer && this.pendingTransfer.toAgent;
    const toId = to && typeof to === 'object' ? to._id || to.id : to;
    if (!toId) {
      this.util.onError('ts_something_went_wrong', '');
      return;
    }
    this.transferBusy = true;
    this.api
      .post_private(`v1/support_team/chat/${this.roomId}/force-assign`, { toAgent: toId, reason: 'Supervisor takeover' })
      .subscribe({
        next: () => {
          this.transferBusy = false;
          this.getInitialDetail();
        },
        error: (error: any) => {
          this.transferBusy = false;
          this.util.handleError(error, 'support-team');
        },
      });
  }

  answerTransfer(accept: boolean) {
    if (this.transferBusy) return;
    this.transferBusy = true;
    const action = accept ? 'accept' : 'decline';
    this.api.post_private(`v1/support_team/chat/transfer/${this.roomId}/${action}`, {}).subscribe({
      next: () => {
        this.transferBusy = false;
        this.getInitialDetail();
      },
      error: (error: any) => {
        this.transferBusy = false;
        this.util.handleError(error, 'support-team');
      },
    });
  }

  // Everything currently on screen is seen by this agent. The server only
  // flips the other party's rows, so our own ticks never self-read.
  private markSeen(upTo?: string) {
    if (!this.roomId) return;
    const last = upTo || (this.chatMessages.length ? (this.chatMessages[this.chatMessages.length - 1].id || '') : '');
    if (!last) return;
    this.chatService.sendMessageRead(this.roomId, String(last));
  }

  // Thread find: server-side search inside this ticket, then jump + highlight.
  // Debounced so typing doesn't hammer the endpoint.
  onThreadQuery(value: string) {
    this.threadQuery = value;
    if (this.threadSearchDebounce) clearTimeout(this.threadSearchDebounce);
    if (!value || value.trim().length < 2) {
      this.threadMatches = [];
      this.threadMatchIdx = -1;
      this.highlightId = null;
      return;
    }
    this.threadSearchDebounce = setTimeout(() => {
      let params = new HttpParams().set('q', value.trim()).set('roomId', this.roomId).set('limit', 50);
      this.api.get_private(`v1/support_team/chat/search?${params.toString()}`).subscribe({
        next: (response: any) => {
          const matches = (response && response.matches) || [];
          this.threadMatches = matches.map((m: any) => m.messageId);
          this.threadMatchIdx = this.threadMatches.length ? 0 : -1;
          this.jumpToMatch();
        },
        error: () => {},
      });
    }, 400);
  }

  stepMatch(dir: number) {
    if (!this.threadMatches.length) return;
    this.threadMatchIdx = (this.threadMatchIdx + dir + this.threadMatches.length) % this.threadMatches.length;
    this.jumpToMatch();
  }

  clearThreadSearch() {
    this.threadQuery = '';
    this.threadMatches = [];
    this.threadMatchIdx = -1;
    this.highlightId = null;
  }

  // Audit export: cookie-authenticated download, so a plain navigation
  // carries the session (no token plumbing needed).
  exportTranscript() {
    if (!this.roomId) return;
    window.open(`${this.api.baseUrl}v1/support_team/chat/${this.roomId}/export`, '_blank');
  }

  loadRecentOrders() {
    if (!this.userId) return;
    this.api.get_private(`v1/support_team/user/${this.userId}/recent-orders`).subscribe({
      next: (response: any) => {
        this.recentOrders = (response && response.items) || [];
      },
      error: () => {},
    });
  }

  pinSubject(item: any) {
    if (!item || this.pinBusy) return;
    this.pinBusy = true;
    this.api.post_private(`v1/support_team/chat/${this.roomId}/pin-subject`, { kind: item.kind, entityId: item.id }).subscribe({
      next: () => {
        this.pinBusy = false;
        this.getInitialDetail();
      },
      error: (error: any) => {
        this.pinBusy = false;
        this.util.handleError(error, 'support-team');
      },
    });
  }

  private jumpToMatch() {
    if (this.threadMatchIdx < 0 || !this.threadMatches.length) {
      this.highlightId = null;
      return;
    }
    const id = this.threadMatches[this.threadMatchIdx];
    this.highlightId = id;
    setTimeout(() => {
      try {
        document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {
        // Message not on screen (older page): highlight applies when loaded.
      }
    }, 50);
  }

  onInputChange(value: string) {
    this.msg = value;
    this.sendTyping(!!value && value.trim() !== '');
    // A leading `/` turns the composer into a macro search. Anything else hides
    // the picker, including deleting the slash.
    this.macroQuery = value.startsWith('/') ? value.slice(1).trimStart() : null;
  }

  // --- Macros (`/` in the composer) ------------------------------------------
  // The bodies live in `CannedResponse` (seeded per locale) and are fetched
  // once when the workspace opens. Never inline the text here: an operator can
  // change the copy server-side and the agent sees it without a redeploy.
  macros: Array<{ intent: string; title: string; body: string }> = [];
  macroQuery: string | null = null;

  private loadMacros() {
    const locale = this.util.appLocaleName ? this.util.appLocaleName() : 'en';
    this.api.get_private(`v1/support_team/canned?locale=${locale}`).subscribe({
      next: (response: any) => {
        if (response && response.success && Array.isArray(response.canned)) {
          // Every active reply is pickable — seeded intents (greeting, …)
          // included. The old `macro_` prefix filter hid all of them, so
          // `/g` never offered Greeting.
          this.macros = response.canned;
        }
      },
      error: () => {
        // Macros are a convenience. A failed fetch must not interrupt typing.
      },
    });
  }

  filteredMacros() {
    if (this.macroQuery === null) return [];
    const q = this.macroQuery.toLowerCase();
    return this.macros
      .filter((m) => !q || m.title.toLowerCase().includes(q) || m.intent.toLowerCase().includes(q))
      .slice(0, 6);
  }

  useMacro(macro: { title: string; body: string }) {
    this.msg = macro.body;
    this.macroQuery = null;
  }

  dismissMacros() {
    this.macroQuery = null;
  }

  // --- Internal note (agent-only, never shown to the customer) ---------------
  internalNoteMode = false;

  toggleInternalNote() {
    this.internalNoteMode = !this.internalNoteMode;
    this.msg = '';
  }

  saveInternalNote() {
    if (!this.msg || this.msg.trim() === '') return;
    const text = this.msg.trim();
    this.msg = '';
    const spinnerRef = this.util.start();
    this.api
      .post_private(`v1/support_team/chat/internal_note/${this.roomId}`, {
        sender: this.uid,
        note: text,
      })
      .subscribe({
        next: (response: any) => {
          this.util.stop(spinnerRef);
          if (response && response.success) {
            this.chatMessages.push(this.buildLocalMessage(this.uid, text, `n${Date.now()}`, 'agent'));
            this.chatMessages[this.chatMessages.length - 1].visibility = 'internal';
            this.scrollToBottom();
          }
        },
        error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'support-team');
        },
      });
  }

  // --- Duplicate detection ---------------------------------------------------
  // Suggestions only. Merging is supervisor-only and always an explicit click:
  // a score is a hint, never an automatic action on a customer's ticket.
  dupSuggestions: any[] = [];
  dupBusy = false;
dupOpen = false;

  // `Math` is not reachable from an Angular template, so the score is rounded
  // here rather than inline in the markup.
  pct(score: number): number {
    return Math.round((score || 0) * 100);
  }

  checkDuplicates() {
    if (!this.roomId || this.dupBusy) return;
    this.dupBusy = true;
    this.api.get_private(`v1/support_team/chat/${this.roomId}/duplicates`).subscribe({
      next: (r: any) => {
        this.dupBusy = false;
        this.dupSuggestions = (r && r.suggestions) || [];
        this.dupOpen = true;
      },
      error: (error: any) => {
        this.dupBusy = false;
        this.util.handleError(error, 'support-team');
      },
    });
  }

  mergeInto(targetId: string) {
    if (!targetId || this.dupBusy) return;
    this.dupBusy = true;
    this.api.post_private(`v1/support_team/chat/${this.roomId}/merge`, { into: targetId }).subscribe({
      next: () => {
        this.dupBusy = false;
        this.dupOpen = false;
        this.dupSuggestions = [];
        this.getInitialDetail();
      },
      error: (error: any) => {
        this.dupBusy = false;
        this.util.handleError(error, 'support-team');
      },
    });
  }

  unmerge() {
    if (!this.roomId || this.dupBusy) return;
    this.dupBusy = true;
    this.api.post_private(`v1/support_team/chat/${this.roomId}/unmerge`, {}).subscribe({
      next: () => {
        this.dupBusy = false;
        this.getInitialDetail();
      },
      error: (error: any) => {
        this.dupBusy = false;
        this.util.handleError(error, 'support-team');
      },
    });
  }

  // --- Transfer to another agent --------------------------------------------
  transferDialogOpen = false;
  transferAgentId = '';
  transferReason = '';
  transferAgents: any[] = [];

  openTransferDialog() {
    this.transferAgentId = '';
    this.transferReason = '';
    this.transferDialogOpen = true;
    // Live roster: only online agents with headroom. An ID textbox made this
    // feature dummy — nobody knows ObjectIds by heart.
    this.api.get_private('v1/support_team/agents/online').subscribe({
      next: (response: any) => {
        this.transferAgents = (response && response.agents) || [];
      },
      error: () => {},
    });
  }

  confirmTransfer(direct = false) {
    if (!this.transferAgentId || this.transferAgentId.trim() === '') {
      this.util.onError('ts_something_went_wrong', '');
      return;
    }
    const spinnerRef = this.util.start();
    // Supervisors move directly (no offer step); agents offer. The server
    // enforces the right independently of this flag.
    const url = direct
      ? `v1/support_team/chat/${this.roomId}/force-assign`
      : `v1/support_team/chat/transfer/${this.roomId}`;
    this.api
      .post_private(url, {
        toAgent: this.transferAgentId.trim(),
        reason: this.transferReason,
      })
      .subscribe({
        next: (response: any) => {
          this.util.stop(spinnerRef);
          this.transferDialogOpen = false;
          if (response && response.success) {
            // An offer (not a move): reload so the "awaiting receiver"
            // banner reflects the pending state.
            this.getInitialDetail();
          }
        },
        error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'support-team');
        },
      });
  }

  isSupervisor(): boolean {
    return (localStorage.getItem('_authRole') || '') === 'supportSupervisor';
  }

  onScroll(event: any) {
  }

  getDateFormatted(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('LLL dd, yyyy');
  }

  getAuditTime(at: string) {
    if (!at) return '-';
    return DateTime.fromISO(at).setLocale(this.util.appLocaleName()).toFormat('dd LLL hh:mm a');
  }

  auditLabel(action: string): string {
    // Raw actions are `bot:greeting`-style machine strings. Agents need words.
    if (!action) return '-';
    if (action.startsWith('bot:')) return `${this.util.appTranslate('bot')} · ${action.slice(4)}`;
    const known: Record<string, string> = {
      assigned: this.util.appTranslate('assigned_agent'),
      handover: this.util.appTranslate('handover'),
      transfer: this.util.appTranslate('transfer'),
      resolved: this.util.appTranslate('resolved'),
      reopened: this.util.appTranslate('reopened'),
      'agent-reply': this.util.appTranslate('reply'),
      'sla:breach': `SLA ${this.util.appTranslate('breached')}`,
      'queued:no-agent': this.util.appTranslate('tab_unassigned'),
      'queued:offline': this.util.appTranslate('tab_unassigned'),
      'queued:wip-limit': this.util.appTranslate('tab_unassigned'),
      csat: 'CSAT',
    };
    return known[action] || action;
  }

  // Heartbeat while the workspace is open.
  //
  // The server only rotates agents whose `AgentPresence.online` is fresh, and
  // the cron clears anything quiet for 60s. Without this the agent is never in
  // the rotation at all, so tickets queue unassigned forever.
  private startHeartbeat() {
    this.beatOnline();
    this.heartbeat = setInterval(() => this.beatOnline(), 30000);
  }

  private beatOnline() {
    this.api
      .post_private('v1/support_team/presence/heartbeat', { agent: this.uid, roomId: this.roomId })
      .subscribe({
        error: () => {
          // Never surface this: a failed heartbeat must not interrupt typing.
        },
      });
  }

  private stopHeartbeat() {
    if (this.heartbeat) {
      clearInterval(this.heartbeat);
      this.heartbeat = null;
    }
    // Navigating away from a thread is not logging out. Offline is posted
    // only on real logout; otherwise closing a ticket falsely offlines the
    // agent and the sweep requeues their assigned chats.
  }

  slaMinutes(): number | null {
    if (!this.slaDueAt) return null;
    return Math.round(DateTime.fromISO(this.slaDueAt).diff(DateTime.now(), 'minutes').minutes);
  }

  slaLabel(): string {
    const mins = this.slaMinutes();
    if (mins === null) return '-';
    if (mins < 0) return `${Math.abs(mins)}m over`;
    if (mins < 60) return `${mins}m left`;
    return `${Math.round(mins / 60)}h left`;
  }

  isSlaBreached(): boolean {
    const mins = this.slaMinutes();
    return mins !== null && mins < 0;
  }

  // First-response countdown: seconds left to send the first reply (30s
  // after assignment). Null once replied or unassigned. Ticks via `nowMs`.
  nowMs: number = Date.now();
  private ticker: any = null;
  firstResponseAt: string | null = null;
  firstResponseDueAt: string | null = null;

  frSecondsLeft(): number | null {
    if (this.firstResponseAt || !this.firstResponseDueAt) return null;
    return Math.round((new Date(this.firstResponseDueAt).getTime() - this.nowMs) / 1000);
  }

  frLabel(): string {
    const s = this.frSecondsLeft();
    if (s === null) return '';
    if (s < 0) return `first reply ${Math.abs(s)}s overdue`;
    return `first reply in 0:${String(s).padStart(2, '0')}`;
  }

  getBookingStatusColor(bookingStatus: string) {
    const okBookingStatus = ['created', 'accepted', 'preparing'];
    const successBookingStatus = ['completed'];
    const failedBookingStatus = ['cancelled', 'rejected', 'refunded', 'partially_refunded', 'pending_payments'];
    if (okBookingStatus.includes(bookingStatus)) {
      return 'primary';
    } else if (successBookingStatus.includes(bookingStatus)) {
      return 'success';
    } else if (failedBookingStatus.includes(bookingStatus)) {
      return 'error';
    }
    return 'warning';
  }

  getPackageStatusColor(orderStatus: string) {
    const okOrderStatus = ['created'];
    const successOrderStatus = ['completed'];
    const failedOrderStatus = ['cancelled', 'refunded', 'partially_refunded', 'pending_payments'];
    if (okOrderStatus.includes(orderStatus)) {
      return 'primary';
    } else if (successOrderStatus.includes(orderStatus)) {
      return 'success';
    } else if (failedOrderStatus.includes(orderStatus)) {
      return 'error';
    }
    return 'warning';
  }

  onOrderDetail() {
    this.router.navigate(['support-team/u/order-detail', this.supportForId]);
  }

  onBookingDetail() {
    this.router.navigate(['support-team/u/dining-booking', this.supportForId]);
  }

  onTiffinPurchaseDetail() {
    this.router.navigate(['support-team/u/tiffin-purchase-detail', this.supportForId]);
  }

  resolveSupportChat() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_mark_chat_resolved', subTitle: 'ts_mark_chat_resolved_instruction', okTitle: 'ts_resolved_chat', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action && result.action == "confirm") {
        const param = {
          'id': this.roomId,
          'team': this.uid,
        }
        const spinnerRef = this.util.start();
        this.api.post_private('v1/support_team/resolve_support_chat/', param).subscribe({
          next: (response: any) => {
            this.util.stop(spinnerRef);
            this.onBack();
          }, error: (error: any) => {
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'support-team');
          }
        });
      }
    });
  }

  forceResolveSupportChat() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'Force close this ticket?', subTitle: 'Supervisor close, audited as forced.', okTitle: 'Force close', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action && result.action == "confirm") {
        const spinnerRef = this.util.start();
        this.api.post_private(`v1/support_team/chat/${this.roomId}/force-resolve`, { reason: 'supervisor close' }).subscribe({
          next: () => {
            this.util.stop(spinnerRef);
            this.onBack();
          }, error: (error: any) => {
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'support-team');
          }
        });
      }
    });
  }

  exportSupportChat() {
    const spinnerRef = this.util.start();
    this.api.get_private('v1/support_team/export_chats/' + this.roomId).subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_exported');
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'support-team');
      }
    });
  }

}
