import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../services/patient.service'; // Adjust the path if necessary

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
  patients: any[] = [];

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.patientService.getPatients().subscribe(
      (data: any) => { 
        this.patients = data;
      },
      (error: any) => { 
        console.error('Error fetching patients:', error);
      }
    );
  }
}
