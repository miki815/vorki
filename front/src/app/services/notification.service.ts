import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SwPush } from "@angular/service-worker";
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private vapidPublicKey = 'BHTg9h9CX0rT_okcYjvkFRNXVFoPMSOVu99KjTfflvuMhz8iU8tgwzLfuglAQjTbBP6XgZT75JStZNHbX_rZ5Vg';
  uri = 'https://vorki.rs';
  // uri = 'http://127.0.0.1:4000'
  // uri = environment.apiUrl;
  readonly VAPID_PUBLIC_KEY = "BHTg9h9CX0rT_okcYjvkFRNXVFoPMSOVu99KjTfflvuMhz8iU8tgwzLfuglAQjTbBP6XgZT75JStZNHbX_rZ5Vg";

  constructor(private http: HttpClient, private swPush: SwPush) { }

  // subscribeToNotifications() {
  //   navigator.serviceWorker.ready
  //     .then((registration) => {
  //       return registration.pushManager.subscribe({
  //         userVisibleOnly: true,
  //         applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
  //       });
  //     })
  //     .then((subscription) => {
  //       console.log('Push subscription:', subscription);
  //       return this.http.post('http://127.0.0.1:4000/subscribe', subscription).toPromise();
  //     })
  //     .then(() => {
  //       console.log('Successfully subscribed to push notifications!');
  //     })
  //     .catch((error) => {
  //       console.error('Failed to subscribe to push notifications:', error);
  //     });
  // }

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

  subscribeToNotifications(userId: string) {
    if (!this.swPush.isEnabled) {
      console.error('Push notifications are not enabled');
      return;
    }

    this.swPush
      .requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY,
      })
      .then((subscription) => {
        const payload = {
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.toJSON().keys.p256dh,
          auth: subscription.toJSON().keys.auth,
        };

        this.http.post(`${this.uri}/save-subscription`, payload).subscribe({
          next: () => {
            console.log('Subscription saved successfully')
          },
          error: (err) => console.error('Failed to save subscription:', err),
        });
      })
      .catch((err) => console.error('Failed to subscribe to notifications:', err));
  }

  newJobNotification(data) {
    return this.http.post(`${this.uri}/subscriptions/get_related_subscribers`, data, { headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }) })
  }

  informMasterOfJob(data) {
    return this.http.post(`${this.uri}/subscriptions/inform_master_of_job`, data)
  }

  inform_user_of_master_accept_their_job(data) {
    return this.http.post(`${this.uri}/subscriptions/inform_user_of_master_accept_their_job`, data)
  }

  subscribe_to_notifications(data) {
    return this.http.post(`${this.uri}/subscriptions/subscribe`, data)
  }

  save_subscription(subscription, userId) {
    const payload = {
      user_id: userId,
      sub: subscription
    };
    return this.http.post(`${this.uri}/subscriptions/save_subscription`, payload);
  }

  unsubscribe_from_notifications(userId) {
    return this.http.post(`${this.uri}/subscriptions/unsubscribe`, { userId: userId });
  }

  trigger_event(eventData: string) {
    return this.http.post(`${this.uri}/subscriptions/trigger_event`, { eventData });
  }
}
