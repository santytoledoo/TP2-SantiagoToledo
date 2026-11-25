import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appResaltarHover]',
  standalone: true,
})
export class ResaltarHoverDirective {
  @Input() appResaltarHover = '#93c5fd';

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease');
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'border-color', this.appResaltarHover || '#93c5fd');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(-2px)');
    this.renderer.setStyle(
      this.el.nativeElement,
      'box-shadow',
      '0 16px 32px -8px rgba(37, 99, 235, 0.14), 0 6px 14px -4px rgba(15, 23, 42, 0.06)'
    );
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.removeStyle(this.el.nativeElement, 'border-color');
    this.renderer.removeStyle(this.el.nativeElement, 'transform');
    this.renderer.removeStyle(this.el.nativeElement, 'box-shadow');
  }
}