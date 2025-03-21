import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Gallery, GalleryItem, GalleryRef, GalleryState, ImageItem } from 'ng-gallery';
import { CookieService } from 'ngx-cookie-service';
import { JobService } from 'src/app/services/job.service';
import { UserService } from 'src/app/services/user.service';
import * as L from 'leaflet';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { NotificationService } from 'src/app/services/notification.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-single-job-long',
  templateUrl: './single-job-long.component.html',
  styleUrls: ['./single-job-long.component.css']
})
export class SingleJobLongComponent implements OnInit {
  job: any;
  jobId: string;
  comments: any[] = [];
  comment: string = null;
  cookie: string = "";
  photo: string = null;
  username: string = null;
  visibleComments: number = 3;
  images: GalleryItem[] = [];
  imagesLoaded: boolean = false;
  galleryId = 'mixed';
  galleryRef: GalleryRef = this.gallery.ref(this.galleryId);
  numberOfPhotos: number = 0;
  imgIndex: number = 0;
  private map;
  jobStatus: string = "";
  idUser: string = "";
  rating: number = 0;
  phoneNumber: string = "";
  isRequest: boolean = false;
  startDate: Date = new Date();
  endDate: Date = new Date();
  startTime: Date = new Date();
  endTime: Date = new Date();
  additionalInfo: string = "";
  numberOfJobs: number = 0;
  requestMsg: string = "Zainteresovan/a za posao";
  ph: string = "https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80"
  cities: any[] = [];
  coordinates: any[] = [];
  index: number = 0;
  // uri = 'http://127.0.0.1:4000'
  uri = 'https://vorki.rs';
  // uri = environment.uri;


