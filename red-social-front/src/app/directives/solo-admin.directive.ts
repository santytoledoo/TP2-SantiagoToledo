import { Directive, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appSoloAdmin]',
  standalone: true,
})
export class SoloAdminDirective implements OnInit {
  private tieneVista = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit() {
    const raw = localStorage.getItem('usuario');
    let esAdmin = false;
    if (raw) {
      try {
        const user = JSON.parse(raw);
        esAdmin = user?.rol === 'administrador';
      } catch {
        esAdmin = false;
      }
    }

    if (esAdmin && !this.tieneVista) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.tieneVista = true;
    } else if (!esAdmin && this.tieneVista) {
      this.viewContainer.clear();
      this.tieneVista = false;
    }
  }
}