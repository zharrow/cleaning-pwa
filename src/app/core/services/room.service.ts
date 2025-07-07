import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';
import { NetworkService } from './network.service';
import { Room } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private api = inject(ApiService);
  private db = inject(DatabaseService);
  private networkService = inject(NetworkService);

  getRooms(): Observable<Room[]> {
    if (this.networkService.isOffline()) {
      return from(this.db.rooms.orderBy('displayOrder').toArray());
    }

    return this.api.get<Room[]>('/rooms').pipe(
      tap(async (rooms) => {
        await this.db.rooms.clear();
        await this.db.rooms.bulkAdd(rooms);
      }),
      catchError(() => from(this.db.rooms.orderBy('displayOrder').toArray()))
    );
  }

  createRoom(data: Partial<Room>): Observable<Room> {
    const room: Room = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      syncStatus: this.networkService.isOffline() ? 'pending' : 'synced',
    } as Room;

    this.db.rooms.add(room);

    if (this.networkService.isOnline()) {
      return this.api.post<Room>('/rooms', data).pipe(
        tap(async (response) => {
          await this.db.rooms.update(room.id!, {
            ...response,
            syncStatus: 'synced',
          });
        }),
        catchError(() => of(room))
      );
    }

    return of(room);
  }

  updateRoom(id: string, data: Partial<Room>): Observable<Room> {
    this.db.rooms.update(id, {
      ...data,
      updatedAt: new Date(),
      syncStatus: this.networkService.isOffline() ? 'pending' : 'synced',
    });

    if (this.networkService.isOnline()) {
      return this.api.patch<Room>(`/rooms/${id}`, data).pipe(
        tap(async (response) => {
          await this.db.rooms.update(id, {
            ...response,
            syncStatus: 'synced',
          });
        })
      );
    }

    return from(this.db.rooms.get(id)) as Observable<Room>;
  }
}