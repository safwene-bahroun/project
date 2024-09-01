import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YourAbsenceComponent } from './your-absence.component';

describe('YourAbsenceComponent', () => {
  let component: YourAbsenceComponent;
  let fixture: ComponentFixture<YourAbsenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [YourAbsenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YourAbsenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
