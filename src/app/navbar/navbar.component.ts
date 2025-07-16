import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, input, Output, output, ViewChild } from '@angular/core';
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faCogs, faEraser, faFile, faFolder, faPencil, faPlus, faSave, faUpload } from "@fortawesome/free-solid-svg-icons";
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Picture } from '../../model/picture.model';

@Component({
  selector: 'app-navbar',
  imports: [ FontAwesomeModule, NgbModule, FormsModule ],
  templateUrl: './navbar.component.html',
  styleUrl: '../app.component.scss'
})
export class NavbarComponent {
  
  faFolder = faFolder;
  faFile = faFile;
  faUpload = faUpload;
  faSave = faSave;
  faCogs = faCogs;

  @Output() openNewModal = new EventEmitter<void>();
  @Output() openResizeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() fileUpload = new EventEmitter<Event>();
  
}
