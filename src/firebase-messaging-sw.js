/* Localwala support-panel web push: background handler only.
 * Foreground messages are handled in-app (toast + ping). Loaded by the
 * browser as the FCM service worker, NOT bundled by Angular.
 */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyA4BW3io5UddoBVZ7qkotFz-vfLPFLjdVI',
  authDomain: 'localwala-2efe6.firebaseapp.com',
  projectId: 'localwala-2efe6',
  messagingSenderId: '341203696703',
  appId: '1:341203696703:web:dbf4640e0b3a3f665bcc8a',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'Support chat';
  const body = (payload.notification && payload.notification.body) || 'New customer message';
  const url =
    (payload.data && payload.data.url) ||
    (payload.data && payload.data.roomId ? `/support-team/u/message/${payload.data.roomId}` : '/support-team/u/agent-queue');
  self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico',
    data: { url },
    tag: (payload.data && payload.data.roomId) || 'support-chat',
    renotify: true,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/support-team/u/agent-queue';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (w.url.includes('/support-team')) {
          w.navigate(url);
          return w.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
