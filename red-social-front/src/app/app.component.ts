import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SesionService } from './services/sesion.service';
import { SoloAdminDirective } from './directives/solo-admin.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, SoloAdminDirective],
  template: `
    <!-- Toast global de sesión -->
    <div
      *ngIf="sesionService.mensajeSesion$ | async as msg"
      class="toast-banner"
      [ngClass]="msg.tipo === 'error' ? 'toast-error' : 'toast-success'">
      {{ msg.texto }}
    </div>

    <nav *ngIf="obtenerUsuario() as user" style="position: sticky; top: 0; z-index: 100; background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(12px); border-bottom: 1px solid #dbe3ee; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);">
      <a routerLink="/publicaciones" style="display: flex; align-items: center; gap: 10px; text-decoration: none;">
        <div style="width: 38px; height: 38px; border-radius: 11px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 17px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);">
          U
        </div>
        <span style="color: #0f172a; font-weight: 800; font-size: 18px; letter-spacing: -0.4px;">UTN Social</span>
      </a>

      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <a routerLink="/publicaciones" routerLinkActive="nav-active" style="text-decoration: none; color: #475569; font-weight: 600; font-size: 14px; padding: 8px 14px; border-radius: 10px; transition: all 0.2s;">
          Muro
        </a>

        <a routerLink="/guardados" routerLinkActive="nav-active" style="text-decoration: none; color: #475569; font-weight: 600; font-size: 14px; padding: 8px 14px; border-radius: 10px; transition: all 0.2s;">
          🔖 Guardados
        </a>

        <a routerLink="/compartidos" routerLinkActive="nav-active" style="text-decoration: none; color: #475569; font-weight: 600; font-size: 14px; padding: 8px 14px; border-radius: 10px; transition: all 0.2s;">
          📤 Compartidos
        </a>

        <!-- Opciones visibles SOLO para administradores -->
        <a *appSoloAdmin routerLink="/dashboard/usuarios" routerLinkActive="nav-active" style="text-decoration: none; color: #475569; font-weight: 600; font-size: 14px; padding: 8px 14px; border-radius: 10px; transition: all 0.2s;">
          🛡️ Usuarios
        </a>
        <a *appSoloAdmin routerLink="/dashboard/estadisticas" routerLinkActive="nav-active" style="text-decoration: none; color: #475569; font-weight: 600; font-size: 14px; padding: 8px 14px; border-radius: 10px; transition: all 0.2s;">
          📊 Estadísticas
        </a>

        <a routerLink="/mi-perfil" routerLinkActive="nav-active" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #475569; font-weight: 600; font-size: 14px; padding: 6px 12px; border-radius: 10px; transition: all 0.2s;">
          <img *ngIf="user.fotoPerfil" [src]="user.fotoPerfil" alt="Avatar" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 2px solid #2563eb;">
          <div *ngIf="!user.fotoPerfil" style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #1d4ed8; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center;">
            {{ (user.nombre || 'U').substring(0, 2).toUpperCase() }}
          </div>
          <span>Mi Perfil</span>
        </a>

        <button (click)="cerrarSesion()" style="background: linear-gradient(180deg, #fee2e2, #fecaca); color: #b91c1c; border: 1px solid #fca5a5; padding: 8px 14px; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 700; box-shadow: 0 2px 6px rgba(220, 38, 38, 0.12);">
          Salir
        </button>
      </div>
    </nav>

    <!-- Modal de aviso de expiración de sesión -->
    <div *ngIf="sesionService.mostrarModalExtension$ | async" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.68); backdrop-filter: blur(5px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div style="background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); border-radius: 20px; padding: 30px 32px; max-width: 420px; width: 100%; box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.35); border: 1px solid #cbd5e1; text-align: center;">
        <div style="width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg, #fef3c7, #fde68a); color: #b45309; display: flex; align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 14px auto; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.2);">
          ⏳
        </div>
        <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 20px; font-weight: 800;">
          Tu sesión está por vencer
        </h3>
        <p style="margin: 0 0 22px 0; color: #475569; font-size: 14px; line-height: 1.55;">
          Quedan <strong>{{ (sesionService.segundosRestantes$ | async) ?? 0 }} segundos</strong> antes de que finalice tu sesión. ¿Deseás extenderla?
        </p>

        <div style="display: flex; gap: 12px; justify-content: center;">
          <button
            type="button"
            (click)="cerrarSesion()"
            style="flex: 1; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 11px 16px; border-radius: 11px; font-size: 14px; font-weight: 600; cursor: pointer;">
            Cerrar sesión
          </button>
          <button
            type="button"
            (click)="sesionService.extenderSesion()"
            [disabled]="sesionService.extendiendoSesion$ | async"
            class="btn-primary"
            style="flex: 1; padding: 11px 16px; font-size: 14px;">
            {{ (sesionService.extendiendoSesion$ | async) ? 'Extendiendo...' : 'Extender sesión' }}
          </button>
        </div>
      </div>
    </div>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .nav-active {
      background: #eff6ff !important;
      color: #1d4ed8 !important;
      box-shadow: inset 0 0 0 1px #bfdbfe;
    }
  `],
})
export class AppComponent implements OnInit {
  constructor(public sesionService: SesionService) {}

  ngOnInit() {
    if (localStorage.getItem('token')) {
      this.sesionService.iniciarTemporizador();
    }
  }

  formatearTiempo(segundos: number): string {
    if (segundos >= 60) {
      const mins = Math.ceil(segundos / 60);
      return `${mins}${mins === 1 ? 'minuto' : 'minutos'}`;
    }
    return `${segundos}${segundos === 1 ? 'segundo' : 'segundos'}`;
  }

  obtenerUsuario(): any {
    const raw = localStorage.getItem('usuario');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  cerrarSesion() {
    this.sesionService.cerrarSesion();
  }
}