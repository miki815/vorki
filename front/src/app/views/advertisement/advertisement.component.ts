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
  styleUrls: ['./advertisement.component.css']
})
export class AdvertisementComponent implements OnInit {

  title: string = null;
  description: string = null;
  cities = [];
  professions = [];
  selectedCity: string = "";
  selectedProfession: string = "";
  poruka: string = null;
  bgcolor: string = "rgb(239, 114, 114)";
  imagePreviews: string[] = [];
  searchQuery = '';
  searchQueryProf = '';
  filteredCities: any;
  filteredProfessions: string[] = [];
  jobType: number;
  jobAddress: string = null;

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
      });

    fetch('assets/craftsmen.json')
      .then(response => response.json())
      .then(professions => {
        this.professions = [...professions.craftsmen, ...professions.services, ...professions.transport];
        this.professions.sort((a, b) => a.localeCompare(b));
        this.filteredProfessions = this.professions;
      })
      .catch(error => {
      });
  }

  insertJob() {
    // Provera
    if (!this.description || !this.title || !this.selectedCity || !this.selectedProfession) {
      this.poruka = "Niste uneli sve podatke.";
      this.bgcolor = "rgb(239, 114, 114)";
      return;
    }
    //Pakovanje
    const data = {
      description: this.description,
      title: this.title,
      city: this.selectedCity,
      profession: this.selectedProfession,
      type: "1",
      address: this.jobAddress,
    }
    //Slanje
    this.jobService.insertJob(data).subscribe((message: any) => {
      if (message['message'] == 0) {
        const job_id = message['job_id'];
        this.addPicturesJobInsert(job_id);
        this.notificationService.newJobNotification({ user_id: this.cookieService.get('userId'), job_id: message['job_id'], job_title: this.title, job_location: this.selectedCity, job_profession: this.selectedProfession }).subscribe((message: any) => {
          this.router.navigate(['/oglasi/' + job_id]);
        });
      }
    })

  }

  onImageChange(event: any) {
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const MAX_IMAGES = 4;
    const files = event.target.files;
    if (files) {
      this.imagePreviews = [];
      const selectedFiles = Array.from(files).slice(0, MAX_IMAGES);

      selectedFiles.forEach((file: File) => {
        if (file.size > MAX_SIZE) {
          alert(`Slika ${file.name} je prevelika! Maksimalna dozvoljena veličina je 2MB.`);
          return;
        }
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  addPicturesJobInsert(jobId) {
    const formData = new FormData();
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB 
    const MAX_IMAGES = 4;

    formData.append('idJob', jobId);

    // Dodaj sve slike u formData
    const imageFiles = (document.getElementById('images') as HTMLInputElement).files;
    if (imageFiles) {
      if (imageFiles.length > MAX_IMAGES) {
        alert(`Možete poslati najviše ${MAX_IMAGES} slike.`);
        return;
      }

      Array.from(imageFiles).forEach((file: File) => {
        if (file.size > MAX_SIZE) {
          return;
        }
        formData.append('images', file, file.name);
      });
    }

    this.http.post(`${this.uri}/uploadJobPictures`, formData)
      .subscribe((response: any) => {

      });
  }

  filterCities() {
    this.filteredCities = this.cities.filter(city =>
      this.normalizeString(city.city).includes(this.normalizeString(this.searchQuery))
    );
  }

  filterProfessions() {
    this.filteredProfessions = this.professions.filter((profession) =>
      this.normalizeString(profession).includes(this.normalizeString(this.searchQueryProf))
    );
  }

  normalizeString(input: string): string {
    return input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  test() {
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
          return;
        }
        if (rezultati.every((element, index) => element === provera[index])) {
          alert("Prijava - test: FAILED")
          return;
        }
        alert("Prijava - test: PASS");
      })
      .catch(error => {
        
      });
  }
}
