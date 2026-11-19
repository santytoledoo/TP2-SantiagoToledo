import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

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

    <router-outlet></router-outlet>
  `,
  styles: [`
    .nav-active {
      background: #eff6ff !important;
      color: #1d4ed8 !important;
    }
  `]
})
export class AppComponent {
  constructor(private router: Router) {}

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
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}