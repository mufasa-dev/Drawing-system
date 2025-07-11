import { Injectable } from '@angular/core';
import { BrushType } from '../enum/brush-type.enum';

@Injectable({ providedIn: 'root' })
export class BrushService {

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, type: BrushType, size: number, color: string) {
    ctx.lineWidth = size;
    ctx.strokeStyle = color;

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
}
