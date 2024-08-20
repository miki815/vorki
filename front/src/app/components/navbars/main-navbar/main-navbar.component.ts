import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-main-navbar',
  templateUrl: './main-navbar.component.html',
})
export class MainNavbarComponent implements OnInit {
  navbarOpen = false;

  constructor( private router: Router,private cookieService: CookieService) { }

  ngOnInit(): void { }

  setNavbarOpen() {
    this.navbarOpen = !this.navbarOpen;
  }
  logout(){
    this.cookieService.delete('token', '/');
    // window.location.reload(); 
    this.router.navigate(['/autentikacija/prijava']);
  }
  navigateToProfile() {
    // var id = this.cookieService.get('token');
    this.router.navigate(['/profil',  this.cookieService.get('token')]);
  }
}
