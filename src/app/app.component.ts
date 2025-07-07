import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faEraser, faPencil } from "@fortawesome/free-solid-svg-icons";
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
@Component({
  selector: 'app-root',
  imports: [ FontAwesomeModule, NgbModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {

  @ViewChild('canvas', { static: false }) canva!: ElementRef<HTMLCanvasElement>;

  public tool: 'pencil' | 'eraser' = 'pencil';

  private drawing: boolean = false;
  public ctx!: CanvasRenderingContext2D;
  public isBrowser: boolean = false;
  public lastX: number = 0;
  public lastY: number = 0;

  public faPencil = faPencil;
  public faEraser = faEraser;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    this.startCanvas();
  }

  startCanvas(): void {
    if (this.isBrowser) {
      const ctx = this.canva.nativeElement.getContext('2d');
      debugger;
      if (ctx == null) {
        console.log('error get ctx', this.canva)
        return;
      }
      this.ctx = ctx;
    }
  }

  startDrawing(event: MouseEvent) {
    this.drawing = true;
    if (!this.ctx) this.startCanvas();
    this.ctx.beginPath();
    this.ctx.moveTo(event.offsetX, event.offsetY);
  }

  stopDrawing() {
    this.drawing = false;
  }

  draw(event: MouseEvent) {
    if (!this.drawing) return;
    if (!this.ctx) this.startCanvas();

    const originalStroke = this.ctx.strokeStyle;

    if (this.tool === 'eraser') {
      this.ctx.strokeStyle = '#FFFFFF';
    }

    this.ctx.lineTo(event.offsetX, event.offsetY);
    this.ctx.stroke();

    this.ctx.strokeStyle = originalStroke;
  }

  selectTool(tool: 'pencil' | 'eraser') {
    this.tool = tool;
  }

  changeColor(event: Event) {
    const input = event.target as HTMLInputElement;
    this.ctx.strokeStyle = input.value;
  }
}
