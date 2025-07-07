import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';
import { NetworkService } from './network.service';
import { AssignedTask, TaskLog, TaskStatus } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private api = inject(ApiService);
  private db = inject(DatabaseService);
  private networkService = inject(NetworkService);

  getAssignedTasks(): Observable<AssignedTask[]> {
    if (this.networkService.isOffline()) {
      return from(this.db.tasks.toArray());
    }

    return this.api.get<AssignedTask[]>('/assigned-tasks').pipe(
      tap(async (tasks) => {
        // Sauvegarder en local
        await this.db.tasks.clear();
        await this.db.tasks.bulkAdd(tasks);
      }),
      catchError(() => from(this.db.tasks.toArray()))
    );
  }

  getSessionTasks(sessionId: string): Observable<TaskLog[]> {
    if (this.networkService.isOffline()) {
      return from(this.db.taskLogs.where('sessionId').equals(sessionId).toArray());
    }

    return this.api.get<TaskLog[]>(`/cleaning-logs?session_id=${sessionId}`).pipe(
      tap(async (logs) => {
        // Mettre à jour le cache local
        for (const log of logs) {
          await this.db.taskLogs.put(log);
        }
      }),
      catchError(() => from(this.db.taskLogs.where('sessionId').equals(sessionId).toArray()))
    );
  }

  async validateTask(data: {
    sessionId: string;
    assignedTaskId: string;
    performerId: string;
    status: TaskStatus;
    notes?: string;
    photos?: string[];
  }): Promise<TaskLog> {
    const taskLog: TaskLog = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      createdAt: new Date(),
      syncStatus: this.networkService.isOffline() ? 'pending' : 'synced',
    };

    // Sauvegarder localement d'abord
    await this.db.taskLogs.add(taskLog);

    if (this.networkService.isOnline()) {
      try {
        const response = await this.api.post<TaskLog>('/cleaning-logs', data).toPromise();
        // Mettre à jour avec l'ID du serveur
        await this.db.taskLogs.update(taskLog.id!, {
          ...response,
          syncStatus: 'synced',
        });
        return response;
      } catch (error) {
        console.error('Erreur validation tâche:', error);
        // La requête sera dans la queue offline
      }
    }

    return taskLog;
  }

  async uploadPhoto(logId: string, file: File): Promise<string> {
    // En mode offline, stocker la photo localement
    if (this.networkService.isOffline()) {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          // Stocker dans IndexedDB
          this.db.transaction('rw', this.db.taskLogs, async () => {
            const log = await this.db.taskLogs.get(logId);
            if (log) {
              log.photos = [...(log.photos || []), base64];
              await this.db.taskLogs.put(log);
            }
          });
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    // En ligne, uploader normalement
    return this.api.uploadFile<{ filename: string }>(
      `/cleaning-logs/${logId}/photos`,
      file
    ).pipe(
      map(response => response.filename)
    ).toPromise();
  }

  async syncPendingTasks(): Promise<void> {
    const pendingLogs = await this.db.taskLogs
      .where('syncStatus')
      .equals('pending')
      .toArray();

    for (const log of pendingLogs) {
      try {
        const response = await this.api.post<TaskLog>('/cleaning-logs', {
          sessionId: log.sessionId,
          assignedTaskId: log.assignedTaskId,
          performerId: log.performerId,
          status: log.status,
          notes: log.notes,
          photos: log.photos,
        }).toPromise();

        await this.db.taskLogs.update(log.id!, {
          ...response,
          syncStatus: 'synced',
          lastSyncAt: new Date(),
        });
      } catch (error) {
        console.error('Erreur sync tâche:', error);
        await this.db.taskLogs.update(log.id!, {
          syncStatus: 'error',
        });
      }
    }
  }
}