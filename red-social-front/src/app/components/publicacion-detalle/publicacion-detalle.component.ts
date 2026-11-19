import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-publicacion-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div style="max-width: 780px; margin: 28px auto; padding: 0 18px 60px 18px;">

      <!-- Toast de notificación -->
      <div *ngIf="toastMensaje" class="toast-banner" [ngClass]="toastTipo === 'error' ? 'toast-error' : 'toast-success'">
        {{ toastMensaje }}
      </div>

      <!-- Botón volver -->
      <div style="margin-bottom: 18px;">
        <a routerLink="/publicaciones" style="display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; color: #1e293b; text-decoration: none; font-weight: 600; font-size: 13px; box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);">
          ← Volver a publicaciones
        </a>
      </div>

      <!-- Cargando publicación -->
      <div *ngIf="cargandoPublicacion" style="background: #ffffff; padding: 48px; border-radius: 18px; border: 1px solid #e2e8f0; text-align: center; color: #64748b; font-weight: 600;">
        Cargando publicación...
      </div>

      <!-- Publicación en grande -->
      <div *ngIf="!cargandoPublicacion && publicacion" style="background: #ffffff; border: 1px solid #e2e8f0; padding: 28px; border-radius: 18px; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05); margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <img *ngIf="publicacion.autorFoto" [src]="publicacion.autorFoto" alt="Avatar" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0;">
          <div *ngIf="!publicacion.autorFoto" style="width: 50px; height: 50px; background: #dbeafe; color: #1d4ed8; font-weight: 800; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px;">
            {{ (publicacion.autor || 'US').substring(0, 2).toUpperCase() }}
          </div>
          <div>
            <span style="font-weight: 800; color: #0f172a; font-size: 17px; display: block;">{{ publicacion.autor || 'Usuario' }}</span>
            <span style="font-size: 13px; color: #64748b;">
              <span *ngIf="publicacion.autorUsername">&#64;{{ publicacion.autorUsername }} · </span>
              {{ publicacion.createdAt | date:'dd/MM/yyyy HH:mm' }}
            </span>
          </div>
        </div>

        <h1 *ngIf="publicacion.titulo" style="margin: 0 0 12px 0; color: #0f172a; font-size: 24px; font-weight: 800; line-height: 1.3;">
          {{ publicacion.titulo }}
        </h1>

        <p style="color: #1e293b; margin: 0 0 20px 0; font-size: 16px; line-height: 1.65; word-break: break-word; white-space: pre-line;">
          {{ publicacion.contenido }}
        </p>

        <div *ngIf="publicacion.imagen" style="margin-bottom: 20px; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; background: #f8fafc;">
          <img [src]="publicacion.imagen" alt="Imagen de publicación" style="width: 100%; max-height: 580px; object-fit: contain; display: block; margin: 0 auto;">
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 14px;">
          <button
            (click)="darLike()"
            [style.color]="usuarioDioLike() ? '#e11d48' : '#475569'"
            [style.background]="usuarioDioLike() ? '#ffe4e6' : '#f8fafc'"
            style="border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 10px; cursor: pointer; font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 14px;">
            {{ usuarioDioLike() ? '❤️' : '🤍' }} Me gusta ({{ publicacion.likes?.length || 0 }})
          </button>

          <span style="font-size: 13px; font-weight: 600; color: #64748b;">
            💬 {{ totalComentarios }} {{ totalComentarios === 1 ? 'comentario' : 'comentarios' }}
          </span>
        </div>
      </div>

      <!-- Sección de Comentarios -->
      <div *ngIf="!cargandoPublicacion && publicacion" style="background: #ffffff; border: 1px solid #e2e8f0; padding: 24px; border-radius: 18px; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);">
        <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 17px; font-weight: 800;">
          Comentarios ({{ totalComentarios }})
        </h3>

        <!-- Caja para escribir comentario -->
        <div style="display: flex; gap: 12px; align-items: flex-start; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
          <img *ngIf="usuarioActual?.fotoPerfil" [src]="usuarioActual.fotoPerfil" alt="Avatar" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">
          <div *ngIf="!usuarioActual?.fotoPerfil" style="width: 38px; height: 38px; border-radius: 50%; background: #dbeafe; color: #1d4ed8; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            {{ (usuarioActual?.nombre || 'U').substring(0, 2).toUpperCase() }}
          </div>

          <div style="flex: 1;">
            <textarea
              rows="2"
              class="field-input"
              [(ngModel)]="nuevoComentario"
              placeholder="Escribí un comentario..."
              maxlength="300"
              style="resize: none; margin-bottom: 8px;"></textarea>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; color: #64748b;">{{ 300 - nuevoComentario.length }} caracteres restantes</span>
              <button
                (click)="agregarComentario()"
                class="btn-primary"
                style="padding: 8px 18px; font-size: 13px;"
                [disabled]="enviandoComentario || !nuevoComentario.trim()">
                {{ enviandoComentario ? 'Enviando...' : 'Comentar' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Estado sin comentarios -->
        <div *ngIf="!cargandoComentarios && comentarios.length === 0" style="text-align: center; padding: 28px 16px; color: #64748b; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
          <p style="margin: 0; font-size: 14px; font-weight: 600;">Todavía no hay comentarios en esta publicación.</p>
          <p style="margin: 4px 0 0 0; font-size: 13px;">¡Sé el primero en opinar!</p>
        </div>

        <!-- Listado ordenado uno debajo del otro -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div *ngFor="let com of comentarios" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img *ngIf="com.autorFoto" [src]="com.autorFoto" alt="Avatar" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover;">
                <div *ngIf="!com.autorFoto" style="width: 34px; height: 34px; border-radius: 50%; background: #e0e7ff; color: #3730a3; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center;">
                  {{ (com.autor || 'US').substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span style="font-weight: 700; color: #0f172a; font-size: 14px;">{{ com.autor }}</span>
                    <span *ngIf="com.autorUsername" style="font-size: 12px; color: #64748b;">&#64;{{ com.autorUsername }}</span>
                    <span *ngIf="com.modificado" style="background: #fef3c7; color: #92400e; border: 1px solid #fde68a; font-size: 11px; font-weight: 700; padding: 1px 8px; border-radius: 999px;">
                      editado
                    </span>
                  </div>
                  <span style="font-size: 11px; color: #64748b;">{{ com.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>

              <!-- Botón editar si es el autor del comentario -->
              <button
                *ngIf="esAutorComentario(com) && editandoComentarioId !== com._id"
                (click)="iniciarEdicion(com)"
                style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 4px 10px; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer;">
                ✏️ Editar
              </button>
            </div>

            <!-- Modo lectura -->
            <p *ngIf="editandoComentarioId !== com._id" style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.5; word-break: break-word; white-space: pre-line;">
              {{ com.mensaje }}
            </p>

            <!-- Modo edición -->
            <div *ngIf="editandoComentarioId === com._id" style="margin-top: 8px;">
              <textarea
                rows="2"
                class="field-input"
                [(ngModel)]="textoEdicion"
                maxlength="300"
                style="resize: none; background: #ffffff; margin-bottom: 8px;"></textarea>
              <div style="display: flex; justify-content: flex-end; gap: 8px;">
                <button
                  type="button"
                  (click)="cancelarEdicion()"
                  style="background: #e2e8f0; color: #334155; border: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">
                  Cancelar
                </button>
                <button
                  type="button"
                  (click)="guardarEdicion(com)"
                  class="btn-primary"
                  style="padding: 6px 14px; font-size: 12px;"
                  [disabled]="guardandoEdicion || !textoEdicion.trim()">
                  {{ guardandoEdicion ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón Cargar más comentarios (mantiene los anteriores) -->
        <div *ngIf="hasMore" style="text-align: center; margin-top: 20px;">
          <button
            type="button"
            (click)="cargarMasComentarios()"
            [disabled]="cargandoMas"
            style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;">
            {{ cargandoMas ? 'Cargando...' : 'Cargar más comentarios' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class PublicacionDetalleComponent implements OnInit {
  publicacionId = '';
  publicacion: any = null;
  usuarioActual: any = null;

  cargandoPublicacion = true;
  cargandoComentarios = true;
  cargandoMas = false;

  comentarios: any[] = [];
  page = 1;
  limit = 5;
  totalComentarios = 0;
  hasMore = false;

  nuevoComentario = '';
  enviandoComentario = false;

  editandoComentarioId: string | null = null;
  textoEdicion = '';
  guardandoEdicion = false;

  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const userJson = localStorage.getItem('usuario');
    if (!userJson) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuarioActual = JSON.parse(userJson);

    this.publicacionId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.publicacionId) {
      this.router.navigate(['/publicaciones']);
      return;
    }

    this.cargarPublicacion();
    this.cargarComentariosIniciales();
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

  cargarPublicacion() {
    this.cargandoPublicacion = true;
    this.http.get<any>(`${environment.apiUrl}/publicaciones/${this.publicacionId}`).subscribe({
      next: (pub) => {
        this.cargandoPublicacion = false;
        this.publicacion = pub;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoPublicacion = false;
        this.router.navigate(['/publicaciones']);
      },
    });
  }

  cargarComentariosIniciales() {
    this.cargandoComentarios = true;
    this.page = 1;
    const url = `${environment.apiUrl}/publicaciones/${this.publicacionId}/comentarios?page=1&limit=${this.limit}`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.cargandoComentarios = false;
        this.comentarios = res?.data || [];
        this.totalComentarios = res?.total || 0;
        this.hasMore = Boolean(res?.hasMore);
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoComentarios = false;
        this.cdr.detectChanges();
      },
    });
  }

  cargarMasComentarios() {
    if (this.cargandoMas || !this.hasMore) return;
    this.cargandoMas = true;
    const siguientePagina = this.page + 1;
    const url = `${environment.apiUrl}/publicaciones/${this.publicacionId}/comentarios?page=${siguientePagina}&limit=${this.limit}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.cargandoMas = false;
        this.page = siguientePagina;
        const nuevos = res?.data || [];
        const idsExistentes = new Set(this.comentarios.map((c) => c._id));
        const filtrados = nuevos.filter((c: any) => !idsExistentes.has(c._id));
        this.comentarios = [...this.comentarios, ...filtrados];
        this.totalComentarios = res?.total ?? this.totalComentarios;
        this.hasMore = Boolean(res?.hasMore);
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoMas = false;
        this.mostrarToast('No se pudieron cargar más comentarios.', 'error');
      },
    });
  }

  agregarComentario() {
    const mensaje = this.nuevoComentario.trim();
    if (!mensaje || this.enviandoComentario) return;

    this.enviandoComentario = true;
    const nombreCompleto = `${this.usuarioActual?.nombre || ''} ${this.usuarioActual?.apellido || ''}`.trim();

    const body = {
      mensaje,
      autorId: this.usuarioActual?.id || this.usuarioActual?._id || '',
      autor: nombreCompleto || this.usuarioActual?.username || 'Usuario',
      autorUsername: this.usuarioActual?.username || '',
      autorFoto: this.usuarioActual?.fotoPerfil || '',
    };

    this.http
      .post<any>(`${environment.apiUrl}/publicaciones/${this.publicacionId}/comentarios`, body)
      .subscribe({
        next: (creado) => {
          this.enviandoComentario = false;
          this.nuevoComentario = '';
          this.comentarios = [creado, ...this.comentarios];
          this.totalComentarios += 1;
          this.mostrarToast('Comentario agregado.');
          this.cdr.detectChanges();
        },
        error: () => {
          this.enviandoComentario = false;
          this.mostrarToast('No se pudo publicar el comentario.', 'error');
        },
      });
  }

  esAutorComentario(com: any): boolean {
    const uid = this.usuarioActual?.id || this.usuarioActual?._id;
    return Boolean(uid && com.autorId === uid);
  }

  iniciarEdicion(com: any) {
    this.editandoComentarioId = com._id;
    this.textoEdicion = com.mensaje;
  }

  cancelarEdicion() {
    this.editandoComentarioId = null;
    this.textoEdicion = '';
  }

  guardarEdicion(com: any) {
    const nuevoTexto = this.textoEdicion.trim();
    if (!nuevoTexto || this.guardandoEdicion) return;

    this.guardandoEdicion = true;
    const autorId = this.usuarioActual?.id || this.usuarioActual?._id || '';

    this.http
      .put<any>(
        `${environment.apiUrl}/publicaciones/${this.publicacionId}/comentarios/${com._id}`,
        { mensaje: nuevoTexto, autorId }
      )
      .subscribe({
        next: (actualizado) => {
          this.guardandoEdicion = false;
          com.mensaje = actualizado?.mensaje || nuevoTexto;
          com.modificado = true;
          this.editandoComentarioId = null;
          this.textoEdicion = '';
          this.mostrarToast('Comentario actualizado.');
          this.cdr.detectChanges();
        },
        error: () => {
          this.guardandoEdicion = false;
          this.mostrarToast('No se pudo editar el comentario.', 'error');
        },
      });
  }

  usuarioDioLike(): boolean {
    const uid = this.usuarioActual?.id || this.usuarioActual?._id;
    return Array.isArray(this.publicacion?.likes) && this.publicacion.likes.includes(uid);
  }

  darLike() {
    const userId = this.usuarioActual?.id || this.usuarioActual?._id;
    this.http
      .post<any>(`${environment.apiUrl}/publicaciones/${this.publicacionId}/like`, { userId })
      .subscribe({
        next: (pubActualizada) => {
          if (pubActualizada?.likes) {
            this.publicacion.likes = pubActualizada.likes;
            this.cdr.detectChanges();
          }
        },
        error: () => this.mostrarToast('No se pudo actualizar el Me gusta.', 'error'),
      });
  }
}