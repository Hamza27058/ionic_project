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

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  isLoggedIn: boolean = false;
  doctors: Doctor[] = [];
  filteredSpecialty: string | null = null;
  searchQuery: string = '';
  
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
  }

  checkLoginStatus() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    // Vérifier à la fois le token et l'userId pour déterminer si l'utilisateur est connecté
    this.isLoggedIn = !!(token && userId);
    console.log('Login status checked:', this.isLoggedIn);
  }

  loadDoctors() {
    this.http.get<Doctor[]>(`${this.apiUrl}/doctors`).subscribe({
      next: (response) => {
        this.doctors = response;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.doctors = []; // Assurez-vous que doctors est un tableau vide en cas d'erreur
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