import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList, OnInit } from '@angular/core';
import { UserService } from "src/app/services/user.service";
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from "@angular/router";
import { SwPush } from "@angular/service-worker";
import { HttpClient } from "@angular/common/http";
import { JobService } from 'src/app/services/job.service';


@Component({
  selector: "app-landing",
  templateUrl: "./landing.component.html",
  styleUrls: ["./landing.component.css"],
})



export class LandingComponent implements OnInit, AfterViewInit {
  topMasters: any = [];
  nameAndSurname: string = ""
  contact: string = ""
  message: string = ""
  msg: string = "";
  sentMsg: string = "";
  isSubscribed: boolean = false;
  userId: string = "";
  searchQuery: string = '';
  topJobs: any[] = [];
  readonly VAPID_PUBLIC_KEY = "BHTg9h9CX0rT_okcYjvkFRNXVFoPMSOVu99KjTfflvuMhz8iU8tgwzLfuglAQjTbBP6XgZT75JStZNHbX_rZ5Vg";
  // uri = 'http://127.0.0.1:4000'
  uri: string = 'https://vorki.rs';

  @ViewChildren('fadeSection', { read: ElementRef }) sectionsElements!: QueryList<ElementRef>;

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target); // opcionalno, ako ne želiš da se ponavlja
          }
        });
      },
      { threshold: 0.1 } // 10% sekcije mora biti vidljivo
    );

    this.sectionsElements.forEach((section) => {
      observer.observe(section.nativeElement);
    });
  }

  constructor(private userService: UserService, private cookieService: CookieService, private router: Router, private route: ActivatedRoute, private swPush: SwPush, private http: HttpClient, private jobService: JobService) { }
  login: number = 1;
  ngOnInit(): void {
    this.login = this.cookieService.get('userId') ? 1 : 0;
    this.userId = this.cookieService.get('userId');
    this.userService.getTop5masters().subscribe((data: any) => {
      this.topMasters = data['top5'];
      console.log(this.topMasters);
    });
  }

  send() {
    console.log('Support - submit: START')
    if (!this.nameAndSurname || !this.contact || !this.message) {
      this.msg = "Niste popunili sva polja.";
      return;
    }
    if ((!/^381\d{8,9}$/.test(this.contact.slice(1)) || this.contact[0] != "+")
      && !/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(this.contact)) { this.msg = "Mobilni telefon ili email nije u dobrom formatu. \n Format broja telefona: +381xxxxxxxxx"; return; }
    this.msg = "";
    const data = {
      contact: this.contact,
      message: this.message,
      nameAndSurname: this.nameAndSurname
    }
    console.log(data);
    this.userService.support(data).subscribe((response: any) => {
      if (response['message'] == "0") {
        this.sentMsg = "Naš tim je primio vašu poruku. Odgovorićemo vam u najkraćem roku.";
        return;
      } else {
        this.msg = "Problemi sa serverom. Molimo vas pokušajte kasnije.";
      }
      console.log('Support - submit: END')
    });
  }

  subscribeToNotifications() {
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
          next: () => {
            console.log('Subscription saved successfully')
            this.isSubscribed = true;
          },
          error: (err) => console.error('Failed to save subscription:', err),
        });
      })
      .catch((err) => console.error('Failed to subscribe to notifications:', err));
  }

  category_navigation(id: number) {
    this.router.navigate(['/kategorija', id]);
  }

  searchJobs() {
    if (!this.searchQuery.trim()) {
      this.topJobs = [];
      return;
    }
    this.jobService.getTop3Jobs(this.searchQuery).subscribe((data: any) => {
      this.topJobs = data['jobs'];
      console.log(this.topJobs);
    });
  }

  job_navigation(id: number) {
    console.log(id + " id");
    this.router.navigate(['/oglasi', id]);
  }

}
