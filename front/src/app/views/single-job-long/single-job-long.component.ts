import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobService } from 'src/app/services/job.service';

@Component({
  selector: 'app-single-job-long',
  templateUrl: './single-job-long.component.html',
})
export class SingleJobLongComponent implements OnInit {
  job: any;
  jobId: string;

  constructor(private jobService: JobService, private route: ActivatedRoute) { }
  ngOnInit(): void {
    this.job = history.state.job;
    this.route.paramMap.subscribe(params => {
      this.jobId = params.get('id');
    });
    // this.jobService.getJobById(this.jobId).subscribe((job: any) => {
    //   // getJobById returns array of one element
    //   this.job = job[0];
    // });
  }


}
