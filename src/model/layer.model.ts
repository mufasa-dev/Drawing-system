export class Layer {
  id: string = "";
  name: string = "";
  visible: boolean = true;
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
}
