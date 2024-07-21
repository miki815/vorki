import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { UserService } from "src/app/services/user.service";
import * as bcrypt from 'bcryptjs';

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
})
export class LoginComponent{
  constructor(private userService: UserService, private router: Router, private http: HttpClient,private cookieService: CookieService) { }

  email: string = null;
  password: string = null;
  message: string = null;

  async hashPassword(plainPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainPassword, salt);
  }

  submit(){
    console.log("Login - submit: START")

    // VERIFY
    if(!this.email || !this.password){ this.message = "Niste uneli sve podatke."; return; }

    // SEND
    this.hashPassword(this.password).then(hashedPassword => {
      const data = { email: this.email,password: hashedPassword}
      this.userService.login(data).subscribe((message: any) => {
        if (message['error'] == "0") {
          this.cookieService.set('token', JSON.stringify(message['message']), 30, '/');
          this.router.navigate(["pocetna"]);
          return;
        } else {  this.message = message['message'];}
      })
      console.log("Login - submit: END")
    })
   
  }
  
}
