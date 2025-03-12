import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular'; // Import IonicModule
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module'; // Ensure this path is correct
import { PatientService } from './services/patient.service'; // Ensure this path is correct












@NgModule({
  declarations: [
    AppComponent,    // other components
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, // Ensure this is correctly imported
    // other modules
  ],
  providers: [PatientService],
})
export class AppModule { }
