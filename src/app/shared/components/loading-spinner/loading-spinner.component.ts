import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiLoaderModule } from '@taiga-ui/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, TuiLoaderModule],
  template: `
    <div class="loading-container" [class.overlay]="overlay">
      <tui-loader [showLoader]="true" [inheritColor]="false" [overlay]="overlay">
        @if (text) {
          <span class="text-gray-600">{{ text }}</span>
        }
      </tui-loader>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .loading-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      z-index: 1000;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() text?: string;
  @Input() overlay = false;
}