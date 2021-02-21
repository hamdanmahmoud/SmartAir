import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendPassword } from './send-password.component';

describe('SendPasswordPopupComponent', () => {
  let component: SendPassword;
  let fixture: ComponentFixture<SendPassword>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendPassword ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
