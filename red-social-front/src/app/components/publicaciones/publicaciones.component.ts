import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div style="max-width: 800px; margin: 30px auto; padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>Muro de Publicaciones</h2>
        <div>
          <a routerLink="/mi-perfil" style="margin-right: 15px; color: #1877f2; text-decoration: none; font-weight: bold;">Mi Perfil</a>
          <a routerLink="/login" style="color: #dc3545; text-decoration: none; font-weight: bold;">Cerrar Sesión</a>
        </div>
      </div>

      <!-- Crear Publicación -->
      <div class="card" style="max-width: 100%; margin-bottom: 25px;">
        <h3>Crear Publicación</h3>
        <input type="text" [(ngModel)]="nuevoTitulo" placeholder="Título de la publicación" style="margin-bottom: 10px;">
        <textarea [(ngModel)]="nuevoMensaje" placeholder="¿Qué estás pensando?" rows="3" style="margin-bottom: 10px; width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box;"></textarea>
        <button class="btn-primary" (click)="crearPublicacion()">Publicar</button>
      </div>

      <!-- Filtros / Orden -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
        <span>Ordenar por: 
          <select style="padding: 5px; border-radius: 4px; border: 1px solid #ccc;">
            <option>Fecha (Más recientes)</option>
            <option>Cantidad de Me gusta</option>
          </select>
        </span>
      </div>

      <!-- Listado de posteos -->
      <div *ngFor="let post of publicaciones" class="card" style="max-width: 100%; margin-bottom: 15px;">
        <h4 style="margin: 0 0 5px 0; color: #1877f2;">{{ post.titulo }}</h4>
        <p style="margin: 0 0 10px 0; color: #555;">{{ post.mensaje }}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #888;">
          <span>❤️ {{ post.likes }} Me gusta</span>
          <div>
            <button (click)="darLike(post)" style="background: #e4e6eb; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Me gusta</button>
            <button (click)="eliminarPost(post.id)" style="background: #ffebee; color: #c62828; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Eliminar (Baja Lógica)</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PublicacionesComponent {
  nuevoTitulo = '';
  nuevoMensaje = '';

  publicaciones = [
    { id: 1, titulo: 'Primer Post', mensaje: 'Bienvenidos a la red social de la UTN.', likes: 5 },
    { id: 2, titulo: 'Trabajo Práctico 2', mensaje: 'Codificando con Angular y NestJS.', likes: 12 }
  ];

  crearPublicacion() {
    if (!this.nuevoTitulo || !this.nuevoMensaje) return;
    this.publicaciones.unshift({
      id: Date.now(),
      titulo: this.nuevoTitulo,
      mensaje: this.nuevoMensaje,
      likes: 0
    });
    this.nuevoTitulo = '';
    this.nuevoMensaje = '';
  }

  darLike(post: any) {
    post.likes++;
  }

  eliminarPost(id: number) {
    this.publicaciones = this.publicaciones.filter(p => p.id !== id);
    alert('Publicación dada de baja lógicamente.');
  }
}