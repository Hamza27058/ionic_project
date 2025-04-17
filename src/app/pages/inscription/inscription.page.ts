import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Ajout de CommonModule
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.page.html',
  styleUrls: ['./inscription.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, HttpClientModule, CommonModule], // Ajout de CommonModule
})
export class InscriptionPage {
  inscriptionForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController
  ) {
    this.inscriptionForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  async onSubmit() {
    if (this.inscriptionForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const payload = this.inscriptionForm.value;
      delete payload.confirmPassword;

      try {
        const response: any = await this.apiService.register(payload).toPromise();
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.user_id);
        const toast = await this.toastController.create({
          message: 'Inscription réussie !',
          duration: 2000,
          color: 'success',
        });
        await toast.present();
        this.router.navigate(['/home']);
      } catch (error: any) {
        this.errorMessage = error.error?.error || 'Erreur lors de l’inscription.';
        if (error.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez si le backend est en marche.';
        }
      } finally {
        this.isLoading = false;
      }
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}