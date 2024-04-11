import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }
  uri = 'http://127.0.0.1:4000'


  login(data) {
    return this.http.post(`${this.uri}/users/login`, data);
  }

  register(data) {
    return this.http.post(`${this.uri}/users/register`, data);
  }

  getUserById(data) {
    return this.http.post(`${this.uri}/users/getUserById`, data);
  }

  addComment(data) {
    return this.http.post(`${this.uri}/users/addComment`, data);
  }

  getCommentById(data) {
    return this.http.post(`${this.uri}/users/getCommentById`, data);
  }

  deleteCommentById(data) {
    return this.http.post(`${this.uri}/users/deleteCommentById`, data);
  }

  rate(data) {
    return this.http.post(`${this.uri}/users/rate`, data);
  }

  getRateByIdUser(data) {
    return this.http.post(`${this.uri}/users/getRateByIdUser`, data);
  }

  getRateByIdUserAndRater(data) {
    return this.http.post(`${this.uri}/users/getRateByIdUserAndRater`, data);
  }

  getGalleryById(data) {
    return this.http.post(`${this.uri}/users/getGalleryById`, data);
  }

  
}