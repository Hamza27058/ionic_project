import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonicModule, AlertController, ModalController, ToastController } from '@ionic/angular';
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

interface Appointment {
  _id: string;
  doctor_id: string;
  user_id: string;
  date: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  doctor_name: string;
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
  profile: any = {};
  appointments: any[] = [];
  contacts: any[] = [];
  messages: any[] = [];
  selectedContact: any = null;
  newMessage: string = '';
  isLoading = true;
  errorMessage = '';
  password = '';
  confirmPassword = '';
  selectedTab = 'appointments'; // Onglet par défaut
  pendingAppointmentsCount = 0;
  acceptedAppointmentsCount = 0;
  notificationCount = 0;
  pendingAppointments: any[] = [];
  acceptedAppointments: any[] = [];
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadAppointments();
    this.loadContacts();
    this.loadNotifications();
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
    this.http.get(`${this.apiUrl}/profile`, { headers }).subscribe({
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

  loadAppointments() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      this.router.navigate(['/login']);
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<Appointment[]>(`${this.apiUrl}/doctor-appointments/${userId}`, { headers }).subscribe({
      next: (response) => {
        this.appointments = response;
        this.pendingAppointments = this.appointments.filter(appointment => appointment.status === 'pending');
        this.acceptedAppointments = this.appointments.filter(appointment => appointment.status === 'accepted');
        this.pendingAppointmentsCount = this.pendingAppointments.length;
        this.acceptedAppointmentsCount = this.acceptedAppointments.length;
      },
      error: async (err) => {
        console.error('Error loading appointments:', err);
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Impossible de charger les rendez-vous.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }

  acceptAppointment(appointmentId: string) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      this.router.navigate(['/login']);
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const updateData = { status: 'accepted' };
    this.http.put(`${this.apiUrl}/appointments/${appointmentId}`, updateData, { headers }).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Succès',
          message: 'Rendez-vous accepté avec succès !',
          buttons: ['OK'],
        });
        await alert.present();
        this.loadAppointments();
      },
      error: async (err) => {
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Erreur lors de l\'acceptation du rendez-vous.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }

  rejectAppointment(appointmentId: string) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      this.router.navigate(['/login']);
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const updateData = { status: 'rejected' };
    this.http.put(`${this.apiUrl}/appointments/${appointmentId}`, updateData, { headers }).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Succès',
          message: 'Rendez-vous refusé avec succès !',
          buttons: ['OK'],
        });
        await alert.present();
        this.loadAppointments();
      },
      error: async (err) => {
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Erreur lors du refus du rendez-vous.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }

  loadNotifications() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      this.router.navigate(['/login']);
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any[]>(`${this.apiUrl}/notifications/${userId}`, { headers }).subscribe({
      next: (response) => {
        this.notificationCount = response.length;
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
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

  contactPatient(patientId: string) {
    // Stocker l'ID du patient dans le localStorage pour l'utiliser dans la page de messagerie
    localStorage.setItem('selectedContactId', patientId);
    // Naviguer vers la page de messagerie
    this.router.navigate(['/messaging']);
  }

  goToMessaging() {
    this.router.navigate(['/messaging']);
  }

  @ViewChild('photoInput') photoInput!: ElementRef;

  triggerPhotoInput() {
    this.photoInput.nativeElement.click();
  }
}