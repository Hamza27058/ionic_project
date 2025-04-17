import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http'; // Ajout de HttpErrorResponse
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.page.html',
  styleUrls: ['./appointments.page.scss'],
  standalone: true,
  imports: [IonicModule, HttpClientModule, CommonModule],
})
export class AppointmentsPage implements OnInit {
  appointments: any[] = [];
  isLoading = false;
  page = 1;
  perPage = 10;
  totalAppointments = 0;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  async loadAppointments(event?: any) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      const toast = await this.toastController.create({
        message: 'Veuillez vous connecter pour voir vos rendez-vous.',
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    try {
      const response = await this.apiService.getAppointments(userId, this.page, this.perPage).toPromise();
      this.appointments = event ? [...this.appointments, ...response.data] : response.data;
      this.totalAppointments = response.total;
      if (event) {
        event.target.complete();
        if (this.appointments.length >= this.totalAppointments) {
          event.target.disabled = true;
        }
      }
    } catch (error: unknown) {
      const message = error instanceof HttpErrorResponse && error.status === 401
        ? 'Session expirée. Veuillez vous reconnecter.'
        : 'Erreur lors du chargement des rendez-vous.';
      const toast = await this.toastController.create({
        message,
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
      if (error instanceof HttpErrorResponse && error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        this.router.navigate(['/login']);
      }
    } finally {
      this.isLoading = false;
    }
  }

  loadMoreAppointments(event: any) {
    this.page++;
    this.loadAppointments(event);
  }

  async cancelAppointment(appointment: any) {
    if (appointment.status === 'Annulé') return;

    try {
      await this.apiService.cancelAppointment(appointment._id).toPromise();
      appointment.status = 'Annulé';
      const toast = await this.toastController.create({
        message: 'Rendez-vous annulé avec succès.',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
    } catch (error: unknown) {
      const toast = await this.toastController.create({
        message: 'Erreur lors de l’annulation du rendez-vous.',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }
}