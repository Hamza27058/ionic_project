import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { RegistrationModalPage } from '../registration-modal/registration-modal.page';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.page.html',
  styleUrls: ['./sidebar.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class SidebarPage implements OnInit {
  isLoggedIn: boolean = false;
  userRole: string = '';
  darkMode: boolean = false;
  notificationsEnabled: boolean = true;
  private apiUrl = 'http://localhost:5000/api';
  private loginStatus = new BehaviorSubject<boolean>(false);

  constructor(
    private router: Router,
    private http: HttpClient,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      this.http.get(`${this.apiUrl}/profile`, { headers }).subscribe({
        next: (user: any) => {
          this.isLoggedIn = true;
          this.userRole = user.role || 'client';
          this.loginStatus.next(true);
        },
        error: () => {
          this.isLoggedIn = false;
          this.userRole = '';
          this.loginStatus.next(false);
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        },
      });
    } else {
      this.isLoggedIn = false;
      this.userRole = '';
      this.loginStatus.next(false);
    }
  }

  navigateTo(page: string) {
    if (page === 'login' || this.isLoggedIn) {
      this.router.navigate([`/${page}`]);
    } else {
      this.router.navigate(['/login']);
    }
  }

  async openRegisterModal() {
    const modal = await this.modalController.create({
      component: RegistrationModalPage,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data?.role) {
      this.router.navigate([data.role === 'doctor' ? '/doctor-register' : '/register']);
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.isLoggedIn = false;
    this.userRole = '';
    this.loginStatus.next(false);
    this.router.navigate(['/home']);
  }

  toggleDarkMode() {
    document.body.classList.toggle('dark', this.darkMode);
  }

  toggleNotifications() {
    console.log('Notifications:', this.notificationsEnabled);
  }
}