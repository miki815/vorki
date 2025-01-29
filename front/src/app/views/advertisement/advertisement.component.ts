import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { JobService } from "src/app/services/job.service";
import { NotificationService } from "src/app/services/notification.service";
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
  bgcolor: string = "rgb(239, 114, 114)";

  constructor(private jobService: JobService, private router: Router, private userService: UserService, private http: HttpClient, private cookieService: CookieService, private notificationService: NotificationService) {

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
        this.professions = [...professions.craftsmen, ...professions.services, ...professions.transport];
        this.professions.sort((a, b) => a.localeCompare(b));
      })
      .catch(error => {
        console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje zanata):', error);
      });
  }

  insertJob() {
    console.log("Insert job - submit: START")
    // Provera
    if (!this.description || !this.title) {
      this.poruka = "Niste uneli sve podatke.";
      this.bgcolor = "rgb(239, 114, 114)";
      return;
    }

    this.userService.getUserById({ id: this.cookieService.get('token') }).subscribe((message: any) => {
      //Pakovanje
      const data = {
        description: this.description,
        title: this.title,
        city: this.selectedCity,
        profession: this.selectedProfession,
        id: JSON.parse(this.cookieService.get('token')),
        type: message['message'].type
      }
      //Slanje
      console.log(data);
      this.jobService.insertJob(data).subscribe((message: any) => {
        if (message['message'] == 0) {
          console.log("Insert job - submit: PASS")
          this.poruka = "Uspešno ste dodali oglas: " + this.title;
          this.description = null;
          this.title = null;
          this.bgcolor = "rgb(42, 138, 42)";
          this.notificationService.newJobNotification({ user_id: this.cookieService.get('token') }).subscribe((message: any) => {
            console.log("Notification sent");
          });
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
