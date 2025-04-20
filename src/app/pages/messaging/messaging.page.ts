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
    this.loadMessages();
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
          this.contacts = response;
          if (response.length > 0) {
            this.selectedContact = response[0]._id;
            this.loadMessages();
          }
        },
        error: (err) => {
          console.error('Erreur lors du chargement des contacts', err);
        },
      });
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
}