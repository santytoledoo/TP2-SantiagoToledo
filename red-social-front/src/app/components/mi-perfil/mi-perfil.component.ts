import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { procesarImagenArchivo } from '../../utils/imagen.util';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  template: `
    <div style="max-width: 720px; margin: 28px auto; padding: 0 18px 60px 18px;">

      <!-- Notificación flotante (sin alert) -->
      <div *ngIf="toastMensaje" class="toast-banner" [ngClass]="toastTipo === 'error' ? 'toast-error' : 'toast-success'">
        {{ toastMensaje }}
      </div>

      <!-- Tarjeta Principal de Perfil -->
      <div style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06); border: 1px solid #e2e8f0; margin-bottom: 28px;">
        
        <!-- Banner superior -->
        <div style="height: 135px; background: linear-gradient(120deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%); position: relative;"></div>

        <div style="padding: 0 28px 28px 28px;">
          <!-- Fila de Avatar + Botón Editar -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: -52px; margin-bottom: 16px; gap: 16px; flex-wrap: wrap;">
            
            <!-- Avatar interactivo con botón de cámara -->
            <div style="position: relative; width: 104px; height: 104px;">
              <div style="width: 104px; height: 104px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; font-size: 36px; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 4px solid #ffffff; box-shadow: 0 6px 16px rgba(15, 23, 42, 0.14);">
                <img *ngIf="avatarMostrado" [src]="avatarMostrado" alt="Foto de perfil" style="width: 100%; height: 100%; object-fit: cover;">
                <span *ngIf="!avatarMostrado">{{ iniciales }}</span>
              </div>

              <!-- Acceso directo para cambiar foto desde el avatar -->
              <label title="Cambiar foto de perfil" style="position: absolute; bottom: 2px; right: 2px; width: 32px; height: 32px; border-radius: 50%; background: #0f172a; color: #ffffff; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                📷
                <input type="file" accept="image/*" (change)="onCambioRapidoFoto($event)" style="display: none;">
              </label>
            </div>

            <button
              type="button"
              (click)="toggleEditar()"
              [style.background]="editando ? '#f1f5f9' : '#ffffff'"
              [style.color]="editando ? '#475569' : '#0f172a'"
              style="border: 1.5px solid #cbd5e1; padding: 9px 18px; border-radius: 999px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
              {{ editando ? 'Cancelar edición' : 'Editar perfil' }}
            </button>
          </div>

          <!-- MODO LECTURA (Información limpia y social) -->
          <div *ngIf="!editando">
            <div style="margin-bottom: 12px;">
              <h1 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.4px;">
                {{ usuario?.nombre }} {{ usuario?.apellido }}
              </h1>
              <span style="color: #64748b; font-size: 14px; font-weight: 500;">
                &#64;{{ usuario?.username }}
              </span>
            </div>

            <p *ngIf="usuario?.descripcion" style="margin: 0 0 16px 0; color: #1e293b; font-size: 15px; line-height: 1.55;">
              {{ usuario.descripcion }}
            </p>
            <p *ngIf="!usuario?.descripcion" style="margin: 0 0 16px 0; color: #94a3b8; font-size: 14px; font-style: italic;">
              Sin biografía todavía. Hacé clic en "Editar perfil" para contar algo sobre vos.
            </p>

            <!-- Datos de contacto y fecha en línea -->
            <div style="display: flex; flex-wrap: wrap; gap: 18px; color: #475569; font-size: 13px; margin-bottom: 18px;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                ✉️ {{ usuario?.correo }}
              </span>
              <span *ngIf="usuario?.fechaNacimiento" style="display: inline-flex; align-items: center; gap: 6px;">
                🎂 Nacimiento: {{ usuario.fechaNacimiento | date:'dd/MM/yyyy' }}
              </span>
            </div>

            <!-- Barra de métricas sociales -->
            <div style="display: flex; gap: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
              <div>
                <span style="font-weight: 800; color: #0f172a; font-size: 16px;">{{ totalMisPublis }}</span>
                <span style="color: #64748b; font-size: 13px; margin-left: 5px;">Publicaciones</span>
              </div>
              <div>
                <span style="font-weight: 800; color: #0f172a; font-size: 16px;">{{ totalLikesRecibidos }}</span>
                <span style="color: #64748b; font-size: 13px; margin-left: 5px;">Me gusta recibidos</span>
              </div>
            </div>
          </div>

          <!-- MODO EDICIÓN -->
          <form *ngIf="editando" (ngSubmit)="guardarPerfil()" style="margin-top: 8px; padding-top: 18px; border-top: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: #0f172a;">Editar información del perfil</h3>
              <button
                *ngIf="formEdit.fotoPerfil"
                type="button"
                (click)="formEdit.fotoPerfil = ''"
                style="background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">
                Quitar foto actual
              </button>
            </div>

            <span class="error-text" *ngIf="errorFoto" style="margin-bottom: 12px;">{{ errorFoto }}</span>

            <div class="grid-2">
              <div class="field-group">
                <label class="field-label">Nombre *</label>
                <input type="text" class="field-input" [class.input-error]="errorEditNombre" [(ngModel)]="formEdit.nombre" name="editNombre" placeholder="Tu nombre">
                <span class="error-text" *ngIf="errorEditNombre">{{ errorEditNombre }}</span>
              </div>

              <div class="field-group">
                <label class="field-label">Apellido *</label>
                <input type="text" class="field-input" [class.input-error]="errorEditApellido" [(ngModel)]="formEdit.apellido" name="editApellido" placeholder="Tu apellido">
                <span class="error-text" *ngIf="errorEditApellido">{{ errorEditApellido }}</span>
              </div>

              <div class="field-group">
                <label class="field-label">Nombre de usuario *</label>
                <input type="text" class="field-input" [class.input-error]="errorEditUsername" [(ngModel)]="formEdit.username" name="editUsername" placeholder="usuario">
                <span class="error-text" *ngIf="errorEditUsername">{{ errorEditUsername }}</span>
              </div>

              <div class="field-group">
                <label class="field-label">Correo electrónico *</label>
                <input type="email" class="field-input" [class.input-error]="errorEditCorreo" [(ngModel)]="formEdit.correo" name="editCorreo" placeholder="correo@ejemplo.com">
                <span class="error-text" *ngIf="errorEditCorreo">{{ errorEditCorreo }}</span>
              </div>

              <div class="field-group">
                <label class="field-label">Fecha de nacimiento *</label>
                <input type="date" class="field-input" [class.input-error]="errorEditFecha" [(ngModel)]="formEdit.fechaNacimiento" name="editFecha">
                <span class="error-text" *ngIf="errorEditFecha">{{ errorEditFecha }}</span>
              </div>

              <div class="field-group">
                <label class="field-label">Foto de perfil</label>
                <input type="file" accept="image/*" (change)="onSeleccionarFotoForm($event)" style="font-size: 13px; color: #475569; padding-top: 8px;">
              </div>
            </div>

            <div class="field-group">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label class="field-label">Biografía / Descripción</label>
                <span style="font-size: 12px;" [style.color]="formEdit.descripcion.length > 160 ? '#dc2626' : '#64748b'">
                  {{ formEdit.descripcion.length }}/160
                </span>
              </div>
              <textarea
                rows="2"
                class="field-input"
                [class.input-error]="errorEditDescripcion"
                [(ngModel)]="formEdit.descripcion"
                name="editDesc"
                placeholder="Contá brevemente quién sos, qué estudiás o qué te interesa..."
                style="resize: none;"></textarea>
              <span class="error-text" *ngIf="errorEditDescripcion">{{ errorEditDescripcion }}</span>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px;">
              <button type="button" (click)="toggleEditar()" style="padding: 10px 18px; border-radius: 10px; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; font-weight: 600; font-size: 14px; cursor: pointer;">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" style="padding: 10px 24px; font-size: 14px;" [disabled]="guardando || !formularioEditValido">
                {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Sección de Publicaciones Propias -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="margin: 0; color: #0f172a; font-size: 19px; font-weight: 800;">
          Mis publicaciones
        </h2>
        <span style="background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px;">
          {{ totalMisPublis }} {{ totalMisPublis === 1 ? 'publicación' : 'publicaciones' }}
        </span>
      </div>

      <div *ngIf="misPublicaciones.length === 0" style="text-align: center; color: #64748b; padding: 44px 20px; background: #ffffff; border-radius: 18px; border: 1px dashed #cbd5e1;">
        <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #334155;">Todavía no publicaste nada</p>
        <p style="margin: 0 0 18px 0; font-size: 13px;">Cuando compartas algo en el muro, va a aparecer acá.</p>
        <a routerLink="/publicaciones" class="btn-primary" style="display: inline-block; text-decoration: none; font-size: 13px; padding: 10px 20px;">
          Ir a publicar algo
        </a>
      </div>

      <div *ngFor="let pub of misPublicaciones" style="background: #ffffff; border: 1px solid #e2e8f0; padding: 22px; border-radius: 18px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 11px;">
            <img *ngIf="usuario?.fotoPerfil" [src]="usuario.fotoPerfil" alt="Avatar" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;">
            <div *ngIf="!usuario?.fotoPerfil" style="width: 38px; height: 38px; border-radius: 50%; background: #dbeafe; color: #1d4ed8; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center;">
              {{ iniciales }}
            </div>
            <div>
              <span style="font-weight: 700; color: #0f172a; font-size: 14px; display: block;">
                {{ usuario?.nombre }} {{ usuario?.apellido }}
              </span>
              <span style="font-size: 12px; color: #64748b;">
                &#64;{{ usuario?.username }} · {{ pub.createdAt | date:'dd/MM/yyyy HH:mm' }}
              </span>
            </div>
          </div>
        </div>

        <h4 *ngIf="pub.titulo" style="margin: 0 0 8px 0; color: #0f172a; font-size: 17px; font-weight: 700;">
          {{ pub.titulo }}
        </h4>

        <p style="color: #334155; margin: 0 0 14px 0; font-size: 14.5px; line-height: 1.55; word-break: break-word;">
          {{ pub.contenido }}
        </p>

        <div *ngIf="pub.imagen" style="margin-bottom: 14px; border-radius: 12px; overflow: hidden; border: 1px solid #f1f5f9;">
          <img [src]="pub.imagen" alt="Imagen de la publicación" style="width: 100%; max-height: 380px; object-fit: cover; display: block;">
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 12px;">
          <button
            (click)="darLike(pub._id)"
            [style.color]="usuarioDioLike(pub) ? '#e11d48' : '#475569'"
            [style.background]="usuarioDioLike(pub) ? '#ffe4e6' : '#f8fafc'"
            style="border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
            {{ usuarioDioLike(pub) ? '❤️' : '🤍' }} {{ pub.likes?.length || 0 }} Me gusta
          </button>

          <div>
            <button *ngIf="confirmandoBorradoId !== pub._id" (click)="confirmandoBorradoId = pub._id" style="background: none; border: none; color: #dc2626; font-weight: 600; font-size: 13px; cursor: pointer;">
              🗑️ Eliminar
            </button>
            <div *ngIf="confirmandoBorradoId === pub._id" style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12px; color: #64748b;">¿Borrar?</span>
              <button (click)="eliminarPublicacion(pub._id)" style="background: #dc2626; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
                Sí
              </button>
              <button (click)="confirmandoBorradoId = null" style="background: #e2e8f0; color: #334155; border: none; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
                No
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div *ngIf="totalPages > 1" style="display: flex; justify-content: center; align-items: center; gap: 14px; margin-top: 22px;">
        <button (click)="cambiarPagina(page - 1)" [disabled]="page <= 1" [style.opacity]="page <= 1 ? '0.5' : '1'" style="padding: 8px 16px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; font-weight: 600; font-size: 13px; cursor: pointer;">
          ← Anterior
        </button>
        <span style="font-size: 13px; font-weight: 600; color: #475569;">Página {{ page }} de {{ totalPages }}</span>
        <button (click)="cambiarPagina(page + 1)" [disabled]="page >= totalPages" [style.opacity]="page >= totalPages ? '0.5' : '1'" style="padding: 8px 16px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; font-weight: 600; font-size: 13px; cursor: pointer;">
          Siguiente →
        </button>
      </div>
    </div>
  `
})
export class MiPerfilComponent implements OnInit {
  usuario: any = null;
  editando = false;
  guardando = false;
  errorFoto = '';

