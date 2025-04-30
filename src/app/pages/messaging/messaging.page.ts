import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.page.html',
  styleUrls: ['./messaging.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class MessagingPage implements OnInit {
  messages: any[] = [];
  newMessage: string = '';
  selectedContact: string = '';
  contacts: any[] = [];
  userId: string = ''; // Define userId property
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.userId = localStorage.getItem('userId') || ''; // Initialize userId
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadContacts();
  }

  loadContacts() {
    const token = localStorage.getItem('token');
    if (!token || !this.userId) {
      this.router.navigate(['/login']);
      return;
    }
    this.http
      .get<any[]>(`${this.apiUrl}/contacts/${this.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (response) => {
          console.log('Contacts loaded:', response);
          this.contacts = response;
          
          // Vérifier si un contact a été sélectionné depuis la page des notifications
          const selectedContactId = localStorage.getItem('selectedContactId');
          
          if (selectedContactId && this.contacts.some(contact => contact._id === selectedContactId)) {
            // Si le contact sélectionné existe dans la liste des contacts, l'utiliser
            this.selectedContact = selectedContactId;
            // Supprimer l'ID du contact sélectionné du localStorage pour ne pas l'utiliser à nouveau
            localStorage.removeItem('selectedContactId');
          } else if (response.length > 0) {
            // Sinon, utiliser le premier contact de la liste
            this.selectedContact = response[0]._id;
          } else {
            // Aucun contact disponible
            this.selectedContact = '';
            console.log('Aucun contact disponible');
          }
          
          // Charger les messages si un contact est sélectionné
          if (this.selectedContact) {
            this.loadMessages();
          }
        },
        error: (err) => {
          console.error('Erreur lors du chargement des contacts', err);
          // Afficher un message d'erreur à l'utilisateur
          this.presentToast('Erreur lors du chargement des contacts. Veuillez réessayer plus tard.');
        },
      });
  }

  async presentToast(message: string) {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = 3000;
    toast.position = 'bottom';
    toast.color = 'danger';

    document.body.appendChild(toast);
    return toast.present();
  }

  loadMessages() {
    const token = localStorage.getItem('token');
    if (!token || !this.userId || !this.selectedContact) return;
    this.http
      .get<any[]>(`${this.apiUrl}/messages/${this.userId}/${this.selectedContact}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (response) => {
          this.messages = response;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des messages', err);
        },
      });
  }

  sendMessage() {
    const token = localStorage.getItem('token');
    if (!token || !this.userId || !this.newMessage || !this.selectedContact) return;

    const messageData = {
      sender_id: this.userId,
      receiver_id: this.selectedContact,
      content: this.newMessage,
    };

    this.http
      .post(`${this.apiUrl}/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: () => {
          this.newMessage = '';
          this.loadMessages();
        },
        error: (err) => {
          console.error('Erreur lors de l’envoi du message', err);
        },
      });
  }

  onContactChange() {
    this.loadMessages();
  }

  getContactName() {
    if (!this.selectedContact) return '';
    const contact = this.contacts.find(c => c._id === this.selectedContact);
    return contact ? `${contact.name} ${contact.surname}` : '';
  }
}