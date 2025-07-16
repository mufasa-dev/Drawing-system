import { TestBed } from '@angular/core/testing';
import { ConfigToolsComponent } from './config-tools.component';

describe('Config tools', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigToolsComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(ConfigToolsComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
