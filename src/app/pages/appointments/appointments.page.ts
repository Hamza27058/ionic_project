import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.page.html',
  styleUrls: ['./appointments.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    HttpClientModule,
    CommonModule
  ]
})
export class AppointmentsPage implements OnInit {
  appointments: any[] = [];
  isLoading = false;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      this.router.navigate(['/inscription']);
      return;
    }

    this.isLoading = true;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get(`http://localhost:5000/api/appointments/${userId}`, { headers }).subscribe(
      (response: any) => {
        this.appointments = response;
        this.fetchDoctorNames(); // Récupérer les noms des médecins
        this.isLoading = false;
      },
      error => {
        console.error('Erreur lors du chargement des rendez-vous:', error);
        this.isLoading = false;
        if (error.status === 401) {
          alert('Session expirée ou invalide. Veuillez vous reconnecter.');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          this.router.navigate(['/login']);
        } else {
          alert(`Erreur: ${error.error?.error || 'Inconnue'}`);
        }
      }
    );
  }

  fetchDoctorNames() {
    this.appointments.forEach(appointment => {
      this.http.get(`http://localhost:5000/api/doctors`).subscribe(
        (doctors: any) => {
          const doctor = doctors.find((d: any) => d._id === appointment.doctor_id);
          appointment.doctorName = doctor ? doctor.name : 'Médecin inconnu';
        },
        error => {
          console.error('Erreur lors de la récupération du nom du médecin:', error);
          appointment.doctorName = 'Médecin inconnu';
        }
      );
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}