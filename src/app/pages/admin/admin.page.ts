import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertController, IonicModule, ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule]
})
export class AdminPage implements OnInit {
  private apiUrl = 'http://localhost:5000/api';
  private token: string = '';
  private headers: HttpHeaders = new HttpHeaders();
  
  // Variables pour les utilisateurs et docteurs
  users: any[] = [];
  doctors: any[] = [];
  selectedTab: string = 'doctors';
  
  // Variables pour l'ajout de docteur
  showAddDoctorForm: boolean = false;
  newDoctor: any = {
    name: '',
    surname: '',
    email: '',
    password: '',
    specialty: '',
    city: '',
    photo: ''
  };
  
  // Variables pour les statistiques
  stats = {
    totalUsers: 0,
    totalDoctors: 0,
    totalClients: 0
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.token = localStorage.getItem('token') || '';
    this.headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` });
    
    // Vérifier si l'utilisateur est un administrateur
    this.checkAdminStatus();
    
    // Charger les données initiales
    this.loadDoctors();
    this.loadUsers();
    this.calculateStats();
  }
  
  checkAdminStatus() {
    this.http.get(`${this.apiUrl}/admin/check-admin`, { headers: this.headers }).subscribe({
      next: (response: any) => {
        if (!response.is_admin) {
          this.showAccessDeniedAlert();
        }
      },
      error: (err) => {
        console.error('Erreur de vérification admin:', err);
        this.showAccessDeniedAlert();
      }
    });
  }
  
  async showAccessDeniedAlert() {
    const alert = await this.alertController.create({
      header: 'Accès refusé',
      message: 'Vous n\'avez pas les privilèges d\'administrateur nécessaires pour accéder à cette page.',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.router.navigate(['/home']);
        }
      }]
    });
    await alert.present();
  }
  
  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }
  
  loadDoctors() {
    this.http.get(`${this.apiUrl}/admin/doctors`, { headers: this.headers }).subscribe({
      next: (response: any) => {
        this.doctors = response;
        this.calculateStats();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des médecins:', err);
      }
    });
  }
  
  loadUsers() {
    this.http.get(`${this.apiUrl}/admin/users`, { headers: this.headers }).subscribe({
      next: (response: any) => {
        this.users = response;
        this.calculateStats();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs:', err);
      }
    });
  }
  
  calculateStats() {
    this.stats.totalUsers = this.users.length;
    this.stats.totalDoctors = this.users.filter(user => user.role === 'doctor').length;
    this.stats.totalClients = this.users.filter(user => user.role === 'client').length;
  }
  
  toggleAddDoctorForm() {
    this.showAddDoctorForm = !this.showAddDoctorForm;
    if (this.showAddDoctorForm) {
      // Réinitialiser le formulaire
      this.newDoctor = {
        name: '',
        surname: '',
        email: '',
        password: '',
        specialty: '',
        city: '',
        photo: ''
      };
    }
  }
  
  async addDoctor() {
    // Valider les champs requis
    if (!this.newDoctor.name || !this.newDoctor.surname || !this.newDoctor.email || 
        !this.newDoctor.password || !this.newDoctor.specialty || !this.newDoctor.city) {
      const alert = await this.alertController.create({
        header: 'Champs manquants',
        message: 'Veuillez remplir tous les champs obligatoires.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    
    // Envoyer la requête pour ajouter un docteur
    this.http.post(`${this.apiUrl}/admin/doctors`, this.newDoctor, { headers: this.headers }).subscribe({
      next: async (response: any) => {
        const toast = await this.toastController.create({
          message: 'Médecin ajouté avec succès',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        
        // Recharger la liste des médecins et masquer le formulaire
        this.loadDoctors();
        this.toggleAddDoctorForm();
      },
      error: async (err) => {
        console.error('Erreur lors de l\'ajout du médecin:', err);
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: err.error?.error || 'Une erreur est survenue lors de l\'ajout du médecin.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
  
  async confirmDeleteUser(user: any) {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Êtes-vous sûr de vouloir supprimer ${user.name} ${user.surname} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.deleteUser(user._id);
          }
        }
      ]
    });
    await alert.present();
  }
  
  deleteUser(userId: string) {
    this.http.delete(`${this.apiUrl}/admin/users/${userId}`, { headers: this.headers }).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Utilisateur supprimé avec succès',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        
        // Recharger les listes
        this.loadUsers();
        this.loadDoctors();
      },
      error: async (err) => {
        console.error('Erreur lors de la suppression de l\'utilisateur:', err);
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: err.error?.error || 'Une erreur est survenue lors de la suppression de l\'utilisateur.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
  
  async editUser(user: any) {
    // Implémenter l'édition d'utilisateur (à développer)
    const alert = await this.alertController.create({
      header: 'Fonctionnalité à venir',
      message: 'L\'édition des utilisateurs sera disponible prochainement.',
      buttons: ['OK']
    });
    await alert.present();
  }
  
  getUserRoleLabel(role: string): string {
    switch(role) {
      case 'admin': return 'Administrateur';
      case 'doctor': return 'Médecin';
      case 'client': return 'Client';
      default: return 'Utilisateur';
    }
  }
  
  getRoleColor(role: string): string {
    switch(role) {
      case 'admin': return 'danger';
      case 'doctor': return 'tertiary';
      case 'client': return 'primary';
      default: return 'medium';
    }
  }
  
  logout() {
    // Supprimer les informations d'authentification du stockage local
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    
    // Afficher un message de confirmation
    this.toastController.create({
      message: 'Vous êtes déconnecté',
      duration: 2000,
      color: 'success'
    }).then(toast => toast.present());
    
    // Rediriger vers la page de connexion
    this.router.navigate(['/login']);
  }
}
