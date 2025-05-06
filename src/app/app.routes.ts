import { Routes } from '@angular/router';

export const routes: Routes = [
  
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  
  
  
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then( m => m.HomePage)
  },
  {
    path: 'inscription',
    loadComponent: () => import('./pages/inscription/inscription.page').then( m => m.InscriptionPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
  },
  // Ajout de la route home/profile pour rediriger vers profile
  {
    path: 'home/profile',
    redirectTo: 'profile',
    pathMatch: 'full'
  },
  {
    path: 'appointments',
    loadComponent: () => import('./pages/appointments/appointments.page').then( m => m.AppointmentsPage)
  },
  // Ajout de la route home/appointments pour rediriger vers appointments
  {
    path: 'home/appointments',
    redirectTo: 'appointments',
    pathMatch: 'full'
  },
  {
    path: 'sidebar',
    loadComponent: () => import('./pages/sidebar/sidebar.page').then( m => m.SidebarPage)
  },
  {
    path: 'doctor-register',
    loadComponent: () => import('./pages/doctor-register/doctor-register.page').then( m => m.DoctorRegisterPage)
  },
  {
    path: 'doctor-dashboard',
    loadComponent: () => import('./pages/doctor-dashboard/doctor-dashboard.page').then( m => m.DoctorDashboardPage)
  },
  {
    path: 'messaging',
    loadComponent: () => import('./pages/messaging/messaging.page').then( m => m.MessagingPage)
  },
  // Ajout de la route home/messaging pour rediriger vers messaging
  {
    path: 'home/messaging',
    redirectTo: 'messaging',
    pathMatch: 'full'
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications.page').then( m => m.NotificationsPage)
  },
  // Ajout de la route home/notifications pour rediriger vers notifications
  {
    path: 'home/notifications',
    redirectTo: 'notifications',
    pathMatch: 'full'
  },
  {
    path: 'registration-modal',
    loadComponent: () => import('./pages/registration-modal/registration-modal.page').then( m => m.RegistrationModalPage)
  },
  {
    path: 'doctor-details',
    loadComponent: () => import('./pages/doctor-details/doctor-details.page').then( m => m.DoctorDetailsPage)
  },
  // Ajout d'une route pour les détails des rendez-vous
  {
    path: 'appointment-details',
    loadComponent: () => import('./pages/appointment-details/appointment-details.page').then( m => m.AppointmentDetailsPage)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.page').then( m => m.AdminPage)
  },
];
