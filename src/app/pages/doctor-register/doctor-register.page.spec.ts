import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorRegisterPage } from './doctor-register.page';

describe('DoctorRegisterPage', () => {
  let component: DoctorRegisterPage;
  let fixture: ComponentFixture<DoctorRegisterPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorRegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
