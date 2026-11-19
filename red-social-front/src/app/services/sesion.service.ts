import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SesionService {
  private timerAviso: any = null;
  private readonly TIEMPO_AVISO_MS = 10 * 60 * 1000; // 10 minutos

  mostrarModalExtension$ = new BehaviorSubject<boolean>(false);
  extendiendoSesion$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {}

  iniciarTemporizador() {
    this.detenerTemporizador();
    const token = localStorage.getItem('token');
    if (!token) return;

    this.ngZone.runOutsideAngular(() => {
      this.timerAviso = setTimeout(() => {
        this.ngZone.run(() => {
          if (localStorage.getItem('token')) {
            this.mostrarModalExtension$.next(true);
          }
        });
      }, this.TIEMPO_AVISO_MS);
    });
  }

  detenerTemporizador() {
    if (this.timerAviso) {
      clearTimeout(this.timerAviso);
      this.timerAviso = null;
    }
    this.mostrarModalExtension$.next(false);
  }

  extenderSesion() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.cerrarSesion();
      return;
    }

    this.extendiendoSesion$.next(true);
    this.http
      .post<any>(
        `${environment.apiUrl}/auth/refrescar`,
        { token },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .subscribe({
        next: (res) => {
          this.extendiendoSesion$.next(false);
          if (res?.access_token) {
            localStorage.setItem('token', res.access_token);
          }
          if (res?.usuario) {
            localStorage.setItem('usuario', JSON.stringify(res.usuario));
          }
          this.mostrarModalExtension$.next(false);
          this.iniciarTemporizador();
        },
        error: () => {
          this.extendiendoSesion$.next(false);
          this.cerrarSesion();
        },
      });
  }

  cerrarSesion() {
    this.detenerTemporizador();
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}