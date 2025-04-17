import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Ajout de CommonModule
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, HttpClientModule, CommonModule], // Ajout de CommonModule
})
export class LoginPage {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const payload = this.loginForm.value;

      try {
        const response: any = await this.apiService.login(payload).toPromise();
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.user_id);
        const toast = await this.toastController.create({
          message: 'Connexion réussie !',
          duration: 2000,
          color: 'success',
        });
        await toast.present();
        this.router.navigate(['/home']);
      } catch (error: any) {
        this.errorMessage = error.error?.error || 'Erreur lors de la connexion.';
        if (error.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez si le backend est en marche.';
        }
      } finally {
        this.isLoading = false;
      }
    }
  }

  goToInscription() {
    this.router.navigate(['/inscription']);
  }
}