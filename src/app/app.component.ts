import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';

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

    if (this.image.complete) {
      this.ctx.drawImage(this.image, this.cameraOffset.x, this.cameraOffset.y);
    } else {
      this.image.onload = () => {
        this.ctx.drawImage(this.image, this.cameraOffset.x, this.cameraOffset.y);
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
}
