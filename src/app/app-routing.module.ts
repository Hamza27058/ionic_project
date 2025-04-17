import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { AppointmentsPage } from './pages/appointments/appointments.page';
import { InscriptionPage } from './pages/inscription/inscription.page';
import { LoginPage } from './pages/login/login.page';
import { ProfilePage } from './pages/profile/profile.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomePage,
  },
  {
    path: 'appointments',
    component: AppointmentsPage,
  },
  {
    path: 'inscription',
    component: InscriptionPage,
  },
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: 'profile',
    component: ProfilePage,
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module' /* @vite-ignore */).then(m => m.SettingsPageModule),
  },
  {
    path: 'doctor-details',
    loadChildren: () => import('./pages/doctor-details/doctor-details.module' /* @vite-ignore */).then(m => m.DoctorDetailsPageModule),
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module' /* @vite-ignore */).then(m => m.NotificationsPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}utingModule {}