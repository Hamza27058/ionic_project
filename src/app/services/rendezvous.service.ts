import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RendezvousService {
  private apiUrl = 'http://127.0.0.1:5000/rendezvous';

  constructor(private http: HttpClient) {}

  getRendezvous(): Observable<any> {
    return this.http.get(`${this.apiUrl}/list`);
  }

  registerRendezvous(rendezvousData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/inscription`, rendezvousData);
  }
}
