import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="card">
        <h2>Iniciar Sesión</h2>
        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label>Usuario o Correo</label>
            <input type="text" [(ngModel)]="usuario" name="usuario" placeholder="Ingresá tu usuario o email" required>
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Mínimo 8 caracteres" required>
          </div>
          <button type="submit" class="btn-primary">Ingresar</button>
        </form>
        <p class="link-text">¿No tenés cuenta? <a routerLink="/registro">Registrate acá</a></p>
      </div>
    </div>
  `
})
export class LoginComponent {
  usuario = '';
  password = '';

  constructor(private router: Router) {}

  onLogin() {
    this.router.navigate(['/publicaciones']);
  }
}