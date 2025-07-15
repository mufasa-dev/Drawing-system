import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Layer } from '../../model/layer.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { faBan, faEye, faPlus, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-layer-panel',
  imports: [ FontAwesomeModule, NgbModule, FormsModule, DragDropModule ],
  templateUrl: './layers.component.html',
  styleUrls: ['../app.component.scss']
})
export class LayersComponent {
  @Input() layers: Layer[] = [];
  @Input() activeLayerId: string = '';

  @Output() onCreateLayer = new EventEmitter<void>();
  @Output() onRemoveLayer = new EventEmitter<string>();
  @Output() onToggleLayer = new EventEmitter<string>();
  @Output() onSetActiveLayer = new EventEmitter<string>();
  @Output() layersReordered = new EventEmitter<Layer[]>();

  public selectedLayer: Layer  = new Layer();
  public newName: string = "";
  public openBox: boolean = true;

  public faPlus = faPlus;
  public faEye = faEye;
  public faBan = faBan;
  public faTrash = faTrash;
  public faSave = faSave;

  constructor(private modalService: NgbModal) {
    
  }

  createLayer() {
    this.onCreateLayer.emit();
  }

  removeLayer(id: string) {
    this.onRemoveLayer.emit(id);
  }

  toggleLayer(id: string) {
    this.onToggleLayer.emit(id);
  }

  setActiveLayer(id: string) {
    this.onSetActiveLayer.emit(id);
  }

  toggleOpenBox() {
    this.openBox = !this.openBox;
  }

  openModal(content: any, layer: Layer) {
    this.selectedLayer = layer;
    this.newName = layer.name;
    this.modalService.open(content, { centered: true });
  }

  changeLayerOpts() {
    this.selectedLayer.name = this.newName;
  }

  onDrop(event: CdkDragDrop<Layer[]>) {
    moveItemInArray(this.layers, event.previousIndex, event.currentIndex);
    this.layersReordered.emit(this.layers);
  }

  trackById(index: number, layer: Layer) {
    return layer.id;
  }

}
