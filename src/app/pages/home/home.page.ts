import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HttpClientModule],
})
export class HomePage implements OnInit {
  searchQuery = '';
  locationFilter = '';
  doctors: any[] = [];
  popularSpecialties = [
    { name: 'Cardiologie', icon: 'heart-outline' },
    { name: 'Dermatologie', icon: 'body-outline' },
    { name: 'Gynécologie', icon: 'female-outline' },
    { name: 'Pédiatrie', icon: 'child-outline' },
  ];
  page = 1;
  perPage = 10;
  isLoading = false;
  totalDoctors = 0;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadDoctors();
  }

  async loadDoctors(event?: any) {
    this.isLoading = true;
    try {
      const response = await this.apiService.getDoctors(this.page, this.perPage, this.searchQuery, this.locationFilter).toPromise();
      this.doctors = event ? [...this.doctors, ...response.data] : response.data;
      this.totalDoctors = response.total;
      if (event) {
        event.target.complete();
        if (this.doctors.length >= this.totalDoctors) {
          event.target.disabled = true;
        }
      }
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Erreur lors du chargement des médecins',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  loadMoreDoctors(event: any) {
    this.page++;
    this.loadDoctors(event);
  }

  onSearch() {
    this.page = 1;
    this.doctors = [];
    this.loadDoctors();
  }

  onSpecialtySelected(specialty: any) {
    this.searchQuery = specialty.name;
    this.onSearch();
  }

  async bookAppointment(doctor: any) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      const toast = await this.toastController.create({
        message: 'Vous devez être connecté pour prendre un rendez-vous.',
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
      this.router.navigate(['/inscription']);
      return;
    }

    const appointmentData = {
      doctor_id: doctor._id,
      user_id: userId,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    try {
      await this.apiService.bookAppointment(appointmentData).toPromise();
      const toast = await this.toastController.create({
        message: 'Rendez-vous pris avec succès !',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
      this.router.navigate(['/appointments']);
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Erreur lors de la prise de rendez-vous',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  viewDoctorDetails(doctor: any) {
    this.router.navigate(['/doctor-details'], { state: { doctor } });
  }

  openNotifications() {
    this.router.navigate(['/notifications']);
  }
}