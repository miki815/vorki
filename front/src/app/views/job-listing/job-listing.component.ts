import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { JobService } from 'src/app/services/job.service';

@Component({
  selector: 'app-job-listing',
  templateUrl: './job-listing.component.html',
})
export class JobListingComponent implements OnInit{
  jobs: Array<any>;
  currentPage: number = 1;
  jobsPerPage: number = 10;
  @ViewChild('top') topElement!: ElementRef;

  ngOnInit(): void {
    this.jobService.getJobs().subscribe((jobs: any) => {
      this.jobs = jobs;
    });
  }


  constructor(private jobService: JobService) {
    
    // this.jobs = [
    //   {
    //     title: 'Moler',
    //     description: 'Potrebno je da se ofarba stan od 50 kvadrata',
    //     city: 'Beograd',
    //     profession: 'Moler'
    //   },
    //   {
    //     title: 'Vodoinstalater',
    //     description: 'Potrebno je da se zameni vodokotlić',
    //     city: 'Beograd',
    //     profession: 'Vodoinstalater'
    //   },
    //   {
    //     title: 'Automehaničar',
    //     description: 'Potrebno je da se zameni ulje na automobilu',
    //     city: 'Beograd',
    //     profession: 'Automehaničar'
    //   },
    //   {
    //     title: 'Električar',
    //     description: 'Potrebno je da se zameni sijalica',
    //     city: 'Beograd',
    //     profession: 'Električar'
    //   },
    //   {
    //     title: 'Stolar',
    //     description: 'Potrebno je da se napravi polica',
    //     city: 'Beograd',
    //     profession: 'Stolar'
    //   },
    //   {
    //     title: 'Bravar',
    //     description: 'Potrebno je da se napravi ograda',
    //     city: 'Beograd',
    //     profession: 'Bravar'
    //   },
    //   {
    //     title: 'Keramičar',
    //     description: 'Potrebno je da se postavi pločice',
    //     city: 'Beograd',
    //     profession: 'Keramičar'
    //   },
    //   {
    //     title: 'Tesar',
    //     description: 'Potrebno je da se napravi krov',
    //     city: 'Beograd',
    //     profession: 'Tesar'
    //   },
    //   {
    //     title: 'Zidar',
    //     description: 'Potrebno je da se zida kuća',
    //     city: 'Beograd',
    //     profession: 'Zidar'
    //   },
    //   {
    //     title: 'Gipsar',
    //     description: 'Potrebno je da se postavi gips',
    //     city: 'Beograd',
    //     profession: 'Gipsar'
    //   },
    //   {
    //     title: 'Limar',
    //     description: 'Potrebno je da se postavi lim',
    //     city: 'Beograd',
    //     profession: 'Limar'
    //   },
    // ]
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
  
}
