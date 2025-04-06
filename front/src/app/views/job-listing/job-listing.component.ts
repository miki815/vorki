import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs';
import { JobService } from 'src/app/services/job.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-job-listing',
  templateUrl: './job-listing.component.html',
  styleUrls: ['./job-listing.component.css']
})
export class JobListingComponent implements OnInit {
  jobs: Array<any>;
  allJobs: Array<any>;
  currentPage: number = 1;
  jobsPerPage: number = 9;
  @ViewChild('top') topElement!: ElementRef;
  cities = [];
  selectedCity: string = '';
  professions = [];
  filteredProfessions = [];
  selectedProfession: string = '';
  selectedSort: string = '';
  id: string = '';
  idUser: string = '';
  cookie: string = '';
  userType: string = '';
  idU: string = '';
  filteredCities: any;
  searchQuery = '';

  constructor(private jobService: JobService, private router: Router, private userService: UserService, private cookieService: CookieService, private route: ActivatedRoute) {
  }


  ngOnInit(): void {
    console.log("JobListing - ngOnInit: START")
    this.cookie = this.cookieService.get("userId");
    this.selectedProfession = sessionStorage.getItem('category');
    this.route.queryParamMap.subscribe(params => {
      this.idUser = params.get('idU');
      this.getCities();
      this.getCraftmen();
      this.getJobs();
    });

    console.log("JobListing - ngOnInit: END")
  }

  getCities() {
    console.log("JobListing - getCities: START")

    fetch('assets/city.json')
      .then(response => response.json())
      .then(cities => {
        this.cities = cities;
        this.cities.sort((a, b) => a.city.localeCompare(b.city));
        this.filteredCities = this.cities;
      })
      .catch(error => {
        console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje gradiva):', error);
      });

    console.log("JobListing - getCities: END")
  }

  getCraftmen() {
    console.log("JobListing - getCraftmen: START")

    fetch('assets/craftsmen.json')
      .then(response => response.json())
      .then(professions => {
        this.professions = this.professions = [...professions.craftsmen, ...professions.services, ...professions.transport];
        ;
        this.professions.sort((a, b) => a.localeCompare(b));
        this.filteredProfessions = this.professions;
      })
      .catch(error => {
        console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje zanata):', error);
      });

    console.log("JobListing - getCraftmen: END")
  }

  getJobs() {
    console.log("JobListing - getJobs: START")
    this.jobService.getJobsWithUserInfo2().subscribe((jobs: any) => {
      this.userService.getUserById({ id: this.cookie }).subscribe((user: any) => {
        this.allJobs = this.jobs = jobs // TODO: Pogledaj
        this.filterJobs();
        // if (this.idUser === this.cookie) {
        //   this.jobs = this.allJobs.filter(job => job.idUser === this.idUser);
        // } else {
        //   this.allJobs = this.jobs = jobs.filter(job => job.type !== user['message'].type);
        // }
      })
    });
    console.log("JobListing - getJobs: END")
  }

  moveToTop() {
    this.topElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
    this.moveToTop();
  }

  nextPage() {
    if (this.jobs.length > this.currentPage * this.jobsPerPage) this.currentPage++;
    this.moveToTop();
  }

  filterJobs() {
    this.currentPage = 1;
    if (this.selectedCity === '' && this.selectedProfession === '') this.jobs = this.allJobs;
    else if (this.selectedCity === '') this.jobs = this.allJobs.filter(job => job.profession === this.selectedProfession);
    else if (this.selectedProfession === '') this.jobs = this.allJobs.filter(job => job.city === this.selectedCity);
    else this.jobs = this.allJobs.filter(job => job.city === this.selectedCity && job.profession === this.selectedProfession);
  }

  sort() {
    this.currentPage = 1;
    if (this.selectedSort === 'rate') this.jobs = this.allJobs.sort((a, b) => b.avgRate - a.avgRate);
    if (this.selectedSort === 'city') this.jobs = this.allJobs.sort((a, b) => a.city.localeCompare(b.city));
    //if (this.selectedSort === 'name') this.jobs = this.allJobs.sort((a, b) => a.name.localeCompare(b.name));
  }

  filterCities() {
    console.log('Register - filterCities: START')
    console.log('Search query:', this.searchQuery)
    console.log('Cities:', this.cities[0])
    this.filteredCities = this.cities.filter(city =>
      city.city.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }


}


