import { Component, OnInit } from "@angular/core";
import { UserService } from "src/app/services/user.service";
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: "app-landing",
  templateUrl: "./landing.component.html",
  styleUrls: ["./landing.component.css"],
})



export class LandingComponent implements OnInit {
  topMasters: any = [];
  nameAndSurname: string = ""
  contact: string = ""
  message: string = ""
  msg: string = "";
  sentMsg: string = "";

  constructor(private userService: UserService, private cookieService: CookieService) { }
  login: number = 1;
  ngOnInit(): void {
    this.login = this.cookieService.get('token') ? 1 : 0;
    this.userService.getTop5masters().subscribe((data: any) => {
      this.topMasters = data['top5'];
      console.log(this.topMasters);
    });
  }

  send() {
    console.log('Support - submit: START')
    if (!this.nameAndSurname || !this.contact || !this.message) {
      this.msg = "Niste uneli sve podatke.";
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

}
