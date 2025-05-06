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
  time?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  doctor_name: string;
  specialty?: string;
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
  filteredAppointments: Appointment[] = [];
  isLoading = false;
  errorMessage = '';
  currentFilter: string = 'all'; // 'all', 'upcoming', 'completed', 'pending'
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
        // Ajouter l'heure à partir de la date si elle n'existe pas
        this.appointments = response.map(appointment => {
          if (!appointment.time) {
            const dateObj = new Date(appointment.date);
            appointment.time = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          }
          return appointment;
        });
        this.filterAppointments(this.currentFilter);
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

  filterAppointments(filter: string) {
    this.currentFilter = filter;
    
    switch (filter) {
      case 'all':
        this.filteredAppointments = [...this.appointments];
        break;
      case 'upcoming':
        this.filteredAppointments = this.appointments.filter(app => app.status === 'accepted');
        break;
      case 'completed':
        this.filteredAppointments = this.appointments.filter(app => app.status === 'completed');
        break;
      case 'pending':
        this.filteredAppointments = this.appointments.filter(app => app.status === 'pending');
        break;
      default:
        this.filteredAppointments = [...this.appointments];
    }
  }

  getFilterLabel(): string {
    switch (this.currentFilter) {
      case 'all': return '';
      case 'upcoming': return 'à venir';
      case 'completed': return 'terminés';
      case 'pending': return 'en attente';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Confirmé';
      case 'completed': return 'Terminé';
      case 'rejected': return 'Refusé';
      default: return status;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'primary';
      case 'completed': return 'success';
      case 'rejected': return 'danger';
      default: return 'medium';
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  extractDay(dateStr: string): string {
    const date = new Date(dateStr);
    return date.getDate().toString();
  }

  extractMonth(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', { month: 'short' });
  }

  getCompletedCount(): number {
    return this.appointments.filter(app => app.status === 'completed').length;
  }

  getPendingCount(): number {
    return this.appointments.filter(app => app.status === 'pending').length;
  }

  viewAppointmentDetails(appointment: Appointment) {
    this.router.navigate(['/appointment-details'], { state: { appointment } });
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