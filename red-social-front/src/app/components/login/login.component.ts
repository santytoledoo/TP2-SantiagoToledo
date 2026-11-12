import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <h2>Iniciar Sesión</h2>
      <form (ngSubmit)="onLogin()">
        <input type="text" [(ngModel)]="usuario" name="usuario" placeholder="Usuario o Correo" required>
        <input type="password" [(ngModel)]="password" name="password" placeholder="Contraseña" required>
        <button type="submit">Ingresar</button>
      </form>
    </div>
  `
})
export class LoginComponent {
  usuario = '';
  password = '';

  constructor(private router: Router) {}

  onLogin() {
    console.log('Login attempt:', this.usuario);
    // Simular login exitoso
    this.router.navigate(['/publicaciones']);
  }
}
