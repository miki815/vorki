import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-main-navbar',
  templateUrl: './main-navbar.component.html',
})
export class MainNavbarComponent implements OnInit {
  navbarOpen = false;
  login: number = 1;

  constructor(private router: Router, private cookieService: CookieService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.login = this.cookieService.get('userId') ? 1 : 0;
    // this.login = 1;
  }

  toggleMenu() {
    document.querySelector('.navbar').classList.toggle('active');
  }

  logout() {
    this.cookieService.delete('token', '/');
    this.cookieService.delete('userId', '/');
    this.router.navigate(['/autentikacija/prijava']);
  }

  navigate_to_login() {
    this.router.navigate(['/autentikacija/prijava']);
  }

  navigate_to_register() {
    this.router.navigate(['/autentikacija/registracija']);
  }

  navigateToProfile() {
    if(this.login == 1) this.router.navigate(['/profil', this.cookieService.get('userId')]);
    else this.router.navigate(['/autentikacija/prijava']);
  }

  navigateToJobListing() {
    this.router.navigate(['/izbor-kategorije']);
  }

  navigateToAddJob() {
    if(this.login == 1) this.router.navigate(['/dodaj_oglas']);
    else this.router.navigate(['/autentikacija/prijava']);
  }
}
