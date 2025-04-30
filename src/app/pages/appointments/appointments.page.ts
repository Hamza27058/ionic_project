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
    const userType = localStorage.getItem('userType'); 
    if (!token || !userId) {
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    
    const endpoint = userType === 'doctor' 
      ? `${this.apiUrl}/doctor-appointments/${userId}`
      : `${this.apiUrl}/appointments/${userId}`;
    
    console.log('Loading appointments from endpoint:', endpoint);
    console.log('User type:', userType);
    
    this.http.get<Appointment[]>(endpoint, { headers }).subscribe({
      next: (response) => {
        console.log('Appointments loaded:', response);
        // Filtrer les rendez-vous pour n'afficher que ceux qui sont en attente (pending)
        this.appointments = response.filter(appointment => appointment.status === 'pending');
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

  acceptAppointment(appointmentId: string) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      this.router.navigate(['/login']);
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const updateData = { status: 'accepted' };
    
    console.log('Accepting appointment:', appointmentId);
    console.log('User ID:', userId);
    
    this.http.put(`${this.apiUrl}/appointments/${appointmentId}`, updateData, { headers }).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Succès',
          message: 'Rendez-vous accepté avec succès !',
          buttons: ['OK'],
        });
        await alert.present();
        this.loadAppointments();
      },
      error: async (err) => {
        console.error('Error accepting appointment:', err);
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Erreur lors de l\'acceptation du rendez-vous.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }

  rejectAppointment(appointmentId: string) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      this.router.navigate(['/login']);
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const updateData = { status: 'rejected' };
    
    console.log('Rejecting appointment:', appointmentId);
    console.log('User ID:', userId);
    
    this.http.put(`${this.apiUrl}/appointments/${appointmentId}`, updateData, { headers }).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Succès',
          message: 'Rendez-vous refusé avec succès !',
          buttons: ['OK'],
        });
        await alert.present();
        this.loadAppointments();
      },
      error: async (err) => {
        console.error('Error rejecting appointment:', err);
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Erreur lors du refus du rendez-vous.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }
}