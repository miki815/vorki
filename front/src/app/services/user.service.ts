import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private http: HttpClient) { }
    uri = 'https://vorki.rs';
    // uri = 'http://127.0.0.1:4000'
    // uri = environment.apiUrl;

    login(data) {
        console.log("API URL: ", this.uri);
        return this.http.post(`${this.uri}/users/login`, data, { withCredentials: true });
    }

    register(data) {
        return this.http.post(`${this.uri}/users/register`, data);
    }

    getUserById(data) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
        return this.http.post(`${this.uri}/users/getUserById`, data, { headers });
    }

    getUserProfessionsById(data) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
        return this.http.post(`${this.uri}/users/getUserProfessionsById`, data, { headers });
    }

    addComment(data) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
        return this.http.post(`${this.uri}/users/addComment`, data, { headers });
    }

    getCommentById(data) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
        return this.http.post(`${this.uri}/users/getCommentById`, data, { headers });
    }

    getCommentsByJobId(data) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
        return this.http.post(`${this.uri}/users/getCommentsByJobId`, data, { headers });
    }

    deleteCommentById(data) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
        return this.http.post(`${this.uri}/users/deleteCommentById`, data, { headers });
    }

    rate(data) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
        return this.http.post(`${this.uri}/users/rate`, data, { headers });
    }

    getRateByIdUser(data) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
        return this.http.post(`${this.uri}/users/getRateByIdUser`, data, { headers });
    }

    getRateByIdUserAndRater(data) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
        return this.http.post(`${this.uri}/users/getRateByIdUserAndRater`, data, { headers });
    }

    changePassword(data) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
        return this.http.post(`${this.uri}/users/changePassword`, data, { headers });
    }

    getIdByEmail(data) {
        return this.http.post(`${this.uri}/users/getIdByEmail`, data);
    }

    getIdByUsername(data) {
        return this.http.post(`${this.uri}/users/getIdByUsername`, data);
    }

    updateUser(data) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
        return this.http.post(`${this.uri}/users/updateUser`, data, { headers });
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

    saveToken(token: string): void {
        localStorage.setItem('token', token);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getCurrentUser(): any {
        const token = this.getToken();
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
        }
        return null;
    }

    verifyUser(data) {
        return this.http.post(`${this.uri}/users/verify-user`, data, { withCredentials: true });
    }

    verifyToken(data) {
        return this.http.post(`${this.uri}/users/verify-token`, data, { withCredentials: true });
    }

    isUserSubscribed() {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
        return this.http.get(`${this.uri}/users/isUserSubscribed`, { headers });
    }

    getTop3Masters(data) {
        return this.http.post(`${this.uri}/users/getTop3Masters`, data);
    }

    trackPhoneClick(data) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
        return this.http.post(`${this.uri}/users/trackPhoneClick`, data, { headers });
    }

    trackProfileClick(data) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
        return this.http.post(`${this.uri}/users/trackProfileClick`, data, { headers });
    }
}