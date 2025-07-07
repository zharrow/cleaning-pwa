import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TuiButtonModule } from '@taiga-ui/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, TuiButtonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p class="text-xl text-gray-600 mb-8">Page non trouvée</p>
      <a tuiButton routerLink="/dashboard" size="l">
        Retour au tableau de bord
      </a>
    </div>
  `,
})
export class NotFoundComponent {}