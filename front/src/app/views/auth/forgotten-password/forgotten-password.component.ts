import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-forgotten-password',
  templateUrl: './forgotten-password.component.html',
})
export class ForgottenPasswordComponent {
  constructor(private userService: UserService) { }

  email: string;
  poruka: string;

  ngOnInit(): void {
  }

  forgotPasswordRequest(){
    console.log("Zaboravljena lozinka - submit: START")
    let data  = {
      email: this.email
    }
    this.userService.forgotPasswordRequest(data).subscribe(ob=>{
        if(ob['message']=='poruka poslata'){
          alert('Privremeni link za promenu lozinke je poslat na vašu email adresu. Link je validan narednih 30 minuta.');
        } else{
          alert('Email ne postoji u bazi korisnika!');
        }
        console.log("Zaboravljena lozinka - submit: END")
      })
  }
}
