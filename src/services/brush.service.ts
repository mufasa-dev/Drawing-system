import { Injectable } from '@angular/core';
import { BrushType } from '../enum/brush-type.enum';
import { hexToRgb } from '../utils/color.utils';

@Injectable({ providedIn: 'root' })
export class BrushService {

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, type: BrushType, size: number, color: string, opacity: number, pressure: number) {
    ctx.lineWidth = size * pressure;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity * pressure;

    switch (type) {
      case BrushType.Round:
        this.drawRound(ctx, x, y);
        break;
      case BrushType.Square:
        this.drawSquare(ctx, x, y, size, color);
        break;
      case BrushType.Spray:
        this.drawSpray(ctx, x, y, size, color);
        break;
    }

    ctx.globalAlpha = 1.0;
  }

  private drawRound(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  private drawSquare(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }

  private drawSpray(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
    const density = 20;
    const radius = size / 2;

    ctx.fillStyle = color;

    for (let i = 0; i < density; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const r = Math.random() * radius;
      const dx = Math.cos(angle) * r;
      const dy = Math.sin(angle) * r;
      ctx.fillRect(x + dx, y + dy, 1, 1);
    }
  }

  public floodFill(imageData: ImageData, x: number, y: number, fillHex: string, tolerance: number = 30): void {
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
      return distance <= tolerance;
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
}
