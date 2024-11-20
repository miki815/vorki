import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { SwPush } from "@angular/service-worker";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  readonly VAPID_PUBLIC_KEY = "BLrt-N6o0uHdZQa46XzurPIuZq822yuJBOuaVV4C-jVBURwIZsepPODSxZUaH0Bpl9s3HxGHpmxSjEgonCuu6rI";

  constructor(private swPush: SwPush, private http: HttpClient) { }

  ngOnInit() {
    console.log("Subscribe to notifications")

    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker.register('/ngsw-worker.js')
    //     .then(reg => {
    //       console.log('Service Worker registered', reg);
    //     //  this.subscribeToNotifications();
    //     })
    //     .catch(err => console.error('Service Worker registration failed', err));
    // }

    // Notification.requestPermission().then(permission => {
    //   console.log(permission);
    // });

  }

  subscribeToNotifications() {
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
      .then(sub => {
        console.log("Subscription successful", sub);
        this.http.post('https://vorki.rs/subscribe', sub).subscribe();
      })
      .catch(err => {
        console.error('Subscription failed:', err);
      });
  }
}
