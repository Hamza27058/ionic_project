import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    HttpClientModule,
    CommonModule
  ]
})
export class ProfilePage implements OnInit {
  profile: any = null;
  isEditing = false;
  isLoading = false;
  name: string = '';
  surname: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  // Référence à l'élément input de type file
  @ViewChild('photoInput') photoInput!: ElementRef;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      this.router.navigate(['/inscription']);
      return;
    }

    this.isLoading = true;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get('http://localhost:5000/api/profile', { headers }).subscribe(
      (response: any) => {
        this.profile = response;
        this.name = response.name;
        this.surname = response.surname;
        this.email = response.email;
        this.isLoading = false;
      },
      error => {
        console.error('Erreur lors du chargement du profil:', error);
        this.isLoading = false;
        if (error.status === 401) {
          alert('Session expirée ou invalide. Veuillez vous reconnecter.');
          this.logout();
        } else {
          alert(`Erreur: ${error.error?.error || 'Inconnue'}`);
        }
      }
    );
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.password = '';
      this.confirmPassword = '';
    }
  }

  updateProfile() {
    if (this.password && this.password !== this.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    const payload = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      password: this.password || undefined,
      confirmPassword: this.confirmPassword || undefined
    };

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.isLoading = true;
    this.http.put('http://localhost:5000/api/profile', payload, { headers }).subscribe(
      (response: any) => {
        alert('Profil mis à jour avec succès');
        this.isEditing = false;
        this.loadProfile();
        this.isLoading = false;
      },
      error => {
        console.error('Erreur lors de la mise à jour:', error);
        this.isLoading = false;
        alert(`Erreur: ${error.error?.error || 'Inconnue'}`);
      }
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.router.navigate(['/home']);
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  triggerPhotoInput() {
    this.photoInput.nativeElement.click();
  }

  uploadPhoto(event: any) {
    const file = event.target.files[0];
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('photo', file);
    this.isLoading = true;
    this.http.post('http://localhost:5000/api/profile/photo', formData, { headers }).subscribe(
      (response: any) => {
        alert('Photo de profil mise à jour avec succès');
        this.loadProfile();
        this.isLoading = false;
      },
      error => {
        console.error('Erreur lors de la mise à jour de la photo:', error);
        this.isLoading = false;
        alert(`Erreur: ${error.error?.error || 'Inconnue'}`);
      }
    );
  }
}