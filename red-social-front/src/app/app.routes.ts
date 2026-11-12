import { Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home-placeholder',
  standalone: true,
  template: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; background: #f0f2f5; color: #333;">
      <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
        <h1 style="color: #1877f2; margin-bottom: 10px;">¡Red Social Activa! 🚀</h1>
        <p style="color: #65676b;">El enrutamiento de Vercel y Angular ya está funcionando perfectamente.</p>
      </div>
    </div>
  `
})
export class HomePlaceholderComponent {}

export const routes: Routes = [
  { path: '', component: HomePlaceholderComponent },
  { path: '**', redirectTo: '' }
];