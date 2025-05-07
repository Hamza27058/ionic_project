import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { IonicModule, AlertController, ModalController, ToastController } from '@ionic/angular';

interface User {
  _id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  photo?: string;
}

interface Doctor extends User {
  specialty: string;
  city: string;
  rating?: number;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule]
})
export class AdminPage implements OnInit {
  users: User[] = [];
  doctors: Doctor[] = [];
  segment: string = 'doctors';
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Formulaire pour ajouter un médecin
  newDoctor = {
    name: '',
    surname: '',
    email: '',
    password: '',
    specialty: '',
    city: ''
  };

  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private modalController: ModalController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.checkAdminAccess();
    this.loadDoctors();
    this.loadUsers();
  }

  checkAdminAccess() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType');
    
    if (!token || !userId || userType !== 'admin') {
      this.router.navigate(['/home']);
      return;
    }
  }

  segmentChanged(event: any) {
    this.segment = event.detail.value;
  }

  loadDoctors() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    
    this.http.get<Doctor[]>(`${this.apiUrl}/doctors`, { headers }).subscribe({
      next: (response) => {
        this.doctors = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des médecins:', error);
        this.errorMessage = 'Erreur lors du chargement des médecins';
        this.isLoading = false;
      }
    });
  }

  loadUsers() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    
    // Utiliser la route correcte pour récupérer tous les utilisateurs
    this.http.get<User[]>(`${this.apiUrl}/users`, { headers }).subscribe({
      next: (response) => {
        console.log('Utilisateurs récupérés:', response);
        // Filtrer pour n'avoir que les clients (pas les médecins ni les admins)
        this.users = response.filter(user => user.role === 'client');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.errorMessage = 'Erreur lors du chargement des utilisateurs';
        this.isLoading = false;
        // Afficher plus de détails sur l'erreur
        if (error.error && error.error.error) {
          this.errorMessage += ': ' + error.error.error;
        }
      }
    });
  }

  async addDoctor() {
    // Vérification de base des champs obligatoires
    if (!this.newDoctor.name || !this.newDoctor.surname || !this.newDoctor.email || !this.newDoctor.password) {
      await this.presentAlert('Erreur', 'Les champs nom, prénom, email et mot de passe sont obligatoires.');
      return;
    }
    
    this.isLoading = true;
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    
    const headers = new HttpHeaders({ 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    // IMPORTANT: Forcer des valeurs pour les champs posant problème
    // Créer une copie des données avec des valeurs par défaut explicites et garantir qu'elles sont de type string
    const doctorData = {
      name: this.newDoctor.name,
      surname: this.newDoctor.surname,
      email: this.newDoctor.email,
      password: this.newDoctor.password,
      // Forcer une valeur pour la spécialité comme une chaîne de caractères
      specialty: "Généraliste",
      // Forcer une valeur pour la ville comme une chaîne de caractères
      city: "Non spécifiée"
    };
    
    // Si l'utilisateur a saisi des valeurs, les utiliser après nettoyage
    if (this.newDoctor.specialty && this.newDoctor.specialty.trim() !== '') {
      doctorData.specialty = this.newDoctor.specialty.trim();
    }
    
    if (this.newDoctor.city && this.newDoctor.city.trim() !== '') {
      doctorData.city = this.newDoctor.city.trim();
    }
    
    // Vérification finale pour s'assurer que les champs sont bien définis
    if (!doctorData.specialty || doctorData.specialty === '') {
      doctorData.specialty = "Généraliste";
    }
    
    if (!doctorData.city || doctorData.city === '') {
      doctorData.city = "Non spécifiée";
    }
    
    console.log('Envoi des données du médecin:', JSON.stringify(doctorData));
    
    // Utiliser la route admin pour l'ajout de médecins
    this.http.post(`${this.apiUrl}/admin/doctors/add`, doctorData, { headers }).subscribe({
      next: async (response) => {
        console.log('Réponse du serveur:', response);
        this.isLoading = false;
        
        const toast = await this.toastController.create({
          message: 'Médecin ajouté avec succès',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        
        // Réinitialiser le formulaire
        this.resetDoctorForm();
        
        // Recharger la liste des médecins
        this.loadDoctors();
      },
      error: async (error) => {
        this.isLoading = false;
        console.error('Erreur lors de l\'ajout du médecin:', error);
        
        // Afficher les détails de l'erreur pour le débogage
        if (error.error) {
          console.error('Détails de l\'erreur:', error.error);
        }
        
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: error.error?.error || error.error?.details || 'Erreur lors de l\'ajout du médecin',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  validateDoctorForm(): boolean {
    if (!this.newDoctor.name || !this.newDoctor.surname || !this.newDoctor.email || 
        !this.newDoctor.password || !this.newDoctor.specialty || !this.newDoctor.city) {
      this.presentAlert('Validation', 'Veuillez remplir tous les champs');
      return false;
    }
    return true;
  }

  resetDoctorForm() {
    this.newDoctor = {
      name: '',
      surname: '',
      email: '',
      password: '',
      specialty: '',
      city: ''
    };
  }

  async deleteUser(userId: string, isDoctor: boolean = false) {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Êtes-vous sûr de vouloir supprimer cet ${isDoctor ? 'médecin' : 'utilisateur'} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          handler: () => {
            this.confirmDeleteUser(userId, isDoctor);
          }
        }
      ]
    });
    await alert.present();
  }

  confirmDeleteUser(userId: string, isDoctor: boolean) {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    // Utiliser les routes correctes pour la suppression
    const endpoint = isDoctor ? `${this.apiUrl}/admin/doctors/${userId}` : `${this.apiUrl}/admin/users/${userId}`;
    
    this.http.delete(endpoint, { headers }).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: `${isDoctor ? 'Médecin' : 'Utilisateur'} supprimé avec succès`,
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        
        // Recharger les listes
        if (isDoctor) {
          this.loadDoctors();
        } else {
          this.loadUsers();
        }
      },
      error: async (error) => {
        console.error(`Erreur lors de la suppression de l'${isDoctor ? 'médecin' : 'utilisateur'}:`, error);
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: error.error?.error || `Erreur lors de la suppression de l'${isDoctor ? 'médecin' : 'utilisateur'}`,
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async logout() {
    // Afficher une confirmation avant la déconnexion
    const alert = await this.alertController.create({
      header: 'Déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter de votre compte administrateur ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Déconnecter',
          handler: () => {
            // Supprimer les informations d'authentification
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userType');
            
            // Afficher un message de confirmation
            this.presentToast('Vous avez été déconnecté avec succès', 'success');
            
            // Rediriger vers la page d'accueil
            this.router.navigate(['/home']);
          }
        }
      ]
    });
    await alert.present();
  }

  async editProfile() {
    // Récupérer l'ID de l'utilisateur connecté
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!userId || !token) {
      this.presentToast('Vous devez être connecté pour accéder à votre profil', 'warning');
      return;
    }
    
    if (userType !== 'admin') {
      this.presentToast('Vous n\'avez pas les droits d\'administrateur', 'danger');
      return;
    }
    
    // Afficher une alerte pour confirmer la redirection vers la page de profil
    const alert = await this.alertController.create({
      header: 'Profil Administrateur',
      message: 'Vous allez être redirigé vers votre page de profil. Voulez-vous continuer ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Continuer',
          handler: () => {
            // Rediriger vers la page de profil
            this.router.navigate(['/profile']);
            this.presentToast('Vous pouvez maintenant modifier votre profil administrateur', 'primary');
          }
        }
      ]
    });
    await alert.present();
  }
  
  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}
