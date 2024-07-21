import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UserService } from "src/app/services/user.service";
import * as bcrypt from 'bcryptjs';

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  constructor(private userService: UserService, private router: Router) { }

  username: string = null;
  name: string = null;
  surname: string = null;
  birthday: Date = null;
  telephone: string = null;
  location: string = null;
  type: string = null;
  password: string = null;
  password1: string = null;
  policy: boolean = null;
  email: string = null;
  message: string = null;
  cities: any;

  ngOnInit(): void {
    console.log('Register - ngOnInit: START')

    this.getCities();

    console.log('Register - ngOnInit: END')
  }

  getCities(){
    console.log('Register - getCities: START')

    fetch('assets/city.json')
    .then(response => response.json())
    .then(cities => {
      this.cities = cities.sort((a, b) => a.city.localeCompare(b.city)); 
      this.location = this.cities[0].city;
    })
    .catch(error => {
      console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje gradiva):', error);
    });

    console.log('Register - getCities: END')
  }


  async hashPassword(plainPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainPassword, salt);
  }
  
  submit() {
    console.log('Register - submit: START')
    
    // VERIFY
    if (!this.username || !this.name || !this.surname || !this.birthday || !this.policy ||
      !this.telephone || !this.location || (!this.type) || !this.password || !this.password1 || !this.email) {
      this.message = "Niste uneli sve podatke."; return;
    }
    if (this.username.length < 3) { this.message = "Korisničko name je prekratko, mora imati najmanje 3 karaktera."; return; }
    if (this.name.length < 2) { this.message = "Ime je prekratko, mora imati najmanje 2 karaktera."; return; }
    if (this.surname.length < 2) { this.message = "Prezime je prekratko, mora imati najmanje 2 karaktera."; return; }
    if (new Date(this.birthday).getFullYear() < 1930) { this.message = "Unesite ispravno godinu rođenja."; return; }
    if (new Date(this.birthday) > new Date((new Date()).getFullYear() - 18, (new Date()).getMonth(), (new Date()).getDate())) { this.message = "Morate biti punoletni."; return; }
    if (!/^381\d{8,9}$/.test(this.telephone.slice(1)) || this.telephone[0] != "+") { this.message = "Mobilni telefon nije u dobrom formatu. Format: +381XXXXXXXXX"; return; }
    if (! /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{6,}$/.test(this.password)) {
      this.message = "Lozinka mora imati barem \
      jedno malo slovo, jedno veliko slovo, jedan broj i jedan specijalni (@#$%^&*()\-_=+{};:,<.>) karakter. Lozinka mora\
      imati najmanje 6 karaktera."; return;
    }
    if (this.password != this.password1) { this.message = "Lozinke nisu iste."; return; }
    if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(this.email)) { this.message = "Email nije u dobrom formatu."; return; }
    
    // SEND
    fetch('assets/backPhoto.txt')
    .then(response => response.text())
    .then(backPhoto => {
      this.hashPassword(this.password).then(hashedPassword => {
        const data = {
          username: this.username,
          firstname: this.name,
          lastname: this.surname,
          password: hashedPassword,
          birthday: this.birthday,
          phone: this.telephone,
          location: this.location,
          type: this.type,
          email: this.email.toLowerCase(),
          backPhoto: backPhoto
        }
  
        this.userService.register(data).subscribe((message: any) => {
          if (message['message'] == "0") {
            this.router.navigate(["/autentikacija/prijava"]);
          } else {
            this.message = message['message'];
          }
          console.log('Register - submit: END')
        })
      });   
    }) 
  }

}
