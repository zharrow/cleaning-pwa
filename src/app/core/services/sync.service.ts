import { Injectable, inject } from '@angular/core';
import { interval } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NetworkService } from './network.service';
import { TaskService } from './task.service';
import { OfflineQueueService } from './offline-queue.service';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private networkService = inject(NetworkService);
  private taskService = inject(TaskService);
  private queueService = inject(OfflineQueueService);
  private db = inject(DatabaseService);

  initialize(): void {
    // Sync quand on repasse en ligne
    this.networkService.online$.pipe(
      filter(isOnline => isOnline)
    ).subscribe(() => {
      this.performFullSync();
    });

    // Sync périodique si en ligne
    interval(5 * 60 * 1000) // 5 minutes
      .pipe(filter(() => this.networkService.isOnline()))
      .subscribe(() => {
        this.performFullSync();
      });
  }

  async performFullSync(): Promise<void> {
    console.log('🔄 Synchronisation complète...');

    try {
      // 1. Traiter la queue offline
      await this.queueService.processQueue();

      // 2. Synchroniser les tâches
      await this.taskService.syncPendingTasks();

      // 3. Synchroniser les sessions
      await this.syncSessions();

      const stats = await this.db.getSyncStats();
      console.log('✅ Synchronisation terminée', stats);
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
    }
  }

  private async syncSessions(): Promise<void> {
    const pendingSessions = await this.db.sessions
      .where('syncStatus')
      .equals('pending')
      .toArray();

    // Implémenter la logique de sync des sessions
    console.log(`📤 ${pendingSessions.length} sessions à synchroniser`);
  }
}