import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenPopupComponent } from './kitchen-popup.component';

describe('KitchenPopupComponent', () => {
  let component: KitchenPopupComponent;
  let fixture: ComponentFixture<KitchenPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KitchenPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KitchenPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
