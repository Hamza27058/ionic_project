import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../services/api.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let httpTestingController: HttpTestingController;
  let toastController: ToastController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        CommonModule, // Ajout pour *ngIf dans login.page.html
        LoginPage,
      ],
      providers: [ApiService, ToastController],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    toastController = TestBed.inject(ToastController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Correction de la faute de frappe
    localStorage.clear();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should validate form and login successfully', async () => {
    component.loginForm.setValue({
      email: 'john.doe@example.com',
      password: 'password123',
    });

    component.onSubmit();
    await fixture.whenStable(); // Attendre la résolution des appels asynchrones
    const req = httpTestingController.expectOne('http://localhost:5000/api/login');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'mock-token', user_id: 'user123' });

    fixture.detectChanges();
    expect(localStorage.getItem('token')).toBe('mock-token');
    expect(localStorage.getItem('userId')).toBe('user123');
  });

  it('should show error if email is invalid', () => {
    component.loginForm.setValue({
      email: 'invalid-email',
      password: 'password123',
    });

    fixture.detectChanges();
    expect(component.loginForm.get('email')?.hasError('email')).toBeTrue();
  });
});