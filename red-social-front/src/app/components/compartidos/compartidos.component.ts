import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo.pipe';
import { ResaltarHoverDirective } from '../../directives/resaltar-hover.directive';

@Component({
  selector: 'app-compartidos',
  standalone: true,
  imports: [CommonModule, RouterModule, TiempoRelativoPipe, ResaltarHoverDirective],
  template: `
    <div style="max-width: 680px; margin: 28px auto; padding: 0 18px 50px 18px;">

      <div *ngIf="toastMensaje" class="toast-banner" [ngClass]="toastTipo === 'error' ? 'toast-error' : 'toast-success'">
        {{ toastMensaje }}
      </div>

      <div class="surface-card" style="padding: 20px 24px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <h1 style="margin: 0; color: #0f172a; font-size: 22px; font-weight: 800;">📤 Compartidos conmigo</h1>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13.5px;">
            Publicaciones que otros usuarios compartieron con vos
          </p>
        </div>
        <span style="background: #dcfce7; color: #15803d; border: 1px solid #86efac; font-size: 12.5px; font-weight: 700; padding: 6px 12px; border-radius: 999px;">
          {{ publicaciones.length }} {{ publicaciones.length === 1 ? 'publicación' : 'publicaciones' }}
        </span>
      </div>

      <div *ngIf="cargando" class="surface-card" style="padding: 40px; text-align: center; color: #64748b; font-weight: 600;">
        Cargando publicaciones compartidas...
      </div>

      <div *ngIf="!cargando && publicaciones.length === 0" class="surface-card" style="padding: 48px 20px; text-align: center; color: #64748b; border-style: dashed;">
        <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #334155;">Todavía no te compartieron publicaciones</p>
        <p style="margin: 0 0 16px 0; font-size: 13px;">Cuando alguien te comparta una publicación, va a aparecer acá.</p>
        <a routerLink="/publicaciones" class="btn-primary" style="display: inline-block; text-decoration: none; font-size: 13px; padding: 10px 20px;">
          Ir al muro
        </a>
      </div>

      <div *ngFor="let pub of publicaciones" [appResaltarHover]="'#86efac'" class="surface-card" style="padding: 22px; margin-bottom: 18px; overflow: hidden;">

        <!-- Quién compartió la publicación -->
        <div *ngIf="pub.compartidosConmigo?.length" class="texto-ajustado" style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 8px 12px; border-radius: 10px; font-size: 12.5px; font-weight: 700; margin-bottom: 14px;">
          Compartido por:
          <span *ngFor="let c of pub.compartidosConmigo; let last = last">
            {{ c.deUsuarioNombre }}<span *ngIf="c.deUsuarioUsername"> (&#64;{{ c.deUsuarioUsername }})</span><span *ngIf="!last">, </span>
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px; min-width: 0;">
          <img *ngIf="pub.autorFoto" [src]="pub.autorFoto" alt="Avatar" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">
          <div *ngIf="!pub.autorFoto" style="width: 42px; height: 42px; border-radius: 50%; background: #dbeafe; color: #1d4ed8; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;">
            {{ (pub.autor || 'US').substring(0, 2).toUpperCase() }}
          </div>
          <div style="min-width: 0; flex: 1;">
            <span class="texto-ajustado" style="font-weight: 700; color: #0f172a; font-size: 15px; display: block;">{{ pub.autor || 'Usuario' }}</span>
            <span style="font-size: 12px; color: #64748b;">
              <span *ngIf="pub.autorUsername">&#64;{{ pub.autorUsername }} · </span>
              {{ pub.createdAt | tiempoRelativo }}
            </span>
          </div>
        </div>

        <div (click)="verPublicacion(pub._id)" style="cursor: pointer; min-width: 0;">
          <h4 *ngIf="pub.titulo" class="texto-ajustado" style="margin: 0 0 8px 0; color: #0f172a; font-size: 18px; font-weight: 800; line-height: 1.35;">
            {{ pub.titulo }}
          </h4>
          <p class="texto-ajustado" style="margin: 0 0 14px 0; color: #334155; font-size: 15px; line-height: 1.55;">
            {{ pub.contenido }}
          </p>
          <div *ngIf="pub.imagen" style="margin-bottom: 16px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <img [src]="pub.imagen" alt="Imagen" style="width: 100%; max-height: 400px; object-fit: cover; display: block;">
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          <button
            (click)="darLike(pub)"
            [style.color]="usuarioDioLike(pub) ? '#e11d48' : '#475569'"
            [style.background]="usuarioDioLike(pub) ? '#ffe4e6' : '#f8fafc'"
            style="border: 1px solid #cbd5e1; padding: 7px 12px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 13px;">
            {{ usuarioDioLike(pub) ? '❤️' : '🤍' }} Me gusta ({{ pub.likes?.length || 0 }})
          </button>

          <button
            (click)="verPublicacion(pub._id)"
            style="background: #eff6ff; color: #1d4ed8; border: 1px solid #93c5fd; padding: 7px 14px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 13px;">
            💬 Comentar / Ver detalle
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CompartidosComponent implements OnInit {
  publicaciones: any[] = [];
  usuarioActual: any = null;
  cargando = true;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const raw = localStorage.getItem('usuario');
    if (!raw) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuarioActual = JSON.parse(raw);
    this.cargarCompartidas();
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMensaje = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  cargarCompartidas() {
    this.cargando = true;
    this.http.get<any[]>(`${environment.apiUrl}/publicaciones/compartidas`).subscribe({
      next: (lista) => {
        this.cargando = false;
        this.publicaciones = lista || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.mostrarToast('No se pudieron cargar las publicaciones compartidas.', 'error');
      },
    });
  }

  usuarioDioLike(pub: any): boolean {
    const uid = this.usuarioActual?.id || this.usuarioActual?._id;
    return Array.isArray(pub.likes) && pub.likes.includes(uid);
  }

  darLike(pub: any) {
    const userId = this.usuarioActual?.id || this.usuarioActual?._id;
    this.http.post<any>(`${environment.apiUrl}/publicaciones/${pub._id}/like`, { userId }).subscribe({
      next: (res) => {
        if (res?.likes) {
          pub.likes = res.likes;
          this.cdr.detectChanges();
        }
      },
      error: () => this.mostrarToast('No se pudo actualizar el Me gusta.', 'error'),
    });
  }

  verPublicacion(id: string) {
    this.router.navigate(['/publicacion', id]);
  }
}