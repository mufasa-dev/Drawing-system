import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faCogs, faEraser, faPencil, faSave, faUpload } from "@fortawesome/free-solid-svg-icons";
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
  public drawName: string = "image";
  public canvasWidth: number = 800;
  public canvasHeight: number = 600;
  public Tool = Tool;

  public tempDrawName: string = "image";
  public tempCanvasWidth: number = 800;
  public tempCanvasHeight: number = 600;

  public faPencil = faPencil;
  public faEraser = faEraser;
  public faSave = faSave;
  public faUpload = faUpload;
  public faCogs = faCogs;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private modalService: NgbModal) {
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

  resizeCanvas() {
    if (!this.canva) return;

    const canvas = this.canva.nativeElement;

    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);

    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;

    this.ctx = canvas.getContext('2d')!;
    this.ctx.lineCap = 'round';
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeStyle = '#000';

    this.ctx.putImageData(imageData, 0, 0);
  }

  applyResize(modal: any) {
    this.drawName = this.tempDrawName;
    this.canvasHeight = this.tempCanvasHeight;
    this.canvasWidth = this.tempCanvasWidth;
    this.resizeCanvas();
    modal.close();
  }

  openResizeModal(content: any) {
    this.tempCanvasHeight = this.canvasHeight;
    this.tempCanvasWidth = this.canvasWidth;
    this.tempDrawName = this.drawName
    this.modalService.open(content, { centered: true });
  }

  saveDrawing() {
    if (!this.ctx || !this.canva) return;

    const canvas = this.canva.nativeElement;
    const image = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = image;
    link.download = this.drawName + '.png';
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
        // 🔁 Redimensiona o canvas ANTES de desenhar
        this.canvasWidth = img.width;
        this.canvasHeight = img.height;

        const canvas = this.canva.nativeElement;

        // Redimensiona o elemento
        canvas.width = img.width;
        canvas.height = img.height;

        // Recria contexto
        this.ctx = canvas.getContext('2d')!;
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.strokeStyle = '#000';

        // ✅ Agora é seguro desenhar a imagem
        this.ctx.drawImage(img, 0, 0);
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  }

}
