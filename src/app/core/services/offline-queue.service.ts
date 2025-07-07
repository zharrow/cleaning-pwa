import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpClient } from '@angular/common/http';
import { NetworkService } from './network.service';
import { DatabaseService } from './database.service';
import { from, interval, filter, switchMap, catchError, of } from 'rxjs';

export interface QueuedRequest {
  id: string;
  request: {
    url: string;
    method: string;
    body: any;
    headers: { [key: string]: string };
  };
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineQueueService {
  private networkService = inject(NetworkService);
  private db = inject(DatabaseService);
  private http = inject(HttpClient);

  constructor() {
    this.initializeSyncProcess();
  }

  private initializeSyncProcess(): void {
    // Synchroniser quand on repasse en ligne
    this.networkService.online$.pipe(
      filter(isOnline => isOnline),
      switchMap(() => this.processQueue())
    ).subscribe();

    // Tentative périodique si en ligne
    interval(60000).pipe( // Toutes les minutes
      filter(() => this.networkService.isOnline()),
      switchMap(() => this.processQueue())
    ).subscribe();
  }

  async addToQueue(request: HttpRequest<any>): Promise<void> {
    const queuedRequest: QueuedRequest = {
      id: crypto.randomUUID(),
      request: {
        url: request.url,
        method: request.method,
        body: request.body,
        headers: this.extractHeaders(request),
      },
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3,
    };

    await this.db.queuedRequests.add(queuedRequest);
    console.log('📥 Requête mise en queue:', queuedRequest);
  }

  private extractHeaders(request: HttpRequest<any>): { [key: string]: string } {
    const headers: { [key: string]: string } = {};
    request.headers.keys().forEach(key => {
      headers[key] = request.headers.get(key) || '';
    });
    return headers;
  }

  async processQueue(): Promise<void> {
    const queued = await this.db.queuedRequests.toArray();
    
    for (const item of queued) {
      try {
        await this.processQueueItem(item);
        await this.db.queuedRequests.delete(item.id);
        console.log('✅ Requête synchronisée:', item.id);
      } catch (error) {
        console.error('❌ Erreur sync:', error);
        await this.handleRetry(item);
      }
    }
  }

  private async processQueueItem(item: QueuedRequest): Promise<any> {
    const { url, method, body, headers } = item.request;
    
    return this.http.request(method, url, {
      body,
      headers,
    }).toPromise();
  }

  private async handleRetry(item: QueuedRequest): Promise<void> {
    item.retryCount++;
    
    if (item.retryCount >= item.maxRetries) {
      // Marquer comme échec définitif
      await this.db.queuedRequests.update(item.id, {
        ...item,
        error: true,
      });
    } else {
      // Mettre à jour le compteur
      await this.db.queuedRequests.update(item.id, item);
    }
  }

  async getQueueSize(): Promise<number> {
    return this.db.queuedRequests.count();
  }

  async clearQueue(): Promise<void> {
    await this.db.queuedRequests.clear();
  }
}
