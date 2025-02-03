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
  imagePreviews: string[] = [];
  searchQuery = '';
  filteredCities: any;


  // uri = 'http://127.0.0.1:4000'
  uri = 'https://vorki.rs';
  // uri = environment.uri;

  constructor(private jobService: JobService, private router: Router, private userService: UserService, private http: HttpClient, private cookieService: CookieService, private notificationService: NotificationService) {

  }

  ngOnInit(): void {
    fetch('assets/city.json')
      .then(response => response.json())
      .then(cities => {
        this.cities = cities;
        this.cities.sort((a, b) => a.city.localeCompare(b.city));
        this.filteredCities = this.cities;
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
          this.addPicturesJobInsert(message['job_id']);
          this.notificationService.newJobNotification({ user_id: this.cookieService.get('token'), job_id: message['job_id'], job_title: this.title }).subscribe((message: any) => {
            console.log("Notification sent");
          });
        }
      })

    })
  }

  onImageChange(event: any) {
    const files = event.target.files;
    if (files) {
      this.imagePreviews = [];
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);  // Učitavamo sliku kao data URL
      });
    }
  }

  addPicturesJobInsert(jobId) {
    const formData = new FormData();
    formData.append('idJob', jobId);

    // Dodaj sve slike u formData
    const imageFiles = (document.getElementById('images') as HTMLInputElement).files;
    if (imageFiles) {
      Array.from(imageFiles).forEach((file: File) => {
        formData.append('images', file, file.name);
      });
    }

    // Pošaljemo POST zahtev na server
    this.http.post(`${this.uri}/upload`, formData)
      .subscribe((response: any) => {
        console.log('Response from server:', response);
        // Ovdje možeš obraditi odgovor sa servera (spremiti putanje slika u bazu, itd.)
      });
  }

  filterCities() {
    console.log('Register - filterCities: START')
    console.log('Search query:', this.searchQuery)
    console.log('Cities:', this.cities[0])
    this.filteredCities = this.cities.filter(city =>
      city.city.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
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
