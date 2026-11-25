import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { procesarImagenArchivo } from '../../utils/imagen.util';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo.pipe';
import { ResaltarHoverDirective } from '../../directives/resaltar-hover.directive';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TiempoRelativoPipe, ResaltarHoverDirective],
  template: `
    <div style="max-width: 680px; margin: 28px auto; padding: 0 18px 50px 18px;">

      <!-- Toast de notificación -->
      <div *ngIf="toastMensaje" class="toast-banner" [ngClass]="toastTipo === 'error' ? 'toast-error' : 'toast-success'">
        {{ toastMensaje }}
      </div>

      <!-- Formulario de nueva publicación -->
      <div class="surface-card" style="padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <img *ngIf="usuarioActual?.fotoPerfil" [src]="usuarioActual.fotoPerfil" alt="Avatar" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid #dbeafe;">
          <div *ngIf="!usuarioActual?.fotoPerfil" style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #1d4ed8; font-weight: 800; display: flex; align-items: center; justify-content: center;">
            {{ (usuarioActual?.nombre || 'U').substring(0, 2).toUpperCase() }}
          </div>
          <div>
            <h3 style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 800;">Crear nueva publicación</h3>
            <span style="font-size: 12px; color: #64748b;">Publicando como {{ usuarioActual?.nombre }} {{ usuarioActual?.apellido }}</span>
          </div>
        </div>

        <div class="field-group" style="margin-bottom: 12px;">
          <input
            type="text"
            class="field-input"
            [class.input-error]="(tocadoTitulo && errorTitulo) || esTituloExcedido"
            [(ngModel)]="nuevoTitulo"
            (input)="tocadoTitulo = true"
            (blur)="tocadoTitulo = true"
            placeholder="Título de la publicación (máximo 80 caracteres) *">

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 12px;">
            <span class="error-text" style="margin: 0;" *ngIf="tocadoTitulo && errorTitulo">
              {{ errorTitulo }}
            </span>
            <span *ngIf="!(tocadoTitulo && errorTitulo)"></span>
            <span [style.color]="esTituloExcedido ? '#dc2626' : '#64748b'" style="font-weight: 600;">
              {{ caracteresRestantesTitulo }} caracteres restantes
            </span>
          </div>
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

        <div *ngIf="nuevaImagen" style="position: relative; margin-bottom: 14px; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1;">
          <img [src]="nuevaImagen" alt="Vista previa" style="width: 100%; max-height: 280px; object-fit: cover; display: block;">
          <button type="button" (click)="nuevaImagen = ''" style="position: absolute; top: 10px; right: 10px; background: rgba(15, 23, 42, 0.85); color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">
            ✕ Quitar foto
          </button>
        </div>

        <span class="error-text" *ngIf="errorImagen" style="margin-bottom: 10px;">{{ errorImagen }}</span>

        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #e2e8f0;">
          <label style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: linear-gradient(180deg, #f8fafc, #e2e8f0); color: #334155; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;">
            📷 Agregar foto
            <input type="file" accept="image/*" (change)="onSeleccionarImagen($event)" style="display: none;">
          </label>

          <button
            (click)="crearPublicacion()"
            class="btn-primary"
            style="padding: 10px 22px; font-size: 14px;"
            [disabled]="publicando || !!errorTitulo || !!errorContenido || esExcedido || esTituloExcedido">
            {{ publicando ? 'Publicando...' : 'Publicar' }}
          </button>
        </div>
      </div>

      <!-- Barra de Ordenamiento -->
      <div class="surface-card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; padding: 12px 18px; border-radius: 14px;">
        <span style="font-size: 14px; font-weight: 700; color: #334155;">
          Publicaciones ({{ total }})
        </span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px; color: #64748b;">Ordenar por:</span>
          <select [(ngModel)]="orden" (change)="cambiarOrden()" style="padding: 7px 12px; border-radius: 9px; border: 1.5px solid #cbd5e1; font-size: 13px; font-weight: 600; color: #1e293b; background: #f8fafc; cursor: pointer;">
            <option value="recientes">Más recientes</option>
            <option value="likes">Más Me gusta</option>
          </select>
        </div>
      </div>

      <!-- Estado vacío -->
      <div *ngIf="!cargando && publicaciones.length === 0" class="surface-card" style="text-align: center; color: #64748b; padding: 48px 20px; border-style: dashed;">
        <p style="margin: 0; font-size: 16px; font-weight: 700; color: #334155;">No hay publicaciones todavía</p>
        <p style="margin: 6px 0 0 0; font-size: 13px;">¡Sé el primero en compartir algo con la comunidad!</p>
      </div>

      <!-- Tarjetas de publicaciones -->
      <div *ngFor="let pub of publicaciones" [appResaltarHover]="'#93c5fd'" class="surface-card" style="padding: 22px; margin-bottom: 18px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
            <img *ngIf="pub.autorFoto" [src]="pub.autorFoto" alt="Avatar" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid #e2e8f0;">
            <div *ngIf="!pub.autorFoto" style="width: 44px; height: 44px; background: linear-gradient(135deg, #e0e7ff, #c7d2fe); color: #3730a3; font-weight: 800; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;">
              {{ (pub.autor || 'US').substring(0, 2).toUpperCase() }}
            </div>
            <div style="min-width: 0;">
              <span class="texto-ajustado" style="font-weight: 700; color: #0f172a; font-size: 15px; display: block;">{{ pub.autor || 'Usuario' }}</span>
              <span style="font-size: 12px; color: #64748b;">
                <span *ngIf="pub.autorUsername">&#64;{{ pub.autorUsername }} · </span>
                {{ pub.createdAt | tiempoRelativo }}
              </span>
            </div>
          </div>
        </div>

        <div (click)="verPublicacion(pub._id)" style="cursor: pointer;">
          <h4 *ngIf="pub.titulo" class="texto-ajustado" style="margin: 0 0 8px 0; color: #0f172a; font-size: 18px; font-weight: 800; line-height: 1.35;">
            {{ pub.titulo }}
          </h4>

          <p class="texto-ajustado" style="color: #334155; margin: 0 0 14px 0; font-size: 15px; line-height: 1.55;">
            {{ pub.contenido }}
          </p>

          <div *ngIf="pub.imagen" style="margin-bottom: 16px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <img [src]="pub.imagen" alt="Imagen de publicación" style="width: 100%; max-height: 420px; object-fit: cover; display: block;">
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 12px; gap: 10px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button
              (click)="darLike(pub._id)"
              [style.color]="usuarioDioLike(pub) ? '#e11d48' : '#475569'"
              [style.background]="usuarioDioLike(pub) ? 'linear-gradient(180deg, #ffe4e6, #fecdd3)' : 'linear-gradient(180deg, #ffffff, #f1f5f9)'"
              style="border: 1px solid #cbd5e1; padding: 7px 14px; border-radius: 10px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 6px; font-size: 13px;">
              {{ usuarioDioLike(pub) ? '❤️' : '🤍' }} Me gusta ({{ pub.likes?.length || 0 }})
            </button>

            <button
              (click)="verPublicacion(pub._id)"
              style="background: linear-gradient(180deg, #eff6ff, #dbeafe); color: #1d4ed8; border: 1px solid #93c5fd; padding: 7px 14px; border-radius: 10px; cursor: pointer; font-weight: 700; display: flex; align-items: center; gap: 6px; font-size: 13px;">
              💬 Comentar / Ver grande
            </button>
          </div>

          <!-- Botón de baja habilitado para el autor o cualquier ADMINISTRADOR -->
          <div *ngIf="puedeDarDeBaja(pub)">
            <button *ngIf="confirmandoBorradoId !== pub._id" (click)="confirmandoBorradoId = pub._id" style="background: #fef2f2; border: 1px solid #fecaca; padding: 6px 12px; border-radius: 8px; cursor: pointer; color: #dc2626; font-weight: 700; font-size: 12.5px;">
              🗑️ {{ esAdmin && !esAutor(pub) ? 'Dar de baja (Admin)' : 'Dar de baja' }}
            </button>
            <div *ngIf="confirmandoBorradoId === pub._id" style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12px; color: #64748b;">¿Dar de baja?</span>
              <button (click)="eliminar(pub._id)" style="background: #dc2626; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
                Sí, confirmar
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
          style="padding: 9px 16px; border-radius: 10px; border: 1px solid #cbd5e1; background: #ffffff; color: #1e293b; font-weight: 600; font-size: 13px; cursor: pointer;"
          [style.opacity]="page <= 1 ? '0.5' : '1'">
          ← Anterior
        </button>

        <span style="font-size: 13px; font-weight: 600; color: #475569;">
          Página {{ page }} de {{ totalPages }}
        </span>

        <button
          (click)="cambiarPagina(page + 1)"
          [disabled]="page >= totalPages"
          style="padding: 9px 16px; border-radius: 10px; border: 1px solid #cbd5e1; background: #ffffff; color: #1e293b; font-weight: 600; font-size: 13px; cursor: pointer;"
          [style.opacity]="page >= totalPages ? '0.5' : '1'">
          Siguiente →
        </button>
      </div>
    </div>
  `,
})
export class PublicacionesComponent implements OnInit {
  publicaciones: any[] = [];
  usuarioActual: any = null;

