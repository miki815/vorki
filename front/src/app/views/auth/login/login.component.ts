import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
})
export class LoginComponent implements OnInit {
  constructor() {}

  email: string = null;
  lozinka: string = null;
  poruka: string = null;


  ngOnInit(): void {
  
  }

  potvrdi(){
    alert(this.email);
    if(!this.email || !this.lozinka){
      this.poruka = "Niste uneli sve podatke."
    }
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
