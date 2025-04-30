import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  authSegment: string = 'login';
  
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController
  ) {}
  
  ngOnInit() {
    // Initialiser le segment
    this.authSegment = 'login';
  }

  segmentChanged(ev: any) {
    this.authSegment = ev.detail.value;
  }

  async login() {
    if (!this.email || !this.password) {
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: 'Email et mot de passe sont requis.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    this.http.post(`${this.apiUrl}/login`, { email: this.email, password: this.password }).subscribe({
      next: async (response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.user_id);
        
        // Store user type
        const userType = response.user_type || 'client';
        localStorage.setItem('userType', userType);
        
        const headers = new HttpHeaders({ Authorization: `Bearer ${response.token}` });
        this.http.get(`${this.apiUrl}/profile`, { headers }).subscribe({
          next: (user: any) => {
            const role = user.role || 'client';
            if (role === 'doctor') {
              this.router.navigate(['/doctor-dashboard']);
            } else {
              this.router.navigate(['/home']);
            }
          },
          error: (err) => {
            console.error('Error loading profile:', err);
            this.router.navigate(['/home']);
          },
        });
      },
      error: async (err) => {
        console.error('Login error:', err);
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: err.error?.error || 'Erreur de connexion. Vérifiez vos identifiants.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }

  forgotPassword() {
    // Implémenter la fonctionnalité de mot de passe oublié
    this.alertController.create({
      header: 'Mot de passe oublié',
      message: 'Un email de réinitialisation va vous être envoyé.',
      buttons: ['OK']
    }).then(alert => alert.present());
  }

  goToRegister(type: string) {
    if (type === 'doctor') {
      this.router.navigate(['/doctor-register']);
    } else {
      this.router.navigate(['/inscription']);
    }
  }
}