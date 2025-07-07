import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButtonModule } from '@taiga-ui/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, TuiButtonModule],
  template: `
    <div class="empty-state">
      @if (icon) {
        <div class="icon-container">
          <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path [attr.d]="icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </svg>
        </div>
      }
      
      <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ title }}</h3>
      
      @if (description) {
        <p class="text-gray-600 mb-6">{{ description }}</p>
      }
      
      @if (actionLabel) {
        <button tuiButton (click)="action.emit()" size="m">
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
    }
    
    .icon-container {
      margin-bottom: 1.5rem;
    }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'Aucune donnée';
  @Input() description?: string;
  @Input() icon?: string = 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4';
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();
}