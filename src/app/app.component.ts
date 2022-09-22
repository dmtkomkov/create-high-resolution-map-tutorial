import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';

const ZOOM_FACTOR = 1.2;
const MAX_ZOOM = 10;
const MIN_ZOOM = -10;
const ORIGINAL_TILE_SIZE = 2048;

const LAYER_SIZE = 2;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvasRef: ElementRef<HTMLCanvasElement>;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  layer: HTMLImageElement[][] = [];
  isDragging: boolean = false;
  dragStart: { x: number, y: number } = { x: 0, y: 0 };
  cameraOffset: { x: number, y: number } = { x: 0, y: 0};
  zoomLevel = -5;
  cameraZoom = Math.pow(ZOOM_FACTOR, this.zoomLevel);

  ngOnInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;

    for (let i=0; i < LAYER_SIZE; i++) {
      this.layer[i] = [];
      for (let j=0; j < LAYER_SIZE; j++) {
        this.layer[i][j] = new Image();
      }
    }

    // this.image.src = 'assets/8/image-4-4.webp';
    this.draw();
  }

  draw() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.translate(this.cameraOffset.x, this.cameraOffset.y);

    const tileSize: number = ORIGINAL_TILE_SIZE * this.cameraZoom;
    for (let tileX = 0; tileX < LAYER_SIZE; tileX++) {
      for (let tileY = 0; tileY < LAYER_SIZE; tileY++) {
        const image = this.layer[tileX][tileY];
        if (!image.src) image.src = `assets/${LAYER_SIZE}/image-${tileX}-${tileY}.webp`
        this.drawImageTile(this.layer[tileX][tileY], tileX, tileY, tileSize);
      }
    }
  }


  drawImageTile(image: HTMLImageElement, tileX: number, tileY: number, tileSize: number) {
    if (image.complete) {
      this.ctx.drawImage(image, tileX * tileSize, tileY * tileSize, tileSize, tileSize);
    } else {
      image.onload = () => {
        this.ctx.drawImage(image, tileX * tileSize, tileY * tileSize, tileSize, tileSize);
      }
    }
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

    const zoomDelta = Math.pow(ZOOM_FACTOR, zoomDirection);
    this.cameraOffset.x = Math.floor(event.clientX - (event.clientX - this.cameraOffset.x) * zoomDelta);
    this.cameraOffset.y = Math.floor(event.clientY - (event.clientY - this.cameraOffset.y) * zoomDelta);

    this.draw();
  }
}
