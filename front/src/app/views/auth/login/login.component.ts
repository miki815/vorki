import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
})
export class LoginComponent implements OnInit {
  constructor(private userService: UserService, private router: Router, private http: HttpClient,private cookieService: CookieService) { }

  email: string = null;
  lozinka: string = null;
  poruka: string = null;


  ngOnInit(): void {}

  potvrdi(){
    console.log("Login - submit: START")

    // Provera
    if(!this.email || !this.lozinka){ this.poruka = "Niste uneli sve podatke."; return; }

    //Pakovanje
    const data = { email: this.email,password: this.lozinka}

    //Slanje
    this.userService.login(data).subscribe((message: any) => {
      if (message['error'] == "0") {
        this.cookieService.set('token', JSON.stringify(message['message']), 30, '/');
        this.router.navigate(["profile"]);
        return;
      } else {  this.poruka = message['message'];}
    })

    console.log("Login - submit: END")
  }
  
  
  
  test(){
    console.log("Prijava - test: START")
    var rezultati = [];
    var provera = [0,-1, -1]
    fetch('assets/login_test.json')
    .then(response => response.json())
    .then(testovi1 => {
      testovi1.forEach((test) => {
        if(!this.email || !this.lozinka){
          rezultati.push(-1);
        }
        else{ rezultati.push(0);}
      });

      if (rezultati.length !== provera.length) {
        alert("Prijava - test: FAILED")
        console.log("Prijava - test: FAILED");
        return;
      }
      if (rezultati.every((element, index) => element === provera[index])) {
        alert("Prijava - test: FAILED")
        console.log("Prijava - test: FAILED");
        return;
      }
      alert("Prijava - test: PASS");
      console.log("Prijava - test: END")
    })
    .catch(error => {
      console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje login):', error);
    });
  }
}
