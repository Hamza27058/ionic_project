import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePage } from './home.page';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../services/api.service';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule,
        HomePage,
      ],
      providers: [ApiService, ToastController],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
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

  it('should load doctors on init', () => {
    const mockDoctors = { data: [{ _id: '1', name: 'Dr. Smith', specialty: 'Cardiologie' }], total: 1 };
    const req = httpTestingController.expectOne(req => req.url.includes('/doctors'));
    expect(req.request.method).toBe('GET');
    req.flush(mockDoctors);

    expect(component.doctors).toEqual(mockDoctors.data);
    expect(component.totalDoctors).toBe(mockDoctors.total);
  });

  it('should filter doctors by specialty', () => {
    const specialty = { name: 'Cardiologie' };
    component.onSpecialtySelected(specialty);
    expect(component.searchQuery).toBe('Cardiologie');

    const mockDoctors = { data: [{ _id: '1', name: 'Dr. Smith', specialty: 'Cardiologie' }], total: 1 };
    const req = httpTestingController.expectOne(req => req.url.includes('/doctors'));
    req.flush(mockDoctors);

    expect(component.doctors).toEqual(mockDoctors.data);
  });
});