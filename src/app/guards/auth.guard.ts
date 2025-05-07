import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private router: Router, private http: HttpClient) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      this.router.navigateByUrl('/login');
      return of(false);
    }

    return this.http
      .get(`${this.apiUrl}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        map((user: any) => {
          const expectedRole = route.data['role'];
          if (expectedRole && user.role !== expectedRole) {
            this.router.navigateByUrl('/home');
            return false;
          }
          return true;
        }),
        catchError(() => {
          this.router.navigateByUrl('/login');
          return of(false);
        })
      );
  }
}