import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import Chart from 'chart.js/auto';
import { environment } from '../../../environments/environment';
import { ResaltarHoverDirective } from '../../directives/resaltar-hover.directive';

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ResaltarHoverDirective],
  template: `
    <div style="max-width: 1060px; margin: 28px auto; padding: 0 18px 60px 18px;">

      <!-- Encabezado -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 22px;">
        <div>
          <h1 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800;">
            Estadísticas de la Plataforma
          </h1>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">
            Métricas de actividad por rango de fechas seleccionado
          </p>
        </div>

        <a routerLink="/dashboard/usuarios" style="padding: 10px 16px; border-radius: 10px; border: 1.5px solid #cbd5e1; background: #ffffff; color: #1e293b; text-decoration: none; font-size: 13px; font-weight: 700;">
          👥 Gestionar Usuarios
        </a>
      </div>

      <!-- Selector de Lapso de Tiempo -->
      <div class="surface-card" style="padding: 20px 24px; margin-bottom: 24px;">
        <div style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: flex-end;">
            <div>
              <label class="field-label">Desde</label>
              <input type="date" class="field-input" [(ngModel)]="desde" style="width: 170px;">
            </div>

            <div>
              <label class="field-label">Hasta</label>
              <input type="date" class="field-input" [(ngModel)]="hasta" style="width: 170px;">
            </div>

            <button type="button" (click)="cargarEstadisticas()" class="btn-primary" style="padding: 11px 20px; font-size: 13px;">
              Filtrar lapso
            </button>
          </div>

          <!-- Accesos rápidos de lapso -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" (click)="aplicarRangoRapido(7)" style="padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #f8fafc; color: #334155; font-size: 12px; font-weight: 600; cursor: pointer;">
              Últimos 7 días
            </button>
            <button type="button" (click)="aplicarRangoRapido(30)" style="padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #f8fafc; color: #334155; font-size: 12px; font-weight: 600; cursor: pointer;">
              Últimos 30 días
            </button>
            <button type="button" (click)="limpiarFiltro()" style="padding: 8px 12px; border-radius: 8px; border: 1px solid #bfdbfe; background: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 700; cursor: pointer;">
              Todo el historial
            </button>
          </div>
        </div>
      </div>

      <!-- Tarjetas resumen -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="surface-card" style="padding: 18px 22px;">
          <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Publicaciones en el lapso</span>
          <div style="font-size: 28px; font-weight: 800; color: #1d4ed8; margin-top: 4px;">{{ totalPublicaciones }}</div>
        </div>

        <div class="surface-card" style="padding: 18px 22px;">
          <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Comentarios en el lapso</span>
          <div style="font-size: 28px; font-weight: 800; color: #059669; margin-top: 4px;">{{ totalComentarios }}</div>
        </div>

        <div class="surface-card" style="padding: 18px 22px;">
          <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Usuarios activos publicando</span>
          <div style="font-size: 28px; font-weight: 800; color: #7c3aed; margin-top: 4px;">{{ totalUsuariosPublicando }}</div>
        </div>
      </div>

      <!-- Grilla de 3 gráficos distintos -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(460px, 1fr)); gap: 22px;">

        <!-- Gráfico 1: Barras (Publicaciones por usuario) -->
        <div [appResaltarHover]="'#93c5fd'" class="surface-card" style="padding: 22px;">
          <h3 style="margin: 0 0 4px 0; color: #0f172a; font-size: 16px; font-weight: 800;">
            1. Publicaciones por usuario
          </h3>
          <p style="margin: 0 0 16px 0; color: #64748b; font-size: 12.5px;">
            Cantidad de publicaciones realizadas por cada autor en el período
          </p>
          <div style="position: relative; height: 280px;">
            <canvas #canvasBarras></canvas>
          </div>
        </div>

        <!-- Gráfico 2: Líneas (Comentarios en un lapso de tiempo) -->
        <div [appResaltarHover]="'#86efac'" class="surface-card" style="padding: 22px;">
          <h3 style="margin: 0 0 4px 0; color: #0f172a; font-size: 16px; font-weight: 800;">
            2. Evolución de comentarios en el tiempo
          </h3>
          <p style="margin: 0 0 16px 0; color: #64748b; font-size: 12.5px;">
            Cantidad de comentarios realizados por día en el lapso seleccionado
          </p>
          <div style="position: relative; height: 280px;">
            <canvas #canvasLineas></canvas>
          </div>
        </div>

        <!-- Gráfico 3: Torta (Comentarios por publicación) -->
        <div [appResaltarHover]="'#c4b5fd'" class="surface-card" style="padding: 22px; grid-column: 1 / -1;">
          <h3 style="margin: 0 0 4px 0; color: #0f172a; font-size: 16px; font-weight: 800;">
            3. Comentarios por publicación
          </h3>
          <p style="margin: 0 0 16px 0; color: #64748b; font-size: 12.5px;">
            Distribución de comentarios recibidos en cada publicación dentro del lapso elegido
          </p>
          <div style="position: relative; height: 310px; max-width: 560px; margin: 0 auto;">
            <canvas #canvasTorta></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardEstadisticasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasBarras') canvasBarras!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasLineas') canvasLineas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasTorta') canvasTorta!: ElementRef<HTMLCanvasElement>;

  desde = '';
  hasta = '';

  totalPublicaciones = 0;
  totalComentarios = 0;
  totalUsuariosPublicando = 0;

  private chartBarras?: Chart;
  private chartLineas?: Chart;
  private chartTorta?: Chart;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.aplicarRangoRapido(30, false);
  }

  ngAfterViewInit() {
    this.cargarEstadisticas();
  }

  ngOnDestroy() {
    this.chartBarras?.destroy();
    this.chartLineas?.destroy();
    this.chartTorta?.destroy();
  }

  aplicarRangoRapido(dias: number, recargar = true) {
    const hoy = new Date();
    const inicio = new Date();
    inicio.setDate(hoy.getDate() - dias);

    this.hasta = hoy.toISOString().slice(0, 10);
    this.desde = inicio.toISOString().slice(0, 10);
    if (recargar) {
      this.cargarEstadisticas();
    }
  }

  limpiarFiltro() {
    this.desde = '';
    this.hasta = '';
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    const params: string[] = [];
    if (this.desde) params.push(`desde=${this.desde}`);
    if (this.hasta) params.push(`hasta=${this.hasta}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';

    forkJoin({
      porUsuario: this.http.get<any>(`${environment.apiUrl}/estadisticas/publicaciones-por-usuario${query}`),
      porTiempo: this.http.get<any>(`${environment.apiUrl}/estadisticas/comentarios-por-tiempo${query}`),
      porPublicacion: this.http.get<any>(`${environment.apiUrl}/estadisticas/comentarios-por-publicacion${query}`),
    }).subscribe({
      next: ({ porUsuario, porTiempo, porPublicacion }) => {
        const datosUsuarios: number[] = porUsuario?.data || [];
        this.totalPublicaciones = datosUsuarios.reduce((a, b) => a + b, 0);
        this.totalUsuariosPublicando = datosUsuarios.length;
        this.totalComentarios = porTiempo?.total || 0;

        this.renderizarBarras(porUsuario?.labels || [], datosUsuarios);
        this.renderizarLineas(porTiempo?.labels || [], porTiempo?.data || []);
        this.renderizarTorta(porPublicacion?.labels || [], porPublicacion?.data || []);
        this.cdr.detectChanges();
      },
    });
  }

  private renderizarBarras(labels: string[], data: number[]) {
    this.chartBarras?.destroy();
    if (!this.canvasBarras) return;

    this.chartBarras = new Chart(this.canvasBarras.nativeElement, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['Sin datos en el período'],
        datasets: [
          {
            label: 'Publicaciones',
            data: data.length ? data : [0],
            backgroundColor: '#2563eb',
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
  }

  private renderizarLineas(labels: string[], data: number[]) {
    this.chartLineas?.destroy();
    if (!this.canvasLineas) return;

    this.chartLineas = new Chart(this.canvasLineas.nativeElement, {
      type: 'line',
      data: {
        labels: labels.length ? labels : ['Sin datos'],
        datasets: [
          {
            label: 'Comentarios realizados',
            data: data.length ? data : [0],
            borderColor: '#059669',
            backgroundColor: 'rgba(5, 150, 105, 0.16)',
            fill: true,
            tension: 0.35,
            pointRadius: 5,
            pointBackgroundColor: '#059669',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
  }

  private renderizarTorta(labels: string[], data: number[]) {
    this.chartTorta?.destroy();
    if (!this.canvasTorta) return;

    const paleta = [
      '#2563eb',
      '#059669',
      '#7c3aed',
      '#d97706',
      '#dc2626',
      '#0891b2',
      '#4f46e5',
      '#db2777',
    ];

    this.chartTorta = new Chart(this.canvasTorta.nativeElement, {
      type: 'pie',
      data: {
        labels: labels.length ? labels : ['Sin comentarios en el período'],
        datasets: [
          {
            label: 'Comentarios',
            data: data.length ? data : [1],
            backgroundColor: labels.length ? paleta : ['#cbd5e1'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' },
        },
      },
    });
  }
}