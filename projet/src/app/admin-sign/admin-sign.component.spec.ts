import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSignComponent } from './admin-sign.component';

describe('AdminSignComponent', () => {
  let component: AdminSignComponent;
  let fixture: ComponentFixture<AdminSignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminSignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
