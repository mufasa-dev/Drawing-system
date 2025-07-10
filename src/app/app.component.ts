import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faBars, faBucket, faCogs, faEraser, faEyeDropper, faFile, faFolder, faPencil, faPlus, faSave, faSearch, faUpload } from "@fortawesome/free-solid-svg-icons";
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Tool } from '../enum/tools.enum';
import { FormsModule } from '@angular/forms';
import { Layer } from '../model/layer.model';
import { Picture } from '../model/picture.model';
import { ConfigComponent } from "./config-modal/config-modal.component";
import { hexToRgb, rgbaToHex } from '../utils/color.utils';
import { NewPictureComponent } from './new-picture/new-picture.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FontAwesomeModule, NgbModule, FormsModule, ConfigComponent, NewPictureComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {

  @ViewChild('canvas', { static: false }) canva!: ElementRef<HTMLCanvasElement>;
  @ViewChild('previewCanvas', { static: false }) previewCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer', { static: true }) canvasContainerRef!: ElementRef<HTMLDivElement>;

  public tool: Tool = Tool.Pencil;

  public picture: Picture = new Picture();
  private drawing: boolean = false;
  public ctx!: CanvasRenderingContext2D;
  public isBrowser: boolean = false;
  public showBrush = false;
  public cursorX: number = 0;
  public cursorY: number = 0;
  public lineWidth: number = 5;
  public tolerance: number = 30;
  public zoom: number = 1;
  public zoomStep: number = 0.1;
  public layers: Layer[] = [];
  public activeLayerId: string = '';
  public currentColor: string = '#000000';
  public countLayers: number = 1;
  public transformX = 0;
  public transformY = 0;
  public Tool = Tool;

  public faPencil = faPencil;
  public faEraser = faEraser;
  public faSave = faSave;
  public faUpload = faUpload;
  public faCogs = faCogs;
  public faPlus = faPlus;
  public faEyeDropper = faEyeDropper;
  public faFile = faFile;
  public faBars = faBars;
  public faFolder = faFolder;
  public faBucket =  faBucket;
  public faSearch = faSearch;

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
    const layer = this.getActiveLayer();
    if (!layer) return;

    if (this.tool == Tool.Bucket) {
      this.startFill(event);
      return;
    }

    if (this.tool === Tool.Eyedropper) {
      this.pickColorFromCanvas(event.offsetX, event.offsetY, layer.ctx);
      return;
    }

    if (this.tool == Tool.Zoom) {
      event.preventDefault();
      if (event.button === 2) {
        this.zoomOut(event.offsetX, event.offsetY);
      } else {
        this.zoonIn(event.offsetX, event.offsetY);
      }
      return;
    }

    this.drawing = true;

    const ctx = layer.ctx;

    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
  }

  stopDrawing() {
    this.drawing = false;
  }

  zoonIn(x: number, y: number) {
    const factor = 1 + this.zoomStep;
    this.zoomAt(x, y, factor);
  }

  zoomOut(x: number, y: number) {
    const factor = 1 - this.zoomStep
    this.zoomAt(x, y, factor);
  }

  draw(event: MouseEvent) {
    if (!this.drawing) return;

    const layer = this.getActiveLayer();
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

  startFill(event: MouseEvent) {
    const layer = this.getActiveLayer();
    if (!layer) return;

    const rect = layer.canvas.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);

    const ctx = layer.ctx;
    const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);

    this.floodFill(imageData, x, y, this.currentColor);

    ctx.putImageData(imageData, 0, 0);
  }

  updateCursor(event: MouseEvent) {
    const canvasContainer = this.canvasContainerRef.nativeElement;
    const rect = canvasContainer.getBoundingClientRect();

    this.cursorX = event.clientX - rect.left;
    this.cursorY = event.clientY - rect.top;
  }

  hideCursor() {
    this.cursorX = -9999;
    this.cursorY = -9999;
  }

  getActiveLayer() {
    return this.layers.find(l => l.id === this.activeLayerId);
  }

  selectTool(tool: Tool) {
    this.tool = tool;
  }

  changeColor(event: Event) {
    const input = event.target as HTMLInputElement;

    const layer = this.getActiveLayer();
    if (!layer) return;

    layer.ctx.strokeStyle = this.currentColor;
  }

  createNewPicture(picture: Picture) {
    this.picture = { ...picture };

    this.layers.forEach(layer => layer.canvas.remove());
    this.layers = [];

    const container = document.querySelector('.my-canva') as HTMLElement;

    const canvas = document.createElement('canvas');
    canvas.width = picture.width;
    canvas.height = picture.height;
    canvas.classList.add('absolute-canvas');

    const ctx = canvas.getContext('2d')!;

    if (picture.background === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.lineCap = 'round';
    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = this.currentColor;

    container.appendChild(canvas);

    const newLayer = {
      id: crypto.randomUUID(),
      name: picture.name || 'Camada 1',
      canvas,
      ctx,
      visible: true
    };

    this.layers.push(newLayer);
    this.activeLayerId = newLayer.id;

    this.updatePreview();
  }

  callContextMenu(event: MouseEvent) {
    if (this.tool == Tool.Zoom) event.preventDefault();
  }

  zoomAt(mouseX: number, mouseY: number, factor: number) {
    const container = this.canvasContainerRef.nativeElement;
    const rect = container.getBoundingClientRect();

    const prevZoom = this.zoom;
    this.zoom *= factor;

    const relX = mouseX;
    const relY = mouseY;

    this.transformX = relX - (relX - this.transformX) * (this.zoom / prevZoom);
    this.transformY = relY - (relY - this.transformY) * (this.zoom / prevZoom);

    this.updateCanvasTransforms();
  }

  updateCanvasTransforms() {
    const canvasContainer = this.canvasContainerRef.nativeElement;
    canvasContainer.style.transform = `translate(${this.transformX}px, ${this.transformY}px) scale(${this.zoom})`;
    canvasContainer.style.transformOrigin = 'top left';
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

  pickColorFromCanvas(x: number, y: number, ctx: CanvasRenderingContext2D) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b, a] = pixel;

    const color = rgbaToHex(r, g,b);

    this.currentColor = color;

    const active = this.getActiveLayer();
    if (active) {
      active.ctx.strokeStyle = color;
    }

    this.tool = Tool.Pencil;
  }

  floodFill(imageData: ImageData, x: number, y: number, fillHex: string) {
    const { data, width, height } = imageData;
    const index = (x: number, y: number) => (y * width + x) * 4;

    const [rF, gF, bF] = hexToRgb(fillHex);
    const stack: [number, number][] = [[x, y]];

    const startIdx = index(x, y);
    const targetColor = [
      data[startIdx],
      data[startIdx + 1],
      data[startIdx + 2],
      data[startIdx + 3]
    ];

    const matchColor = (i: number): boolean => {
      const dr = data[i] - targetColor[0];
      const dg = data[i + 1] - targetColor[1];
      const db = data[i + 2] - targetColor[2];
      const da = data[i + 3] - targetColor[3];

      const distance = Math.sqrt(dr * dr + dg * dg + db * db + da * da);
      return distance <= this.tolerance;
    };

    const setColor = (i: number) => {
      data[i] = rF;
      data[i + 1] = gF;
      data[i + 2] = bF;
      data[i + 3] = 255;
    };

    const visited = new Uint8Array(width * height);

    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!;
      const i = index(cx, cy);
      const pixelIdx = cy * width + cx;

      if (visited[pixelIdx] || !matchColor(i)) continue;

      setColor(i);
      visited[pixelIdx] = 1;

      if (cx > 0) stack.push([cx - 1, cy]);
      if (cx < width - 1) stack.push([cx + 1, cy]);
      if (cy > 0) stack.push([cx, cy - 1]);
      if (cy < height - 1) stack.push([cx, cy + 1]);
    }
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
    const image = canvas.toDataURL('image/' + this.picture.format);

    const link = document.createElement('a');
    link.href = image;
    link.download = this.picture.name + '.' + this.picture.format;
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
        this.picture.name = file.name.replace(/\.[^/.]+$/, '');
        this.picture.width = img.width;
        this.picture.height = img.height;

        let format = file.name.split('.').pop()?.toLowerCase();
        if (format) this.picture.format = format;

        const container = document.querySelector('.my-canva') as HTMLElement;

        this.layers.forEach(layer => layer.canvas.remove());
        this.layers = [];

        const layerId = crypto.randomUUID();
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.classList.add('absolute-canvas');

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        ctx.lineCap = 'round';
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.currentColor;

        container.appendChild(canvas);

        this.layers.push({
          id: layerId,
          name: this.picture.name,
          canvas,
          ctx,
          visible: true
        });

        this.activeLayerId = layerId;

        this.updatePreview();
      };

      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  useCursorBrush(): boolean {
    return [Tool.Pencil, Tool.Eraser].includes(this.tool);
  }

  getToolCursor(): string {
    if (this.useCursorBrush()) return 'none';
    if (this.tool == Tool.Zoom) return 'zoom-in';
    return 'default';
  }

}
