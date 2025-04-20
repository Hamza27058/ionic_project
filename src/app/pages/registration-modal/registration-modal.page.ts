import { Component } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration-modal',
  templateUrl: './registration-modal.page.html',
  styleUrls: ['./registration-modal.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class RegistrationModalPage {
  constructor(private modalController: ModalController) {}

  selectRole(role: string) {
    console.log(`Dismissing modal with role: ${role}`); // Debugging
    this.modalController.dismiss({ role });
  }

  cancel() {
    console.log('Modal cancelled'); // Debugging
    this.modalController.dismiss();
  }
}