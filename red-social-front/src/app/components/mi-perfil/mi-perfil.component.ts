import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2>Mi Perfil</h2>
      <!-- Datos del usuario, foto y últimas 3 publicaciones (Sprint 2) -->
    </div>
  `
})
export class MiPerfilComponent {}
