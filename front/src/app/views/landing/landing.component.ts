import { Component, OnInit } from "@angular/core";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-landing",
  templateUrl: "./landing.component.html",
})
export class LandingComponent implements OnInit {
  topMasters: any = [];
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getTop5masters().subscribe((data: any) => {
      this.topMasters = data['top5'];
      console.log(this.topMasters);
    });
  }
}
