import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Doctor {
  _id: string;
  name: string;
  surname?: string;
  email: string;
  specialty: string;
  profile_photo?: string;
  rating?: number;
  reviews?: number;
  address?: string;
  price?: string;
  availability?: string;
}

interface Category {
  name: string;
  icon: string;
  color: string;
}

interface Appointment {
  _id: string;
  doctor_id: string;
  user_id: string;
  date: string;
  time: string;
  status: string;
  created_at: string;
  updated_at: string;
  doctor_name: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  isLoggedIn: boolean = false;
  userName: string = '';
  doctors: Doctor[] = [];
  filteredSpecialty: string | null = null;
  searchQuery: string = '';
  
  // Propriétés pour les statistiques
  upcomingAppointments: number = 0;
  daysUntilNextAppointment: number = 0;
  appointmentCompletionRate: number = 74; // Valeur par défaut comme dans Health Tracker
  totalConsultations: number = 0;
  totalTreatments: number = 0;
  followUpRate: number = 0;
  nextAppointmentDate: string = '';
  
  categories: Category[] = [
    { name: 'Cardiologie', icon: 'heart', color: '#EF4444' },
    { name: 'Pédiatrie', icon: 'child', color: '#10B981' },
    { name: 'Dermatologie', icon: 'body', color: '#F59E0B' },
    { name: 'Neurologie', icon: 'brain', color: '#6366F1' },
    { name: 'Ophtalmologie', icon: 'eye', color: '#8B5CF6' },
    { name: 'Dentiste', icon: 'medical', color: '#EC4899' },
    { name: 'Psychiatrie', icon: 'happy', color: '#14B8A6' },
    { name: 'Orthopédie', icon: 'fitness', color: '#F97316' },
  ];

  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.checkLoginStatus();
    this.loadDoctors();
    if (this.isLoggedIn) {
      this.loadUserInfo();
      this.loadAppointmentsStats();
    }
  }

  checkLoginStatus() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
  }

  loadUserInfo() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    if (!userId || !token) return;
    
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    this.http.get<any>(`${this.apiUrl}/users/${userId}`, { headers }).subscribe({
      next: (user) => {
        this.userName = user.name || 'Utilisateur';
      },
      error: (error) => {
        console.error('Error loading user info:', error);
      }
    });
  }

  loadAppointmentsStats() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!userId || !token) return;
    
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const endpoint = userType === 'doctor' ? 
      `${this.apiUrl}/appointments/doctor/${userId}` : 
      `${this.apiUrl}/appointments/user/${userId}`;
    
    this.http.get<Appointment[]>(endpoint, { headers }).subscribe({
      next: (appointments) => {
        // Calculer les statistiques des rendez-vous
        const upcomingAppointments = appointments.filter(app => app.status === 'accepted');
        this.upcomingAppointments = upcomingAppointments.length;
        
        // Calculer les jours jusqu'au prochain rendez-vous
        if (upcomingAppointments.length > 0) {
          // Trier les rendez-vous par date
          upcomingAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          const nextAppointment = upcomingAppointments[0];
          const nextAppDate = new Date(nextAppointment.date);
          const today = new Date();
          
          // Calculer la différence en jours
          const diffTime = Math.abs(nextAppDate.getTime() - today.getTime());
          this.daysUntilNextAppointment = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Formater la date du prochain rendez-vous
          this.nextAppointmentDate = nextAppDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
        }
        
        // Calculer le taux de complétion des rendez-vous
        const completedAppointments = appointments.filter(app => app.status === 'completed').length;
        const totalAppointments = appointments.length;
        
        if (totalAppointments > 0) {
          this.appointmentCompletionRate = Math.round((completedAppointments / totalAppointments) * 100);
        }
        
        // Autres statistiques
        this.totalConsultations = totalAppointments;
        this.totalTreatments = Math.floor(totalAppointments * 0.3); // Exemple : 30% des consultations ont abouti à un traitement
        this.followUpRate = Math.round((upcomingAppointments.length / totalAppointments) * 100);
      },
      error: (error) => {
        console.error('Error loading appointments stats:', error);
      }
    });
  }

  loadDoctors() {
    this.http.get<Doctor[]>(`${this.apiUrl}/doctors`).subscribe({
      next: (response) => {
        this.doctors = response;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
      }
    });
  }

  searchDoctors(event: any) {
    this.searchQuery = event.detail.value.toLowerCase();
    this.applyFilters();
  }

  filterBySpecialty(specialty: string) {
    this.filteredSpecialty = specialty;
    this.applyFilters();
  }

  resetFilter() {
    this.filteredSpecialty = null;
    this.searchQuery = '';
    this.loadDoctors();
  }

  applyFilters() {
    this.http.get<Doctor[]>(`${this.apiUrl}/doctors`).subscribe({
      next: (doctors) => {
        let filtered = doctors;
        
        // Filtrer par spécialité
        if (this.filteredSpecialty) {
          filtered = filtered.filter(doctor => 
            doctor.specialty.toLowerCase() === this.filteredSpecialty?.toLowerCase()
          );
        }
        
        // Filtrer par recherche
        if (this.searchQuery) {
          filtered = filtered.filter(doctor => 
            doctor.name.toLowerCase().includes(this.searchQuery) || 
            doctor.specialty.toLowerCase().includes(this.searchQuery)
          );
        }
        
        this.doctors = filtered;
      },
      error: (error) => {
        console.error('Error filtering doctors:', error);
      }
    });
  }

  viewDoctorDetails(doctor: Doctor) {
    this.router.navigate(['/doctor-details'], { state: { doctor } });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/inscription']);
  }
}