import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { UserService } from "src/app/services/user.service";
// import * as bcrypt from 'bcryptjs';

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private userService: UserService, private router: Router, private http: HttpClient, private cookieService: CookieService) { }

  email: string = null;
  password: string = null;
  message: string = null;

  // async hashPassword(plainPassword: string): Promise<string> {
  //   const salt = await bcrypt.genSalt(10);
  //   return await bcrypt.hash(plainPassword, salt);
  // }



  submit() {
    console.log("Login - submit: START")

    if (!this.verifyRequest()) return;

    // SEND
    const data = { email: this.email, password: this.password }
    this.userService.login(data).subscribe((response: any) => {
      if (response['error'] == "0") {
        // this.cookieService.set('token', JSON.stringify(response['id']), 30, '/');
        this.cookieService.set('token', response['token'], 30, '/');
        this.cookieService.set('userId', response['userId'], 30, '/');
        this.cookieService.set('userType', response['userType'], 30, '/');
        localStorage.setItem('token', response['token']);
        this.router.navigate(["pocetna"]);
      } else { this.message = response['message']; }
    })
    console.log("Login - submit: END")
  }

  verifyRequest() {
    if (!this.email || !this.password) { this.message = "Niste uneli sve podatke."; return false; }
    return true;
  }

}