  constructor(private jobService: JobService, private route: ActivatedRoute, private cookieService: CookieService, private userService: UserService, private gallery: Gallery, private notificationService: NotificationService) { }
  ngOnInit(): void {
    this.cookie = this.cookieService.get("userId");
    // this.job = history.state.job;

    this.route.paramMap.subscribe(params => {
      this.jobId = params.get('id');
      this.jobService.get_job_and_user_info(this.jobId).subscribe((job: any) => {
        console.log(job);
        this.job = job[0];
        this.idUser = this.job.idUser;
        this.userService.getUserById({ id: this.idUser }).subscribe((message: any) => {
          console.log("User: ", message['message'])
          this.photo = message['message'].photo;
          this.username = message['message'].username;
          this.phoneNumber = message['message'].phone;
        });
        this.jobService.getJobGallery(this.jobId).subscribe((imgs: any) => {
          console.log(imgs);
          imgs.forEach(element => {
            console.log(element.urlPhoto)
            this.images.push(new ImageItem({ src: `${this.uri}${element.urlPhoto}`, thumb: `${this.uri}${element.urlPhoto}` }))
            this.galleryRef.add(new ImageItem({ src: `${this.uri}${element.urlPhoto}`, thumb: `${this.uri}${element.urlPhoto}` }))
            this.numberOfPhotos += 1;
          });
          if (this.numberOfPhotos > 0) this.imagesLoaded = true;
        });
        this.getComments();
        this.jobService.checkUserRequestForAgreement({jobId: this.jobId}).subscribe((message: any) => {
          this.jobStatus = message['status'];
          if (this.jobStatus == "offer") {
            this.requestMsg = "Ponuda poslata!";
          }
        });
        this.map = L.map('map').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(this.map);
        fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + this.job.city)
          .then(response => response.json())
          .then(data => {
            if (data.length > 0) {
              var lat = parseFloat(data[0].lat);
              var lon = parseFloat(data[0].lon);
              L.marker([lat, lon]).addTo(this.map)
                .bindPopup('' + this.job.city)
                .openPopup();
              this.map.setView([lat, lon], 8);
            }
          })
          .catch(error => {
            console.error('Greška pri pretrazi grada:', error);
          });
      });
    });
  }

  addComment() {
    console.log("Job - addComment: START")
    if (this.comment == "") return;
    if (/^\s*$/.test(this.comment)) return;

    const data = { idCommentator: this.cookie, comment: this.comment, idUser: this.job.idUser, dateC: new Date(), jobId: this.job.id }
    this.userService.addComment(data).subscribe((message: any) => {
      this.userService.getUserById({ id: data.idCommentator }).subscribe((message: any) => {
        const data1 = {
          comment: data.comment,
          idCommentator: data.idCommentator,
          dateC: data.dateC,
          photo: message['message'].photo,
          username: message['message'].username,
        }
        this.comments.unshift(data1);
        this.comment = ""
        //  this.visibleComments += 1;
      });
      console.log("Job - addComment: END")
    })
  }

  getComments() {
    console.log("Job - getComments: START")
    this.userService.getCommentsByJobId({ jobId: this.job.id }).subscribe((info: any) => {
      this.comments = info['message'];
      this.comments.forEach(comment => {
        this.userService.getUserById({ id: comment.idCommentator }).subscribe((message: any) => {
          comment.photo = message['message'].photo;
          comment.username = message['message'].username;
        });
      });
    });
    console.log("Job - getComments: END")
  }

  onIndexChange(event: GalleryState) {
    this.imgIndex = event.currIndex
  }

  setRating(rating: number) {
    this.rating = rating;
  }

  rate() {
    console.log("Job - rate: START")
    const data = { idUser: this.job.idUser, idRater: this.cookie, rate: this.rating }
    this.userService.rate(data).subscribe((message: any) => {
      console.log("Job - rate: END")
    })
  }

  deleteComment(idComment: string) {
    console.log("Job - deleteComment: START")
    const data = { idComment: idComment }
    this.userService.deleteCommentById(data).subscribe((message: any) => {
      this.comments = this.comments.filter(comment => comment.id != idComment);
      console.log("Job - deleteComment: END")
    })
  }

  more() {
    this.visibleComments += 3;
  }

  less() {
    this.visibleComments = 3;
  }

  sendOffer() {
    const data = { idJob: this.job.id, idMaster: this.job.idUser }
    this.jobService.sendOffer(data).subscribe((message: any) => {
      this.isRequest = false;
      this.requestMsg = "Ponuda poslata!";
      this.notificationService.informMasterOfJob({ user_id: this.cookie, master_id: this.job.idUser, job_title: this.job.title }).subscribe((message: any) => {
        console.log("Notification sent to master")
      });
      console.log("Job - userRequestForAgreement: END")
    })
  }

  formatDateTime(date: Date, time: Date): string {
    console.log("Date: " + date);
    console.log("Time: " + time);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + time.getHours()).slice(-2);
    const minutes = ('0' + time.getMinutes()).slice(-2);
    const seconds = ('0' + time.getSeconds()).slice(-2);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  userRequestForAgreement() {
    console.log("Job - userRequestForAgreement: START")
    // let formattedStartDate = this.formatDateTime(this.startDate, this.startTime);
    let formattedEndDate = this.formatDateTime(this.endDate, this.endTime);
    const data = { idJob: this.job.id, idMaster: this.job.idUser, startDate: this.startDate, endDate: formattedEndDate, additionalInfo: this.additionalInfo }
    this.jobService.requestForAgreement(data).subscribe((message: any) => {
      this.isRequest = false;
      this.requestMsg = "Zahtev poslat!";
      this.notificationService.informMasterOfJob({ user_id: this.cookie, master_id: this.job.idUser, job_title: this.job.title }).subscribe((message: any) => {
        console.log("Notification sent to master")
      });
      console.log("Job - userRequestForAgreement: END")
    })
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in km unit
  }


  getCities() {
    console.log('Calculations - getCities: START')
    fetch('assets/city.json')
      .then(response => response.json())
      .then(cities => {
        this.cities = cities;
      })
      .catch(error => {
        console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje gradiva):', error);
      });
    console.log('Calculations - getCities: END')
  }

  getCitiesCoordinatesFromOpenstreet() {
    console.log('Calculations - getCitiesCoordinates: START');
    if (this.index < this.cities.length) {
      const curCity = this.cities[this.index].city;
      console.log(`City: ${curCity}, Index: ${this.index}`);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 5000)
      );

      const fetchPromise = fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${curCity}, Serbia`)
        .then(response => response.json())
        .then(data => {
          console.log('Data received:', data);
          if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            this.coordinates.push({ curCity, lat, lon });
            console.log(`City: ${curCity}, Lat: ${lat}, Lon: ${lon}`);
          } else {
            console.log(`No data found for ${curCity}, skipping...`);
          }
        })
        .catch(error => {
          console.error(`Error fetching data for ${curCity}:`, error);
        });

      Promise.race([fetchPromise, timeoutPromise])
        .finally(() => {
          this.index += 1;
          setTimeout(() => this.getCitiesCoordinatesFromOpenstreet(), 2000);
        });
    } else {
      console.log('Calculations - getCitiesCoordinates: END');
      // save to local file
      const dataStr = JSON.stringify(this.coordinates, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cityCoordinates.json';
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  getCitiesCoordinates() {
    console.log('GetCitiesCoordinates: START');
    fetch('assets/cityCoordinates.json')
      .then(response => response.json())
      .then(crds => {
        this.coordinates = crds;
        console.log('Coordinates:', this.coordinates);
      })
      .catch(error => {
        console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje koordinata):', error);
      });
    console.log('GetCitiesCoordinates: END');
  }

  calculateDistancesSync(cities) {
    const distances = [];
    const n = cities.length * (cities.length - 1) / 2;
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        const city1 = cities[i];
        const city2 = cities[j];
        console.log('Progress:', distances.length, '/', n);
        const distance = this.calculateDistance(city1.lat, city1.lon, city2.lat, city2.lon);
        if (distance < 50) {
          distances.push({
            city1: city1.curCity,
            city2: city2.curCity,
            distance: distance.toFixed(2)
          });
        }
      }
    }
    return distances;
  }

  saveDistancesToFile(distances) {
    const jsonData = JSON.stringify(distances, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cityDistances.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  processCities() {
    console.log('Proces računanja rastojanja je započet...');
    const distances = this.calculateDistancesSync(this.coordinates);
    console.log('Rastojanja su izračunata:', distances);
    this.saveDistancesToFile(distances);
  }

  callPhoneNumber(phoneNumber: string): void {
    console.log('Calling phone number:', phoneNumber);
    window.location.href = `tel:${phoneNumber}`;
  }
}
