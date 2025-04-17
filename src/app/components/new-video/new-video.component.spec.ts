import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVideoComponent } from './new-video.component';

describe('NewVideoComponent', () => {
  let component: NewVideoComponent;
  let fixture: ComponentFixture<NewVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewVideoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
