import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { RegistrationModalPage } from '../registration-modal/registration-modal.page';

interface Doctor {
  _id: string;
  name: string;
  surname: string;
  specialty: string;
  city: string;
  photo?: string;
  rating?: number;
  isFavorite?: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HttpClientModule],
})
export class HomePage implements OnInit {
  searchQuery = '';
  doctors: Doctor[] = [];
  popularSpecialties = [
    { name: 'Cardiologie', icon: 'heart-outline' },
    { name: 'Dermatologie', icon: 'body-outline' },
    { name: 'Gynécologie', icon: 'female-outline' },
    { name: 'Pédiatrie', icon: 'child-outline' },
  ];
  cities = ['Casablanca', 'Rabat', 'Marrakech', 'Fès'];
  selectedCity = '';
  isLoading = false;
  errorMessage = '';
  notificationCount = 0;
  userRole: string = '';
  isLoggedIn: boolean = false;
  private apiUrl = 'http://localhost:5000/api';
  private loginStatus = new BehaviorSubject<boolean>(false);

  constructor(
    private router: Router,
    private http: HttpClient,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadDoctors();
    this.checkUserStatus();
  }

  checkUserStatus() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      this.http.get(`${this.apiUrl}/profile`, { headers }).subscribe({
        next: (user: any) => {
          this.userRole = user.role || 'client';
          this.isLoggedIn = true;
          this.loginStatus.next(true);
          this.loadNotifications();
        },
        error: () => {
          this.userRole = '';
          this.isLoggedIn = false;
          this.loginStatus.next(false);
        },
      });
    } else {
      this.userRole = '';
      this.isLoggedIn = false;
      this.loginStatus.next(false);
    }
  }

  loadDoctors() {
    this.isLoading = true;
    this.errorMessage = '';
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    const url = this.selectedCity
      ? `${this.apiUrl}/doctors?city=${this.selectedCity}`
      : `${this.apiUrl}/doctors`;
    this.http.get<Doctor[]>(url, { headers, responseType: 'json' }).subscribe({
      next: (response) => {
        this.doctors = response.map((doctor) => ({
          ...doctor,
          isFavorite: false,
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des médecins';
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  onSearch(event?: Event) {
    this.isLoading = true;
    this.errorMessage = '';
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.loadDoctors();
      return;
    }
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    this.http.get<Doctor[]>(`${this.apiUrl}/doctors`, { headers, responseType: 'json' }).subscribe({
      next: (response) => {
        this.doctors = response.filter(
          (doctor) =>
            doctor.name.toLowerCase().includes(query) ||
            doctor.specialty.toLowerCase().includes(query)
        );
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la recherche';
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  onSpecialtySelected(specialty: { name: string; icon: string }) {
    this.isLoading = true;
    this.errorMessage = '';
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    this.http.get<Doctor[]>(`${this.apiUrl}/doctors/${specialty.name}`, { headers, responseType: 'json' }).subscribe({
      next: (response) => {
        this.doctors = response;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Aucun médecin trouvé pour cette spécialité';
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  onFilterChange() {
    this.loadDoctors();
  }

  async bookAppointment(doctor: Doctor) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      const alert = await this.alertController.create({
        header: 'Connexion requise',
        message: 'Vous devez être connecté pour prendre un rendez-vous.',
        buttons: [
          {
            text: 'Annuler',
            role: 'cancel',
          },
          {
            text: 'Se connecter',
            handler: () => {
              this.router.navigate(['/login']);
            },
          },
        ],
      });
      await alert.present();
      return;
    }

    if (this.userRole === 'doctor') {
      const alert = await this.alertController.create({
        header: 'Action non autorisée',
        message: 'Les médecins ne peuvent pas prendre de rendez-vous en tant que clients.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmer le rendez-vous',
      message: `Confirmez-vous votre rendez-vous avec ${doctor.name} ?`,
      inputs: [
        {
          name: 'date',
          type: 'datetime-local',
          value: new Date().toISOString().slice(0, 16),
        },
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'Confirmer',
          handler: (data) => {
            const appointmentData = {
              doctor_id: doctor._id,
              user_id: userId,
              date: data.date,
            };
            const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
            this.http
              .post(`${this.apiUrl}/appointments`, appointmentData, { headers })
              .subscribe({
                next: async () => {
                  const successAlert = await this.alertController.create({
                    header: 'Succès',
                    message: 'Rendez-vous pris avec succès !',
                    buttons: ['OK'],
                  });
                  await successAlert.present();
                  this.goToAppointments();
                },
                error: async (err) => {
                  const alert = await this.alertController.create({
                    header: 'Erreur',
                    message: 'Erreur lors de la prise de rendez-vous.',
                    buttons: ['OK'],
                  });
                  await alert.present();
                  console.error(err);
                },
              });
          },
        },
      ],
    });
    await alert.present();
  }

  viewDoctorDetails(doctor: Doctor) {
    this.router.navigate(['/doctor-details'], { state: { doctor } });
  }

  toggleFavorite(doctor: Doctor) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.userRole === 'doctor') {
      this.alertController.create({
        header: 'Action non autorisée',
        message: 'Les médecins ne peuvent pas ajouter de favoris.',
        buttons: ['OK'],
      }).then((alert) => alert.present());
      return;
    }
    doctor.isFavorite = !doctor.isFavorite;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http
      .post(
        `${this.apiUrl}/favorites`,
        { doctor_id: doctor._id, user_id: userId, isFavorite: doctor.isFavorite },
        { headers }
      )
      .subscribe({
        next: () => {
          console.log('Favorite updated');
        },
        error: (err) => {
          console.error('Error updating favorite:', err);
          doctor.isFavorite = !doctor.isFavorite;
        },
      });
  }

  goToProfile() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    this.router.navigate([token && userId ? '/profile' : '/login']);
  }

  goToAppointments() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    this.router.navigate([token && userId ? '/appointments' : '/login']);
  }

  goToMessaging() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    this.router.navigate([token && userId ? '/messaging' : '/login']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  async openRegisterModal() {
    const modal = await this.modalController.create({
      component: RegistrationModalPage,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data?.role) {
      const targetRoute = data.role === 'doctor' ? '/doctor-register' : '/inscription';
      console.log(`Navigating to: ${targetRoute}`); // Debugging
      this.router.navigate([targetRoute]).catch(err => {
        console.error('Navigation error:', err);
      });
    } else {
      console.log('Modal dismissed without role selection');
    }
  }

  openNotifications() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    this.router.navigate([token && userId ? '/notifications' : '/login']);
  }

  loadNotifications() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      this.http.get<any[]>(`${this.apiUrl}/notifications/${userId}`, { headers }).subscribe({
        next: (response) => {
          this.notificationCount = response.length;
        },
        error: (err) => {
          console.error('Error loading notifications:', err);
          this.notificationCount = 0;
        },
      });
    } else {
      this.notificationCount = 0;
    }
  }
}