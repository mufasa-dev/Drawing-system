import { TestBed } from '@angular/core/testing';
import { ConfigComponent } from './config-modal.component';

describe('Resize Modal', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(ConfigComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
