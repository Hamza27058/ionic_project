import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface Appointment {
  _id: string;
  doctor_id: string;
  user_id: string;
  date: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  doctor_name: string;
}

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.page.html',
  styleUrls: ['./appointments.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule],
})
export class AppointmentsPage implements OnInit {
  appointments: Appointment[] = [];
  isLoading = false;
  errorMessage = '';
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
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
    this.http.get<Appointment[]>(`${this.apiUrl}/appointments/${userId}`, { headers }).subscribe({
      next: (response) => {
        this.appointments = response;
        this.isLoading = false;
      },
      error: async (err) => {
        this.errorMessage = 'Erreur lors du chargement des rendez-vous';
        console.error('Erreur lors du chargement des rendez-vous:', err);
        this.isLoading = false;
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Impossible de charger les rendez-vous. Veuillez réessayer.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }
}