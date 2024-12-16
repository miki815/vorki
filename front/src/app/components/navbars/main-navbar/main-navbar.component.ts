import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-main-navbar',
  templateUrl: './main-navbar.component.html',
})
export class MainNavbarComponent implements OnInit {
  navbarOpen = false;

  constructor(private router: Router, private cookieService: CookieService, private route: ActivatedRoute) { }

  ngOnInit(): void { }

  toggleMenu() {
    document.querySelector('.navbar').classList.toggle('active');
  }

  logout() {
    this.cookieService.delete('token', '/');
    this.router.navigate(['/autentikacija/prijava']);
  }

  navigateToProfile() {
    this.router.navigate(['/profil', this.cookieService.get('token')]);
  }

  navigateToJobListing() {
    this.router.navigate(['/oglasi']);
  }
}
