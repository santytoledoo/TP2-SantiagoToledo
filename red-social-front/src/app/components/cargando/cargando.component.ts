import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at 25% 20%, #2563eb 0%, #1e3a8a 52%, #0f172a 100%); padding: 24px;">
      <div style="background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); padding: 44px 48px; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.2); text-align: center; max-width: 390px; width: 100%;">
        <div style="width: 60px; height: 60px; border-radius: 18px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 26px; margin: 0 auto 22px auto; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.35);">
          U
        </div>

        <div class="spinner-contenedor">
          <div class="spinner-externo"></div>
          <div class="spinner-interno"></div>
        </div>

        <h2 style="margin: 22px 0 8px 0; color: #0f172a; font-size: 21px; font-weight: 800; letter-spacing: -0.3px;">
          Cargando UTN Social
        </h2>
        <p style="margin: 0 0 18px 0; color: #64748b; font-size: 14px; font-weight: 500;">
          {{ mensajeEstado }}
        </p>

        <div style="height: 5px; width: 100%; background: #e2e8f0; border-radius: 999px; overflow: hidden;">
          <div class="barra-progreso"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .spinner-contenedor {
      position: relative;
      width: 52px;
      height: 52px;
      margin: 0 auto;
    }

    .spinner-externo {
      position: absolute;
      inset: 0;
      border: 4px solid #dbeafe;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spinDerecha 0.9s linear infinite;
    }

    .spinner-interno {
      position: absolute;
      inset: 9px;
      border: 3.5px solid #e0e7ff;
      border-bottom-color: #1d4ed8;
      border-radius: 50%;
      animation: spinIzquierda 0.65s linear infinite;
    }

    .barra-progreso {
      height: 100%;
      width: 45%;
      background: linear-gradient(90deg, #3b82f6, #1d4ed8);
      border-radius: 999px;
      animation: moverBarra 1.1s ease-in-out infinite alternate;
    }

    @keyframes spinDerecha {
      to { transform: rotate(360deg); }
    }

    @keyframes spinIzquierda {
      to { transform: rotate(-360deg); }
    }

    @keyframes moverBarra {
      from { transform: translateX(0%); }
      to { transform: translateX(122%); }
    }
  `],
})
export class CargandoComponent implements OnInit {
  mensajeEstado = 'Verificando sesión activa...';

  constructor(
    private http: HttpClient,
    private router: Router,
    private sesionService: SesionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const inicio = Date.now();
    const minTiempoMs = 850;
    const token = localStorage.getItem('token');

    const navegarConDemora = (ruta: string[]) => {
      const transcurrido = Date.now() - inicio;
      const restante = Math.max(0, minTiempoMs - transcurrido);
      setTimeout(() => {
        this.router.navigate(ruta);
      }, restante);
    };

    if (!token) {
      this.mensajeEstado = 'Redirigiendo al inicio de sesión...';
      this.cdr.detectChanges();
      navegarConDemora(['/login']);
      return;
    }

    this.mensajeEstado = 'Validando credenciales...';
    this.cdr.detectChanges();

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
          this.mensajeEstado = '¡Sesión verificada! Entrando al muro...';
          this.cdr.detectChanges();
          this.sesionService.iniciarTemporizador();
          navegarConDemora(['/publicaciones']);
        },
        error: () => {
          this.mensajeEstado = 'Sesión expirada. Redirigiendo al login...';
          this.cdr.detectChanges();
          setTimeout(() => {
            this.sesionService.cerrarSesion();
          }, 600);
        },
      });
  }
}