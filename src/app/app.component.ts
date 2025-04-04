import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
@Component({
  selector: 'app-root',
  imports: [ FontAwesomeModule, NgbModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {

  @ViewChild('canvas') canva!: ElementRef<HTMLCanvasElement>;

  private drawing: boolean = false;
  public ctx!: CanvasRenderingContext2D;

  public faPencil = faPencil;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (ctx == null) return;
      this.ctx = ctx;
      this.ctx.fillStyle = 'blue';
      this.ctx.fillRect(0, 0, 200, 200);
    }
  }

  startDrawing(event: MouseEvent) {
    this.drawing = true;
    this.ctx.beginPath;
    this.ctx.moveTo(event.offsetX, event.offsetY);
  }

  stopDrawing() {
    this.drawing = false;
  }

  draw(event: MouseEvent) {
    if (!this.drawing) return;
    this.ctx.lineTo(event.offsetX, event.offsetY);
    this.ctx.stroke();
  }

  changeColor(event: Event) {
    const input = event.target as HTMLInputElement;
    this.ctx.strokeStyle = input.value;
  }
}
