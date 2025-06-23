import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList, OnInit } from '@angular/core';
import { UserService } from "src/app/services/user.service";
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from "@angular/router";
import { SwPush } from "@angular/service-worker";
import { HttpClient } from "@angular/common/http";
import { JobService } from 'src/app/services/job.service';
import { Gallery, GalleryConfig, GalleryItem, GalleryRef, GalleryState, ImageItem } from 'ng-gallery';
import { NgcCookieConsentService } from 'ngx-cookieconsent';



@Component({
  selector: "app-landing",
  templateUrl: "./landing.component.html",
  styleUrls: ["./landing.component.css"],
})



export class LandingComponent implements OnInit, AfterViewInit {
  topMasters: any = [];
  nameAndSurname: string = ""
  contact: string = ""
  message: string = ""
  msg: string = "";
  sentMsg: string = "";
  isSubscribed: boolean = false;
  userId: string = "";
  searchQuery: string = '';
  topJobs: any[] = [];
  allJobs: Array<any>;
  cities = [];
  selectedCity: string = '';
  professions = [];
  filteredProfessions = [];
  topProfessions: any[] = [];
  selectedProfession: string = '';
  filteredCities: any;
  professionsCount: { [categories: string]: number } = {};

  images: GalleryItem[] = [];
  imagesLoaded: boolean = false;
  galleryId = 'mixed';
  galleryRef: GalleryRef = this.gallery.ref(this.galleryId);
  numberOfPhotos: number = 0;
  imgIndex: number = 0;

  galleryConfig: GalleryConfig = {
    autoPlay: true,
    playerInterval: 3000,
    loop: true
  };

  readonly VAPID_PUBLIC_KEY = "BHTg9h9CX0rT_okcYjvkFRNXVFoPMSOVu99KjTfflvuMhz8iU8tgwzLfuglAQjTbBP6XgZT75JStZNHbX_rZ5Vg";
  // uri = 'http://127.0.0.1:4000'
  uri: string = 'https://vorki.rs';

