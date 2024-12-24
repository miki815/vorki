import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { SwPush } from "@angular/service-worker";

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  readonly VAPID_PUBLIC_KEY = "BLrt-N6o0uHdZQa46XzurPIuZq822yuJBOuaVV4C-jVBURwIZsepPODSxZUaH0Bpl9s3HxGHpmxSjEgonCuu6rI";

  constructor(private swPush: SwPush, private http: HttpClient) { }

  ngOnInit() {
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

    // Notification.requestPermission().then(permission => {
    //   console.log(permission);
    // });

  }

  subscribe() {
    console.log("Button clicked");
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/ngsw-worker.js')
        .then(reg => {
          console.log('Service Worker registered', reg);
          // this.unsubscribeFromNotifications();
          this.subscribeToNotifications();
        })
        .catch(err => console.error('Service Worker registration failed', err));
    }
    else console.error('Service Worker not supported');

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
        this.http.post('http://localhost:4000/subscribe', sub).subscribe({
          next: response => console.log('Subscription sent to server successfully', response),
          error: error => console.error('Failed to send subscription to server', error)
        });
      })
      .catch(err => {
        console.error('Subscription failed:', err);
      });
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
}
