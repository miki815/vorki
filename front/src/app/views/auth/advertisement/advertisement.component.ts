import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { JobService } from "src/app/services/job.service";
import { UserService } from "src/app/services/user.service";


@Component({
  selector: 'app-advertisement',
  templateUrl: './advertisement.component.html',
})
export class AdvertisementComponent implements OnInit {

  title: string = null;
  description: string = null;
  cities: Array<string> = ["Beograd", "Požarevac", "Novi Sad", "Smederevo", "Niš", "Kragujevac", "Subotica", "Zrenjanin", "Pančevo", "Kraljevo", "Čačak", "Valjevo", "Šabac", "Užice", "Novi Pazar", "Leskovac", "Vranje", "Pirot", "Zaječar", "Bor", "Sombor", "Bačka Palanka", "Vršac", "Ruma", "Sremska Mitrovica", "Loznica", "Požega", "Kruševac", "Prokuplje", "Paraćin", "Jagodina", "Ćuprija", "Vranjska Banja", "Kopaonik", "Zlatibor", "Divčibare", "Bajina Bašta", "Mokra Gora", "Drvengrad", "Kladovo", "Veliko Gradište", "Golubac", "Donji Milanovac", "Lepenski Vir", "Smederevska Palanka", "Velika Plana", "Mladenovac", "Aranđelovac", "Topola", "Rakovica", "Obrenovac", "Lazarevac", "Barajevo", "Grocka", "Sopot"];

  professions: Array<string> = ["Moler", "Vodoinstalater", "Automehaničar", "Električar", "Stolar", "Bravar", "Keramičar", "Tesar", "Zidar", "Gipsar", "Limar", "Staklorezac", "Vulkanizer"];

  selectedCity: string = null;
  selectedProfession: string = null;
  poruka: string = null;

  constructor(private jobService: JobService, private router: Router, private http: HttpClient, private cookieService: CookieService) {
    this.selectedCity = this.cities[0];
    this.selectedProfession = this.professions[0];
  }

  ngOnInit(): void { }

  insertJob() {
    console.log("Insert job - submit: START")

    // Provera
    if (!this.description || !this.title) { this.poruka = "Niste uneli sve podatke."; return; }

    //Pakovanje
    const data = {
      description: this.description,
      title: this.title,
      city: this.selectedCity,
      profession: this.selectedProfession,
      id: JSON.parse(this.cookieService.get('token'))
    }
   // console.log(data);

    //Slanje
    this.jobService.insertJob(data).subscribe((message: any) => {
      if(message['message'] == 0) {
        console.log("Insert job - submit: PASS")
      }
      
    })

  }



  test() {
    console.log("Prijava - test: START")
    var rezultati = [];
    var provera = [0, -1, -1]
    fetch('assets/login_test.json')
      .then(response => response.json())
      .then(testovi1 => {
        testovi1.forEach((test) => {
          if (!this.description || !this.title) {
            rezultati.push(-1);
          }
          else { rezultati.push(0); }
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
