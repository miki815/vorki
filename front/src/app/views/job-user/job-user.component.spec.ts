import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobUserComponent } from './job-user.component';

describe('JobUserComponent', () => {
  let component: JobUserComponent;
  let fixture: ComponentFixture<JobUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JobUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
