import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface Notification {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule],
})
export class NotificationsPage implements OnInit {
  notifications: Notification[] = [];
  isLoading = false;
  errorMessage = '';
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading = true;
    this.errorMessage = '';
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<Notification[]>(`${this.apiUrl}/notifications/${userId}`, { headers }).subscribe({
      next: (response) => {
        this.notifications = response;
        this.isLoading = false;
      },
      error: async (err) => {
        this.errorMessage = 'Erreur lors du chargement des notifications';
        console.error('Erreur lors du chargement des notifications:', err);
        this.isLoading = false;
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Impossible de charger les notifications. Veuillez réessayer.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }
}