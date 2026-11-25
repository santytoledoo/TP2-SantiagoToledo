import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'resumenTexto',
  standalone: true,
})
export class ResumenTextoPipe implements PipeTransform {
  transform(valor: string | undefined | null, limite = 120): string {
    if (!valor) return '';
    const limpio = valor.trim();
    if (limpio.length <= limite) return limpio;
    return limpio.slice(0, limite).trimEnd() + '...';
  }
}