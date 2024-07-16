import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs';
import { JobService } from 'src/app/services/job.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-job-listing',
  templateUrl: './job-listing.component.html',
})
export class JobListingComponent implements OnInit {
  jobs: Array<any>;
  allJobs: Array<any>;
  currentPage: number = 1;
  jobsPerPage: number = 5;
  @ViewChild('top') topElement!: ElementRef;
  cities = [];
  selectedCity: string = '';
  professions = [];
  selectedProfession: string = '';
  selectedSort: string = '';
  id: string = '';
  idUser: string = '';
  cookie: string = '';
  userType: string = '';

  constructor(private jobService: JobService, private router: Router,  private userService: UserService, private cookieService: CookieService, private route: ActivatedRoute) {
  }


  ngOnInit(): void {
    console.log("JobListing - ngOnInit: START")

    this.cookie =  this.cookieService.get("token");
    this.route.paramMap.subscribe(params => {
      this.idUser = params.get('id');
      this.getCities();
      this.getCraftmen();
      this.getJobs();
    });  

    console.log("JobListing - ngOnInit: END")
  }

  getCities(){
    console.log("JobListing - getCities: START")

    fetch('assets/city.json')
    .then(response => response.json())
    .then(cities => {
      this.cities = cities;
      this.cities.sort((a, b) => a.city.localeCompare(b.city)); 
    })
    .catch(error => {
      console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje gradiva):', error);
    });

    console.log("JobListing - getCities: END")
  }

  getCraftmen(){
    console.log("JobListing - getCraftmen: START")

    fetch('assets/craftsmen.json')
      .then(response => response.json())
      .then(professions => {
        this.professions = professions.craftsmen;
        this.professions.sort((a, b) => a.localeCompare(b));

      })
      .catch(error => {
        console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje zanata):', error);
      });

    console.log("JobListing - getCraftmen: END")
  }

  getJobs(){
    console.log("JobListing - getJobs: START")

    this.jobService.getJobsWithUserInfo2().subscribe((jobs: any) => {
      this.userService.getUserById({ id: this.cookie }).subscribe((me: any) => {
        this.userService.getUserById({ id: this.idUser }).subscribe((user: any) => {

          if(this.idUser && me['message'].type == user['message'].type && this.cookie!=this.idUser){
            this.router.navigate(["/oglasi/"])
            return;
          }
          var type = me['message'].type ? 0 : 1;
          jobs = jobs.filter(job => job.type == type);
          if(this.idUser){
            jobs = jobs.filter(job => job.idUser == this.idUser);
          }
          this.jobs = jobs;
          this.allJobs = jobs;
          this.userType =  me['message'].type;
        })
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


}


