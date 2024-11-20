import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }
  uri = 'https://vorki.rs';


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

  getCommentsByJobId(data) {
    return this.http.post(`${this.uri}/users/getCommentsByJobId`, data);
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

  changePassword(data) {
    return this.http.post(`${this.uri}/users/changePassword`, data);
  }

  updateGallery(data) {
    return this.http.post(`${this.uri}/users/updateGallery`, data);
  }

  getIdByEmail(data) {
    return this.http.post(`${this.uri}/users/getIdByEmail`, data);
  }

  getIdByUsername(data) {
    return this.http.post(`${this.uri}/users/getIdByUsername`, data);
  }

  updateUser(data) {
    return this.http.post(`${this.uri}/users/updateUser`, data);
  }

  forgotPasswordRequest(data) {
    return this.http.post(`${this.uri}/users/forgotPasswordRequest`, data);
  }

  tokenValidation(data) {
    return this.http.post(`${this.uri}/users/tokenValidation`, data);
  }

  changeForgottenPassword(data) {
    return this.http.post(`${this.uri}/users/changeForgottenPassword`, data);
  }

  getTop5masters() {
    return this.http.get(`${this.uri}/users/getTop5masters`);
  }

  support(data) {
    return this.http.post(`${this.uri}/users/support`, data);
  }
}