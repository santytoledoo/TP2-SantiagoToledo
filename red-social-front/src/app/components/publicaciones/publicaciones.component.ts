import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { procesarImagenArchivo } from '../../utils/imagen.util';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div style="max-width: 680px; margin: 28px auto; padding: 0 18px 50px 18px;">

      <!-- Toast de notificación -->
      <div *ngIf="toastMensaje" class="toast-banner" [ngClass]="toastTipo === 'error' ? 'toast-error' : 'toast-success'">
        {{ toastMensaje }}
      </div>

      <!-- Formulario de nueva publicación -->
      <div style="background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05); margin-bottom: 24px; border: 1px solid #e2e8f0;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <img *ngIf="usuarioActual?.fotoPerfil" [src]="usuarioActual.fotoPerfil" alt="Avatar" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover;">
          <div *ngIf="!usuarioActual?.fotoPerfil" style="width: 42px; height: 42px; border-radius: 50%; background: #dbeafe; color: #1d4ed8; font-weight: 700; display: flex; align-items: center; justify-content: center;">
            {{ (usuarioActual?.nombre || 'U').substring(0, 2).toUpperCase() }}
          </div>
          <div>
            <h3 style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 700;">Crear nueva publicación</h3>
            <span style="font-size: 12px; color: #64748b;">Publicando como {{ usuarioActual?.nombre }} {{ usuarioActual?.apellido }}</span>
          </div>
        </div>

        <div class="field-group">
          <input
            type="text"
            class="field-input"
            [class.input-error]="tocadoTitulo && errorTitulo"
            [(ngModel)]="nuevoTitulo"
            (input)="tocadoTitulo = true"
            (blur)="tocadoTitulo = true"
            placeholder="Título de la publicación *">
          <span class="error-text" *ngIf="tocadoTitulo && errorTitulo">{{ errorTitulo }}</span>
        </div>

        <div class="field-group" style="margin-bottom: 10px;">
          <textarea
            rows="3"
            class="field-input"
            [class.input-error]="(tocadoContenido && errorContenido) || esExcedido"
            [(ngModel)]="nuevoTexto"
            (input)="tocadoContenido = true"
            (blur)="tocadoContenido = true"
            placeholder="¿Qué querés compartir hoy? (máximo 250 caracteres)..."
            style="resize: none;"></textarea>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 12px;">
            <span class="error-text" style="margin: 0;" *ngIf="tocadoContenido && errorContenido">
              {{ errorContenido }}
            </span>
            <span *ngIf="!(tocadoContenido && errorContenido)"></span>
            <span [style.color]="esExcedido ? '#dc2626' : '#64748b'" style="font-weight: 600;">
              {{ caracteresRestantes }} caracteres restantes
            </span>
          </div>
        </div>

        <!-- Vista previa de imagen seleccionada -->
        <div *ngIf="nuevaImagen" style="position: relative; margin-bottom: 14px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          <img [src]="nuevaImagen" alt="Vista previa" style="width: 100%; max-height: 280px; object-fit: cover; display: block;">
          <button type="button" (click)="nuevaImagen = ''" style="position: absolute; top: 10px; right: 10px; background: rgba(15, 23, 42, 0.8); color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">
            ✕ Quitar foto
          </button>
        </div>

        <span class="error-text" *ngIf="errorImagen" style="margin-bottom: 10px;">{{ errorImagen }}</span>

        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #f1f5f9;">
          <label style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: #f1f5f9; color: #334155; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
            📷 Agregar foto
            <input type="file" accept="image/*" (change)="onSeleccionarImagen($event)" style="display: none;">
          </label>

          <button
            (click)="crearPublicacion()"
            class="btn-primary"
            style="padding: 10px 22px; font-size: 14px;"
            [disabled]="publicando || !!errorTitulo || !!errorContenido || esExcedido">
            {{ publicando ? 'Publicando...' : 'Publicar' }}
          </button>
        </div>
      </div>

      <!-- Barra de Ordenamiento -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; background: #ffffff; padding: 12px 18px; border-radius: 12px; border: 1px solid #e2e8f0;">
        <span style="font-size: 14px; font-weight: 700; color: #334155;">
          Publicaciones ({{ total }})
        </span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px; color: #64748b;">Ordenar por:</span>
          <select [(ngModel)]="orden" (change)="cambiarOrden()" style="padding: 7px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; font-weight: 600; color: #1e293b; background: #f8fafc; cursor: pointer;">
            <option value="recientes">Más recientes</option>
            <option value="likes">Más Me gusta</option>
          </select>
        </div>
      </div>

      <!-- Estado vacío -->
      <div *ngIf="!cargando && publicaciones.length === 0" style="text-align: center; color: #64748b; padding: 48px 20px; background: #ffffff; border-radius: 16px; border: 1px dashed #cbd5e1;">
        <p style="margin: 0; font-size: 16px; font-weight: 600;">No hay publicaciones todavía</p>
        <p style="margin: 6px 0 0 0; font-size: 13px;">¡Sé el primero en compartir algo con la comunidad!</p>
      </div>

      <!-- Tarjetas de publicaciones -->
      <div *ngFor="let pub of publicaciones" style="background: #ffffff; border: 1px solid #e2e8f0; padding: 22px; border-radius: 16px; margin-bottom: 18px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img *ngIf="pub.autorFoto" [src]="pub.autorFoto" alt="Avatar" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover;">
            <div *ngIf="!pub.autorFoto" style="width: 42px; height: 42px; background: #e0e7ff; color: #3730a3; font-weight: 700; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">
              {{ (pub.autor || 'US').substring(0, 2).toUpperCase() }}
            </div>
            <div>
              <span style="font-weight: 700; color: #0f172a; font-size: 15px; display: block;">{{ pub.autor || 'Usuario' }}</span>
              <span style="font-size: 12px; color: #64748b;">
                <span *ngIf="pub.autorUsername">&#64;{{ pub.autorUsername }} · </span>
                {{ pub.createdAt | date:'dd/MM/yyyy HH:mm' }}
              </span>
            </div>
          </div>
        </div>

        <h4 *ngIf="pub.titulo" style="margin: 0 0 8px 0; color: #0f172a; font-size: 18px; font-weight: 700;">
          {{ pub.titulo }}
        </h4>

        <p style="color: #334155; margin: 0 0 14px 0; font-size: 15px; line-height: 1.55; word-break: break-word;">
          {{ pub.contenido }}
        </p>

        <div *ngIf="pub.imagen" style="margin-bottom: 16px; border-radius: 12px; overflow: hidden; border: 1px solid #f1f5f9;">
          <img [src]="pub.imagen" alt="Imagen de publicación" style="width: 100%; max-height: 420px; object-fit: cover; display: block;">
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 12px;">
          <button
            (click)="darLike(pub._id)"
            [style.color]="usuarioDioLike(pub) ? '#e11d48' : '#475569'"
            [style.background]="usuarioDioLike(pub) ? '#ffe4e6' : '#f8fafc'"
            style="border: 1px solid #e2e8f0; padding: 7px 14px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 6px; font-size: 13px;">
            {{ usuarioDioLike(pub) ? '❤️' : '🤍' }} Me gusta ({{ pub.likes?.length || 0 }})
          </button>

          <!-- Borrado con confirmación integrada (sin alert/confirm) -->
          <div *ngIf="esAutor(pub)">
            <button *ngIf="confirmandoBorradoId !== pub._id" (click)="confirmandoBorradoId = pub._id" style="background: none; border: none; cursor: pointer; color: #dc2626; font-weight: 600; font-size: 13px;">
              🗑️ Eliminar
            </button>
            <div *ngIf="confirmandoBorradoId === pub._id" style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12px; color: #64748b;">¿Seguro?</span>
              <button (click)="eliminar(pub._id)" style="background: #dc2626; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
                Sí, borrar
              </button>
              <button (click)="confirmandoBorradoId = null" style="background: #e2e8f0; color: #334155; border: none; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div *ngIf="totalPages > 1" style="display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 26px;">
        <button
          (click)="cambiarPagina(page - 1)"
          [disabled]="page <= 1"
          style="padding: 9px 16px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #1e293b; font-weight: 600; font-size: 13px; cursor: pointer;"
          [style.opacity]="page <= 1 ? '0.5' : '1'">
          ← Anterior
        </button>

        <span style="font-size: 13px; font-weight: 600; color: #475569;">
          Página {{ page }} de {{ totalPages }}
        </span>

        <button
          (click)="cambiarPagina(page + 1)"
          [disabled]="page >= totalPages"
          style="padding: 9px 16px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #1e293b; font-weight: 600; font-size: 13px; cursor: pointer;"
          [style.opacity]="page >= totalPages ? '0.5' : '1'">
          Siguiente →
        </button>
      </div>
    </div>
  `
})
export class PublicacionesComponent implements OnInit {
  publicaciones: any[] = [];
  usuarioActual: any = null;

  nuevoTitulo = '';
  nuevoTexto = '';
  nuevaImagen = '';
  maxCaracteres = 250;

  tocadoTitulo = false;
  tocadoContenido = false;
  errorImagen = '';
  publicando = false;
  cargando = false;

  orden = 'recientes';
  page = 1;
  limit = 5;
  total = 0;
  totalPages = 1;

  confirmandoBorradoId: string | null = null;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get errorTitulo(): string {
    const val = this.nuevoTitulo.trim();
    if (!val) return 'El título es obligatorio.';
    if (val.length < 3) return 'El título debe tener al menos 3 caracteres.';
    if (val.length > 80) return 'El título no puede superar los 80 caracteres.';
    return '';
  }

  get errorContenido(): string {
    if (!this.nuevoTexto.trim()) return 'Escribí un mensaje para publicar.';
    if (this.esExcedido) return 'Superaste el límite máximo de 250 caracteres.';
    return '';
  }

  get caracteresRestantes(): number {
    return this.maxCaracteres - (this.nuevoTexto ? this.nuevoTexto.length : 0);
  }

  get esExcedido(): boolean {
    return (this.nuevoTexto ? this.nuevoTexto.length : 0) > this.maxCaracteres;
  }

  ngOnInit() {
    const userJson = localStorage.getItem('usuario');
    if (!userJson) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuarioActual = JSON.parse(userJson);
    this.cargarPublicaciones();
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMensaje = '';
      this.cdr.detectChanges();
    }, 3200);
  }

  async onSeleccionarImagen(event: any) {
    this.errorImagen = '';
    const file: File = event.target?.files?.[0];
    if (!file) return;
    try {
      this.nuevaImagen = await procesarImagenArchivo(file, 850);
      this.cdr.detectChanges();
    } catch (msg: any) {
      this.errorImagen = typeof msg === 'string' ? msg : 'No se pudo procesar la imagen.';
      this.cdr.detectChanges();
    }
  }

  cargarPublicaciones() {
    this.cargando = true;
    const url = `${environment.apiUrl}/publicaciones?page=${this.page}&limit=${this.limit}&orden=${this.orden}`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.cargando = false;
        this.publicaciones = res?.data || [];
        this.total = res?.total || 0;
        this.totalPages = res?.totalPages || 1;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.mostrarToast('Error al cargar las publicaciones.', 'error');
      }
    });
  }

  cambiarOrden() {
    this.page = 1;
    this.cargarPublicaciones();
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
    this.page = nuevaPagina;
    this.cargarPublicaciones();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  crearPublicacion() {
    this.tocadoTitulo = true;
    this.tocadoContenido = true;
    if (this.errorTitulo || this.errorContenido || this.esExcedido) return;

    this.publicando = true;
    const nombreCompleto = `${this.usuarioActual?.nombre || ''} ${this.usuarioActual?.apellido || ''}`.trim();

    const body = {
      titulo: this.nuevoTitulo.trim(),
      contenido: this.nuevoTexto.trim(),
      imagen: this.nuevaImagen,
      autor: nombreCompleto || this.usuarioActual?.username || 'Usuario',
      autorUsername: this.usuarioActual?.username || '',
      autorId: this.usuarioActual?.id || this.usuarioActual?._id || '',
      autorFoto: this.usuarioActual?.fotoPerfil || ''
    };

    this.http.post(`${environment.apiUrl}/publicaciones`, body).subscribe({
      next: () => {
        this.publicando = false;
        this.nuevoTitulo = '';
        this.nuevoTexto = '';
        this.nuevaImagen = '';
        this.tocadoTitulo = false;
        this.tocadoContenido = false;
        this.page = 1;
        this.cargarPublicaciones();
        this.mostrarToast('¡Publicación compartida con éxito!');
      },
      error: () => {
        this.publicando = false;
        this.mostrarToast('No se pudo crear la publicación.', 'error');
      }
    });
  }

  usuarioDioLike(pub: any): boolean {
    const uid = this.usuarioActual?.id || this.usuarioActual?._id;
    const uname = this.usuarioActual?.nombre;
    return Array.isArray(pub.likes) && (pub.likes.includes(uid) || pub.likes.includes(uname));
  }

  darLike(id: string) {
    const userId = this.usuarioActual?.id || this.usuarioActual?._id || this.usuarioActual?.nombre;
    this.http.post(`${environment.apiUrl}/publicaciones/${id}/like`, { userId }).subscribe({
      next: () => this.cargarPublicaciones(),
      error: () => this.mostrarToast('No se pudo actualizar el Me gusta.', 'error')
    });
  }

  esAutor(pub: any): boolean {
    const uid = this.usuarioActual?.id || this.usuarioActual?._id;
    return pub.autorId === uid || pub.autor === this.usuarioActual?.nombre;
  }

  eliminar(id: string) {
    this.http.delete(`${environment.apiUrl}/publicaciones/${id}`).subscribe({
      next: () => {
        this.confirmandoBorradoId = null;
        this.cargarPublicaciones();
        this.mostrarToast('Publicación eliminada.');
      },
      error: () => this.mostrarToast('No se pudo eliminar la publicación.', 'error')
    });
  }
}