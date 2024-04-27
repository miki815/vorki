import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-navbar',
  imports: [],
  templateUrl: './main-navbar.component.html',
})
export class MainNavbarComponent implements OnInit {
  navbarOpen = false;

  constructor() { }

  ngOnInit(): void { }

  setNavbarOpen() {
    this.navbarOpen = !this.navbarOpen;
  }
}
