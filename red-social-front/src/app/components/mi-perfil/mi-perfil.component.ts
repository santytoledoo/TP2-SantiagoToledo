import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="max-width: 700px; margin: 30px auto; padding: 20px;">
      <a routerLink="/publicaciones" style="color: #1877f2; text-decoration: none; font-weight: bold;">← Volver al Muro</a>
      
      <div class="card" style="max-width: 100%; margin-top: 15px; text-align: center;">
        <div style="width: 100px; height: 100px; background: #1877f2; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 15px auto;">
          ST
        </div>
        <h2>Santiago Toledo</h2>
        <p style="color: #65676b; margin-top: -10px;">&#64;santy_toledo</p>
        <p style="margin-top: 10px;">Estudiante de TUP en UTN Avellaneda apasionado por el desarrollo full-stack.</p>
      </div>

      <h3 style="margin-top: 30px;">Mis últimas 3 publicaciones</h3>
      <div *ngFor="let post of misPublicaciones" class="card" style="max-width: 100%; margin-bottom: 15px;">
        <h4 style="margin: 0 0 5px 0; color: #1877f2;">{{ post.titulo }}</h4>
        <p style="margin: 0; color: #555;">{{ post.mensaje }}</p>
      </div>
    </div>
  `
})
export class MiPerfilComponent {
  misPublicaciones = [
    { titulo: 'Probando el sistema', mensaje: 'Acá probando los componentes del Sprint 2.' },
    { titulo: 'Arquitectura de Software', mensaje: 'NestJS y MongoDB configurados correctamente.' }
  ];
}