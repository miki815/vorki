import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
// import * as bcrypt from 'bcryptjs';

@Component({
  selector: 'app-forgotten-password-change',
  templateUrl: './forgotten-password-change.component.html',
  styleUrl: '../register/register.component.css'
})
export class ForgottenPasswordChangeComponent implements OnInit {
  constructor(private route: ActivatedRoute, private userService: UserService, private router: Router) { }

  token: string = '';
  message: string = '';
  messageSucc: string = '';
  email: string = '';
  password: string = '';
  password2: string = '';
  // linkValidan: boolean = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.token = params.get('reset_token');
      this.validate();
    })
  }

  validate() {
    this.userService.tokenValidation({ token: this.token }).subscribe(response => {
      if (response['error'] == '1') {
        this.message = response["message"];
        return;
      }
      else if (response['error'] == '2') {
        this.router.navigate(['../../autentikacija/prijava']);
      }
      // this.linkValidan = true;
      this.email = response['email'];
    });
  }

  async hashPassword(plainPassword: string): Promise<string> {
    // const salt = await bcrypt.genSalt(10);
    // return await bcrypt.hash(plainPassword, salt);
    return "hashedPasswordTODO";
  }

  submit() {
    console.log("Zaboravljena lozinka - promena: START")

    if (!this.validateRequest()) { return; }
    this.hashPassword(this.password).then(hashedPassword => {
      this.userService.changeForgottenPassword({ email: this.email, password: hashedPassword }).subscribe(res => {
        if (res['error'] == '0') {
          this.messageSucc = 'Lozinka promenjena! Molimo Vas da se ulogujete ponovo.';
          this.password = '';
          this.password2 = '';
          sessionStorage.removeItem('user')
          //this.router.navigate(['../../autentikacija/prijava']);
        }
      })
    });

    console.log("Zaboravljena lozinka - promena: END")
  }

  validateRequest() {
    if (this.password == '' || this.password2 == '') { this.message = "Molimo vas da unesete sva trazena polja."; return false; }
    if (this.password.length < 8) {
      this.message = "Lozinka mora imati najmanje 8 karaktera.";
      return false;
    }
    if (this.password != this.password2) { this.message = "Lozinke nisu iste."; return false; }
    // if (!this.password.match(/^(?=.*\d)(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z][a-zA-Z0-9!@#$%^&*]{7,15}$/)) {
    //   this.message = "Lozinka mora imati barem \
    //   jedno malo slovo, jedno veliko slovo, jedan broj i jedan specijalni (@#$%^&*()\-_=+{};:,<.>) karakter. Lozinka mora\
    //   imati najmanje 6 karaktera.";
    //   return false;
    // }
    return true;
  }
}
