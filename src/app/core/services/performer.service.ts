import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';
import { NetworkService } from './network.service';
import { Performer } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PerformerService {
  private api = inject(ApiService);
  private db = inject(DatabaseService);
  private networkService = inject(NetworkService);

  getPerformers(): Observable<Performer[]> {
    if (this.networkService.isOffline()) {
      return from(this.db.performers.toArray());
    }

    return this.api.get<Performer[]>('/performers').pipe(
      tap(async (performers) => {
        // Sauvegarder en local
        await this.db.performers.clear();
        await this.db.performers.bulkAdd(performers);
      }),
      catchError(() => from(this.db.performers.toArray()))
    );
  }

  createPerformer(data: Partial<Performer>): Observable<Performer> {
    const performer: Performer = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      syncStatus: this.networkService.isOffline() ? 'pending' : 'synced',
    } as Performer;

    // Sauvegarder localement d'abord
    this.db.performers.add(performer);

    if (this.networkService.isOnline()) {
      return this.api.post<Performer>('/performers', data).pipe(
        tap(async (response) => {
          await this.db.performers.update(performer.id!, {
            ...response,
            syncStatus: 'synced',
          });
        }),
        catchError(() => of(performer))
      );
    }

    return of(performer);
  }

  updatePerformer(id: string, data: Partial<Performer>): Observable<Performer> {
    // Mettre à jour localement
    this.db.performers.update(id, {
      ...data,
      updatedAt: new Date(),
      syncStatus: this.networkService.isOffline() ? 'pending' : 'synced',
    });

    if (this.networkService.isOnline()) {
      return this.api.patch<Performer>(`/performers/${id}`, data).pipe(
        tap(async (response) => {
          await this.db.performers.update(id, {
            ...response,
            syncStatus: 'synced',
          });
        })
      );
    }

    return from(this.db.performers.get(id)) as Observable<Performer>;
  }
}