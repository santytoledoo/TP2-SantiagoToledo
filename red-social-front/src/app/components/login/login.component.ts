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
  `,
  styles: [`
    .container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f0f2f5; font-family: Arial, sans-serif; }
    .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-width: 400px; box-sizing: border-box; }
    h2 { text-align: center; color: #1877f2; margin-bottom: 20px; font-family: inherit; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px; }
    input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; font-size: 14px; }
    input:focus { outline: none; border-color: #1877f2; }
    .btn-primary { width: 100%; padding: 12px; background-color: #1877f2; color: white; border: none; border-radius: 5px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px; }
    .btn-primary:hover { background-color: #166fe5; }
    .link-text { text-align: center; margin-top: 15px; font-size: 14px; }
    .link-text a { color: #1877f2; text-decoration: none; font-weight: bold; cursor: pointer; }
  `]
})
export class LoginComponent {
  usuario = '';
  password = '';

  constructor(private router: Router) {}

  onLogin() {
    console.log('Login attempt:', this.usuario);
    this.router.navigate(['/publicaciones']);
  }
}