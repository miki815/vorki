import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
})
export class RegisterComponent implements OnInit {

  korisnickoIme: string = null;
  ime: string = null;
  prezime: string = null;
  datumRodjenja: Date = null;
  brojTelefona: string = null;
  mesto: string = "Beograd";
  type: string = null;
  lozinka: string = null;
  lozinka1: string = null;
  politika: boolean = null;
  email: string = null;
  poruka: string = null;
  gradovi: any;

  constructor(private userService: UserService, private router: Router, private http: HttpClient) { }


  ngOnInit(): void {
    console.log('Register - ngOnInit: START')

    fetch('assets/city.json')
      .then(response => response.json())
      .then(gradovi => {
        this.gradovi = gradovi;
        this.gradovi.sort((a, b) => a.city.localeCompare(b.city)); 

      })
      .catch(error => {
        console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje gradiva):', error);
      });

    console.log('Register - ngOnInit: END')
  }

  potvrdi() {
    console.log('Register - submit: START')

    // Provera
    if (!this.korisnickoIme || !this.ime || !this.prezime || !this.datumRodjenja || !this.politika ||
      !this.brojTelefona || !this.mesto || (!this.type) || !this.lozinka || !this.lozinka1 || !this.email) {
      this.poruka = "Niste uneli sve podatke."; return;
    }
    if (this.korisnickoIme.length < 3) { this.poruka = "Korisničko ime je prekratko."; return; }
    if (this.ime.length < 3) { this.poruka = "Ime je prekratko."; return; }
    if (this.prezime.length < 3) { this.poruka = "Prezime je prekratko."; return; }
    if (this.datumRodjenja > new Date((new Date()).getFullYear() - 18, (new Date()).getMonth(), (new Date()).getDate())) { this.poruka = "Morate biti punoletni."; return; }
    if (!/^381\d{8,9}$/.test(this.brojTelefona.slice(1)) || this.brojTelefona[0] != "+") { this.poruka = "Mobilni telefon nije u dobrom formatu."; return; }
    if (! /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{6,}$/.test(this.lozinka)) {
      this.poruka = "Lozinka mora imati barem \
      jedno malo slovo, barem jedno veliko slovo, barem jedan broj i barem jedan specijalni karakter. Lozinka mora\
      imati najmanje 6 karaktera."; return;
    }
    if (this.lozinka != this.lozinka1) { this.poruka = "Lozinke nisu iste. Pokušajte ponovo."; return; }
    if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(this.email)) { this.poruka = "Email nije u dobrom formatu."; return; }
    
    fetch('assets/backPhoto.txt')
    .then(response => response.text())
    .then(backPhoto => {
      //Pakovanje
    const data = {
      username: this.korisnickoIme,
      firstname: this.ime,
      lastname: this.prezime,
      password: this.lozinka,
      birthday: this.datumRodjenja,
      phone: this.brojTelefona,
      location: this.mesto,
      type: this.type,
      email: this.email,
      backPhoto: backPhoto
    }

    this.userService.register(data).subscribe((message: any) => {
      if (message['message'] == "0") {
        this.router.navigate(["/autentikacija/prijava"]);
        return;
      } else {
        this.poruka = message['message'];
      }
      console.log('Register - submit: END')
    })
    })
    
  }

  test() {
    console.log("Registracija - test: START")
    var testovi;
    var rezultati = [];
    var provera = [0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 3, 4, 5, 6, 6, 6, 6, 6, 7]
    fetch('assets/register_test.json')
      .then(response => response.json())
      .then(testovi1 => {
        testovi = testovi1;
        testovi.forEach((test, index) => {
          if (!test["korisnickoIme"] || !test["ime"] || !test["prezime"] || !test["datumRodjenja"] || !test["politika"] ||
            !test["brojTelefona"] || !test["mesto"] || (!test["type"]) || !test["lozinka"] || !test["lozinka1"] ||
            !test["email"]) {
            rezultati.push(-1); return;
          }
          if (test["korisnickoIme"].length < 3) { rezultati.push(1); return; }
          if (test["ime"].length < 3) { rezultati.push(2); return; }
          if (test["prezime"].length < 3) { rezultati.push(3); return; }
          if (new Date(test["datumRodjenja"]) > new Date((new Date()).getFullYear() - 18, (new Date()).getMonth(), (new Date()).getDate())) { rezultati.push(4); return; }
          if (!/^381\d{6}\d+$/.test(test["brojTelefona"].slice(1)) || test["brojTelefona"][0] != "+") { rezultati.push(5); return; }
          if (! /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{6,}$/.test(test["lozinka"])) { rezultati.push(6); return; }
          if (test["lozinka"] != test["lozinka1"]) { rezultati.push(7); return; }
          if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(test["email"])) { rezultati.push(7); return; }

          rezultati.push(0);
        });
        if (rezultati.length !== provera.length) {
          alert("Registracija - test: FAILED")
          console.log("Registracija - test: FAILED");
          return;
        }
        if (rezultati.every((element, index) => element === provera[index])) {
          alert("Registracija - test: FAILED")
          console.log("Registracija - test: FAILED");
          return;
        }
        alert("Registracija - test: PASS");
        console.log("Registracija - test: PASS");

        console.log("Registracija - test: END")


      })
      .catch(error => {
        console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje registracija):', error);
      });


  }


}
