import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  AfterViewInit,
  HostListener,
  Inject,
  PLATFORM_ID
} from '@angular/core';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent implements AfterViewInit {
  @ViewChild('svCanvas') svCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hueCanvas') hueCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('opacitySlider') opacitySliderRef!: ElementRef<HTMLInputElement>;

  @Output() colorSelected = new EventEmitter<string>();

  public hue: number = 0; // 0 a 360
  public saturation: number = 1; // 0 a 1
  public value: number = 1; // 0 a 1
  public selectedColor: string = 'rgba(255, 0, 0, 1)';
  public isBrowser: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.drawHueRing();
      this.drawSVBox();
    }
  }

  drawHueRing() {
    const canvas = this.hueCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    for (let i = 0; i <= 360; i += 60) {
      gradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, height);

    // 🔴 Desenhar marcador de seleção
    const y = (this.hue / 360) * height;
    const markerHeight = 1;
    const x = 0;

    ctx.beginPath();
    ctx.rect(x - 1, y, width, markerHeight);
    ctx.fillStyle = '#fff'; // cor do marcador
    ctx.fill();
    ctx.closePath();
  }

  drawSVBox() {
    const canvas = this.svCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;

    // fundo de matiz
    ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);

    // branco → transparente
    const whiteGrad = ctx.createLinearGradient(0, 0, width, 0);
    whiteGrad.addColorStop(0, '#fff');
    whiteGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, width, height);

    // preto → transparente
    const blackGrad = ctx.createLinearGradient(0, 0, 0, height);
    blackGrad.addColorStop(0, 'transparent');
    blackGrad.addColorStop(1, '#000');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, width, height);

    // 🔵 Desenhar marcador de seleção
    const x = this.saturation * width;
    const y = (1 - this.value) * height;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.closePath();
  }

  onHueSelect(event: MouseEvent) {
    const rect = this.hueCanvasRef.nativeElement.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const percent = y / rect.height;
    this.hue = percent * 360;
    this.drawSVBox();
    this.drawHueRing();
    this.emitColor();
  }

  onSVSelect(event: MouseEvent) {
    const rect = this.svCanvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.saturation = x / rect.width;
    this.value = 1 - y / rect.height;
    this.drawSVBox();
    this.emitColor();
  }

  onOpacityChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.emitColor();
  }

  emitColor() {
    const [r, g, b] = this.hsvToRgb(this.hue, this.saturation, this.value);
    const rgba = `rgba(${r}, ${g}, ${b}, 1)`;
    this.selectedColor = rgba;
    this.colorSelected.emit(rgba);
  }

  hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let [r, g, b] = [0, 0, 0];
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  }
}