  @ViewChildren('fadeSection', { read: ElementRef }) sectionsElements!: QueryList<ElementRef>;

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target); // opcionalno, ako ne želiš da se ponavlja
          }
        });
      },
      { threshold: 0.1 } // 10% sekcije mora biti vidljivo
    );

    this.sectionsElements.forEach((section) => {
      observer.observe(section.nativeElement);
    });
  }

  constructor(private userService: UserService, private cookieService: CookieService, private router: Router, private route: ActivatedRoute, private swPush: SwPush, private http: HttpClient, private jobService: JobService, private gallery: Gallery, private ccService: NgcCookieConsentService) { }
  login: number = 1;
  ngOnInit(): void {
    this.login = this.cookieService.get('userId') ? 1 : 0;
    this.userId = this.cookieService.get('userId');
    // this.userService.getTop5masters().subscribe((data: any) => {
    //   this.topMasters = data['top5'];
    // });
    this.getJobs();
    this.getCities();
    this.getCraftmen();

    const fixedImages = [
      'assets/img/pocetnagal1.png',
      'assets/img/pocetnagal2.png',
      'assets/img/pocetnagal3.png',
    ];

    fixedImages.forEach(path => {
      const fullPath = `${this.uri}${path}`;
      const item = new ImageItem({ src: path, thumb: path });
      this.images.push(item);
      this.galleryRef.add(item);
      this.numberOfPhotos += 1;
      this.imagesLoaded = true;
    });
  }

  send() {
    if (!this.nameAndSurname || !this.contact || !this.message) {
      this.msg = "Niste popunili sva polja.";
      return;
    }
    if ((!/^381\d{8,9}$/.test(this.contact.slice(1)) || this.contact[0] != "+")
      && !/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(this.contact)) { this.msg = "Mobilni telefon ili email nije u dobrom formatu. \n Format broja telefona: +381xxxxxxxxx"; return; }
    this.msg = "";
    const data = {
      contact: this.contact,
      message: this.message,
      nameAndSurname: this.nameAndSurname
    }
    this.userService.support(data).subscribe((response: any) => {
      if (response['message'] == "0") {
        this.sentMsg = "Naš tim je primio Vašu poruku. Odgovorićemo Vam u najkraćem roku.";
        return;
      } else {
        this.msg = "Problemi sa serverom. Molimo vas pokušajte kasnije.";
      }
    });
  }

  subscribeToNotifications() {
    // if (!this.swPush.isEnabled) {
    //   console.error('Push notifications are not enabled');
    //   return;
    // }

    this.swPush
      .requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY,
      })
      .then((subscription) => {
        const payload = {
          user_id: this.userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.toJSON().keys.p256dh,
          auth: subscription.toJSON().keys.auth,
        };

        this.http.post(`${this.uri}/save-subscription`, payload).subscribe({
          next: () => {
            this.isSubscribed = true;
          },
          // error: (err) => console.error('Failed to save subscription:', err),
        });
      })
    // .catch((err) => console.error('Failed to subscribe to notifications:', err));
  }

  category_navigation(id: number) {
    this.router.navigate(['/kategorija', id]);
  }

  searchJobs() {
    if (!this.searchQuery.trim()) {
      this.topJobs = [];
      return;
    }
    this.jobService.getTop3Jobs(this.searchQuery).subscribe((data: any) => {
      this.topJobs = data['jobs'];
    });
  }

  job_navigation(id: number) {
    this.router.navigate(['/profil', id]);
  }

  getJobs() {
    this.jobService.getJobsWithUserInfo2().subscribe((jobs: any) => {
      this.allJobs = jobs;
      // this.filterJobs();
    });
  }

  filterJobs() {
    if (this.selectedCity === '' && this.selectedProfession === '') this.topJobs = this.allJobs;
    else if (this.selectedCity === '') this.topJobs = this.allJobs.filter(job => job.profession === this.selectedProfession);
    else if (this.selectedProfession === '') this.topJobs = this.allJobs.filter(job => job.city === this.selectedCity);
    else this.topJobs = this.allJobs.filter(job => job.city === this.selectedCity && job.profession === this.selectedProfession);
  }

  filterCities() {
    this.filteredCities = this.cities.filter(city =>
      city.city.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getCraftmen() {

    fetch('assets/craftsmen.json')
      .then(response => response.json())
      .then(professions => {
        this.professions = this.professions = [...professions.craftsmen, ...professions.services, ...professions.transport];
        ;
        this.professions.sort((a, b) => a.localeCompare(b));
        this.filteredProfessions = this.professions;
        this.initializeCategoriesCount();
        this.getMastersCount(this.professions);
      })
      .catch(error => {
        // console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje zanata):');
      });

  }

  getCities() {

    fetch('assets/city.json')
      .then(response => response.json())
      .then(cities => {
        this.cities = cities;
        this.cities.sort((a, b) => a.city.localeCompare(b.city));
        this.filteredCities = this.cities;
      })
      .catch(error => {
        // console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje gradiva):');
      });

  }

  getMastersCount(categories) {
    const data = {
      jobsArray: categories
    }
    this.jobService.getMastersCount(data).subscribe((data: any) => {
      for (let i = 0; i < data.length; i++) {
        this.professionsCount[data[i].profession] = data[i].count
      }
      // get topProfessions
      this.topProfessions = Object.entries(this.professionsCount)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 12)
        .map(([profession]) => profession);
    });
  }

  initializeCategoriesCount(): void {
    this.professionsCount = this.professions.reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {} as { [profession: string]: number });
  }

  categoryChoice(category) {
    sessionStorage.setItem('category', category);
    this.router.navigate(['/oglasi']);
    // this.router.navigate(['/oglasi'], { state: { category: category } });
  }

  onIndexChange(event: GalleryState) {
    this.imgIndex = event.currIndex
  }

  getTop3Masters() {
    let data = {
      selectedCity: this.selectedCity,
      selectedProfession: this.selectedProfession
    }

    this.userService.getTop3Masters(data).subscribe((data: any) => {
      this.topMasters = data['top3'];
    });
  }

  showPopupAgain() {
    this.ccService.clearStatus();
    this.ccService.open();
  }

  formatCategoryToFilename(category: string): string {
    return category.replace(/\s+/g, '-');
  }


}
