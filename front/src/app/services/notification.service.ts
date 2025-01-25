import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private vapidPublicKey = 'BHTg9h9CX0rT_okcYjvkFRNXVFoPMSOVu99KjTfflvuMhz8iU8tgwzLfuglAQjTbBP6XgZT75JStZNHbX_rZ5Vg';
  uri = 'https://vorki.rs';
  // uri = 'http://127.0.0.1:4000'

  constructor(private http: HttpClient) {}

  subscribeToNotifications() {
    navigator.serviceWorker.ready
      .then((registration) => {
        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
        });
      })
      .then((subscription) => {
        console.log('Push subscription:', subscription);
        return this.http.post('http://127.0.0.1:4000/subscribe', subscription).toPromise();
      })
      .then(() => {
        console.log('Successfully subscribed to push notifications!');
      })
      .catch((error) => {
        console.error('Failed to subscribe to push notifications:', error);
      });
  }

  saveSubscription(subscription, userId) {
    const payload = {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    };

    return this.http.post(`${this.uri}/save-subscription`, payload);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  triggerEvent(eventData: string) {
    return this.http.post(`${this.uri}/trigger-event`, { eventData });
  }
}
