import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule
  ]
})
export class HomePage implements OnInit {
  showSettings = false;
  darkMode = false;
  notificationsEnabled = true;
  searchQuery = '';
  searchResults: any[] = [];
  doctors: any[] = [];
  isLoading = false; // Indicateur de chargement
  popularSpecialties = [
    { name: 'Cardiologie', icon: 'heart-outline' },
    { name: 'Dermatologie', icon: 'body-outline' },
    { name: 'Gynécologie', icon: 'female-outline' },
    { name: 'Pédiatrie', icon: 'child-outline' },
  ];

  constructor(private router: Router, private http: HttpClient) {
    this.loadDoctors();
  }

  ngOnInit() {}

  loadDoctors() {
    this.isLoading = true;
    this.http.get('http://localhost:5000/api/doctors').subscribe(
      (response: any) => {
        this.doctors = response;
        this.isLoading = false;
      },
      error => {
        console.error('Erreur lors du chargement des médecins:', error);
        this.isLoading = false;
        alert('Erreur lors du chargement des médecins.');
      }
    );
  }

  toggleSettings() {
    this.showSettings = !this.showSettings;
  }

  onSpecialtySelected(specialty: any) {
    this.isLoading = true;
    this.http.get(`http://localhost:5000/api/doctors/${specialty.name}`).subscribe(
      (response: any) => {
        this.doctors = response;
        this.isLoading = false;
      },
      error => {
        console.error('Erreur lors de la recherche par spécialité:', error);
        this.doctors = [];
        this.isLoading = false;
        alert(`Aucun médecin trouvé pour ${specialty.name}.`);
      }
    );
  }

  viewDoctorDetails(doctor: any) {
    this.router.navigate(['/doctor-details'], { state: { doctor } });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.isLoading = true;
      this.http.get('http://localhost:5000/api/doctors').subscribe(
        (response: any) => {
          this.searchResults = response.filter((doctor: any) =>
            doctor.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
          this.doctors = this.searchResults;
          this.isLoading = false;
        },
        error => {
          console.error('Erreur lors de la recherche:', error);
          this.isLoading = false;
          alert('Erreur lors de la recherche.');
        }
      );
    }
  }

  bookAppointment(doctor: any) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Vous devez être connecté pour prendre un rendez-vous.');
      this.router.navigate(['/inscription']);
      return;
    }

    const appointmentData = {
      doctor_id: doctor._id,
      user_id: userId,
      date: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    this.isLoading = true;
    this.http.post('http://localhost:5000/api/appointments', appointmentData).subscribe(
      (response: any) => {
        alert('Rendez-vous pris avec succès!');
        this.isLoading = false;
        this.goToAppointments();
      },
      error => {
        console.error('Erreur lors de la prise de rendez-vous:', error);
        this.isLoading = false;
        alert('Erreur lors de la prise de rendez-vous.');
      }
    );
  }

  goToProfile() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/inscription']);
    }
  }

  goToAppointments() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      this.router.navigate(['/appointments']);
    } else {
      this.router.navigate(['/inscription']);
    }
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  openNotifications() {
    this.router.navigate(['/notifications']);
  }
}