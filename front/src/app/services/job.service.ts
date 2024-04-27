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
}
