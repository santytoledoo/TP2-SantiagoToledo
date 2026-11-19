import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SesionService } from './services/sesion.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav *ngIf="obtenerUsuario() as user" style="position: sticky; top: 0; z-index: 100; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); border-bottom: 1px solid #e2e8f0; padding: 12px 28px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);">
      <a routerLink="/publicaciones" style="display: flex; align-items: center; gap: 10px; text-decoration: none;">
        <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #2563eb, #1e40af); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px;">
          U
        </div>
        <span style="color: #0f172a; font-weight: 800; font-size: 18px; letter-spacing: -0.4px;">UTN Social</span>
      </a>

      <div style="display: flex; gap: 18px; align-items: center;">
        <a routerLink="/publicaciones" routerLinkActive="nav-active" style="text-decoration: none; color: #475569; font-weight: 600; font-size: 14px; padding: 8px 14px; border-radius: 8px; transition: all 0.2s;">
          Muro
        </a>
        <a routerLink="/mi-perfil" routerLinkActive="nav-active" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #475569; font-weight: 600; font-size: 14px; padding: 6px 12px; border-radius: 8px; transition: all 0.2s;">
          <img *ngIf="user.fotoPerfil" [src]="user.fotoPerfil" alt="Avatar" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1.5px solid #2563eb;">
          <div *ngIf="!user.fotoPerfil" style="width: 28px; height: 28px; border-radius: 50%; background: #dbeafe; color: #1d4ed8; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;">
            {{ (user.nombre || 'U').substring(0, 2).toUpperCase() }}
          </div>
          <span>Mi Perfil</span>
        </a>
        <button (click)="cerrarSesion()" style="background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">
          Salir
        </button>
      </div>
    </nav>

    <!-- Modal de aviso de expiración de sesión (a los 10 min, quedan 5 min) -->
    <div *ngIf="sesionService.mostrarModalExtension$ | async" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div style="background: #ffffff; border-radius: 18px; padding: 28px 32px; max-width: 420px; width: 100%; box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25); border: 1px solid #e2e8f0; text-align: center;">
        <div style="width: 50px; height: 50px; border-radius: 50%; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 14px auto;">
          ⏳
        </div>
        <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 20px; font-weight: 800;">
          Tu sesión está por vencer
        </h3>
        <p style="margin: 0 0 22px 0; color: #475569; font-size: 14px; line-height: 1.55;">
          Quedan <strong>5 minutos</strong> antes de que finalice tu sesión. ¿Deseás extenderla por 15 minutos más?
        </p>

        <div style="display: flex; gap: 12px; justify-content: center;">
          <button
            type="button"
            (click)="cerrarSesion()"
            style="flex: 1; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 10px 16px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;">
            Cerrar sesión
          </button>
          <button
            type="button"
            (click)="sesionService.extenderSesion()"
            [disabled]="sesionService.extendiendoSesion$ | async"
            style="flex: 1; background: #2563eb; color: #ffffff; border: none; padding: 10px 16px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer;">
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