  nuevoTitulo = '';
  nuevoTexto = '';
  nuevaImagen = '';
  maxCaracteresTitulo = 80;
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

  get esAdmin(): boolean {
    return this.usuarioActual?.rol === 'administrador';
  }

  get errorTitulo(): string {
    const val = this.nuevoTitulo.trim();
    if (!val) return 'El título es obligatorio.';
    if (val.length < 3) return 'El título debe tener al menos 3 caracteres.';
    if (this.esTituloExcedido) return 'Superaste el límite máximo de 80 caracteres.';
    return '';
  }

  get caracteresRestantesTitulo(): number {
    return this.maxCaracteresTitulo - (this.nuevoTitulo ? this.nuevoTitulo.length : 0);
  }

  get esTituloExcedido(): boolean {
    return (this.nuevoTitulo ? this.nuevoTitulo.length : 0) > this.maxCaracteresTitulo;
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

  verPublicacion(id: string) {
    this.router.navigate(['/publicacion', id]);
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
      },
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
    if (this.errorTitulo || this.errorContenido || this.esExcedido || this.esTituloExcedido) return;

    this.publicando = true;
    const nombreCompleto = `${this.usuarioActual?.nombre || ''} ${this.usuarioActual?.apellido || ''}`.trim();

    const body = {
      titulo: this.nuevoTitulo.trim(),
      contenido: this.nuevoTexto.trim(),
      imagen: this.nuevaImagen,
      autor: nombreCompleto || this.usuarioActual?.username || 'Usuario',
      autorUsername: this.usuarioActual?.username || '',
      autorId: this.usuarioActual?.id || this.usuarioActual?._id || '',
      autorFoto: this.usuarioActual?.fotoPerfil || '',
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
      },
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
      error: () => this.mostrarToast('No se pudo actualizar el Me gusta.', 'error'),
    });
  }

  esAutor(pub: any): boolean {
    const uid = this.usuarioActual?.id || this.usuarioActual?._id;
    return pub.autorId === uid || pub.autor === this.usuarioActual?.nombre;
  }

  puedeDarDeBaja(pub: any): boolean {
    return this.esAdmin || this.esAutor(pub);
  }

  eliminar(id: string) {
    this.http.delete(`${environment.apiUrl}/publicaciones/${id}`).subscribe({
      next: () => {
        this.confirmandoBorradoId = null;
        this.cargarPublicaciones();
        this.mostrarToast('Publicación y comentarios dados de baja.');
      },
      error: () => this.mostrarToast('No se pudo dar de baja la publicación.', 'error'),
    });
  }
}