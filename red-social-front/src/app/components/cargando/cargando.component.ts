import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-cargando',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); padding: 24px;">
      <div style="background: #ffffff; padding: 40px 48px; border-radius: 20px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; text-align: center; max-width: 360px; width: 100%;">
        <div style="width: 54px; height: 54px; border-radius: 16px; background: linear-gradient(135deg, #2563eb, #1e40af); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 24px; margin: 0 auto 20px auto;">
          U
        </div>

        <div class="spinner-utn"></div>

        <h2 style="margin: 18px 0 6px 0; color: #0f172a; font-size: 20px; font-weight: 800;">
          Cargando UTN Social
        </h2>
        <p style="margin: 0; color: #64748b; font-size: 14px;">
          Verificando tu sesión...
        </p>
      </div>
    </div>
  `,
  styles: [`
    .spinner-utn {
      width: 42px;
      height: 42px;
      margin: 0 auto;
      border: 4px solid #dbeafe;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spinUtn 0.85s linear infinite;
    }

    @keyframes spinUtn {
      to {
        transform: rotate(360deg);
      }
    }
  `],
})
export class CargandoComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private router: Router,
    private sesionService: SesionService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');

    if (!token) {
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 450);
      return;
    }

    this.http
      .post<any>(
        `${environment.apiUrl}/auth/autorizar`,
        { token },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .subscribe({
        next: (res) => {
          if (res?.usuario) {
            localStorage.setItem('usuario', JSON.stringify(res.usuario));
          }
          this.sesionService.iniciarTemporizador();
          this.router.navigate(['/publicaciones']);
        },
        error: () => {
          this.sesionService.cerrarSesion();
        },
      });
  }
}