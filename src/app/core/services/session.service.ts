import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';
import { NetworkService } from './network.service';
import { Session, SessionStatus } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private api = inject(ApiService);
  private db = inject(DatabaseService);
  private networkService = inject(NetworkService);

  async getTodaySession(): Promise<Session | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.networkService.isOffline()) {
      const sessions = await this.db.sessions
        .where('date')
        .equals(today)
        .toArray();
      return sessions[0] || null;
    }

    try {
      const session = await this.api.get<Session>('/sessions/today').toPromise();
      if (session) {
        await this.db.sessions.put(session);
      }
      return session;
    } catch (error) {
      // Fallback sur la base locale
      const sessions = await this.db.sessions
        .where('date')
        .equals(today)
        .toArray();
      return sessions[0] || null;
    }
  }

  async createTodaySession(): Promise<Session> {
    const session: Session = {
      id: crypto.randomUUID(),
      date: new Date(),
      status: SessionStatus.EN_COURS,
      createdAt: new Date(),
      syncStatus: this.networkService.isOffline() ? 'pending' : 'synced',
    };

    await this.db.sessions.add(session);

    if (this.networkService.isOnline()) {
      try {
        const response = await this.api.post<Session>('/sessions/today', {}).toPromise();
        await this.db.sessions.update(session.id!, {
          ...response,
          syncStatus: 'synced',
        });
        return response;
      } catch (error) {
        console.error('Erreur création session:', error);
      }
    }

    return session;
  }

  async updateSessionStatus(sessionId: string, status: SessionStatus): Promise<void> {
    await this.db.sessions.update(sessionId, { 
      status,
      updatedAt: new Date(),
      syncStatus: this.networkService.isOffline() ? 'pending' : 'synced',
    });

    if (this.networkService.isOnline()) {
      try {
        await this.api.patch(`/sessions/${sessionId}/status`, { status }).toPromise();
        await this.db.sessions.update(sessionId, { syncStatus: 'synced' });
      } catch (error) {
        console.error('Erreur mise à jour session:', error);
      }
    }
  }

  getSessions(limit = 30): Observable<Session[]> {
    if (this.networkService.isOffline()) {
      return from(
        this.db.sessions
          .orderBy('date')
          .reverse()
          .limit(limit)
          .toArray()
      );
    }

    return this.api.get<Session[]>(`/sessions?limit=${limit}`).pipe(
      tap(async (sessions) => {
        // Mettre à jour le cache
        for (const session of sessions) {
          await this.db.sessions.put(session);
        }
      }),
      catchError(() => from(
        this.db.sessions
          .orderBy('date')
          .reverse()
          .limit(limit)
          .toArray()
      ))
    );
  }

  async exportSessionPDF(sessionId: string): Promise<void> {
    await this.api.post(`/exports/pdf/${sessionId}`, {}).toPromise();
  }

  async exportSessionPhotos(sessionId: string): Promise<void> {
    await this.api.post(`/exports/zip/${sessionId}`, {}).toPromise();
  }
}