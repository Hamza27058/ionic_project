import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsPage } from './appointments.page';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

describe('AppointmentsPage', () => {
  let component: AppointmentsPage;
  let fixture: ComponentFixture<AppointmentsPage>;
  let httpTestingController: HttpTestingController;
  let toastController: ToastController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule,
        CommonModule, // Ajout pour *ngIf dans appointments.page.html
        AppointmentsPage,
      ],
      providers: [ApiService, ToastController],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsPage);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    toastController = TestBed.inject(ToastController);
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('userId', 'user123');
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load appointments on init', async () => {
    const mockAppointments = {
      data: [
        { _id: 'appt1', doctorName: 'Dr. Smith', date: '2025-04-20T10:00:00Z', created_at: '2025-04-16T00:00:00Z' }
      ],
      total: 1
    };

    component.ngOnInit();
    await fixture.whenStable(); // Attendre la résolution des appels asynchrones
    const req = httpTestingController.expectOne(req => req.url.includes('/appointments/user123'));
    expect(req.request.method).toBe('GET');
    req.flush(mockAppointments);

    fixture.detectChanges();
    expect(component.appointments).toEqual(mockAppointments.data);
    expect(component.totalAppointments).toBe(mockAppointments.total);
  });

  it('should redirect to login if not authenticated', async () => {
    localStorage.clear();
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');

    component.ngOnInit();
    await fixture.whenStable(); // Attendre la résolution des appels asynchrones
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});