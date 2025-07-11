import { TestBed } from '@angular/core/testing';
import { ColorPickerComponent } from './color-picker.component';

describe('Color Picker', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorPickerComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(ColorPickerComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
