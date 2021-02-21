import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeManagementComponent } from './home-management.component';

describe('HomeManagementComponent', () => {
  let component: HomeManagementComponent;
  let fixture: ComponentFixture<HomeManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
