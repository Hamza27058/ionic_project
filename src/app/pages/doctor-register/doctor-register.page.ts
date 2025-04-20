import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-register',
  templateUrl: './doctor-register.page.html',
  styleUrls: ['./doctor-register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],
})
export class DoctorRegisterPage {
  name: string = '';
  surname: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  specialty: string = '';
  city: string = '';
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController
  ) {}

  async register() {
    if (!this.name || !this.surname || !this.email || !this.password || !this.confirmPassword || !this.specialty || !this.city) {
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: 'Tous les champs sont requis.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (this.password !== this.confirmPassword) {
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: 'Les mots de passe ne correspondent pas.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const registerData = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      password: this.password,
      specialty: this.specialty,
      city: this.city,
      role: 'doctor'
    };

    this.http.post(`${this.apiUrl}/doctor-register`, registerData).subscribe({
      next: async (response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.user_id);
        const successAlert = await this.alertController.create({
          header: 'Succès',
          message: 'Inscription réussie !',
          buttons: [{
            text: 'OK',
            handler: () => {
              this.router.navigate(['/doctor-dashboard']);
            }
          }],
        });
        await successAlert.present();
      },
      error: async (err) => {
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: err.error.error || 'Erreur lors de l’inscription.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }
}