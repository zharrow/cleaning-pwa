import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Le SwUpdateService gère l'affichage via TuiAlertService -->
  `,
})
export class UpdatePromptComponent {}