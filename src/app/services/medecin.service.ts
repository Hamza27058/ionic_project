import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {
  private apiUrl = 'http://127.0.0.1:5000/medecin';

  constructor(private http: HttpClient) {}

  getMedecins(): Observable<any> {
    return this.http.get(`${this.apiUrl}/list`);
  }

  registerMedecin(medecinData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/inscription`, medecinData);
  }
}
