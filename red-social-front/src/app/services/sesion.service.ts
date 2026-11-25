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
  private intervaloCuentaRegresiva: any = null;
  private timeoutMensaje: any = null;

  mostrarModalExtension$ = new BehaviorSubject<boolean>(false);
  extendiendoSesion$ = new BehaviorSubject<boolean>(false);
  segundosRestantes$ = new BehaviorSubject<number>(0);
  mensajeSesion$ = new BehaviorSubject<{ texto: string; tipo: 'success' | 'error' } | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {}

  private decodificarPayload(token: string): any | null {
    try {
      const partes = token.split('.');
      if (partes.length < 2) return null;
      const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  private mostrarMensaje(texto: string, tipo: 'success' | 'error' = 'success') {
    if (this.timeoutMensaje) {
      clearTimeout(this.timeoutMensaje);
    }
    this.mensajeSesion$.next({ texto, tipo });
    this.timeoutMensaje = setTimeout(() => {
      this.mensajeSesion$.next(null);
    }, 3200);
  }

  iniciarTemporizador() {
    this.detenerTemporizador();
    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = this.decodificarPayload(token);
    const ahoraMs = Date.now();

    let expMs = ahoraMs + 900 * 1000;
    let duracionTotalSeg = 900;

    if (payload?.exp) {
      expMs = payload.exp * 1000;
      if (payload?.iat) {
        duracionTotalSeg = Math.max(10, payload.exp - payload.iat);
      } else {
        duracionTotalSeg = Math.max(10, Math.round((expMs - ahoraMs) / 1000));
      }
    }

    const msRestantesTotales = expMs - ahoraMs;
    if (msRestantesTotales <= 1000) {
      this.mostrarModalExtension$.next(true);
      this.iniciarCuentaRegresiva(expMs);
      return;
    }

    // Si el token dura <= 2 min (ej. 1 min), avisa 25s antes; si dura 15 min, avisa 5 min antes
    const margenAvisoMs =
      duracionTotalSeg <= 120
        ? Math.min(25 * 1000, Math.floor(duracionTotalSeg * 0.45 * 1000))
        : 5 * 60 * 1000;

    const esperarParaAvisoMs = Math.max(0, msRestantesTotales - margenAvisoMs);

    this.ngZone.runOutsideAngular(() => {
      this.timerAviso = setTimeout(() => {
        this.ngZone.run(() => {
          if (!localStorage.getItem('token')) return;
          this.mostrarModalExtension$.next(true);
          this.iniciarCuentaRegresiva(expMs);
        });
      }, esperarParaAvisoMs);
    });
  }

  private iniciarCuentaRegresiva(expMs: number) {
    if (this.intervaloCuentaRegresiva) {
      clearInterval(this.intervaloCuentaRegresiva);
    }

    const actualizar = () => {
      const restantes = Math.max(0, Math.ceil((expMs - Date.now()) / 1000));
      this.segundosRestantes$.next(restantes);
      if (restantes <= 0) {
        if (this.intervaloCuentaRegresiva) {
          clearInterval(this.intervaloCuentaRegresiva);
          this.intervaloCuentaRegresiva = null;
        }
      }
    };

    actualizar();
    this.ngZone.runOutsideAngular(() => {
      this.intervaloCuentaRegresiva = setInterval(() => {
        this.ngZone.run(() => actualizar());
      }, 1000);
    });
  }

  detenerTemporizador() {
    if (this.timerAviso) {
      clearTimeout(this.timerAviso);
      this.timerAviso = null;
    }
    if (this.intervaloCuentaRegresiva) {
      clearInterval(this.intervaloCuentaRegresiva);
      this.intervaloCuentaRegresiva = null;
    }
    this.mostrarModalExtension$.next(false);
  }

  extenderSesion() {
    const token = localStorage.getItem('token');
    const usuarioRaw = localStorage.getItem('usuario');
    const usuarioGuardado = usuarioRaw ? JSON.parse(usuarioRaw) : null;

    if (!token && !usuarioGuardado?.id && !usuarioGuardado?.correo) {
      this.cerrarSesion('No se pudo extender porque el token ya venció.');
      return;
    }

    this.extendiendoSesion$.next(true);
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    this.http
      .post<any>(
        `${environment.apiUrl}/auth/refrescar`,
        {
          token,
          userId: usuarioGuardado?.id || usuarioGuardado?._id,
          correo: usuarioGuardado?.correo,
        },
        { headers }
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
          this.mostrarMensaje('¡Sesión extendida exitosamente!', 'success');
        },
        error: () => {
          this.extendiendoSesion$.next(false);
          this.cerrarSesion('No se pudo extender porque el token ya venció.');
        },
      });
  }

  cerrarSesion(motivo?: string) {
    this.detenerTemporizador();
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    if (motivo) {
      this.mostrarMensaje(motivo, 'error');
    }
    this.router.navigate(['/login']);
  }
}