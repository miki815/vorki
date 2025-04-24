import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { CookieService } from 'ngx-cookie-service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-main-navbar',
  templateUrl: './main-navbar.component.html',
})
export class MainNavbarComponent implements OnInit {
  navbarOpen = false;
  login: number = 1;
  menuOpen = false;
  notificationsEnabled = false;
  showAnimation = true;
  readonly VAPID_PUBLIC_KEY = "BHTg9h9CX0rT_okcYjvkFRNXVFoPMSOVu99KjTfflvuMhz8iU8tgwzLfuglAQjTbBP6XgZT75JStZNHbX_rZ5Vg";
  userId: string = "";
  userType: string = "";


  constructor(private router: Router, private cookieService: CookieService, private route: ActivatedRoute, private notificationService: NotificationService, private swPush: SwPush, private userService: UserService) { }

  ngOnInit(): void {
    this.login = this.cookieService.get('userId') ? 1 : 0;
    this.userId = this.cookieService.get('userId');
    this.userType = this.cookieService.get('userType');

    const savedState = localStorage.getItem('notificationsEnabled');
    this.userService.isUserSubscribed().subscribe({
      next: response => this.notificationsEnabled = response['subscribed'],
      error: error => console.error('Failed to check if user is subscribed', error)
    });
    setTimeout(() => {
      this.showAnimation = false;
    }, 5000);
    // this.notificationsEnabled = savedState === 'true';
  }

  toggleMenu() {
    //document.querySelector('.navbar').classList.toggle('active');
    this.menuOpen = !this.menuOpen;
  }

  toggleNotifications() {
    this.notificationsEnabled = !this.notificationsEnabled;
    localStorage.setItem('notificationsEnabled', this.notificationsEnabled.toString());
    if (this.notificationsEnabled) {
      this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      }).then(sub => {
        console.log('Sending subscription to server', sub);
        this.notificationService.save_subscription(sub, this.cookieService.get('userId')).subscribe({
          next: response => console.log('Subscription sent to server successfully', response),
          error: error => console.error('Failed to send subscription to server', error)
        });
      })
    } else {
      this.notificationService.unsubscribe_from_notifications(this.cookieService.get('userId')).subscribe({
        next: response => console.log('Subscription removed from server', response),
        error: error => console.error('Failed to remove subscription from server', error)
      });
      // this.swPush.subscription.subscribe(sub => {
      //   if (sub) {
      //     this.notificationService.unsubscribe_from_notifications(sub).subscribe({
      //       next: response => console.log('Subscription removed from server', response),
      //       error: error => console.error('Failed to remove subscription from server', error)
      //     });

      //     // Zatim brišemo pretplatu iz browsera
      //     sub.unsubscribe().then(() => console.log('Unsubscribed from push notifications'))
      //       .catch(err => console.error('Error unsubscribing', err));
      //   }
      // });
    }
  }

  logout() {
    this.cookieService.delete('token', '/');
    this.cookieService.delete('userId', '/');
    localStorage.removeItem('notificationsEnabled');
    localStorage.removeItem('token');
    this.router.navigate(['/autentikacija/prijava']);
  }

  navigate_to_login() {
    this.router.navigate(['/autentikacija/prijava']);
  }

  navigate_to_register() {
    this.router.navigate(['/autentikacija/registracija']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  navigateToProfile() {
    if (this.login == 1) this.router.navigate(['/profil', this.cookieService.get('userId')]);
    else this.router.navigate(['/autentikacija/prijava']);
  }

  navigateToJobListing() {
    this.router.navigate(['/izbor-kategorije']);
  }

  navigateToAddJob() {
    if (this.login == 1) this.router.navigate(['/dodaj_oglas']);
    else this.router.navigate(['/autentikacija/prijava']);
  }
}
