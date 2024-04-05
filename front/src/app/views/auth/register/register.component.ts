import { Component, OnInit } from "@angular/core";
import { sha256 } from 'sha.js';


@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
})
export class RegisterComponent implements OnInit {
  constructor() {}


  korisnickoIme : string = null;
  ime: string = null;
  prezime: string = null;
  datumRodjenja: Date = null;
  brojTelefona: string = null;
  mesto: string = null;
  ulogaK: boolean = false;
  ulogaM: boolean = false;
  lozinka: string = null;
  lozinka1: string = null;
  politika: boolean = null;
  poruka:  string = null;
  gradovi: any;

  ngOnInit(): void {
    console.log('Registracija - ngOnInit: START')
    
    fetch('assets/city.json')
    .then(response => response.json())
    .then(gradovi => {
      this.gradovi = gradovi; 
      console.log(this.gradovi);
    })
    .catch(error => {
      console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje gradiva):', error);
    });

    console.log('Registracija - ngOnInit: END')
  }

  potvrdi(){
    console.log('Registracija - potvrdi: START')
    alert(this.korisnickoIme)
    if( !this.korisnickoIme ||  !this.ime || !this.prezime ||  !this.datumRodjenja || !this.politika ||
      !this.brojTelefona ||  !this.mesto || (this.ulogaM && !this.ulogaK) ||  !this.lozinka ||  !this.lozinka1 ){
        this.poruka = "Niste uneli sve podatke."; return; }
    if(this.korisnickoIme.length < 3 ){ this.poruka = "Korisničko ime je prekratko."; return; }
    if(this.ime.length < 3 ){ this.poruka = "Ime je prekratko."; return; }
    if(this.prezime.length < 3 ){ this.poruka = "Prezime je prekratko."; return; }
    if (this.datumRodjenja > new Date((new Date()).getFullYear() - 18, (new Date()).getMonth(), (new Date()).getDate()))
      { this.poruka = "Morate biti punoletni."; return; }
    if (!/^381\d{6}\d+$/.test(this.brojTelefona.slice(1)) || this.brojTelefona[0]!="+") { this.poruka = "Mobilni telefon nije u dobrom formatu."; return; }
    if ( ! /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{6,}$/.test(this.lozinka)  )  {this.poruka = "Lozinka mora imati barem \
      jedno malo slovo, barem jedno veliko slovo, barem jedan broj i barem jedan specijalni karakter. Lozinka mora\
      imati najmanje 6 karaktera."; return; }
    if (this.lozinka != this.lozinka1){ this.poruka="Lozinke nisu iste. Pokušajte ponovo."; return;}

    let hashLozinka = sha256().update(this.lozinka, 'utf8').digest('hex');

    console.log('Registracija - potvrdi: END')

  }

  test(){
    console.log("Registracija - test: START")
    var testovi;
    var rezultati = [];
    var provera = [0,-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 3, 4, 5, 6, 6, 6, 6, 6]
    fetch('assets/register_test.json')
    .then(response => response.json())
    .then(testovi1 => {
      testovi = testovi1; 
      console.log(testovi);
      testovi.forEach((test) => {
        if( !test["korisnickoIme"] ||  !test["ime"] || !test["prezime"] ||  !test["datumRodjenja"] || !test["politika"] ||
          !test["brojTelefona"] ||  !test["mesto"] || (!test["ulogaM"] && !test["ulogaK"]) ||  !test["lozinka"] ||  !test["lozinka1"] ){
            rezultati.push(-1); return;}
        if(test["korisnickoIme"].length < 3 ){  rezultati.push(1);  return;}
        if(test["ime"].length < 3 ){  rezultati.push(2);  return;}
        if(test["prezime"].length < 3 ){  rezultati.push(3);  return; }
        if (new Date(test["datumRodjenja"]) > new Date((new Date()).getFullYear() - 18, (new Date()).getMonth(), (new Date()).getDate()))
          {  rezultati.push(4); return; }
        if (!/^381\d{6}\d+$/.test(test["brojTelefona"].slice(1)) || test["brojTelefona"][0]!="+") {  rezultati.push(5); return; }
        if ( ! /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{6,}$/.test(test["lozinka"])  ) { rezultati.push( 6);  return; }
        if (test["lozinka"] != test["lozinka1"]){  rezultati.push(7);  return;}
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
      console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje gradiva):', error);
    });
    

  }


}
