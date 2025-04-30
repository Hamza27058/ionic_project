import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface Notification {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  read: boolean;
  type?: string;
  action?: string;
  related_id?: string;
}

interface Appointment {
  _id: string;
  doctor_id: string;
  user_id: string;
  date: string;
  time?: string;
  reason?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  doctor_name: string;
  user_photo?: string;
  doctor_photo?: string;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule],
})
export class NotificationsPage implements OnInit {
  notifications: Notification[] = [];
  acceptedAppointments: Appointment[] = [];
  pendingAppointments: Appointment[] = [];
  isLoading = false;
  errorMessage = '';
  userType: string = 'client'; // Par défaut, on considère l'utilisateur comme un client
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.checkUserType();
    this.loadNotifications();
    this.loadAppointments();
  }

  checkUserType() {
    const userType = localStorage.getItem('userType');
    if (userType) {
      this.userType = userType;
    }
  }

  loadNotifications() {
    this.isLoading = true;
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      this.errorMessage = 'Vous devez être connecté pour voir vos notifications';
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<Notification[]>(`${this.apiUrl}/notifications/${userId}`, { headers }).subscribe({
      next: (response) => {
        this.notifications = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.errorMessage = 'Erreur lors du chargement des notifications';
        this.isLoading = false;
      }
    });
  }

  loadAppointments() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      return;
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const endpoint = this.userType === 'doctor' ? 
      `${this.apiUrl}/appointments/doctor/${userId}` : 
      `${this.apiUrl}/appointments/user/${userId}`;

    this.http.get<Appointment[]>(endpoint, { headers }).subscribe({
      next: (response) => {
        // Filtrer les rendez-vous acceptés
        this.acceptedAppointments = response.filter(app => app.status === 'accepted');
        // Filtrer les rendez-vous en attente (pour les médecins uniquement)
        if (this.userType === 'doctor') {
          this.pendingAppointments = response.filter(app => app.status === 'pending');
        }
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
      }
    });
  }

  getNotificationIcon(type?: string): string {
    switch (type) {
      case 'appointment':
        return 'calendar-outline';
      case 'message':
        return 'chatbubble-outline';
      case 'system':
        return 'information-circle-outline';
      default:
        return 'notifications-outline';
    }
  }

  getNotificationColor(type?: string): string {
    switch (type) {
      case 'appointment':
        return 'medical';
      case 'message':
        return 'accent';
      case 'system':
        return 'warning';
      default:
        return 'medium';
    }
  }

  handleNotificationAction(notification: Notification) {
    if (!notification.action || !notification.related_id) return;

    switch (notification.action) {
      case 'view_appointment':
        this.router.navigate(['/appointment-details'], { state: { appointmentId: notification.related_id } });
        break;
      case 'view_message':
        this.router.navigate(['/messaging'], { state: { contactId: notification.related_id } });
        break;
      default:
        break;
    }

    // Marquer la notification comme lue
    this.markAsRead(notification.id);
  }

  markAsRead(notificationId: string) {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.put(`${this.apiUrl}/notifications/${notificationId}/read`, {}, { headers }).subscribe({
      next: () => {
        // Mettre à jour l'état local
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
          this.notifications[index].read = true;
        }
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  markAllAsRead() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId || !token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.put(`${this.apiUrl}/notifications/${userId}/read-all`, {}, { headers }).subscribe({
      next: () => {
        // Mettre à jour l'état local
        this.notifications.forEach(notification => {
          notification.read = true;
        });
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
      }
    });
  }

  acceptAppointment(appointmentId: string) {
    this.updateAppointmentStatus(appointmentId, 'accepted');
  }

  declineAppointment(appointmentId: string) {
    this.updateAppointmentStatus(appointmentId, 'declined');
  }

  updateAppointmentStatus(appointmentId: string, status: string) {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.put(`${this.apiUrl}/appointments/${appointmentId}/status`, { status }, { headers }).subscribe({
      next: () => {
        // Mettre à jour les listes locales
        if (status === 'accepted') {
          const appointment = this.pendingAppointments.find(a => a._id === appointmentId);
          if (appointment) {
            appointment.status = 'accepted';
            this.acceptedAppointments.push(appointment);
            this.pendingAppointments = this.pendingAppointments.filter(a => a._id !== appointmentId);
          }
        } else {
          this.pendingAppointments = this.pendingAppointments.filter(a => a._id !== appointmentId);
        }
        this.presentToast(status === 'accepted' ? 'Rendez-vous accepté' : 'Rendez-vous refusé');
      },
      error: (error) => {
        console.error(`Error ${status} appointment:`, error);
        this.presentToast('Erreur lors de la mise à jour du rendez-vous');
      }
    });
  }

  async presentToast(message: string) {
    const alert = await this.alertController.create({
      header: 'Information',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  goToMessaging(appointment: Appointment) {
    const contactId = this.userType === 'doctor' ? appointment.user_id : appointment.doctor_id;
    this.router.navigate(['/messaging'], { state: { contactId } });
  }

  viewAppointmentDetails(appointment: Appointment) {
    this.router.navigate(['/appointment-details'], { state: { appointmentId: appointment._id } });
  }

  trackById(index: number, item: any) {
    return item.id || item._id || index;
  }
}