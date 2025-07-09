import { TestBed } from '@angular/core/testing';
import { ResizeComponent } from './resize-modal.component';

describe('Resize Modal', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResizeComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(ResizeComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
