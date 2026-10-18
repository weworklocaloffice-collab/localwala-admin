import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // ONE socket for the whole app. The previous version built a new `io()` on
  // every connectToServer() call, so opening a second ticket left the first
  // one subscribed and receiving broadcasts it should never have seen.
  private socket: Socket | null = null;
  private joinedRoom: string | null = null;

  constructor(private zone: NgZone) { }

  private ensureSocket(): Socket {
    if (this.socket && this.socket.connected) return this.socket;
    if (this.socket) return this.socket;

    this.socket = io(environment.apiUrl, {
      transports: ['websocket'],
      autoConnect: false,
      // The Admin panel is cookie-authenticated (api-service uses
      // withCredentials). Without this the handshake carries no cookie and the
      // server's `io.use(jwtVerify)` rejects the socket as unauthorized.
      withCredentials: true,
    });

    return this.socket;
  }

  connectToServer(chatRoomId: string) {
    const socket = this.ensureSocket();

    if (!socket.connected) {
      socket.connect();
    }

    // Re-join after (re)connect. joinRoom used to fire once at construction, so
    // a socket that dropped and came back stayed in no room at all.
    socket.on('connect', () => {
      if (this.joinedRoom) {
        socket.emit('joinRoom', { chatRoomId: this.joinedRoom });
      }
    });

    // Leave the previous room explicitly, otherwise the agent keeps receiving
    // messages from the ticket they just navigated away from.
    if (this.joinedRoom && this.joinedRoom !== chatRoomId) {
      socket.emit('leaveRoom', { chatRoomId: this.joinedRoom });
    }

    this.joinedRoom = chatRoomId;
    socket.emit('joinRoom', { chatRoomId });
  }

  sendMessage(chatRoomId: string, senderId: string, message: string, randomId: string, firstName: string, lastName: string, cover: string) {
    if (!this.socket) return;
    const authRole = localStorage.getItem('_authRole');
    this.socket.emit('sendMessage', {
      chatRoomId,
      senderId,
      message,
      authRole,
      randomId,
      'senderFirstName': firstName,
      'senderLastName': lastName,
      'senderCover': cover
    });
  }

  receiveMessage(): Observable<any> {
    return new Observable((observer) => {
      const socket = this.ensureSocket();
      const handler = (data: any) => {
        // Socket callbacks land outside Angular's zone, so a subscriber that
        // updates a template silently fails to re-render.
        this.zone.run(() => observer.next(data));
      };
      socket.on('receiveMessage', handler);
      // Previously the listener was added and never removed, so every
      // subscribe() added another one and each message was delivered N times.
      return () => socket.off('receiveMessage', handler);
    });
  }

  sendTyping(chatRoomId: string, isTyping: boolean) {
    if (!this.socket) return;
    this.socket.emit('typing', { chatRoomId, isTyping });
  }

  sendMessageRead(chatRoomId: string, upToMessageId: string) {
    if (!this.socket) return;
    this.socket.emit('messageRead', { chatRoomId, upToMessageId });
  }

  readReceipt(): Observable<any> {
    return new Observable((observer) => {
      const socket = this.ensureSocket();
      const handler = (data: any) => this.zone.run(() => observer.next(data));
      socket.on('messageRead', handler);
      return () => socket.off('messageRead', handler);
    });
  }

  typingMessage(): Observable<any> {
    return new Observable((observer) => {
      const socket = this.ensureSocket();
      const handler = (data: any) => this.zone.run(() => observer.next(data));
      socket.on('typing', handler);
      return () => socket.off('typing', handler);
    });
  }

  // Server could not persist the message. The subscriber drops its optimistic
  // bubble so a failed send is never left sitting in the transcript looking
  // delivered.
  messageFailed(): Observable<any> {
    return new Observable((observer) => {
      const socket = this.ensureSocket();
      const handler = (data: any) => this.zone.run(() => observer.next(data));
      socket.on('messageFailed', handler);
      return () => socket.off('messageFailed', handler);
    });
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      if (this.joinedRoom) {
        this.socket.emit('leaveRoom', { chatRoomId: this.joinedRoom });
      }
      this.joinedRoom = null;
      this.socket.disconnect();
      this.socket = null;
    }
  }
}