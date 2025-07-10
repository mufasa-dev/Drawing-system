import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Layer } from '../../model/layer.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { faBan, faEye, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-layer-panel',
  imports: [ FontAwesomeModule, NgbModule, FormsModule ],
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

  public faPlus = faPlus;
  public faEye = faEye;
  public faBan = faBan;
  public faTrash = faTrash;

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
}
