import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas') canva!: ElementRef<HTMLCanvasElement>;
  private drawing: boolean = false;
  public ctx!: CanvasRenderingContext2D;

  ngAfterViewInit(): void {
    let ctx = this.canva.nativeElement.getContext('2d');
    if (ctx) this.ctx = ctx;
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
