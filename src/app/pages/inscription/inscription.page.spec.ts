import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InscriptionPage } from './inscription.page';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../services/api.service';
import { ReactiveFormsModule } from '@angular/forms';

describe('InscriptionPage', () => {
  let component: InscriptionPage;
  let fixture: ComponentFixture<InscriptionPage>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        InscriptionPage,
      ],
      providers: [ApiService, ToastController],
    }).compileComponents();

    fixture = TestBed.createComponent(InscriptionPage);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form and submit successfully', async () => {
    component.inscriptionForm.setValue({
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    component.onSubmit();
    const req = httpTestingController.expectOne('http://localhost:5000/api/register');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'mock-token', user_id: 'user123' });

    expect(localStorage.getItem('token')).toBe('mock-token');
    expect(localStorage.getItem('userId')).toBe('user123');
  });

  it('should show error if passwords do not match', () => {
    component.inscriptionForm.setValue({
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      confirmPassword: 'different',
    });

    expect(component.inscriptionForm.hasError('mismatch')).toBeTrue();
  });
});