import { Injectable } from '@angular/core';
import { Layer } from '../model/layer.model';

@Injectable({ providedIn: 'root' })
export class LayerService {
  private layers: Layer[] = [];
  private activeLayerId: string = '';
  private countLayers = 1;

  getLayers(): Layer[] {
    return [...this.layers];
  }

  getActiveLayer(): Layer | undefined {
    return this.layers.find(l => l.id === this.activeLayerId);
  }

  getActiveLayerId(): string {
    return this.activeLayerId;
  }

  setActiveLayerId(newId: string): void {
    this.activeLayerId = newId;
  }

  addLayer(layer: Layer) {
    this.layers.push(layer);
  }

  removeLayerById(id: string) {
    const index = this.layers.findIndex(l => l.id === id);
    if (index > -1) {
      this.layers[index].canvas.remove();
      this.layers.splice(index, 1);
    }

    if (this.layers.length == 0) {
      this.countLayers = 1;
      this.createLayer();
    }
  }

  removeLayerByIndex(index: number) {
    const [layer] = this.layers.splice(index, 1);
    layer.canvas.remove();
  }

  clearLayers() {
    this.layers.forEach(layer => layer.canvas.remove());
    this.layers = [];
  }

  findLayer(id: string): Layer | undefined {
    return this.layers.find(l => l.id === id);
  }

  indexOf(id: string): number {
    return this.layers.findIndex(l => l.id === id);
  }

  setLayers(layers: Layer[]) {
    this.layers = [...layers];
  }

  createLayer(name?: string): Layer {
    const layer: Layer = {
      id: crypto.randomUUID(),
      name: name || `Camada ${this.countLayers++}`,
      canvas: document.createElement('canvas'),
      ctx: null!,
      visible: true
    };

    this.layers.push(layer);
    this.activeLayerId = layer.id;

    return layer;
  }

  removeLayer(id: string): Layer | null {
    const index = this.layers.findIndex(l => l.id === id);
    if (index === -1) return null;

    const [removed] = this.layers.splice(index, 1);
    removed.canvas?.remove();

    if (this.activeLayerId === id) {
      this.activeLayerId = this.layers.length > 0 ? this.layers[0].id : '';
    }

    return removed;
  }

  setActiveLayer(id: string) {
    if (this.layers.some(l => l.id === id)) {
      this.activeLayerId = id;
    }
  }

  toggleLayerVisibility(id: string): boolean {
    const layer = this.layers.find(l => l.id === id);
    if (!layer) return false;
    layer.visible = !layer.visible;
    layer.canvas.style.display = layer.visible ? 'block' : 'none';
    return layer.visible;
  }

  reorderLayers(newOrder: Layer[]) {
    this.layers = [...newOrder];
  }

  duplicateLayer(id: string): Layer | null {
    const original = this.layers.find(l => l.id === id);
    if (!original || !original.ctx || !original.canvas) return null;

    const imageData = original.ctx.getImageData(0, 0, original.canvas.width, original.canvas.height);

    const newLayer: Layer = {
      id: crypto.randomUUID(),
      name: `${original.name} (Cópia)`,
      visible: true,
      canvas: document.createElement('canvas'),
      ctx: null!,
    };

    newLayer.canvas.width = original.canvas.width;
    newLayer.canvas.height = original.canvas.height;

    const ctx = newLayer.canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);
    newLayer.ctx = ctx;

    this.layers.push(newLayer);
    this.activeLayerId = newLayer.id;

    return newLayer;
  }

  clear() {
    this.layers.forEach(l => l.canvas?.remove());
    this.layers = [];
    this.countLayers = 1;
    this.activeLayerId = '';
  }
}