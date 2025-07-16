import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, input, Output, output, ViewChild } from '@angular/core';
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faCogs, faCrop, faEraser, faEyeDropper, faFile, faFillDrip, faFolder, faPencil, faPlus, faSave, faSearch, faUpload } from "@fortawesome/free-solid-svg-icons";
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Picture } from '../../model/picture.model';
import { Tool } from '../../enum/tools.enum';
import { BrushType } from '../../enum/brush-type.enum';

@Component({
  selector: 'app-config-tools',
  imports: [ CommonModule, FontAwesomeModule, NgbModule, FormsModule ],
  templateUrl: './config-tools.component.html',
  styleUrl: '../app.component.scss'
})
export class ConfigToolsComponent {
  
  @Input() tool!: Tool;
  @Input() Tool = Tool;
  @Input() BrushType = BrushType;
  @Input() brushType!: BrushType;
  @Input() lineWidth!: number;
  @Input() opacity!: number;
  @Input() tolerance!: number;
  @Input() zoomType!: string;
  @Input() zoom!: number;

  @Output() brushTypeChange = new EventEmitter<BrushType>();
  @Output() lineWidthChange = new EventEmitter<number>();
  @Output() opacityChange = new EventEmitter<number>();
  @Output() toleranceChange = new EventEmitter<number>();
  @Output() zoomTypeChange = new EventEmitter<'in' | 'out'>();
  @Output() zoomChange = new EventEmitter<number>();

  public faPencil = faPencil;
  public faEraser = faEraser;
  public faEyeDropper = faEyeDropper;
  public faFile = faFile;
  public faFillDrip = faFillDrip;
  public faSearch = faSearch;
  public faCrop = faCrop;

  useCursorBrush(): boolean {
    return (
      this.tool === Tool.Pencil ||
      this.tool === Tool.Eraser
    );
  }
  
}
