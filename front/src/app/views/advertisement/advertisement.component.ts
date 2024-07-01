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
  cities = [];
  professions = [];
  selectedCity: string = "Beograd";
  selectedProfession: string = "Vodoinstalater";
  poruka: string = null;

  constructor(private jobService: JobService, private router: Router,private userService: UserService, private http: HttpClient, private cookieService: CookieService) {
   
  }

  ngOnInit(): void {
    fetch('assets/city.json')
    .then(response => response.json())
    .then(cities => {
      this.cities = cities;
    })
    .catch(error => {
      console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje gradova):', error);
    });

    fetch('assets/craftsmen.json')
    .then(response => response.json())
    .then(professions => {
      this.professions = professions.craftsmen;
    })
    .catch(error => {
      console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje zanata):', error);
    });
   }

  insertJob() {
    console.log("Insert job - submit: START")



    // Provera
    if (!this.description || !this.title) { this.poruka = "Niste uneli sve podatke."; return; }

    this.userService.getUserById({id: this.cookieService.get('token')}).subscribe((message: any) => {
      //Pakovanje
      const data = {
        description: this.description,
        title: this.title,
        city: this.selectedCity,
        profession: this.selectedProfession,
        id: JSON.parse(this.cookieService.get('token')),
        type: message['message'].type
      }
      // console.log(data);

      //Slanje
      this.jobService.insertJob(data).subscribe((message: any) => {
        if(message['message'] == 0) {
          console.log("Insert job - submit: PASS")
        }
        
      })
    
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
