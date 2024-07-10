import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  constructor(private http: HttpClient) { }
  uri = 'http://127.0.0.1:4000'

  insertJob(data) {
    return this.http.post(`${this.uri}/jobs/insertJob`, data);
  }


  getJobs() {
    return this.http.get(`${this.uri}/jobs/getJobs`);
  }

  getJobById(id) {
    return this.http.get(`${this.uri}/jobs/getJobById/${id}`);
  }

  getJobsWithUserInfo() {
    return this.http.get(`${this.uri}/jobs/getJobsWithUserInfo`);
  }

  getJobsWithUserInfo2() {
    return this.http.get(`${this.uri}/jobs/getJobsWithUserInfo2`);
  }

  requestForAgreement(data) {
    return this.http.post(`${this.uri}/jobs/requestForAgreement`, data);
  }
}
