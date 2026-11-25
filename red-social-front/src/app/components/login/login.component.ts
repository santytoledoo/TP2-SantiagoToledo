import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SesionService } from '../../services/sesion.service';

interface AccesoRapido {
  rolLabel: string;
  identificador: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div style="text-align: center; margin-bottom: 26px;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #2563eb, #1e40af); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 22px; margin: 0 auto 12px auto;">
            U
          </div>
          <h2 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800;">Bienvenido de nuevo</h2>
          <p style="margin: 6px 0 0 0; color: #64748b; font-size: 14px;">Ingresá con tu correo o nombre de usuario</p>
        </div>

        <div *ngIf="errorServidor" style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 12px 14px; border-radius: 10px; font-size: 13px; font-weight: 500; margin-bottom: 18px; text-align: center;">
          {{ errorServidor }}
        </div>

        <form (ngSubmit)="onLogin()">
          <div class="field-group">
            <label class="field-label">Correo electrónico o Usuario</label>
            <input
              type="text"
              class="field-input"
              [class.input-error]="tocadoIdentificador && errorIdentificador"
              [(ngModel)]="identificador"
              (input)="tocadoIdentificador = true"
              (blur)="tocadoIdentificador = true"
              name="identificador"
              placeholder="ej: santiago@mail.com o santi_utn">
            <span class="error-text" *ngIf="tocadoIdentificador && errorIdentificador">
              {{ errorIdentificador }}
            </span>
          </div>

          <div class="field-group" style="margin-bottom: 22px;">
            <label class="field-label">Contraseña</label>
            <input
              type="password"
              class="field-input"
              [class.input-error]="tocadoPassword && errorPassword"
              [(ngModel)]="password"
              (input)="tocadoPassword = true"
              (blur)="tocadoPassword = true"
              name="password"
              placeholder="••••••••">
            <span class="error-text" *ngIf="tocadoPassword && errorPassword">
              {{ errorPassword }}
            </span>
          </div>

          <button
            type="submit"
            class="btn-primary"
            style="width: 100%;"
            [disabled]="cargando || !!errorIdentificador || !!errorPassword">
            {{ cargando ? 'Ingresando...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #64748b; text-align: center; text-transform: uppercase; letter-spacing: 0.04em;">
            Acceso rápido por rol
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button
              type="button"
              (click)="accesoRapido('usuario')"
              [disabled]="cargando"
              style="background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 9px 12px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;">
              👤 Usuario
            </button>
            <button
              type="button"
              (click)="accesoRapido('administrador')"
              [disabled]="cargando"
              style="background: #eff6ff; color: #1d4ed8; border: 1px solid #93c5fd; padding: 9px 12px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;">
              🛡️ Administrador
            </button>
          </div>
        </div>

        <p style="text-align: center; margin: 22px 0 0 0; font-size: 14px; color: #64748b;">
          ¿Todavía no tenés cuenta?
          <a routerLink="/registro" style="color: #2563eb; font-weight: 600; text-decoration: none;">Registrate acá</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  identificador = '';
  password = '';
  tocadoIdentificador = false;
  tocadoPassword = false;
  errorServidor = '';
  cargando = false;

  // Completá aquí los datos reales de tus cuentas de prueba en MongoDB
  private accesosRapidos: Record<'usuario' | 'administrador', AccesoRapido> = {
    usuario: {
      rolLabel: 'Usuario',
      identificador: 'usuario@ejemplo.com',
      password: 'Password123',
    },
    administrador: {
      rolLabel: 'Administrador',
      identificador: 'admin@ejemplo.com',
      password: 'Password123',
    },
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private sesionService: SesionService
  ) {}

  get errorIdentificador(): string {
    const val = this.identificador.trim();
    if (!val) return 'Ingresá tu correo electrónico o nombre de usuario.';
    if (val.length < 3) return 'Debe tener al menos 3 caracteres.';
    return '';
  }

  get errorPassword(): string {
    if (!this.password) return 'Ingresá tu contraseña.';
    if (this.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    return '';
  }

  accesoRapido(rol: 'usuario' | 'administrador') {
    const cred = this.accesosRapidos[rol];
    this.identificador = cred.identificador;
    this.password = cred.password;
    this.tocadoIdentificador = true;
    this.tocadoPassword = true;
    this.onLogin();
  }

  onLogin() {
    this.tocadoIdentificador = true;
    this.tocadoPassword = true;
    this.errorServidor = '';

    if (this.errorIdentificador || this.errorPassword) return;

    this.cargando = true;
    this.http
      .post<any>(`${environment.apiUrl}/auth/login`, {
        identificador: this.identificador.trim(),
        password: this.password,
      })
      .subscribe({
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
            err?.error?.message || 'No se pudo iniciar sesión. Verificá tus datos.';
          this.cdr.detectChanges();
        },
      });
  }
}