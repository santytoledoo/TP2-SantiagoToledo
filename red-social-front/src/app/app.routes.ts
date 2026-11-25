import { Routes } from '@angular/router';
import { CargandoComponent } from './components/cargando/cargando.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { PublicacionesComponent } from './components/publicaciones/publicaciones.component';
import { PublicacionDetalleComponent } from './components/publicacion-detalle/publicacion-detalle.component';
import { MiPerfilComponent } from './components/mi-perfil/mi-perfil.component';
import { DashboardUsuariosComponent } from './components/dashboard-usuarios/dashboard-usuarios.component';
import { DashboardEstadisticasComponent } from './components/dashboard-estadisticas/dashboard-estadisticas.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: CargandoComponent, pathMatch: 'full' },
  { path: 'cargando', component: CargandoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'publicaciones', component: PublicacionesComponent },
  { path: 'publicacion/:id', component: PublicacionDetalleComponent },
  { path: 'mi-perfil', component: MiPerfilComponent },
  { path: 'perfil/:id', component: MiPerfilComponent },
  {
    path: 'dashboard',
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'usuarios', component: DashboardUsuariosComponent },
      { path: 'estadisticas', component: DashboardEstadisticasComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];