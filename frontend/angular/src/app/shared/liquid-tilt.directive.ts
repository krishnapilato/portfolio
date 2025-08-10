import { Directive, ElementRef, Input, HostListener, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appLiquidTilt]',
  standalone: true
})
export class LiquidTiltDirective implements OnInit {
  @Input() tiltMax: number = 4; // degrees
  @Input() perspective: number = 900; // px
  @Input() glare: boolean = true;
  @Input() elevate: boolean = true;

  private rafPending = false;
  private rect?: DOMRect;

  constructor(private el: ElementRef<HTMLElement>, private r: Renderer2) {}

  ngOnInit() {
    const host = this.el.nativeElement;
    this.r.addClass(host, 'has-liquid-tilt');
    host.style.setProperty('--lt-persp', this.perspective + 'px');
    host.style.setProperty('--lt-rx', '0deg');
    host.style.setProperty('--lt-ry', '0deg');
  }

  @HostListener('mouseenter') onEnter() {
    // Cache rect for perf
    this.rect = this.el.nativeElement.getBoundingClientRect();
    if (this.elevate) this.el.nativeElement.style.setProperty('--lt-elev', '1');
  }

  @HostListener('mouseleave') onLeave() {
    const host = this.el.nativeElement;
    host.style.setProperty('--lt-rx', '0deg');
    host.style.setProperty('--lt-ry', '0deg');
    host.style.setProperty('--lt-elev', '0');
    if (this.glare) {
      host.style.setProperty('--lt-px', '50%');
      host.style.setProperty('--lt-py', '50%');
    }
  }

  @HostListener('mousemove', ['$event']) onMove(ev: MouseEvent) {
    if (!this.rect) this.rect = this.el.nativeElement.getBoundingClientRect();
    const rect = this.rect;
    const host = this.el.nativeElement;
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    if (this.rafPending) return;
    this.rafPending = true;
    requestAnimationFrame(() => {
      this.rafPending = false;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = (x - cx) / cx; // -1..1
      const dy = (y - cy) / cy; // -1..1
      const max = this.tiltMax;
      const ry = (dx * max).toFixed(3) + 'deg';
      const rx = (dy * -max).toFixed(3) + 'deg';
      host.style.setProperty('--lt-ry', ry);
      host.style.setProperty('--lt-rx', rx);
      if (this.glare) {
        host.style.setProperty('--lt-px', x + 'px');
        host.style.setProperty('--lt-py', y + 'px');
      }
    });
  }
}
