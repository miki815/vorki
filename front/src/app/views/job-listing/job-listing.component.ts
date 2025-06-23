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
        // this.currentPage = +sessionStorage.getItem('currentPage') || 1;
        // setTimeout(() => {
        //     const savedPosition = sessionStorage.getItem('scrollPosition');
        //     if (savedPosition) {
        //         window.scrollTo({ top: +savedPosition, behavior: 'auto' });
        //     }
        //     console.log('currentPage:', this.currentPage);
        //     console.log('savedPosition:', savedPosition);
        // }, 0);
        this.cookie = this.cookieService.get("userId");
        this.selectedProfession = sessionStorage.getItem('category') || '';
        this.selectedCity = sessionStorage.getItem('selectedCity') || '';
        this.selectedSort = sessionStorage.getItem('selectedSort') || '';
        this.route.queryParamMap.subscribe(params => {
            this.idUser = params.get('idU');
            this.getCities();
            this.getCraftmen();
            // this.loadJobs();
            this.getJobs();
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

            });
    }

    getCraftmen() {

        fetch('assets/craftsmen.json')
            .then(response => response.json())
            .then(professions => {
                this.professions = this.professions = [...professions.craftsmen, ...professions.services, ...professions.transport];
                ;
                this.professions.sort((a, b) => a.localeCompare(b));
                this.filteredProfessions = this.professions;
            })
            .catch(error => {

            });
    }

    getJobs() {
        this.jobService.getJobsWithUserInfo2().subscribe((jobs: any) => {
            this.userService.getUserById({ id: this.cookie }).subscribe((user: any) => {
                this.allJobs = this.jobs = jobs.filter(job => job.type == '0');
                this.filterJobs();
                // if (this.idUser === this.cookie) {
                //   this.jobs = this.allJobs.filter(job => job.idUser === this.idUser);
                // } else {
                //   this.allJobs = this.jobs = jobs.filter(job => job.type !== user['message'].type);
                // }
                const savedPage = sessionStorage.getItem('currentPage');
                this.currentPage = savedPage !== null ? +savedPage : 1;

                // Scrolluj na poziciju nakon što su job-ovi renderovani
                setTimeout(() => {
                    const savedPosition = sessionStorage.getItem('scrollPosition');
                    if (savedPosition) {
                        window.scrollTo({ top: +savedPosition, behavior: 'auto' });
                    }
                }, 0);
            })
        });
    }

    moveToTop() {
        this.topElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    prevPage() {
        if (this.currentPage > 1) this.currentPage--;
        this.moveToTop();
    }

    nextPage() {
        // const data = {
        //   page: this.currentPage + 1,
        //   jobsPerPage: this.jobsPerPage,
        //   selectedCity: this.selectedCity,
        //   selectedProfession: this.selectedProfession,
        //   selectedSort: this.selectedSort
        // };
        // this.jobService.getPageJobs(data).subscribe((response) => {
        //   if(response['message'].length != 0) {
        //     this.jobs = response['message'];
        //     this.allJobs = response['message'];
        //     this.currentPage++;
        //   }
        //   else {
        //     this.currentPage = 1;
        //   }
        // });
        if (this.jobs.length > this.currentPage * this.jobsPerPage) this.currentPage++;
        this.moveToTop();
    }

    filterJobs() {
        sessionStorage.setItem('selectedCity', this.selectedCity);
        sessionStorage.setItem('category', this.selectedProfession);
        sessionStorage.setItem('selectedSort', this.selectedSort);
        this.currentPage = 1;
        if (this.selectedCity === '' && this.selectedProfession === '') this.jobs = this.allJobs;
        else if (this.selectedCity === '') this.jobs = this.allJobs.filter(job => this.normalizeString(job.profession).includes(this.normalizeString(this.selectedProfession)));
        else if (this.selectedProfession === '')
            this.jobs = this.allJobs.filter(job => this.normalizeString(job.city).includes(this.normalizeString(this.selectedCity)));
        else this.jobs = this.allJobs.filter(job => this.normalizeString(job.city).includes(this.normalizeString(this.selectedCity)) &&
            this.normalizeString(job.profession).includes(this.normalizeString(this.selectedProfession)));
        this.sort();
    }

    sort() {
        sessionStorage.setItem('selectedCity', this.selectedCity);
        sessionStorage.setItem('category', this.selectedProfession);
        sessionStorage.setItem('selectedSort', this.selectedSort);
        this.currentPage = 1;
        if (this.selectedSort === 'rate') this.jobs = this.jobs.sort((a, b) => b.avgRate - a.avgRate);
        if (this.selectedSort === 'city') this.jobs = this.jobs.sort((a, b) => a.city.localeCompare(b.city));
        //if (this.selectedSort === 'name') this.jobs = this.allJobs.sort((a, b) => a.name.localeCompare(b.name));
    }

    filterCities() {
        this.filteredCities = this.cities.filter(city =>
            this.normalizeString(city.city).includes(this.normalizeString(this.searchQuery))
        );
    }

    loadJobs() {
        const data = {
            page: this.currentPage,
            jobsPerPage: this.jobsPerPage,
            selectedCity: this.selectedCity,
            selectedProfession: this.selectedProfession,
            selectedSort: this.selectedSort
        };
        this.jobService.getPageJobs(data).subscribe((response) => {
            this.jobs = this.allJobs = response['message'];
            // this.totalJobs = response.total;
        });
    }

    get totalPages(): number {
        return Math.ceil(this.jobs.length / this.jobsPerPage);
    }

    normalizeString(str: string): string {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "dj").replace(/Đ/g, "Dj").trim().toLowerCase();
    }
}


