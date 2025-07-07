import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { NetworkService } from '../services/network.service';
import { OfflineQueueService } from '../services/offline-queue.service';

export const offlineInterceptor: HttpInterceptorFn = (req, next) => {
  const networkService = inject(NetworkService);
  const queueService = inject(OfflineQueueService);

  // Si offline et requête modifiante, mettre en queue
  if (!networkService.isOnline() && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    queueService.addToQueue(req);
    
    // Retourner une réponse optimiste
    return of(new HttpResponse({
      status: 202,
      statusText: 'Accepted (Offline)',
      body: { offline: true, queued: true }
    }));
  }

  return next(req).pipe(
    catchError((error) => {
      // Si erreur réseau et requête modifiante, mettre en queue
      if (error.status === 0 && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        queueService.addToQueue(req);
        
        return of(new HttpResponse({
          status: 202,
          statusText: 'Accepted (Network Error)',
          body: { offline: true, queued: true }
        }));
      }
      
      return throwError(() => error);
    })
  );
};