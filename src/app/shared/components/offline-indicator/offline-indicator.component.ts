// src/app/shared/components/offline-indicator/offline-indicator.component.ts
import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiHint } from '@taiga-ui/core';
import { NetworkService } from '../../../core/services/network.service';
import { QueueService } from '../../../core/services/queue.service';
import { switchMap, from, Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule, TuiHint],
  template: `
    @if (!networkService.isOnline()) {
      <div class="offline-indicator animate-fade-in" [tuiHint]="hintContent">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span class="text-sm font-medium">
            Mode hors ligne
          </span>
          @if (queueSize() > 0) {
            <span class="text-xs bg-red-600 text-white px-2 py-1 rounded-full">
              {{ queueSize() }}
            </span>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .offline-indicator {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #ef4444;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
    }
  `]
})
export class OfflineIndicatorComponent implements OnInit, OnDestroy {
  readonly networkService = inject(NetworkService);
  private readonly queueService = inject(QueueService);
  
  readonly queueSize = signal(0);
  private subscription?: Subscription;

  get hintContent(): string {
    const size = this.queueSize();
    if (size > 0) {
      return `${size} action(s) en attente de synchronisation`;
    }
    return 'Vous êtes hors ligne. Les modifications seront synchronisées automatiquement.';
  }

  ngOnInit() {
    // Surveiller la taille de la queue toutes les 5 secondes
    this.subscription = interval(5000).pipe(
      switchMap(() => from(this.queueService.getQueueSize()))
    ).subscribe({
      next: (size) => this.queueSize.set(size),
      error: (error) => {
        console.error('Erreur lors de la récupération de la taille de la queue:', error);
        this.queueSize.set(0);
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}