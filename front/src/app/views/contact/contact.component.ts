import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { SwPush } from "@angular/service-worker";
import { CookieService } from "ngx-cookie-service";
import { NotificationService } from "src/app/services/notification.service";
import { UserService } from "src/app/services/user.service";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  readonly VAPID_PUBLIC_KEY = "BHTg9h9CX0rT_okcYjvkFRNXVFoPMSOVu99KjTfflvuMhz8iU8tgwzLfuglAQjTbBP6XgZT75JStZNHbX_rZ5Vg";
  // uri = 'http://127.0.0.1:4000'
  uri: string = 'https://vorki.rs';
  // uri: string = environment.uri;
  userId: string;
  name: string = "";
  email: string = "";
  message: string = "";
  infoMsg: string = "";
  constructor(private swPush: SwPush, private http: HttpClient, private notificationService: NotificationService, private cookieService: CookieService, private userService: UserService) { }

  ngOnInit() {
    this.userId = this.cookieService.get('userId');
    // console.log("Subscribe to notifications")

    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker.register('/ngsw-worker.js')
    //     .then(reg => {
    //       console.log('Service Worker registered', reg);
    //       this.unsubscribeFromNotifications();
    //       this.subscribeToNotifications();
    //     })
    //     .catch(err => console.error('Service Worker registration failed', err));
    // }
    // else console.error('Service Worker not supported');

    Notification.requestPermission().then(permission => {
      //   console.log(permission);
    });

  }

  subscribe() {
    console.log("Button clicked");
    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker.register('/ngsw-worker.js')
    //     .then(reg => {
    //       console.log('Service Worker registered', reg);
    //       // this.unsubscribeFromNotifications();
    //       this.subscribeToNotifications();
    //     })
    //     .catch(err => console.error('Service Worker registration failed', err));
    // }
    // else console.error('Service Worker not supported');
    this.subscribeToNotifications();


    Notification.requestPermission().then(permission => {
      console.log(permission);
    });
  }

  subscribeToNotifications() {
    console.log("subscribeToNotifications called");
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
      .then(sub => {
        console.log("Subscription successful", sub);
        this.notificationService.subscribe_to_notifications(sub).subscribe({
          next: response => console.log('Subscription sent to server successfully', response),
          error: error => console.error('Failed to send subscription to server', error)
        });
      })
      .catch(err => {
        console.error('Subscription failed:', err);
      });
    //  this.notificationService.subscribeToNotifications();
  }


  unsubscribeFromNotifications() {
    // Prvo proveri da li postoji pretplata, pa je obriši
    this.swPush.subscription.subscribe(sub => {
      if (sub) {
        sub.unsubscribe().then(() => {
          console.log('Successfully unsubscribed from push notifications');
          // Opcionalno, obriši pretplatu sa servera ako je potrebno
          // this.http.post('http://localhost:4000/unsubscribe', { endpoint: sub.endpoint }).subscribe({
          //   next: response => console.log('Unsubscribed from server', response),
          //   error: error => console.error('Failed to unsubscribe from server', error)
          // });
        }).catch(err => console.error('Error unsubscribing:', err));
      } else {
        console.log('No active subscription found');
      }
    });
  }

  subscribeToNotifications2() {
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
          user_id: this.userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.toJSON().keys.p256dh,
          auth: subscription.toJSON().keys.auth,
        };

        this.http.post(`${this.uri}/save-subscription`, payload).subscribe({
          next: () => console.log('Subscription saved successfully'),
          error: (err) => console.error('Failed to save subscription:', err),
        });
      })
      .catch((err) => console.error('Failed to subscribe to notifications:', err));
  }

  triggerEvent() {
    const eventData = 'Test event triggered';
    this.notificationService.trigger_event(eventData).subscribe({
      next: () => console.log('Event triggered successfully'),
      error: (err) => console.error('Failed to trigger event:', err),
    });
  }

  send() {
    if (!this.name || !this.email || !this.message) {
      this.infoMsg = "Niste popunili sva polja.";
      return;
    }
    // if ((!/^381\d{8,9}$/.test(this.contact.slice(1)) || this.contact[0] != "+")
    //   && !/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(this.contact)) { this.msg = "Mobilni telefon ili email nije u dobrom formatu. \n Format broja telefona: +381xxxxxxxxx"; return; }
    this.infoMsg = "";
    const data = {
      contact: this.email,
      message: this.message,
      nameAndSurname: this.name
    }
    this.userService.support(data).subscribe((response: any) => {
      if (response['message'] == "0") {
        this.infoMsg = "Naš tim je primio Vašu poruku. Odgovorićemo Vam u najkraćem roku.";
        return;
      } else {
        this.infoMsg = "Problemi sa serverom. Molimo vas pokušajte kasnije.";
      }
    });
  }
}
