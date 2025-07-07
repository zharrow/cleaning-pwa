import { Injectable, signal, computed } from '@angular/core';
import { fromEvent, merge, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private _isOnline = signal(navigator.onLine);
  
  isOnline = computed(() => this._isOnline());
  isOffline = computed(() => !this._isOnline());

  // Observable pour les changements de statut
  online$ = merge(
    of(navigator.onLine),
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false))
  ).pipe(startWith(navigator.onLine));

  initialize(): void {
    // Écouter les changements de connexion
    window.addEventListener('online', () => {
      this._isOnline.set(true);
      console.log('🟢 Connexion rétablie');
    });

    window.addEventListener('offline', () => {
      this._isOnline.set(false);
      console.log('🔴 Connexion perdue');
    });

    // Vérifier périodiquement la connexion réelle
    setInterval(() => {
      this.checkConnectivity();
    }, 30000); // 30 secondes
  }

  private async checkConnectivity(): Promise<void> {
    try {
      const response = await fetch('/assets/icons/icon-72x72.png', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      this._isOnline.set(response.ok);
    } catch {
      this._isOnline.set(false);
    }
  }
}