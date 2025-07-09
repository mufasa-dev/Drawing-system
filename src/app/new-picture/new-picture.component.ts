import { AfterViewInit, Component, ElementRef, Inject, Input, input, output, ViewChild } from '@angular/core';
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faCogs, faEraser, faPencil, faPlus, faSave, faUpload } from "@fortawesome/free-solid-svg-icons";
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Picture } from '../../model/picture.model';

@Component({
  selector: 'new-picture-component',
  imports: [ FontAwesomeModule, NgbModule, FormsModule ],
  templateUrl: './new-picture.component.html',
  styleUrl: '../app.component.scss'
})
export class NewPictureComponent implements AfterViewInit {

  createNewPicture = output<Picture>();
  close = output<any>();

  public picture: Picture = new Picture();

  public faPencil = faPencil;
  public faEraser = faEraser;
  public faSave = faSave;
  public faUpload = faUpload;
  public faCogs = faCogs;
  public faPlus = faPlus;

  constructor() {
  }

  ngAfterViewInit(): void {
    
  }

  closeModal() {
    this.close.emit(null);
  }

  onChangeFormat() {
    if (this.picture.format != 'png' && this.picture.background == "transparent") {
      this.picture.background = "white";
    }
  }

  create() {
    if (this.picture.name.length == 0) return;
    this.createNewPicture.emit(this.picture);
    this.close.emit(null);
  }
}
