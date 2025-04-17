import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, HttpClientModule, CommonModule],
})
export class ProfilePage implements OnInit {
  profile: any = null;
  isEditing = false;
  isLoading = false;
  editForm: FormGroup;
  errorMessage = '';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private fb: FormBuilder,
    private toastController: ToastController
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]],
      confirmPassword: [''],
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadProfile();
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password && confirmPassword && password === confirmPassword
      ? null
      : { mismatch: true };
  }

  async loadProfile() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      const toast = await this.toastController.create({
        message: 'Veuillez vous connecter pour voir votre profil.',
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    try {
      const response: any = await this.apiService.getProfile().toPromise();
      this.profile = response;
      this.editForm.patchValue({
        name: response.name,
        surname: response.surname,
        email: response.email,
      });
    } catch (error: any) {
      this.errorMessage = error.error?.error || 'Erreur lors du chargement du profil.';
      if (error.status === 401) {
        this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        this.logout();
      }
    } finally {
      this.isLoading = false;
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.editForm.patchValue({
        password: '',
        confirmPassword: '',
      });
      this.errorMessage = '';
    }
  }

  async updateProfile() {
    if (this.editForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const payload = this.editForm.value;
      if (!payload.password) {
        delete payload.password;
        delete payload.confirmPassword;
      } else {
        delete payload.confirmPassword;
      }

      try {
        await this.apiService.updateProfile(payload).toPromise();
        const toast = await this.toastController.create({
          message: 'Profil mis à jour avec succès.',
          duration: 2000,
          color: 'success',
        });
        await toast.present();
        this.isEditing = false;
        this.loadProfile();
      } catch (error: any) {
        this.errorMessage = error.error?.error || 'Erreur lors de la mise à jour du profil.';
      } finally {
        this.isLoading = false;
      }
    }
  }

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    const toast = await this.toastController.create({
      message: 'Déconnexion réussie.',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
    this.router.navigate(['/home']);
  }
}