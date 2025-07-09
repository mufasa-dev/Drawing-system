import { TestBed } from '@angular/core/testing';
import { NewPictureComponent } from './new-picture.component';

describe('Resize Modal', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPictureComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(NewPictureComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
