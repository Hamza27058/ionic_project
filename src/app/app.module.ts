import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http'; // Importez ceci
import { FormsModule } from '@angular/forms';
import { LoginPage } from './pages/login/login.page'; // Update the path if the file is located in 'pages/login'
import { InscriptionPage } from './pages/inscription/inscription.page'; // Adjusted path
import { HomePage } from './pages/home/home.page';
import { ProfilePage } from './pages/profile/profile.page'; // Adjusted path

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AppComponent,
    HttpClientModule, // Ajoutez ceci ici
    FormsModule,
    LoginPage, // Import standalone component here
    InscriptionPage, // Import standalone component here
    HomePage, // Import standalone component here
    ProfilePage // Import standalone component here
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  // Removed bootstrap array as AppComponent is a standalone component
})
export class AppModule {}