  formEdit = {
    nombre: '',
    apellido: '',
    correo: '',
    username: '',
    fechaNacimiento: '',
    descripcion: '',
    fotoPerfil: ''
  };

  misPublicaciones: any[] = [];
  totalMisPublis = 0;
  page = 1;
  totalPages = 1;
  confirmandoBorradoId: string | null = null;

  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  get avatarMostrado(): string {
    return this.editando ? this.formEdit.fotoPerfil : (this.usuario?.fotoPerfil || '');
  }

  get iniciales(): string {
    const n = this.usuario?.nombre || '';
    const a = this.usuario?.apellido || '';
    const texto = (n + a).trim() || 'US';
    return texto.substring(0, 2).toUpperCase();
  }

  get totalLikesRecibidos(): number {
    return this.misPublicaciones.reduce((acc, p) => acc + (p.likes?.length || 0), 0);
  }

  get errorEditNombre(): string {
    return this.formEdit.nombre.trim().length < 2 ? 'El nombre debe tener al menos 2 caracteres.' : '';
  }

  get errorEditApellido(): string {
    return this.formEdit.apellido.trim().length < 2 ? 'El apellido debe tener al menos 2 caracteres.' : '';
  }

  get errorEditCorreo(): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(this.formEdit.correo.trim()) ? 'Ingresá un correo electrónico válido.' : '';
  }

  get errorEditUsername(): string {
    const val = this.formEdit.username.trim();
    if (val.length < 3) return 'El usuario debe tener al menos 3 caracteres.';
    if (/\s/.test(val)) return 'El usuario no puede contener espacios.';
    return '';
  }

  get errorEditFecha(): string {
    return !this.formEdit.fechaNacimiento ? 'Seleccioná tu fecha de nacimiento.' : '';
  }

  get errorEditDescripcion(): string {
    return this.formEdit.descripcion.length > 160 ? 'La biografía no puede superar los 160 caracteres.' : '';
  }

  get formularioEditValido(): boolean {
    return (
      !this.errorEditNombre &&
      !this.errorEditApellido &&
      !this.errorEditCorreo &&
      !this.errorEditUsername &&
      !this.errorEditFecha &&
      !this.errorEditDescripcion
    );
  }

  ngOnInit() {
    const raw = localStorage.getItem('usuario');
    if (!raw) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuario = JSON.parse(raw);
    const uid = this.usuario.id || this.usuario._id;

    if (uid) {
      this.http.get<any>(`${environment.apiUrl}/auth/perfil/${uid}`).subscribe({
        next: (perfilActualizado) => {
          this.usuario = perfilActualizado;
          localStorage.setItem('usuario', JSON.stringify(perfilActualizado));
          this.cdr.detectChanges();
        }
      });
    }

    this.cargarMisPublicaciones();
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

  toggleEditar() {
    this.editando = !this.editando;
    this.errorFoto = '';
    if (this.editando && this.usuario) {
      this.formEdit = {
        nombre: this.usuario.nombre || '',
        apellido: this.usuario.apellido || '',
        correo: this.usuario.correo || '',
        username: this.usuario.username || '',
        fechaNacimiento: this.usuario.fechaNacimiento || '',
        descripcion: this.usuario.descripcion || '',
        fotoPerfil: this.usuario.fotoPerfil || ''
      };
    }
  }

  // Cambio rápido de foto tocando el ícono de cámara sobre el avatar
  async onCambioRapidoFoto(event: any) {
    const file: File = event.target?.files?.[0];
    if (!file) return;
    try {
      const nuevaFoto = await procesarImagenArchivo(file, 400);
      if (this.editando) {
        this.formEdit.fotoPerfil = nuevaFoto;
        this.cdr.detectChanges();
        return;
      }

      const uid = this.usuario?.id || this.usuario?._id;
      if (!uid) return;

      this.http.put<any>(`${environment.apiUrl}/auth/perfil/${uid}`, { fotoPerfil: nuevaFoto }).subscribe({
        next: (res) => {
          if (res?.usuario) {
            this.usuario = res.usuario;
            localStorage.setItem('usuario', JSON.stringify(res.usuario));
          }
          this.mostrarToast('Foto de perfil actualizada.');
          this.cdr.detectChanges();
        },
        error: () => this.mostrarToast('No se pudo actualizar la foto.', 'error')
      });
    } catch (msg: any) {
      this.mostrarToast(typeof msg === 'string' ? msg : 'Imagen inválida.', 'error');
    }
  }

  async onSeleccionarFotoForm(event: any) {
    this.errorFoto = '';
    const file: File = event.target?.files?.[0];
    if (!file) return;
    try {
      this.formEdit.fotoPerfil = await procesarImagenArchivo(file, 400);
      this.cdr.detectChanges();
    } catch (msg: any) {
      this.errorFoto = typeof msg === 'string' ? msg : 'No se pudo procesar la foto.';
      this.cdr.detectChanges();
    }
  }

  guardarPerfil() {
    const uid = this.usuario?.id || this.usuario?._id;
    if (!uid || !this.formularioEditValido) return;

    this.guardando = true;
    const payload = {
      nombre: this.formEdit.nombre.trim(),
      apellido: this.formEdit.apellido.trim(),
      correo: this.formEdit.correo.trim(),
      username: this.formEdit.username.trim(),
      fechaNacimiento: this.formEdit.fechaNacimiento,
      descripcion: this.formEdit.descripcion.trim(),
      fotoPerfil: this.formEdit.fotoPerfil
    };

    this.http.put<any>(`${environment.apiUrl}/auth/perfil/${uid}`, payload).subscribe({
      next: (res) => {
        this.guardando = false;
        this.editando = false;
        if (res?.usuario) {
          this.usuario = res.usuario;
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
        }
        this.mostrarToast('¡Perfil actualizado con éxito!');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        this.mostrarToast(err?.error?.message || 'Error al guardar los cambios.', 'error');
      }
    });
  }

  cargarMisPublicaciones() {
    const uid = this.usuario?.id || this.usuario?._id;
    if (!uid) return;

    this.http.get<any>(`${environment.apiUrl}/publicaciones?autorId=${uid}&page=${this.page}&limit=5`).subscribe({
      next: (res) => {
        this.misPublicaciones = res?.data || [];
        this.totalMisPublis = res?.total || 0;
        this.totalPages = res?.totalPages || 1;
        this.cdr.detectChanges();
      }
    });
  }

  usuarioDioLike(pub: any): boolean {
    const uid = this.usuario?.id || this.usuario?._id;
    return Array.isArray(pub.likes) && pub.likes.includes(uid);
  }

  darLike(id: string) {
    const userId = this.usuario?.id || this.usuario?._id;
    if (!userId) return;
    this.http.post(`${environment.apiUrl}/publicaciones/${id}/like`, { userId }).subscribe({
      next: () => this.cargarMisPublicaciones()
    });
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
    this.page = nuevaPagina;
    this.cargarMisPublicaciones();
  }

  eliminarPublicacion(id: string) {
    this.http.delete(`${environment.apiUrl}/publicaciones/${id}`).subscribe({
      next: () => {
        this.confirmandoBorradoId = null;
        this.cargarMisPublicaciones();
        this.mostrarToast('Publicación eliminada.');
      },
      error: () => this.mostrarToast('No se pudo eliminar la publicación.', 'error')
    });
  }
}