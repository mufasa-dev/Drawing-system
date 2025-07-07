import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faEraser, faPencil, faSave, faUpload } from "@fortawesome/free-solid-svg-icons";
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Tool } from '../enum/tools.enum';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [ FontAwesomeModule, NgbModule, FormsModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {

  @ViewChild('canvas', { static: false }) canva!: ElementRef<HTMLCanvasElement>;

  public tool: Tool = Tool.Pencil;

  private drawing: boolean = false;
  public ctx!: CanvasRenderingContext2D;
  public isBrowser: boolean = false;
  public lastX: number = 0;
  public lastY: number = 0;
  public lineWidth: number = 5;
  public Tool = Tool;

  public faPencil = faPencil;
  public faEraser = faEraser;
  public faSave = faSave;
  public faUpload = faUpload;

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
    
    const originalComposite = this.ctx.globalCompositeOperation;
    const originalStroke = this.ctx.strokeStyle;
    const originalWidth = this.ctx.lineWidth;

    this.ctx.lineWidth = this.lineWidth;

    if (this.tool === Tool.Eraser) {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.strokeStyle = 'rgba(0,0,0,1)'; 
    }

    this.ctx.lineTo(event.offsetX, event.offsetY);
    this.ctx.stroke();

    this.ctx.globalCompositeOperation = originalComposite;
    this.ctx.strokeStyle = originalStroke;
    this.ctx.lineWidth = originalWidth;
  }

  selectTool(tool: Tool) {
    this.tool = tool;
  }

  changeColor(event: Event) {
    const input = event.target as HTMLInputElement;
    this.ctx.strokeStyle = input.value;
  }

  saveDrawing() {
    if (!this.ctx || !this.canva) return;

    const canvas = this.canva.nativeElement;
    const image = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = image;
    link.download = 'desenho.png';
    link.click();
  }

  handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.ctx.drawImage(img, 0, 0);
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  }

}
