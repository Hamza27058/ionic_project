import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilePage } from './profile.page';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../services/api.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let httpTestingController: HttpTestingController;
  let toastController: ToastController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        CommonModule, // Ajout pour *ngIf dans profile.page.html
        ProfilePage,
      ],
      providers: [ApiService, ToastController],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
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

  it('should load profile on init', async () => {
    const mockProfile = {
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      created_at: '2025-04-16T00:00:00Z',
    };

    component.ngOnInit();
    await fixture.whenStable(); // Attendre la résolution des appels asynchrones
    const req = httpTestingController.expectOne('http://localhost:5000/api/profile');
    expect(req.request.method).toBe('GET');
    req.flush(mockProfile);

    fixture.detectChanges();
    expect(component.profile).toEqual(mockProfile);
    expect(component.editForm.get('name')?.value).toBe('John');
  });

  it('should update profile successfully', async () => {
    component.profile = { name: 'John', surname: 'Doe', email: 'john.doe@example.com' };
    component.editForm.setValue({
      name: 'Jane',
      surname: 'Doe',
      email: 'jane.doe@example.com',
      password: '',
      confirmPassword: '',
    });

    component.updateProfile();
    await fixture.whenStable(); // Attendre la résolution des appels asynchrones
    const req = httpTestingController.expectOne('http://localhost:5000/api/profile');
    expect(req.request.method).toBe('PUT');
    req.flush({});

    const loadReq = httpTestingController.expectOne('http://localhost:5000/api/profile');
    loadReq.flush({ name: 'Jane', surname: 'Doe', email: 'jane.doe@example.com' });

    fixture.detectChanges();
    expect(component.isEditing).toBeFalse();
    expect(component.profile.name).toBe('Jane');
  });

  it('should logout and redirect to home', async () => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');

    await component.logout();
    await fixture.whenStable(); // Attendre la résolution des appels asynchrones
    fixture.detectChanges();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });
});