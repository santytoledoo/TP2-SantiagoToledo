import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { procesarImagenArchivo } from '../../utils/imagen.util';
import { RolEtiquetaPipe } from '../../pipes/rol-etiqueta.pipe';
import { ResumenTextoPipe } from '../../pipes/resumen-texto.pipe';
import { ResaltarHoverDirective } from '../../directives/resaltar-hover.directive';
import { AutoFocusDirective } from '../../directives/auto-focus.directive';

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RolEtiquetaPipe,
    ResumenTextoPipe,
    ResaltarHoverDirective,
    AutoFocusDirective,
  ],
  template: `
    <div style="max-width: 980px; margin: 28px auto; padding: 0 18px 60px 18px;">

      <!-- Toast -->
      <div *ngIf="toastMensaje" class="toast-banner" [ngClass]="toastTipo === 'error' ? 'toast-error' : 'toast-success'">
        {{ toastMensaje }}
      </div>

      <!-- Encabezado Panel Admin -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 22px;">
        <div>
          <h1 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800;">
            Gestión de Usuarios
          </h1>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">
            Administrá cuentas, roles y altas/bajas lógicas de la plataforma
          </p>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <a routerLink="/dashboard/estadisticas" style="padding: 10px 16px; border-radius: 10px; border: 1.5px solid #cbd5e1; background: #ffffff; color: #1e293b; text-decoration: none; font-size: 13px; font-weight: 700;">
            📊 Ver Estadísticas
          </a>
          <button
            type="button"
            (click)="mostrarFormulario = !mostrarFormulario"
            class="btn-primary"
            style="padding: 10px 18px; font-size: 13px;">
            {{ mostrarFormulario ? '✕ Cerrar formulario' : '+ Nuevo Usuario' }}
          </button>
        </div>
      </div>

      <!-- Formulario de Alta de Usuario (con radio buttons usuario / administrador) -->
      <div *ngIf="mostrarFormulario" class="surface-card" style="padding: 26px; margin-bottom: 26px;">
        <h3 style="margin: 0 0 18px 0; color: #0f172a; font-size: 18px; font-weight: 800;">
          Registrar nuevo usuario
        </h3>

        <form (ngSubmit)="crearUsuario()">
          <!-- Foto de perfil opcional -->
          <div style="display: flex; align-items: center; gap: 16px; background: #f8fafc; padding: 12px 16px; border-radius: 12px; border: 1px dashed #cbd5e1; margin-bottom: 18px;">
            <div style="width: 56px; height: 56px; border-radius: 50%; overflow: hidden; background: #dbeafe; color: #1d4ed8; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; flex-shrink: 0; border: 2px solid #2563eb;">
              <img *ngIf="nuevo.fotoPerfil" [src]="nuevo.fotoPerfil" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;">
              <span *ngIf="!nuevo.fotoPerfil">{{ (nuevo.nombre || 'U').substring(0, 2).toUpperCase() }}</span>
            </div>
            <div style="flex: 1;">
              <label class="field-label" style="margin-bottom: 4px;">Foto de Perfil (opcional)</label>
              <input type="file" accept="image/*" (change)="onSeleccionarFoto($event)" style="font-size: 13px; color: #475569;">
              <span class="error-text" *ngIf="errorFoto">{{ errorFoto }}</span>
            </div>
          </div>

          <div class="grid-2">
            <div class="field-group">
              <label class="field-label">Nombre *</label>
              <input type="text" appAutoFocus class="field-input" [(ngModel)]="nuevo.nombre" name="nombre" placeholder="Nombre">
            </div>

            <div class="field-group">
              <label class="field-label">Apellido *</label>
              <input type="text" class="field-input" [(ngModel)]="nuevo.apellido" name="apellido" placeholder="Apellido">
            </div>

            <div class="field-group">
              <label class="field-label">Correo Electrónico *</label>
              <input type="email" class="field-input" [(ngModel)]="nuevo.correo" name="correo" placeholder="correo@ejemplo.com">
            </div>

            <div class="field-group">
              <label class="field-label">Nombre de Usuario *</label>
              <input type="text" class="field-input" [(ngModel)]="nuevo.username" name="username" placeholder="usuario_utn">
            </div>

            <div class="field-group">
              <label class="field-label">Contraseña (mín. 8 caracteres) *</label>
              <input type="password" class="field-input" [(ngModel)]="nuevo.password" name="password" placeholder="••••••••">
            </div>

            <div class="field-group">
              <label class="field-label">Repetir Contraseña *</label>
              <input type="password" class="field-input" [(ngModel)]="nuevo.rePassword" name="rePassword" placeholder="••••••••">
            </div>

            <div class="field-group">
              <label class="field-label">Fecha de Nacimiento *</label>
              <input type="date" class="field-input" [(ngModel)]="nuevo.fechaNacimiento" name="fechaNacimiento">
            </div>

            <div class="field-group">
              <label class="field-label">Descripción breve</label>
              <input type="text" class="field-input" [(ngModel)]="nuevo.descripcion" name="descripcion" maxlength="160" placeholder="Breve descripción...">
            </div>
          </div>

          <!-- Radio buttons para Perfil: Usuario o Administrador -->
          <div class="field-group" style="background: #f8fafc; padding: 14px 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-top: 4px;">
            <label class="field-label" style="margin-bottom: 10px;">Perfil del nuevo usuario *</label>
            <div style="display: flex; gap: 24px; flex-wrap: wrap;">
              <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; font-weight: 600; color: #1e293b;">
                <input type="radio" name="rolNuevo" value="usuario" [(ngModel)]="nuevo.rol" style="width: 17px; height: 17px; accent-color: #2563eb;">
                👤 Usuario estándar
              </label>

              <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; font-weight: 600; color: #1e293b;">
                <input type="radio" name="rolNuevo" value="administrador" [(ngModel)]="nuevo.rol" style="width: 17px; height: 17px; accent-color: #2563eb;">
                🛡️ Administrador
              </label>
            </div>
          </div>

          <span class="error-text" *ngIf="errorFormulario" style="margin-bottom: 12px;">{{ errorFormulario }}</span>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
            <button type="button" (click)="mostrarFormulario = false" style="padding: 10px 18px; border-radius: 10px; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; font-weight: 600; font-size: 14px; cursor: pointer;">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" style="padding: 10px 22px; font-size: 14px;" [disabled]="creando">
              {{ creando ? 'Creando...' : 'Crear Usuario' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Listado de Usuarios -->
      <div *ngIf="cargando" class="surface-card" style="padding: 40px; text-align: center; color: #64748b; font-weight: 600;">
        Cargando listado de usuarios...
      </div>

      <div *ngIf="!cargando" style="display: flex; flex-direction: column; gap: 14px;">
        <div
          *ngFor="let u of usuarios"
          [appResaltarHover]="'#93c5fd'"
          class="surface-card"
          style="padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;"
          [style.opacity]="u.activo ? '1' : '0.72'">

          <div style="display: flex; align-items: center; gap: 14px; min-width: 240px; flex: 1;">
            <img *ngIf="u.fotoPerfil" [src]="u.fotoPerfil" alt="Avatar" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid #cbd5e1;">
            <div *ngIf="!u.fotoPerfil" style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #1d4ed8; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 16px;">
              {{ (u.nombre || 'U').substring(0, 2).toUpperCase() }}
            </div>

            <div style="min-width: 0;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="font-weight: 800; color: #0f172a; font-size: 15px;">
                  {{ u.nombre }} {{ u.apellido }}
                </span>
                <span style="font-size: 12px; color: #64748b; font-weight: 600;">
                  &#64;{{ u.username }}
                </span>
                <span style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 999px;">
                  {{ u.rol | rolEtiqueta }}
                </span>
                <span
                  [style.background]="u.activo ? '#dcfce7' : '#fee2e2'"
                  [style.color]="u.activo ? '#166534' : '#991b1b'"
                  style="font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 999px;">
                  {{ u.activo ? 'Habilitado' : 'Deshabilitado' }}
                </span>
              </div>

              <div style="font-size: 13px; color: #475569; margin-top: 3px;">
                ✉️ {{ u.correo }}
                <span *ngIf="u.descripcion"> · {{ u.descripcion | resumenTexto:65 }}</span>
              </div>
            </div>
          </div>

          <!-- Acciones Alta / Baja Lógica -->
          <div>
            <span *ngIf="esUsuarioActual(u)" style="font-size: 12px; font-weight: 700; color: #64748b; background: #f1f5f9; padding: 6px 12px; border-radius: 8px;">
              Sesión actual
            </span>

            <ng-container *ngIf="!esUsuarioActual(u)">
              <button
                *ngIf="u.activo"
                type="button"
                (click)="deshabilitarUsuario(u)"
                style="background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; padding: 8px 14px; border-radius: 9px; font-size: 13px; font-weight: 700; cursor: pointer;">
                🚫 Deshabilitar
              </button>

              <button
                *ngIf="!u.activo"
                type="button"
                (click)="habilitarUsuario(u)"
                style="background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 8px 14px; border-radius: 9px; font-size: 13px; font-weight: 700; cursor: pointer;">
                ✅ Habilitar
              </button>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuarioActualId = '';
  cargando = true;
  mostrarFormulario = false;
  creando = false;
  errorFoto = '';
  errorFormulario = '';

  nuevo = {
    nombre: '',
    apellido: '',
    correo: '',
    username: '',
    password: '',
    rePassword: '',
    fechaNacimiento: '',
    descripcion: '',
    fotoPerfil: '',
    rol: 'usuario' as 'usuario' | 'administrador',
  };

  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const raw = localStorage.getItem('usuario');
    if (raw) {
      const u = JSON.parse(raw);
      this.usuarioActualId = u.id || u._id || '';
    }
    this.cargarUsuarios();
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

  esUsuarioActual(u: any): boolean {
    const id = u.id || u._id;
    return Boolean(this.usuarioActualId && id === this.usuarioActualId);
  }

  cargarUsuarios() {
    this.cargando = true;
    this.http.get<any[]>(`${environment.apiUrl}/usuarios`).subscribe({
      next: (lista) => {
        this.cargando = false;
        this.usuarios = lista || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.mostrarToast('No se pudo cargar el listado de usuarios.', 'error');
      },
    });
  }

  async onSeleccionarFoto(event: any) {
    this.errorFoto = '';
    const file: File = event.target?.files?.[0];
    if (!file) return;
    try {
      this.nuevo.fotoPerfil = await procesarImagenArchivo(file, 400);
      this.cdr.detectChanges();
    } catch (msg: any) {
      this.errorFoto = typeof msg === 'string' ? msg : 'No se pudo cargar la imagen.';
      this.cdr.detectChanges();
    }
  }

  crearUsuario() {
    this.errorFormulario = '';
    if (
      this.nuevo.nombre.trim().length < 2 ||
      this.nuevo.apellido.trim().length < 2 ||
      !this.nuevo.correo.includes('@') ||
      this.nuevo.username.trim().length < 3 ||
      this.nuevo.password.length < 8 ||
      !this.nuevo.fechaNacimiento
    ) {
      this.errorFormulario = 'Completá todos los campos obligatorios correctamente (contraseña mín. 8 caracteres).';
      return;
    }

    if (this.nuevo.password !== this.nuevo.rePassword) {
      this.errorFormulario = 'Las contraseñas no coinciden.';
      return;
    }

    this.creando = true;
    this.http
      .post<any>(`${environment.apiUrl}/usuarios`, {
        nombre: this.nuevo.nombre.trim(),
        apellido: this.nuevo.apellido.trim(),
        correo: this.nuevo.correo.trim(),
        username: this.nuevo.username.trim(),
        password: this.nuevo.password,
        fechaNacimiento: this.nuevo.fechaNacimiento,
        descripcion: this.nuevo.descripcion.trim(),
        fotoPerfil: this.nuevo.fotoPerfil,
        rol: this.nuevo.rol,
      })
      .subscribe({
        next: () => {
          this.creando = false;
          this.mostrarFormulario = false;
          this.nuevo = {
            nombre: '',
            apellido: '',
            correo: '',
            username: '',
            password: '',
            rePassword: '',
            fechaNacimiento: '',
            descripcion: '',
            fotoPerfil: '',
            rol: 'usuario',
          };
          this.cargarUsuarios();
          this.mostrarToast('Usuario creado correctamente.');
        },
        error: (err) => {
          this.creando = false;
          this.errorFormulario = err?.error?.message || 'Error al crear el usuario.';
          this.cdr.detectChanges();
        },
      });
  }

  deshabilitarUsuario(u: any) {
    const id = u.id || u._id;
    this.http.delete(`${environment.apiUrl}/usuarios/${id}`).subscribe({
      next: () => {
        u.activo = false;
        this.mostrarToast(`Usuario @${u.username} deshabilitado.`);
        this.cdr.detectChanges();
      },
      error: () => this.mostrarToast('No se pudo deshabilitar el usuario.', 'error'),
    });
  }

  habilitarUsuario(u: any) {
    const id = u.id || u._id;
    this.http.post(`${environment.apiUrl}/usuarios/${id}/habilitar`, {}).subscribe({
      next: () => {
        u.activo = true;
        this.mostrarToast(`Usuario @${u.username} rehabilitado.`);
        this.cdr.detectChanges();
      },
      error: () => this.mostrarToast('No se pudo habilitar el usuario.', 'error'),
    });
  }
}