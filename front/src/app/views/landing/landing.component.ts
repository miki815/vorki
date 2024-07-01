import { Component, OnInit } from "@angular/core";
import { UserService } from "src/app/services/user.service";
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: "app-landing",
  templateUrl: "./landing.component.html",
})
export class LandingComponent implements OnInit {
  topMasters: any = [];
  constructor(private userService: UserService,private cookieService: CookieService) {}
  login : number = 1;
  ngOnInit(): void {
    this.login = this.cookieService.get('token') ? 1 : 0;
    this.userService.getTop5masters().subscribe((data: any) => {
      this.topMasters = data['top5'];
      console.log(this.topMasters);
    });
  }
}
