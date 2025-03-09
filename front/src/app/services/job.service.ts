import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class JobService {

  constructor(private http: HttpClient) { }
  // uri = 'https://vorki.rs';
  uri = 'http://localhost:4000';
  // uri = environment.uri;


  getToken() {
    return localStorage.getItem('token'); // Čuva token u localStorage
  }

  insertJob(data) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.post(`${this.uri}/jobs/insertJob`, data, { headers });
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

  get_job_and_user_info(id) {
    return this.http.get(`${this.uri}/jobs/get_job_and_user_info/${id}`);
  }

  requestForAgreement(data) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.post(`${this.uri}/jobs/requestForAgreement`, data, { headers });
  }

  updateJob(data) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.post(`${this.uri}/jobs/updateJob`, data, { headers });
  }

  getJobRequests(idMaster) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get(`${this.uri}/jobs/getJobRequests/${idMaster}`, { headers });
  }

  updateAgreement(data) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.post(`${this.uri}/jobs/updateAgreement`, data, { headers });
  }

  getJobRequestsForUser(idUser) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get(`${this.uri}/jobs/getJobRequestsForUser/${idUser}`, { headers });
  }

  getMastersCount(data) {
    return this.http.post(`${this.uri}/jobs/getMastersCount`, data);
  }

  getJobGallery(idJob) {
    return this.http.get(`${this.uri}/jobs/getJobGallery/${idJob}`);
  }

  changeJobLocationForUser(data) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.post(`${this.uri}/jobs/changeJobLocationForUser`, data, { headers });
  }
}
