import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, HttpClientModule]
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  async onSubmit(event: Event) {
    event.preventDefault();

    const payload = {
      email: this.email,
      password: this.password
    };

    console.log('Données envoyées:', payload);

    try {
      const response: any = await this.http.post('http://localhost:5000/api/login', payload).toPromise();
      console.log('Réponse connexion:', response);
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user_id);
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Erreur complète:', error);
      console.log('Réponse du serveur:', error.error);
      if (error.status === 0) {
        alert('Impossible de se connecter au serveur. Vérifiez si le backend est en marche.');
      } else {
        alert(`Erreur: ${error.error?.error || 'Inconnue'} - Détails: ${error.error?.details || 'Aucun détail'}`);
      }
    }
  }

  goToInscription() {
    this.router.navigate(['/inscription']);
  }
}