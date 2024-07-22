import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-forgotten-password',
  templateUrl: './forgotten-password.component.html',
  styleUrl: '../register/register.component.css'
})
export class ForgottenPasswordComponent {
  constructor(private userService: UserService) { }

  email: string;
  message: string;
  messageSucc: string;

  submit(){
    console.log("Zaboravljena lozinka - submit: START")
    // TODO: Proveriti da li postoji email pomocu getUserByEmail mozda
    if(!this.verifyRequest()){this.message = 'Unesite email.';}
    let data  = { email: this.email }
    this.userService.forgotPasswordRequest(data).subscribe(response=>{
        if(response['error']=='0'){
          this.messageSucc = 'Privremeni link za promenu lozinke je poslat na Vašu email adresu. Link je validan narednih 30 minuta.'
          return;
        }
        this.message = 'Email ne postoji u bazi korisnika!';

        console.log("Zaboravljena lozinka - submit: END")
      })
  }

  verifyRequest(){ 
    if(!this.email) return false; 
    return true;
  }
}
