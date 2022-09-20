import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';

const ZOOM_FACTOR = 1.2;
const MAX_ZOOM = 5;
const MIN_ZOOM = -5;
const ORIGINAL_TILE_SIZE = 2048;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvasRef: ElementRef<HTMLCanvasElement>;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  image: HTMLImageElement;
  isDragging: boolean = false;
  dragStart: { x: number, y: number } = { x: 0, y: 0 };
  cameraOffset: { x: number, y: number } = { x: 0, y: 0};
  zoomLevel = -4;
  cameraZoom = Math.pow(ZOOM_FACTOR, this.zoomLevel);

  ngOnInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.image = new Image();
    this.image.src = 'assets/8/image-4-4.webp';
    this.draw();
  }

  draw() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    const tileSize: number = ORIGINAL_TILE_SIZE * this.cameraZoom;

    if (this.image.complete) {
      this.drawImage(this.cameraOffset.x, this.cameraOffset.y, tileSize);
    } else {
      this.image.onload = () => {
        this.drawImage(this.cameraOffset.x, this.cameraOffset.y, tileSize);
      }
    }
  }

  drawImage(x: number, y: number, size: number) {
    this.ctx.drawImage(this.image, x, y, size, size);
  }

  @HostListener('document:mousedown', ['$event'])
  onPointerDown(event: MouseEvent) {
    this.isDragging = true;
    this.dragStart.x = event.clientX - this.cameraOffset.x;
    this.dragStart.y = event.clientY - this.cameraOffset.y;
  }

  @HostListener('document:mouseup')
  onPointerUp() {
    this.isDragging = false;
  }

  @HostListener('document:mousemove',  ['$event'])
  onPointerMove(event: MouseEvent) {
    if (this.isDragging) {
      this.cameraOffset.x = event.clientX - this.dragStart.x;
      this.cameraOffset.y = event.clientY - this.dragStart.y;
      this.draw();
    }
  }

  @HostListener('document:wheel',  ['$event'])
  onScroll(event: WheelEvent) {
    const zoomDirection = Math.sign(-event.deltaY);

    if (this.zoomLevel + zoomDirection > MAX_ZOOM || this.zoomLevel + zoomDirection < MIN_ZOOM){
      return
    }

    this.zoomLevel += zoomDirection;
    this.cameraZoom = Math.pow(ZOOM_FACTOR, this.zoomLevel);

    this.draw();
  }
}
