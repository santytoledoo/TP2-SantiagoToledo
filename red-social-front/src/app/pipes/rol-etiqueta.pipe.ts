import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rolEtiqueta',
  standalone: true,
})
export class RolEtiquetaPipe implements PipeTransform {
  transform(rol: string | undefined | null): string {
    return rol === 'administrador' ? '🛡️ Administrador' : '👤 Usuario';
  }
}