import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ]
})
export class ProfilePage {
  profile = {
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  onSubmit() {
    console.log('Profil mis à jour :', this.profile);
    // Implémenter la logique de mise à jour du profil
  }
}