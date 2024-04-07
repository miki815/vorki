import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }
  uri = 'http://127.0.0.1:4000'


  login(username: any, password: any) {
    const data = {
      username: username,
      password: password
    }
    return this.http.post(`${this.uri}/users/login`, data);
  }

  register(data) {
    return this.http.post(`${this.uri}/users/register`, data);
  }


}