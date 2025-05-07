import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Doctor {
  _id: string;
  name: string;
  surname?: string;
  email: string;
  specialty: string;
  profile_photo?: string;
  bio?: string;
  address?: string;
  city?: string;
  phone?: string;
  rating?: number;
  reviews?: number;
}

@Component({
  selector: 'app-doctor-details',
  templateUrl: './doctor-details.page.html',
  styleUrls: ['./doctor-details.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DoctorDetailsPage implements OnInit {
  doctor: Doctor | null = null;
  isLoggedIn: boolean = false;
  isFavorite: boolean = false;
  selectedSegment: string = 'about';
  appointmentDate: string = '';
  appointmentTime: string = '';
  appointmentReason: string = '';
  minDate: string = '';
  maxDate: string = '';
  availableTimes: string[] = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private router: Router,
    private http: HttpClient,
    private alertController: AlertController
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['doctor']) {
      this.doctor = navigation.extras.state['doctor'];
    }
  }

  ngOnInit() {
    this.checkLoginStatus();
    this.setupDateLimits();
    
    if (!this.doctor && this.router.getCurrentNavigation()?.extras?.state?.['doctorId']) {
      const doctorId = this.router.getCurrentNavigation()?.extras?.state?.['doctorId'];
      this.loadDoctorById(doctorId);
    }
  }

  checkLoginStatus() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
  }

  setupDateLimits() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);
    this.maxDate = maxDate.toISOString().split('T')[0];
    
    this.appointmentDate = this.minDate;
  }

  loadDoctorById(doctorId: string) {
    this.http.get<Doctor>(`${this.apiUrl}/doctors/${doctorId}`).subscribe({
      next: (response) => {
        this.doctor = response;
      },
      error: (error) => {
        console.error('Error loading doctor:', error);
        this.presentAlert('Erreur', 'Impossible de charger les informations du médecin.');
      }
    });
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    // Ici, vous pourriez implémenter la logique pour sauvegarder les favoris dans le backend
  }

  showReviews() {
    this.selectedSegment = 'reviews';
  }

  async bookAppointment() {
    if (!this.isLoggedIn) {
      this.goToLogin();
      return;
    }

    if (!this.appointmentDate || !this.appointmentTime || !this.appointmentReason) {
      this.presentAlert('Champs requis', 'Veuillez remplir tous les champs pour prendre rendez-vous.');
      return;
    }

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      this.goToLogin();
      return;
    }

    const appointmentData = {
      user_id: userId,
      doctor_id: this.doctor?._id,
      date: this.appointmentDate,
      time: this.appointmentTime,
      reason: this.appointmentReason
    };

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post(`${this.apiUrl}/appointments`, appointmentData, { headers }).subscribe({
      next: (response) => {
        this.presentAlert('Succès', 'Votre rendez-vous a été pris avec succès.', true);
        this.resetAppointmentForm();
      },
      error: (error) => {
        console.error('Error booking appointment:', error);
        this.presentAlert('Erreur', error.error?.message || 'Une erreur est survenue lors de la prise de rendez-vous.');
      }
    });
  }

  resetAppointmentForm() {
    this.appointmentDate = this.minDate;
    this.appointmentTime = '';
    this.appointmentReason = '';
  }

  async presentAlert(header: string, message: string, redirect: boolean = false) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [{
        text: 'OK',
        handler: () => {
          if (redirect) {
            this.router.navigate(['/appointments']);
          }
        }
      }]
    });

    await alert.present();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/inscription']);
  }
}
