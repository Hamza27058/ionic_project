import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

interface Appointment {
  _id: string;
  doctor_id: string;
  user_id: string;
  date: string;
  time: string;
  reason?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  doctor_name: string;
  user_photo?: string;
  doctor_photo?: string;
  doctor_specialty?: string;
  notes?: string;
}

@Component({
  selector: 'app-appointment-details',
  templateUrl: './appointment-details.page.html',
  styleUrls: ['./appointment-details.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule, 
    HttpClientModule
  ]
})
export class AppointmentDetailsPage implements OnInit {
  appointment: Appointment | null = null;
  isLoading = true;
  errorMessage = '';
  userType = 'client';
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    this.checkUserType();
    this.loadAppointmentDetails();
  }

  checkUserType() {
    const userType = localStorage.getItem('userType');
    if (userType) {
      this.userType = userType;
    }
  }

  loadAppointmentDetails() {
    // Récupérer l'ID du rendez-vous depuis l'état de navigation
    const navigation = this.router.getCurrentNavigation();
    const appointmentId = navigation?.extras?.state?.['appointmentId'];

    if (!appointmentId) {
      this.isLoading = false;
      this.errorMessage = 'Identifiant de rendez-vous manquant';
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoading = false;
      this.errorMessage = 'Vous devez être connecté pour voir les détails du rendez-vous';
      return;
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<Appointment>(`${this.apiUrl}/appointments/${appointmentId}`, { headers }).subscribe({
      next: (response) => {
        this.appointment = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointment details:', error);
        this.errorMessage = 'Erreur lors du chargement des détails du rendez-vous';
        this.isLoading = false;
      }
    });
  }

  getAppointmentStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'declined':
        return 'danger';
      case 'cancelled':
        return 'medium';
      default:
        return 'medium';
    }
  }

  getAppointmentStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'accepted':
        return 'Confirmé';
      case 'declined':
        return 'Refusé';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  }

  cancelAppointment() {
    if (!this.appointment) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.put(`${this.apiUrl}/appointments/${this.appointment._id}/status`, { status: 'cancelled' }, { headers }).subscribe({
      next: () => {
        if (this.appointment) {
          this.appointment.status = 'cancelled';
        }
      },
      error: (error) => {
        console.error('Error cancelling appointment:', error);
      }
    });
  }

  goToMessaging() {
    if (!this.appointment) return;

    const contactId = this.userType === 'doctor' ? this.appointment.user_id : this.appointment.doctor_id;
    this.router.navigate(['/messaging'], { state: { contactId } });
  }

  goBack() {
    this.router.navigate(['/notifications']);
  }
}
