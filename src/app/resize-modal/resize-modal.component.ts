import { AfterViewInit, Component, ElementRef, Inject, Input, input, output, ViewChild } from '@angular/core';
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faCogs, faEraser, faPencil, faPlus, faSave, faUpload } from "@fortawesome/free-solid-svg-icons";
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Picture } from '../../model/picture.model';

@Component({
  selector: 'resize-component',
  imports: [ FontAwesomeModule, NgbModule, FormsModule ],
  templateUrl: './resize-modal.component.html',
  styleUrl: '../app.component.scss'
})
export class ResizeComponent implements AfterViewInit {

  @Input() picture = new Picture();
  
  close = output<any>();
  resizeCanvas = output<Picture>();

  public tempDrawName: string = "image";
  public tempCanvasWidth: number = 800;
  public tempCanvasHeight: number = 600;

  public faPencil = faPencil;
  public faEraser = faEraser;
  public faSave = faSave;
  public faUpload = faUpload;
  public faCogs = faCogs;
  public faPlus = faPlus;

  constructor() {
  }

  ngAfterViewInit(): void {
    this.tempCanvasHeight = this.picture.height;
    this.tempCanvasWidth = this.picture.width;
    this.tempDrawName = this.picture.name;
  }

  closeModal() {
    this.close.emit(null);
  }

  applyResize() {
    let picture: Picture = {
      name: this.tempDrawName,
      format: this.picture.format,
      width: this.tempCanvasWidth,
      height: this.tempCanvasHeight
    };
    this.resizeCanvas.emit(picture);
    this.close.emit(null);
  }
}
