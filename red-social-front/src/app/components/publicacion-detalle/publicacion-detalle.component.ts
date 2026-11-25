import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo.pipe';
import { AutoFocusDirective } from '../../directives/auto-focus.directive';

@Component({
  selector: 'app-publicacion-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TiempoRelativoPipe, AutoFocusDirective],
  template: `
    <div style="max-width: 780px; margin: 28px auto; padding: 0 18px 60px 18px;">

      <!-- Toast de notificación -->
      <div *ngIf="toastMensaje" class="toast-banner" [ngClass]="toastTipo === 'error' ? 'toast-error' : 'toast-success'">
        {{ toastMensaje }}
      </div>

      <!-- Barra superior con Volver y Baja Admin -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 18px;">
        <a routerLink="/publicaciones" style="display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; background: linear-gradient(180deg, #ffffff, #f1f5f9); border: 1.5px solid #cbd5e1; border-radius: 11px; color: #1e293b; text-decoration: none; font-weight: 700; font-size: 13px; box-shadow: 0 3px 8px rgba(15, 23, 42, 0.06);">
          ← Volver a publicaciones
        </a>

        <div *ngIf="!cargandoPublicacion && publicacion && puedeDarDeBaja()">
          <button
            *ngIf="!confirmandoBaja"
            type="button"
            (click)="confirmandoBaja = true"
            style="background: #fef2f2; color: #dc2626; border: 1.5px solid #fecaca; padding: 9px 16px; border-radius: 11px; font-size: 13px; font-weight: 700; cursor: pointer;">
            🗑️ {{ esAdmin ? 'Dar de baja publicación (Admin)' : 'Dar de baja publicación' }}
          </button>

          <div *ngIf="confirmandoBaja" style="display: flex; align-items: center; gap: 8px; background: #ffffff; padding: 6px 12px; border-radius: 10px; border: 1px solid #fecaca;">
            <span style="font-size: 12px; font-weight: 600; color: #991b1b;">¿Dar de baja publicación y comentarios?</span>
            <button type="button" (click)="darDeBajaPublicacion()" style="background: #dc2626; color: white; border: none; padding: 6px 12px; border-radius: 7px; font-size: 12px; font-weight: 700; cursor: pointer;">
              Confirmar
            </button>
            <button type="button" (click)="confirmandoBaja = false" style="background: #e2e8f0; color: #334155; border: none; padding: 6px 12px; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer;">
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Cargando publicación -->
      <div *ngIf="cargandoPublicacion" class="surface-card" style="padding: 48px; text-align: center; color: #64748b; font-weight: 600;">
        Cargando publicación...
      </div>

      <!-- Publicación en grande -->
      <div *ngIf="!cargandoPublicacion && publicacion" class="surface-card" style="padding: 28px; border-radius: 20px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 18px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img *ngIf="publicacion.autorFoto" [src]="publicacion.autorFoto" alt="Avatar" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid #cbd5e1; flex-shrink: 0;">
            <div *ngIf="!publicacion.autorFoto" style="width: 52px; height: 52px; background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #1d4ed8; font-weight: 800; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">
              {{ (publicacion.autor || 'US').substring(0, 2).toUpperCase() }}
            </div>
            <div style="min-width: 0;">
              <span class="texto-ajustado" style="font-weight: 800; color: #0f172a; font-size: 17px; display: block;">{{ publicacion.autor || 'Usuario' }}</span>
              <span style="font-size: 13px; color: #64748b;">
                <span *ngIf="publicacion.autorUsername">&#64;{{ publicacion.autorUsername }} · </span>
                {{ publicacion.createdAt | tiempoRelativo }}
              </span>
            </div>
          </div>

          <span
            *ngIf="estaGuardada()"
            style="background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 999px;">
            🔖 Guardada
          </span>
        </div>

        <h1 *ngIf="publicacion.titulo" class="texto-ajustado" style="margin: 0 0 12px 0; color: #0f172a; font-size: 24px; font-weight: 800; line-height: 1.3;">
          {{ publicacion.titulo }}
        </h1>

        <p class="texto-ajustado" style="color: #1e293b; margin: 0 0 20px 0; font-size: 16px; line-height: 1.65; white-space: pre-line;">
          {{ publicacion.contenido }}
        </p>

        <div *ngIf="publicacion.imagen" style="margin-bottom: 20px; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; background: #f8fafc;">
          <img [src]="publicacion.imagen" alt="Imagen de publicación" style="width: 100%; max-height: 580px; object-fit: contain; display: block; margin: 0 auto;">
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; border-top: 1px solid #e2e8f0; padding-top: 14px;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <button
              (click)="darLike()"
              [style.color]="usuarioDioLike() ? '#e11d48' : '#475569'"
              [style.background]="usuarioDioLike() ? 'linear-gradient(180deg, #ffe4e6, #fecdd3)' : 'linear-gradient(180deg, #ffffff, #f1f5f9)'"
              style="border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 10px; cursor: pointer; font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 14px;">
              {{ usuarioDioLike() ? '❤️' : '🤍' }} Me gusta ({{ publicacion.likes?.length || 0 }})
            </button>

            <button
              (click)="toggleGuardar()"
              [style.color]="estaGuardada() ? '#92400e' : '#334155'"
              [style.background]="estaGuardada() ? 'linear-gradient(180deg, #fef3c7, #fde68a)' : 'linear-gradient(180deg, #ffffff, #f8fafc)'"
              style="border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 10px; cursor: pointer; font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 14px;">
              {{ estaGuardada() ? '🔖 Guardado' : '📑 Guardar' }} ({{ publicacion.guardadosPor?.length || 0 }})
            </button>

            <button
              (click)="abrirCompartir()"
              style="background: linear-gradient(180deg, #f0fdf4, #dcfce7); color: #15803d; border: 1px solid #86efac; padding: 8px 16px; border-radius: 10px; cursor: pointer; font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 14px;">
              📤 Compartir ({{ publicacion.compartidos?.length || 0 }})
            </button>
          </div>

          <span style="font-size: 13px; font-weight: 700; color: #64748b;">
            💬 {{ totalComentarios }} {{ totalComentarios === 1 ? 'comentario' : 'comentarios' }}
          </span>
        </div>
      </div>

      <!-- Sección de Comentarios -->
      <div *ngIf="!cargandoPublicacion && publicacion" class="surface-card" style="padding: 24px; border-radius: 20px;">
        <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 17px; font-weight: 800;">
          Comentarios ({{ totalComentarios }})
        </h3>

        <!-- Caja para escribir comentario -->
        <div style="display: flex; gap: 12px; align-items: flex-start; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
          <img *ngIf="usuarioActual?.fotoPerfil" [src]="usuarioActual.fotoPerfil" alt="Avatar" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">
          <div *ngIf="!usuarioActual?.fotoPerfil" style="width: 38px; height: 38px; border-radius: 50%; background: #dbeafe; color: #1d4ed8; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            {{ (usuarioActual?.nombre || 'U').substring(0, 2).toUpperCase() }}
          </div>

          <div style="flex: 1; min-width: 0;">
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
        <div *ngIf="!cargandoComentarios && comentarios.length === 0" style="text-align: center; padding: 28px 16px; color: #64748b; background: #f8fafc; border-radius: 14px; border: 1px dashed #cbd5e1;">
          <p style="margin: 0; font-size: 14px; font-weight: 600;">Todavía no hay comentarios en esta publicación.</p>
          <p style="margin: 4px 0 0 0; font-size: 13px;">¡Sé el primero en opinar!</p>
        </div>

        <!-- Listado ordenado uno debajo del otro -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div *ngFor="let com of comentarios" style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #dbe3ee; border-radius: 14px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                <img *ngIf="com.autorFoto" [src]="com.autorFoto" alt="Avatar" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">
                <div *ngIf="!com.autorFoto" style="width: 34px; height: 34px; border-radius: 50%; background: #e0e7ff; color: #3730a3; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  {{ (com.autor || 'US').substring(0, 2).toUpperCase() }}
                </div>
                <div style="min-width: 0;">
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span class="texto-ajustado" style="font-weight: 700; color: #0f172a; font-size: 14px;">{{ com.autor }}</span>
                    <span *ngIf="com.autorUsername" style="font-size: 12px; color: #64748b;">&#64;{{ com.autorUsername }}</span>
                    <span *ngIf="com.modificado" style="background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; font-size: 11px; font-weight: 700; padding: 1px 8px; border-radius: 999px;">
                      editado
                    </span>
                  </div>
                  <span style="font-size: 11px; color: #64748b;">{{ com.createdAt | tiempoRelativo }}</span>
                </div>
              </div>

              <button
                *ngIf="esAutorComentario(com) && editandoComentarioId !== com._id"
                (click)="iniciarEdicion(com)"
                style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; flex-shrink: 0;">
                ✏️ Editar
              </button>
            </div>

            <p *ngIf="editandoComentarioId !== com._id" class="texto-ajustado" style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.5; white-space: pre-line;">
              {{ com.mensaje }}
            </p>

            <!-- Modo edición con directiva appAutoFocus -->
            <div *ngIf="editandoComentarioId === com._id" style="margin-top: 8px;">
              <textarea
                rows="2"
                appAutoFocus
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

        <!-- Botón Cargar más comentarios -->
        <div *ngIf="hasMore" style="text-align: center; margin-top: 20px;">
          <button
            type="button"
            (click)="cargarMasComentarios()"
            [disabled]="cargandoMas"
            style="background: linear-gradient(180deg, #eff6ff, #dbeafe); color: #1d4ed8; border: 1px solid #93c5fd; padding: 10px 22px; border-radius: 11px; font-size: 13px; font-weight: 700; cursor: pointer;">
            {{ cargandoMas ? 'Cargando...' : 'Cargar más comentarios' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Compartir -->
    <div *ngIf="mostrarModalCompartir" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); z-index: 9998; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div style="background: #ffffff; border-radius: 18px; padding: 24px; max-width: 420px; width: 100%; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.25); border: 1px solid #cbd5e1;">
        <h3 style="margin: 0 0 6px 0; color: #0f172a; font-size: 18px; font-weight: 800;">Compartir publicación</h3>
        <p style="margin: 0 0 16px 0; color: #64748b; font-size: 13px;">
          Elegí el usuario al que querés compartir esta publicación
        </p>

        <div class="field-group" style="margin-bottom: 18px;">
          <label class="field-label">Destinatario</label>
          <select [(ngModel)]="destinatarioSeleccionadoId" class="field-input">
            <option value="">Seleccioná un usuario...</option>
            <option *ngFor="let u of destinatarios" [value]="u.id">
              {{ u.nombreCompleto }} (&#64;{{ u.username }})
            </option>
          </select>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button
            type="button"
            (click)="cerrarCompartir()"
            style="padding: 9px 16px; border-radius: 10px; border: 1px solid #cbd5e1; background: #f8fafc; color: #334155; font-weight: 600; font-size: 13px; cursor: pointer;">
            Cancelar
          </button>
          <button
            type="button"
            (click)="confirmarCompartir()"
            class="btn-primary"
            [disabled]="compartiendo || !destinatarioSeleccionadoId"
            style="padding: 9px 18px; font-size: 13px;">
            {{ compartiendo ? 'Compartiendo...' : 'Enviar' }}
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
  destinatarios: any[] = [];

  mostrarModalCompartir = false;
  destinatarioSeleccionadoId = '';
  compartiendo = false;

  cargandoPublicacion = true;
  cargandoComentarios = true;
  cargandoMas = false;
  confirmandoBaja = false;

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

  get esAdmin(): boolean {
    return this.usuarioActual?.rol === 'administrador';
  }

  puedeDarDeBaja(): boolean {
    const uid = this.usuarioActual?.id || this.usuarioActual?._id;
    return this.esAdmin || (Boolean(uid) && this.publicacion?.autorId === uid);
  }

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
    this.cargarDestinatarios();
  }

  cargarDestinatarios() {
    this.http.get<any[]>(`${environment.apiUrl}/publicaciones/destinatarios-compartir`).subscribe({
      next: (lista) => {
        this.destinatarios = lista || [];
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  estaGuardada(): boolean {
    if (!this.publicacion) return false;
    if (typeof this.publicacion?.guardadaPorMi === 'boolean') return this.publicacion.guardadaPorMi;
    const uid = String(this.usuarioActual?.id || this.usuarioActual?._id || '');
    return Array.isArray(this.publicacion?.guardadosPor) && this.publicacion.guardadosPor.map(String).includes(uid);
  }

  toggleGuardar() {
    if (!this.publicacion) return;
    const yaGuardada = this.estaGuardada();
    const endpoint = yaGuardada ? 'quitar-guardado' : 'guardar';
    this.http.post<any>(`${environment.apiUrl}/publicaciones/${this.publicacionId}/${endpoint}`, {}).subscribe({
      next: (res) => {
        if (res?.publicacion) {
          this.publicacion.guardadosPor = res.publicacion.guardadosPor || [];
          this.publicacion.guardadaPorMi = Boolean(res.guardada);
        } else {
          const uid = String(this.usuarioActual?.id || this.usuarioActual?._id || '');
          const lista = Array.isArray(this.publicacion.guardadosPor) ? [...this.publicacion.guardadosPor] : [];
          this.publicacion.guardadosPor = yaGuardada ? lista.filter((x) => String(x) !== uid) : [...lista, uid];
          this.publicacion.guardadaPorMi = !yaGuardada;
        }
        this.mostrarToast(!yaGuardada ? 'Publicación guardada.' : 'Publicación quitada de guardados.');
        this.cdr.detectChanges();
      },
      error: () => this.mostrarToast('No se pudo actualizar guardados.', 'error'),
    });
  }

  abrirCompartir() {
    this.mostrarModalCompartir = true;
    this.destinatarioSeleccionadoId = '';
    if (this.destinatarios.length === 0) {
      this.cargarDestinatarios();
    }
  }

  cerrarCompartir() {
    this.mostrarModalCompartir = false;
    this.destinatarioSeleccionadoId = '';
    this.compartiendo = false;
  }

  confirmarCompartir() {
    if (!this.destinatarioSeleccionadoId || this.compartiendo) return;
    this.compartiendo = true;

    this.http
      .post<any>(`${environment.apiUrl}/publicaciones/${this.publicacionId}/compartir`, {
        destinatarioId: this.destinatarioSeleccionadoId,
      })
      .subscribe({
        next: (res) => {
          if (res?.publicacion?.compartidos && this.publicacion) {
            this.publicacion.compartidos = res.publicacion.compartidos;
          }
          this.cerrarCompartir();
          this.mostrarToast(res?.message || '¡Publicación compartida!');
          this.cdr.detectChanges();
        },
        error: () => {
          this.compartiendo = false;
          this.mostrarToast('No se pudo compartir la publicación.', 'error');
        },
      });
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

  darDeBajaPublicacion() {
    this.http.delete(`${environment.apiUrl}/publicaciones/${this.publicacionId}`).subscribe({
      next: () => {
        this.router.navigate(['/publicaciones']);
      },
      error: () => {
        this.confirmandoBaja = false;
        this.mostrarToast('No se pudo dar de baja la publicación.', 'error');
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