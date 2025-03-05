import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,  // ✅ Importer le module Ionic
  ]
})
export class HomePage {
  constructor(private router: Router) {}
  showSettings = false;
  darkMode = false;
  notificationsEnabled = true;
  searchQuery = '';
  searchResults: string[] = [];
  doctors = [
    { name: 'Dr. Dupont', specialty: 'Cardiologue', photo: 'assets/images/doctor1.jpg' },
    { name: 'Dr. Martin', specialty: 'Dermatologue', photo: 'assets/images/doctor2.jpg' },
    { name: 'Dr. Leroy', specialty: 'Gynécologue', photo: 'assets/images/doctor3.jpg' },
  ];
  popularSpecialties = [
    { name: 'Cardiologie', icon: 'heart-outline' },
    { name: 'Dermatologie', icon: 'body-outline' },
    { name: 'Gynécologie', icon: 'female-outline' },
    { name: 'Pédiatrie', icon: 'child-outline' },
  ];
  toggleSettings() {
    this.showSettings = !this.showSettings;
  }
  onSpecialtySelected(specialty: any) {
    console.log('Spécialité sélectionnée :', specialty);
    // Rediriger vers une page de recherche ou de détails
  }
  
  // Fonction pour afficher les détails d'un médecin
  viewDoctorDetails(doctor: any) {
    console.log('Détails du médecin :', doctor);
    // Rediriger vers une page de détails
  }
  onSearch() {
    // Simuler des résultats de recherche
    this.searchResults = this.doctors
      .filter(doctor => doctor.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
      .map(doctor => doctor.name);
  }

  onDoctorSelected(doctor: any) {
    console.log('Médecin sélectionné :', doctor);
    // Rediriger vers une page de détails ou de prise de rendez-vous
  }

  bookAppointment(doctor: any) {
    console.log('Prendre rendez-vous avec :', doctor);
    // Implémenter la logique de prise de rendez-vous
  }

  goToProfile() {
    console.log('Aller au profil');
    if (this.router) {
      this.router.navigate(['/profile']);
    }
  }

  goToAppointments() {
    console.log('Voir les rendez-vous');
    // Rediriger vers la page des rendez-vous
  }

  goToSettings() {
    console.log('Aller aux paramètres');
    // Rediriger vers la page des paramètres
}
openNotifications()
{}
}