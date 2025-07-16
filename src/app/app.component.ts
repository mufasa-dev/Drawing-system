import { AfterViewInit, Component, ElementRef, HostListener, Inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faBan, faBars, faCogs, faCrop, faEraser, faEyeDropper, faFile, faFillDrip, faFolder, faPencil, faPlus, faRotateLeft, faSave, faSearch, faUpload } from "@fortawesome/free-solid-svg-icons";
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Tool } from '../enum/tools.enum';
import { FormsModule } from '@angular/forms';
import { Layer } from '../model/layer.model';
import { Picture } from '../model/picture.model';
import { ConfigComponent } from "./config-modal/config-modal.component";
import { hexToRgb, rgbaStringToHex, rgbaToHex } from '../utils/color.utils';
import { NewPictureComponent } from './new-picture/new-picture.component';
import { LayersComponent } from './layers/layers.component';
import { BrushType } from '../enum/brush-type.enum';
import { BrushService } from '../services/brush.service';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { LayerService } from '../services/layer.service';
import { NavbarComponent } from './navbar/navbar.component';
import { ConfigToolsComponent } from './config-tools/config-tools.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FontAwesomeModule, NgbModule, FormsModule, ConfigComponent, 
            NewPictureComponent, LayersComponent, ColorPickerComponent, NavbarComponent,
            ConfigToolsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {

  @ViewChild('canvas', { static: false }) canva!: ElementRef<HTMLCanvasElement>;
  @ViewChild('previewCanvas', { static: false }) previewCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer', { static: true }) canvasContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('myCanva', { static: true }) myCanvaRef!: ElementRef<HTMLDivElement>;

  @ViewChildren('canvasRefs') canvasRefs!: QueryList<ElementRef<HTMLCanvasElement>>;

  public tool: Tool = Tool.Pencil;
  public theme: 'dark' | 'light' = 'dark';

  public picture: Picture = new Picture();
  private drawing: boolean = false;
  public ctx!: CanvasRenderingContext2D;
  public isBrowser: boolean = false;
  public showBrush = false;
  public cursorX: number = 0;
  public cursorY: number = 0;
  public lineWidth: number = 5;
  public tolerance: number = 30;
  public opacity: number = 1;
  public zoom: number = 1;
  public zoomStep: number = 0.1;
  public zoomType: 'in' | 'out' = 'in';
  public transformX = 0;
  public transformY = 0;
  public startX: number = 0;
  public startY: number = 0;
  public endX: number = 0;
  public endY: number = 0;
  public brushType: BrushType = BrushType.Round;
  public openBoxPreview: boolean = true;
  public openBoxColor: boolean = true;
  public isCropping: boolean = false;

  public primaryColor: string = '#000000';
  public secondaryColor: string = '#ffffff';
  public activeColorSlot: 'primary' | 'secondary' = 'primary';
  
  public BrushType = BrushType;
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
  public faFillDrip =  faFillDrip;
  public faSearch = faSearch;
  public faRotateLeft = faRotateLeft;
  public faBan = faBan;
  public faCrop = faCrop;

  get layers(): Layer[] {
    return this.layerService.getLayers();
  }

  get activeLayerId(): string {
    return this.layerService.getActiveLayerId();
  }

  constructor(@Inject(PLATFORM_ID) private platformId: Object, 
        private modalService: NgbModal, 
        private brushService: BrushService,
        private layerService: LayerService) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        this.canvasRefs.changes.subscribe(() => {
          this.syncCanvasContexts();
        });
        this.syncCanvasContexts();
        this.createLayer();
      }, 100);
    }
  }

  syncCanvasContexts() {
    this.canvasRefs.forEach((canvasRef, index) => {
      const layer = this.layers[index];
      if (layer && !layer.ctx) {
        layer.canvas = canvasRef.nativeElement;
        layer.ctx = canvasRef.nativeElement.getContext('2d')!;
        layer.ctx.lineCap = 'round';
        layer.ctx.lineWidth = this.lineWidth;
        layer.ctx.strokeStyle = this.getColor();
      }
    });
  }

  onLayersReordered(newOrder: Layer[]) {
    this.layerService.reorderLayers(newOrder);
    this.updatePreview();
  }

  startDrawing(event: PointerEvent) {
    const layer = this.layerService.getActiveLayer();
    if (!layer) return;

    if (this.tool === Tool.Crop) {
      this.isCropping = true;
      const { offsetX, offsetY } = event;
      this.startX = offsetX;
      this.startY = offsetY;
      this.endX = offsetX;
      this.endY = offsetY;
      return;
    }

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
        if (this.zoomType == 'in') this.zoomOut(event.offsetX, event.offsetY);
        if (this.zoomType == 'out') this.zoomIn(event.offsetX, event.offsetY);
      } else {
        if (this.zoomType == 'in') this.zoomIn(event.offsetX, event.offsetY);
        if (this.zoomType == 'out') this.zoomOut(event.offsetX, event.offsetY);
      }
      return;
    }

    this.drawing = true;

    const ctx = layer.ctx;

    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
  }

  stopDrawing() {
    if (this.tool === Tool.Crop && this.isCropping) {
      this.isCropping = false;
      this.performCrop();
    } 
    this.drawing = false;
  }

  zoomIn(x: number, y: number) {
    const factor = 1 + this.zoomStep;
    this.zoomAt(x, y, factor);
  }

  zoomOut(x: number, y: number) {
    const factor = 1 - this.zoomStep
    this.zoomAt(x, y, factor);
  }

  draw(event: PointerEvent) {
    if (this.tool === Tool.Crop && this.isCropping) {
      this.endX = event.offsetX;
      this.endY = event.offsetY;
      //this.updateCropOverlay(); // opcional para mostrar visualmente
    }

    if (!this.drawing) return;

    const layer = this.layerService.getActiveLayer();
    if (!layer) return;

    const ctx = layer.ctx;

    const x = event.offsetX;
    const y = event.offsetY;

    const pressure = event.pressure || 1;
    const originalComposite = ctx.globalCompositeOperation;
    const originalStroke = ctx.strokeStyle;
    const originalWidth = ctx.lineWidth;

    ctx.lineWidth = this.lineWidth;

    if (this.tool === Tool.Eraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = this.getColor();
    }

    this.brushService.draw(ctx, x, y, this.brushType, this.lineWidth, this.getColor(), this.opacity, pressure);

    ctx.globalCompositeOperation = originalComposite;
    ctx.strokeStyle = originalStroke;
    ctx.lineWidth = originalWidth;

    this.updatePreview();
  }

  startFill(event: PointerEvent) {
    const layer = this.layerService.getActiveLayer();
    if (!layer) return;

    const rect = layer.canvas.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);

    const ctx = layer.ctx;
    const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);

    this.floodFill(imageData, x, y, this.getColor());

    ctx.putImageData(imageData, 0, 0);

    this.updatePreview();
  }

  updateCursor(event: PointerEvent) {
    const container = this.canvasContainerRef.nativeElement;

    const offsetX = event.clientX;
    const offsetY = event.clientY;

    this.cursorX = offsetX;
    this.cursorY = offsetY;
  }

  hideCursor() {
    this.cursorX = -9999;
    this.cursorY = -9999;
  }

  selectTool(tool: Tool) {
    this.tool = tool;
  }

  onColorChange(color: string) {
    this.setColor(rgbaStringToHex(color));
    const active = this.layerService.getActiveLayer();
    if (active) active.ctx.strokeStyle = color;
  }
  
  toggleBoxPreview() {
    this.openBoxPreview = !this.openBoxPreview;
    if (this.openBoxPreview) {
      setTimeout(() => this.updatePreview(), 100);
    }
  }

  toggleBoxColor() {
    this.openBoxColor = !this.openBoxColor;
  }

  createNewPicture(picture: Picture) {
    this.picture = { ...picture };

    this.layerService.clear();

    let newLayer = this.layerService.createLayer();
    this.layerService.setActiveLayerId(newLayer.id);

    this.updatePreview();
  }

  callContextMenu(event: MouseEvent) {
    if (this.tool == Tool.Zoom) event.preventDefault();
  }

  zoomAt(mouseX: number, mouseY: number, factor: number) {
    const container = this.myCanvaRef.nativeElement;
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
    const canvasContainer = this.myCanvaRef.nativeElement;
    canvasContainer.style.transform = `translate(${this.transformX}px, ${this.transformY}px) scale(${this.zoom})`;
    canvasContainer.style.transformOrigin = 'top left';
  }

  createLayer() {
    this.layerService.createLayer();

    this.updatePreview();
  }

  toggleLayer(id: string) {
    this.layerService.toggleLayerVisibility(id);

    this.updatePreview();
  }

  removeLayer(id: string) {
    this.layerService.removeLayerById(id);

    this.updatePreview();
  }

  duplicateLayer() {
    this.layerService.duplicateLayer(this.activeLayerId);

    this.updatePreview();
  }

  setActiveLayer(id: string) {
    this.layerService.setActiveLayer(id);
    this.layers.forEach(layer => {
      layer.canvas.style.pointerEvents = (layer.id === id) ? 'auto' : 'none';
      layer.ctx.strokeStyle = this.getColor();
    });
  }

  pickColorFromCanvas(x: number, y: number, ctx: CanvasRenderingContext2D) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b, a] = pixel;

    const color = rgbaToHex(r, g,b);

    this.setColor(color);

    const active = this.layerService.getActiveLayer();
    if (active) {
      active.ctx.strokeStyle = color;
    }

    this.tool = Tool.Pencil;
  }

  floodFill(imageData: ImageData, x: number, y: number, fillHex: string) {
    this.brushService.floodFill(imageData, x, y, fillHex, this.tolerance);
  }

  performCrop() {
    const x = Math.min(this.startX, this.endX);
    const y = Math.min(this.startY, this.endY);
    const width = Math.abs(this.endX - this.startX);
    const height = Math.abs(this.endY - this.startY);

    if (width === 0 || height === 0) return;

    this.layers.forEach(layer => {
      const oldCanvas = layer.canvas;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;

      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.drawImage(oldCanvas, x, y, width, height, 0, 0, width, height);

      oldCanvas.width = width;
      oldCanvas.height = height;
      

      setTimeout(() => {
        const targetLayer = this.layers.find(l => l.id === layer.id);
        if (targetLayer?.ctx) {
          targetLayer.ctx.drawImage(tempCanvas, 0, 0);
          this.updatePreview();
        }
      });
    });

    this.picture.width = width;
    this.picture.height = height;

    this.updatePreview();
  }


  resizeCanvas() {
    this.layers.forEach(layer => {
      const oldCanvas = layer.canvas;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = oldCanvas.width;
      tempCanvas.height = oldCanvas.height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.drawImage(oldCanvas, 0, 0);

      oldCanvas.width = this.picture.width;
      oldCanvas.height = this.picture.height;

      const newCtx = oldCanvas.getContext('2d')!;
      newCtx.lineCap = 'round';
      newCtx.lineWidth = this.lineWidth;
      newCtx.strokeStyle = this.getColor();

      setTimeout(() => {
        const targetLayer = this.layers.find(l => l.id === layer.id);
        if (targetLayer?.ctx) {
          targetLayer.ctx.drawImage(tempCanvas, 0, 0);
          this.updatePreview();
        }
      });
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
    this.layerService.updatePreview(this.previewCanvasRef.nativeElement, this.picture);
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
        this.layerService.reorderLayers([]);

        const layerId = crypto.randomUUID();
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.classList.add('absolute-canvas');

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        ctx.lineCap = 'round';
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.getColor();

        container.appendChild(canvas);

        this.layers.push({
          id: layerId,
          name: this.picture.name,
          canvas,
          ctx,
          visible: true
        });

        this.layerService.setActiveLayerId(layerId);

        this.updatePreview();
      };

      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  getColor() {
    if (this.activeColorSlot === 'primary') {
      return this.primaryColor;
    } else {
      return this.secondaryColor;
    }
  }

  setColor(color: string) {
    if (this.activeColorSlot === 'primary') {
      this.primaryColor = color;
    } else {
      this.secondaryColor = color;
    }
  }

  swapColors() {
    const temp = this.primaryColor;
    this.primaryColor = this.secondaryColor;
    this.secondaryColor = temp;
  }

  useCursorBrush(): boolean {
    return [Tool.Pencil, Tool.Eraser].includes(this.tool);
  }

  getToolCursor(): string {
    if (this.useCursorBrush()) return 'none';
    if (this.tool == Tool.Zoom && this.zoomType == 'in') return 'zoom-in';
    if (this.tool == Tool.Zoom && this.zoomType == 'out') return 'zoom-out';
    return 'default';
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.key.toLowerCase() === 'x') {
      this.swapColors();
    } else if (event.key.toLowerCase() === 'z') {
      this.selectTool(Tool.Zoom);
    } else if (event.key.toLowerCase() === 'b') {
      this.selectTool(Tool.Pencil);
    } else if (event.key.toLowerCase() === 'e') {
      this.selectTool(Tool.Eraser);
    } else if (event.key.toLowerCase() === 'g') {
      this.selectTool(Tool.Bucket);
    } else if (event.key.toLowerCase() === 'i') {
      this.selectTool(Tool.Eyedropper);
    }
  }

}
