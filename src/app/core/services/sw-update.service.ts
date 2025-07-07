import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';
import { TuiAlertService, TuiNotification } from '@taiga-ui/core';

@Injectable({
  providedIn: 'root'
})
export class SwUpdateService {
  private swUpdate = inject(SwUpdate);
  private alerts = inject(TuiAlertService);

  initialize(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    // Vérifier les mises à jour toutes les heures
    setInterval(() => {
      this.swUpdate.checkForUpdate();
    }, 60 * 60 * 1000);

    // Écouter les nouvelles versions
    this.swUpdate.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      map(evt => ({
        type: 'UPDATE_AVAILABLE',
        current: evt.currentVersion,
        available: evt.latestVersion,
      }))
    ).subscribe(evt => {
      this.promptUserToUpdate();
    });
  }

  private promptUserToUpdate(): void {
    this.alerts
      .open('Une nouvelle version est disponible !', {
        label: 'Mettre à jour',
        status: TuiNotification.Info,
        autoClose: false,
      })
      .subscribe(() => {
        window.location.reload();
      });
  }
}