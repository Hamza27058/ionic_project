import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface UserProfile {
  _id: string;
  name: string;
  surname: string;
  email: string;
  specialty: string;
  city: string;
  photo: string;
}

interface Message {
  _id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.page.html',
  styleUrls: ['./doctor-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],
})
export class DoctorDashboardPage implements OnInit {
  profile: UserProfile = {
    _id: '',
    name: '',
    surname: '',
    email: '',
    specialty: '',
    city: '',
    photo: ''
  };
  password: string = '';
  confirmPassword: string = '';
  messages: Message[] = [];
  contacts: any[] = [];
  selectedContact: any = null;
  newMessage: string = '';
  isLoading = false;
  errorMessage = '';
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadContacts();
  }

  loadProfile() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      this.router.navigate(['/login']);
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<UserProfile>(`${this.apiUrl}/profile`, { headers }).subscribe({
      next: (response) => {
        this.profile = response;
        this.isLoading = false;
      },
      error: async (err) => {
        this.errorMessage = 'Erreur lors du chargement du profil';
        console.error(err);
        this.isLoading = false;
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Impossible de charger le profil.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }

  async updateProfile() {
    if (!this.profile.name || !this.profile.surname || !this.profile.email || !this.profile.specialty || !this.profile.city) {
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: 'Tous les champs obligatoires doivent être remplis.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (this.password && this.password !== this.confirmPassword) {
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: 'Les mots de passe ne correspondent pas.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const updateData: any = {
      name: this.profile.name,
      surname: this.profile.surname,
      email: this.profile.email,
      specialty: this.profile.specialty,
      city: this.profile.city
    };

    if (this.password) {
      updateData.password = this.password;
      updateData.confirmPassword = this.confirmPassword;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.put(`${this.apiUrl}/profile`, updateData, { headers }).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Succès',
          message: 'Profil mis à jour avec succès !',
          buttons: ['OK'],
        });
        await alert.present();
        this.password = '';
        this.confirmPassword = '';
      },
      error: async (err) => {
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: err.error.error || 'Erreur lors de la mise à jour du profil.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }

  async uploadPhoto(event: any) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.post(`${this.apiUrl}/profile/photo`, formData, { headers }).subscribe({
      next: async (response: any) => {
        this.profile.photo = response.photo_url;
        const alert = await this.alertController.create({
          header: 'Succès',
          message: 'Photo de profil mise à jour !',
          buttons: ['OK'],
        });
        await alert.present();
      },
      error: async (err) => {
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Erreur lors du téléchargement de la photo.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }

  loadContacts() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      this.router.navigate(['/login']);
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any[]>(`${this.apiUrl}/contacts/${userId}`, { headers }).subscribe({
      next: (response) => {
        this.contacts = response;
      },
      error: (err) => {
        console.error('Error loading contacts:', err);
      },
    });
  }

  selectContact(contact: any) {
    this.selectedContact = contact;
    this.loadMessages();
  }

  loadMessages() {
    if (!this.selectedContact) return;
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<Message[]>(`${this.apiUrl}/messages/${userId}/${this.selectedContact._id}`, { headers }).subscribe({
      next: (response) => {
        this.messages = response;
      },
      error: (err) => {
        console.error('Error loading messages:', err);
      },
    });
  }

  sendMessage() {
    if (!this.newMessage || !this.selectedContact) return;
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const messageData = {
      sender_id: userId,
      receiver_id: this.selectedContact._id,
      content: this.newMessage,
    };
    this.http.post(`${this.apiUrl}/messages`, messageData, { headers }).subscribe({
      next: () => {
        this.newMessage = '';
        this.loadMessages();
      },
      error: (err) => {
        console.error('Error sending message:', err);
      },
    });
  }

  goToAppointments() {
    this.router.navigate(['/appointments']);
  }

  goToNotifications() {
    this.router.navigate(['/notifications']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.router.navigate(['/home']);
  }
}