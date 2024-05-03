import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-single-job-short',
  templateUrl: './single-job-short.component.html',
})
export class SingleJobShortComponent {
  @Input() job: any;

  constructor(private router: Router) { }

  locateToJob(job: any) {
    console.log(this.job)
    this.router.navigate(['/oglasi/', this.job.id]);
  }

}
