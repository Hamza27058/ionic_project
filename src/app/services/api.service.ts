import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  

  

  getDoctors(page: number, perPage: number, query: string = '', location: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors?page=${page}&per_page=${perPage}&query=${query}&location=${location}`, {
      headers: this.getHeaders(),
    });
  }

  bookAppointment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments`, data, { headers: this.getHeaders() });
  }

  getAppointments(userId: string, page: number, perPage: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointments/${userId}?page=${page}&per_page=${perPage}`, {
      headers: this.getHeaders(),
    });
  }

  cancelAppointment(appointmentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/appointments/${appointmentId}`, { headers: this.getHeaders() });
  }
  

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data, { headers: this.getHeaders() });
  }
}