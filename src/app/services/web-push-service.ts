import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { environment } from 'src/environments/environment';
import { ApiService } from './api-service';
import { UtilService } from './util-service';

/**
 * Web push for support agents. Registers the browser's FCM token once per
 * login; foreground arrivals ping + toast (tap opens the thread), background
 * arrivals are rendered by firebase-messaging-sw.js. Everything no-ops until
 * `environment.vapidKey` is set and notification permission is granted.
 */
@Injectable({ providedIn: 'root' })
export class WebPushService {
  private started = false;

  constructor(
    private api: ApiService,
    private util: UtilService,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  async start() {
    if (this.started) return;
    this.started = true;
    try {
      if (!(await isSupported())) return;
      if (!environment.vapidKey) return;
      if (!('Notification' in window) || Notification.permission === 'denied') return;
      if (Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') return;
      }
      if (!getApps().length) initializeApp(environment.firebase);
      // The SW must be registered by us: getToken does not do it, and
      // without a registration there is no push subscription at all.
      let registration: ServiceWorkerRegistration | undefined;
      try {
        if ('serviceWorker' in navigator) {
          registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        }
      } catch {
        registration = undefined;
      }
      const messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: environment.vapidKey,
        ...(registration ? { serviceWorkerRegistration: registration } : {}),
      });
      if (token) {
        this.api
          .post_private('v1/support_team/push/web-token', {
            agent: localStorage.getItem('_uid') || '',
            token,
          })
          .subscribe({ error: () => {} });
      }
      onMessage(messaging, (payload: any) => {
        const title = payload?.notification?.title || 'Support chat';
        const body = payload?.notification?.body || 'New customer message';
        const roomId = payload?.data?.roomId || '';
        // Ping: reuse the thread widget's two-tone if audible context exists.
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.45);
        } catch {
          // Audio unavailable: toast still fires.
        }
        const toast = this.toastr.info(`${title}: ${body}`, 'support_chat', {
          positionClass: 'toast-top-right',
          timeOut: 12000,
          progressBar: true,
        });
        if (toast && toast.onTap && roomId) {
          toast.onTap.subscribe(() => this.router.navigate(['support-team/u/message', roomId]));
        }
      });
    } catch {
      // Push is best-effort: panel works fully without it.
    }
  }
}
