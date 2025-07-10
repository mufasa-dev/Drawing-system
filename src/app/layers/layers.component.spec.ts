import { TestBed } from '@angular/core/testing';
import { LayersComponent } from './layers.component';

describe('Resize Modal', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayersComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(LayersComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
