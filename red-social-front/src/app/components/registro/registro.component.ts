import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { procesarImagenArchivo } from '../../utils/imagen.util';
import { SesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card auth-card-wide">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800;">Crear una cuenta</h2>
          <p style="margin: 6px 0 0 0; color: #64748b; font-size: 14px;">Completá tus datos para sumarte a la comunidad</p>
        </div>

        <div *ngIf="errorServidor" style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 12px 14px; border-radius: 10px; font-size: 13px; font-weight: 500; margin-bottom: 18px; text-align: center;">
          {{ errorServidor }}
        </div>

        <form (ngSubmit)="onRegistro()">
          <div style="display: flex; align-items: center; gap: 18px; background: #f8fafc; padding: 14px 18px; border-radius: 12px; border: 1px dashed #cbd5e1; margin-bottom: 20px;">
            <div style="width: 64px; height: 64px; border-radius: 50%; overflow: hidden; background: #dbeafe; color: #1d4ed8; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 22px; flex-shrink: 0; border: 2px solid #2563eb;">
              <img *ngIf="fotoPerfil" [src]="fotoPerfil" alt="Vista previa" style="width: 100%; height: 100%; object-fit: cover;">
              <span *ngIf="!fotoPerfil">{{ (nombre || 'U').substring(0, 2).toUpperCase() }}</span>
            </div>
            <div style="flex: 1;">
              <label class="field-label" style="margin-bottom: 4px;">Foto de Perfil (opcional)</label>
              <input type="file" accept="image/*" (change)="onSeleccionarFoto($event)" style="font-size: 13px; color: #475569;">
              <span class="error-text" *ngIf="errorFoto">{{ errorFoto }}</span>
              <button *ngIf="fotoPerfil" type="button" (click)="fotoPerfil = ''" style="margin-top: 6px; background: none; border: none; color: #dc2626; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0;">
                Quitar foto
              </button>
            </div>
          </div>

          <div class="grid-2">
            <div class="field-group">
              <label class="field-label">Nombre *</label>
              <input type="text" class="field-input" [class.input-error]="tocado.nombre && errorNombre" [(ngModel)]="nombre" (input)="tocado.nombre = true" (blur)="tocado.nombre = true" name="nombre" placeholder="Santiago">
              <span class="error-text" *ngIf="tocado.nombre && errorNombre">{{ errorNombre }}</span>
            </div>

            <div class="field-group">
              <label class="field-label">Apellido *</label>
              <input type="text" class="field-input" [class.input-error]="tocado.apellido && errorApellido" [(ngModel)]="apellido" (input)="tocado.apellido = true" (blur)="tocado.apellido = true" name="apellido" placeholder="Toledo">
              <span class="error-text" *ngIf="tocado.apellido && errorApellido">{{ errorApellido }}</span>
            </div>

            <div class="field-group">
              <label class="field-label">Correo Electrónico *</label>
              <input type="email" class="field-input" [class.input-error]="tocado.correo && errorCorreo" [(ngModel)]="correo" (input)="tocado.correo = true" (blur)="tocado.correo = true" name="correo" placeholder="correo@ejemplo.com">
              <span class="error-text" *ngIf="tocado.correo && errorCorreo">{{ errorCorreo }}</span>
            </div>

            <div class="field-group">
              <label class="field-label">Nombre de Usuario *</label>
              <input type="text" class="field-input" [class.input-error]="tocado.username && errorUsername" [(ngModel)]="username" (input)="tocado.username = true" (blur)="tocado.username = true" name="username" placeholder="santi_utn">
              <span class="error-text" *ngIf="tocado.username && errorUsername">{{ errorUsername }}</span>
            </div>

            <div class="field-group">
              <label class="field-label">Contraseña *</label>
              <input type="password" class="field-input" [class.input-error]="tocado.password && errorPassword" [(ngModel)]="password" (input)="tocado.password = true" (blur)="tocado.password = true" name="password" placeholder="Mínimo 8 caracteres">
              <span class="error-text" *ngIf="tocado.password && errorPassword">{{ errorPassword }}</span>
            </div>

            <div class="field-group">
              <label class="field-label">Repetir Contraseña *</label>
              <input type="password" class="field-input" [class.input-error]="tocado.rePassword && errorRePassword" [(ngModel)]="rePassword" (input)="tocado.rePassword = true" (blur)="tocado.rePassword = true" name="rePassword" placeholder="Repetí tu contraseña">
              <span class="error-text" *ngIf="tocado.rePassword && errorRePassword">{{ errorRePassword }}</span>
            </div>

            <div class="field-group">
              <label class="field-label">Fecha de Nacimiento *</label>
              <input type="date" class="field-input" [class.input-error]="tocado.fecha && errorFecha" [(ngModel)]="fechaNacimiento" (change)="tocado.fecha = true" (blur)="tocado.fecha = true" name="fechaNacimiento">
              <span class="error-text" *ngIf="tocado.fecha && errorFecha">{{ errorFecha }}</span>
            </div>

            <div class="field-group">
              <label class="field-label">Descripción breve ({{ descripcion.length }}/160)</label>
              <input type="text" class="field-input" [class.input-error]="errorDescripcion" [(ngModel)]="descripcion" name="descripcion" placeholder="Estudiante de programación...">
              <span class="error-text" *ngIf="errorDescripcion">{{ errorDescripcion }}</span>
            </div>
          </div>

          <button type="submit" class="btn-primary" style="width: 100%; margin-top: 8px;" [disabled]="cargando || !formularioValido">
            {{ cargando ? 'Creando cuenta...' : 'Registrarme y entrar' }}
          </button>
        </form>

        <p style="text-align: center; margin: 20px 0 0 0; font-size: 14px; color: #64748b;">
          ¿Ya tenés cuenta?
          <a routerLink="/login" style="color: #2563eb; font-weight: 600; text-decoration: none;">Iniciá Sesión</a>
        </p>
      </div>
    </div>
  `,
})
export class RegistroComponent {
  nombre = '';
  apellido = '';
  correo = '';
  username = '';
  password = '';
  rePassword = '';
  fechaNacimiento = '';
  descripcion = '';
  fotoPerfil = '';

  errorFoto = '';
  errorServidor = '';
  cargando = false;

  tocado = {
    nombre: false,
    apellido: false,
    correo: false,
    username: false,
    password: false,
    rePassword: false,
    fecha: false,
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private sesionService: SesionService
  ) {}

  get errorNombre(): string {
    const val = this.nombre.trim();
    if (!val) return 'El nombre es obligatorio.';
    if (val.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
    return '';
  }

  get errorApellido(): string {
    const val = this.apellido.trim();
    if (!val) return 'El apellido es obligatorio.';
    if (val.length < 2) return 'El apellido debe tener al menos 2 caracteres.';
    return '';
  }

  get errorCorreo(): string {
    const val = this.correo.trim();
    if (!val) return 'El correo electrónico es obligatorio.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return 'Ingresá un formato de correo válido (ej: usuario@dominio.com).';
    return '';
  }

  get errorUsername(): string {
    const val = this.username.trim();
    if (!val) return 'El nombre de usuario es obligatorio.';
    if (val.length < 3) return 'Debe tener al menos 3 caracteres.';
    if (/\s/.test(val)) return 'El nombre de usuario no puede contener espacios.';
    return '';
  }

  get errorPassword(): string {
    if (!this.password) return 'La contraseña es obligatoria.';
    if (this.password.length < 8) return 'Debe tener al menos 8 caracteres.';
    return '';
  }

  get errorRePassword(): string {
    if (!this.rePassword) return 'Confirmá tu contraseña.';
    if (this.password !== this.rePassword) return 'Las contraseñas no coinciden.';
    return '';
  }

  get errorFecha(): string {
    if (!this.fechaNacimiento) return 'Seleccioná tu fecha de nacimiento.';
    const nacimiento = new Date(this.fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    if (edad < 13) return 'Debés tener al menos 13 años para registrarte.';
    if (edad > 110) return 'Ingresá una fecha de nacimiento válida.';
    return '';
  }

  get errorDescripcion(): string {
    if (this.descripcion.length > 160) return 'La descripción no puede superar los 160 caracteres.';
    return '';
  }

  get formularioValido(): boolean {
    return (
      !this.errorNombre &&
      !this.errorApellido &&
      !this.errorCorreo &&
      !this.errorUsername &&
      !this.errorPassword &&
      !this.errorRePassword &&
      !this.errorFecha &&
      !this.errorDescripcion &&
      !this.errorFoto
    );
  }

  async onSeleccionarFoto(event: any) {
    this.errorFoto = '';
    const file: File = event.target?.files?.[0];
    if (!file) return;
    try {
      this.fotoPerfil = await procesarImagenArchivo(file, 400);
      this.cdr.detectChanges();
    } catch (msg: any) {
      this.errorFoto = typeof msg === 'string' ? msg : 'No se pudo cargar la imagen.';
      this.cdr.detectChanges();
    }
  }

  onRegistro() {
    Object.keys(this.tocado).forEach((k) => ((this.tocado as any)[k] = true));
    this.errorServidor = '';

    if (!this.formularioValido) return;

    this.cargando = true;
    const nuevoUsuario = {
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      correo: this.correo.trim(),
      username: this.username.trim(),
      password: this.password,
      fechaNacimiento: this.fechaNacimiento,
      descripcion: this.descripcion.trim(),
      fotoPerfil: this.fotoPerfil,
    };

    this.http.post<any>(`${environment.apiUrl}/auth/registro`, nuevoUsuario).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response?.usuario) {
          localStorage.setItem('usuario', JSON.stringify(response.usuario));
        }
        if (response?.access_token) {
          localStorage.setItem('token', response.access_token);
        }
        this.sesionService.iniciarTemporizador();
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        this.cargando = false;
        this.errorServidor =
          err?.error?.message || 'No se pudo completar el registro. Revisá los datos.';
        this.cdr.detectChanges();
      },
    });
  }
}