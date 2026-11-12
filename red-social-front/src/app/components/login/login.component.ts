import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './login.component.html', 
  styleUrl: './login.component.css' 
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