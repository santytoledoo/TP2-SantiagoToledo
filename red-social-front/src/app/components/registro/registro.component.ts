import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="card card-large">
        <h2>Crear Cuenta</h2>
        <form (ngSubmit)="onRegistro()">
          <div class="grid-form">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" [(ngModel)]="nombre" name="nombre" required>
            </div>
            <div class="form-group">
              <label>Apellido</label>
              <input type="text" [(ngModel)]="apellido" name="apellido" required>
            </div>
            <div class="form-group">
              <label>Correo Electrónico</label>
              <input type="email" [(ngModel)]="correo" name="correo" required>
            </div>
            <div class="form-group">
              <label>Nombre de Usuario</label>
              <input type="text" [(ngModel)]="username" name="username" required>
            </div>
            <div class="form-group">
              <label>Contraseña</label>
              <input type="password" [(ngModel)]="password" name="password" placeholder="Mín. 8 caracteres, 1 mayús, 1 núm" required>
            </div>
            <div class="form-group">
              <label>Repetir Contraseña</label>
              <input type="password" [(ngModel)]="rePassword" name="rePassword" required>
            </div>
            <div class="form-group">
              <label>Fecha de Nacimiento</label>
              <input type="date" [(ngModel)]="fechaNacimiento" name="fechaNacimiento" required>
            </div>
            <div class="form-group">
              <label>Imagen de Perfil</label>
              <input type="file" accept="image/*">
            </div>
          </div>
          <div class="form-group">
            <label>Descripción breve</label>
            <textarea rows="2" [(ngModel)]="descripcion" name="descripcion" placeholder="Contanos algo sobre vos..."></textarea>
          </div>
          <button type="submit" class="btn-primary">Registrarse</button>
        </form>
        <p class="link-text">¿Ya tenés cuenta? <a routerLink="/login">Iniciá Sesión</a></p>
      </div>
    </div>
  `
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

  constructor(private router: Router) {}

  onRegistro() {
    alert('¡Usuario registrado con éxito!');
    this.router.navigate(['/login']);
  }
}