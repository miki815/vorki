import { Component, Input, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-single-job-short',
  templateUrl: './single-job-short.component.html',
})
export class SingleJobShortComponent implements OnInit{
  @Input() job: any;
  imageSrc: string;
  shortDescription: string;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.imageSrc = this.job.photo;
    this.shortDescription = this.job.description.substring(0, 100) + '...';
  }

  locateToJob() {
    console.log(this.job)
    const navigationExtras: NavigationExtras = {
      state: {
        job: this.job
      }
    };
    this.router.navigate(['/oglasi/', this.job.id], navigationExtras);
  }

}
