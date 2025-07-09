import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faCogs, faEraser, faPencil, faPlus, faSave, faUpload } from "@fortawesome/free-solid-svg-icons";
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Tool } from '../enum/tools.enum';
import { FormsModule } from '@angular/forms';
import { Layer } from '../model/layer.model';
import { Picture } from '../model/picture.model';
import { ResizeComponent } from "./resize-modal/resize-modal.component";

@Component({
  selector: 'app-root',
  imports: [FontAwesomeModule, NgbModule, FormsModule, ResizeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {

  @ViewChild('canvas', { static: false }) canva!: ElementRef<HTMLCanvasElement>;
  @ViewChild('previewCanvas', { static: false }) previewCanvasRef!: ElementRef<HTMLCanvasElement>;

  public tool: Tool = Tool.Pencil;

  public picture: Picture = new Picture();
  private drawing: boolean = false;
  public ctx!: CanvasRenderingContext2D;
  public isBrowser: boolean = false;
  public lastX: number = 0;
  public lastY: number = 0;
  public lineWidth: number = 5;
  public layers: Layer[] = [];
  public activeLayerId: string = '';
  public currentColor: string = '#000000';
  public countLayers: number = 1;
  public Tool = Tool;

  public faPencil = faPencil;
  public faEraser = faEraser;
  public faSave = faSave;
  public faUpload = faUpload;
  public faCogs = faCogs;
  public faPlus = faPlus;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private modalService: NgbModal) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
     if (this.isBrowser) {
      setTimeout(() => {
        this.createLayer();
      }, 100);
    }
  }

  startCanvas(): void {
    if (this.isBrowser) {
      const ctx = this.canva.nativeElement.getContext('2d');
      if (ctx == null) {
        console.log('error get ctx', this.canva)
        return;
      }
      this.ctx = ctx;
    }
  }

  startDrawing(event: MouseEvent) {
    const layer = this.layers.find(l => l.id === this.activeLayerId);
    if (!layer) return;

    this.drawing = true;

    const ctx = layer.ctx;

    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
  }

  stopDrawing() {
    this.drawing = false;
  }

  draw(event: MouseEvent) {
    if (!this.drawing) return;

    const layer = this.layers.find(l => l.id === this.activeLayerId);
    if (!layer) return;

    const ctx = layer.ctx;

    const originalComposite = ctx.globalCompositeOperation;
    const originalStroke = ctx.strokeStyle;
    const originalWidth = ctx.lineWidth;

    ctx.lineWidth = this.lineWidth;

    if (this.tool === Tool.Eraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    }

    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();

    ctx.globalCompositeOperation = originalComposite;
    ctx.strokeStyle = originalStroke;
    ctx.lineWidth = originalWidth;

    this.updatePreview();
  }

  selectTool(tool: Tool) {
    this.tool = tool;
  }

  changeColor(event: Event) {
    const input = event.target as HTMLInputElement;
    this.currentColor = input.value;

    const layer = this.layers.find(l => l.id === this.activeLayerId);
    if (!layer) return;

    layer.ctx.strokeStyle = this.currentColor;
  }

  createLayer() {
    const canvas = document.createElement('canvas');
    canvas.width = this.picture.width;
    canvas.height = this.picture.height;
    canvas.classList.add('absolute-canvas');

    const ctx = canvas.getContext('2d')!;
    ctx.lineCap = 'round';
    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = this.currentColor;

    const newLayer: Layer = {
      id: crypto.randomUUID(),
      name: 'Camada ' + this.countLayers,
      visible: true,
      canvas,
      ctx,
    };
    this.countLayers++;

    this.layers.push(newLayer);
    this.activeLayerId = newLayer.id;

    const container = document.querySelector('.my-canva')!;
    container.appendChild(canvas);

    this.layers.forEach(l => {
      l.canvas.style.pointerEvents = (l.id === this.activeLayerId) ? 'auto' : 'none';
    });
  }

  toggleLayer(id: string) {
    const layer = this.layers.find(l => l.id === id);
    if (!layer) return;
    layer.visible = !layer.visible;
    layer.canvas.style.display = layer.visible ? 'block' : 'none';

    this.updatePreview();
  }

  removeLayer(id: string) {
    const index = this.layers.findIndex(l => l.id === id);
    if (index === -1) return;

    const [layer] = this.layers.splice(index, 1);
    layer.canvas.remove();

    if (this.activeLayerId === layer.id && this.layers.length > 0) {
      this.activeLayerId = this.layers[0].id;
    }

    this.updatePreview();
  }

  setActiveLayer(id: string) {
    this.activeLayerId = id;
    this.layers.forEach(layer => {
      layer.canvas.style.pointerEvents = (layer.id === id) ? 'auto' : 'none';
      layer.ctx.strokeStyle = this.currentColor;
    });
  }

  resizeCanvas() {
    this.layers.forEach(layer => {
      const oldCanvas = layer.canvas;
      const oldCtx = layer.ctx;

      const imageData = oldCtx.getImageData(0, 0, oldCanvas.width, oldCanvas.height);

      oldCanvas.width = this.picture.width;
      oldCanvas.height = this.picture.height;

      const newCtx = oldCanvas.getContext('2d')!;
      newCtx.lineCap = 'round';
      newCtx.lineWidth = this.lineWidth;
      newCtx.strokeStyle = this.currentColor;

      newCtx.putImageData(imageData, 0, 0);

      layer.ctx = newCtx;
    });

    this.updatePreview();
  }

  applyResize(picture: Picture) {
    this.picture.name = picture.name;
    this.picture.width = picture.width;
    this.picture.height = picture.height;
    this.resizeCanvas();
  }

  openResizeModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  updatePreview() {
    if (!this.previewCanvasRef) return;

    const previewCanvas = this.previewCanvasRef.nativeElement;
    const previewCtx = previewCanvas.getContext('2d');
    if (!previewCtx) return;

    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    this.layers.forEach(layer => {
      if (!layer.visible) return;

      previewCtx.drawImage(
        layer.canvas,
        0, 0, layer.canvas.width, layer.canvas.height,
        0, 0, previewCanvas.width, previewCanvas.height
      );
    });
  }

  saveDrawing() {
    if (!this.previewCanvasRef) return;

    const canvas = this.previewCanvasRef.nativeElement;
    const image = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = image;
    link.download = this.picture.name + '.png';
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
        this.picture.width = img.width;
        this.picture.height = img.height;

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

    this.updatePreview();
  }

}
