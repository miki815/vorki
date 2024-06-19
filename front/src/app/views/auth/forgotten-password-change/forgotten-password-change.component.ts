import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-forgotten-password-change',
  templateUrl: './forgotten-password-change.component.html',
})
export class ForgottenPasswordChangeComponent implements OnInit {
  constructor(private route: ActivatedRoute, private userService: UserService, private router: Router) { }

  token: string;
  errorMsg: string;
  email: string;
  lozinka_nova: string;
  lozinka_nova2: string;
  linkValidan: boolean = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.token = params.get('reset_token');
      console.log(this.token);
    })
    this.userService.tokenValidation({ token: this.token }).subscribe(ob => {
      if (ob['poruka'] == 'Vreme isteklo') {
        //  alert('Link vise ne vazi')
      } else {
        this.linkValidan = true;
        this.email = ob['email'];
        console.log(this.email)
      }
    });
  }

  changeForgottenPassword() {
    console.log("Zaboravljena lozinka - promena: START")
    if (this.lozinka_nova == '' || this.lozinka_nova2 == '')
      this.errorMsg = "Molimo vas da unesete sva trazena polja.";
    else if (this.lozinka_nova != this.lozinka_nova2) this.errorMsg = 'Lozinke se ne poklapaju.';
    else if (this.lozinka_nova.match(/^(?=.*\d)(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z][a-zA-Z0-9!@#$%^&*]{7,15}$/)) {
      this.errorMsg = '';
      this.userService.changeForgottenPassword({email: this.email, password: this.lozinka_nova}).subscribe(res => {
        if (res['poruka'] == 'Lozinka promenjena') {
          alert('Lozinka promenjena! Molimo Vas da se ulogujete ponovo.');
          sessionStorage.removeItem('user')
          this.router.navigate(['../']);
        }
      })
    } else {
      this.errorMsg = "Nova lozinka mora da sadrzi 8-16 karaktera, bar jedno veliko slovo, \
      broj i specijalni karakter i mora pocinjati slovom.";
    }
    console.log("Zaboravljena lozinka - promena: END")
  }
}
