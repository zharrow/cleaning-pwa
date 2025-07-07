import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiHintModule } from '@taiga-ui/core';
import { NetworkService } from '../../../core/services/network.service';
import { OfflineQueueService } from '../../../core/services/offline-queue.service';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule, TuiHintModule],
  template: `
    @if (networkService.isOffline()) {
      <div class="offline-indicator animate-fade-in">
        <span class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"/>
          </svg>
          Mode hors ligne
          @if (queueSize$ | async; as size) {
            @if (size > 0) {
              <span class="ml-2 text-sm">({{ size }} en attente)</span>
            }
          }
        </span>
      </div>
    }
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
    }
  `]
})
export class OfflineIndicatorComponent {
  networkService = inject(NetworkService);
  private queueService = inject(OfflineQueueService);
  
  queueSize$ = this.networkService.online$.pipe(
    switchMap(() => from(this.queueService.getQueueSize()))
  );
}