import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonGridComponent } from './button-grid.component';

describe('ButtonGridComponent', () => {
  let component: ButtonGridComponent;
  let fixture: ComponentFixture<ButtonGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
