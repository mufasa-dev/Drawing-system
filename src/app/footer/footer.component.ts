import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, input, Output, output, ViewChild } from '@angular/core';
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faCogs, faEraser, faFile, faFolder, faPencil, faPlus, faSave, faUpload } from "@fortawesome/free-solid-svg-icons";
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Picture } from '../../model/picture.model';

@Component({
  selector: 'app-footer',
  imports: [ CommonModule, FontAwesomeModule, NgbModule, FormsModule ],
  templateUrl: './footer.component.html',
  styleUrl: '../app.component.scss'
})
export class FooterComponent {
  
  faFolder = faFolder;
  faFile = faFile;
  faUpload = faUpload;
  faSave = faSave;
  faCogs = faCogs;

  @Input() zoom: number = 1;

  @Output() updateCanvasTransforms = new EventEmitter<number>();
  
}
