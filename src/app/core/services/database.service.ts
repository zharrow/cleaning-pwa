import Dexie, { Table } from 'dexie';
import { QueuedRequest } from './offline-queue.service';
import { Task, TaskLog, Room, Performer, Session } from '../models';

export class AppDatabase extends Dexie {
  // Tables
  queuedRequests!: Table<QueuedRequest, string>;
  tasks!: Table<Task, string>;
  taskLogs!: Table<TaskLog, string>;
  rooms!: Table<Room, string>;
  performers!: Table<Performer, string>;
  sessions!: Table<Session, string>;

  constructor() {
    super('CleaningAppDB');
    
    this.version(1).stores({
      queuedRequests: 'id, timestamp, retryCount',
      tasks: 'id, roomId, syncStatus, lastSyncAt',
      taskLogs: 'id, taskId, sessionId, performerId, syncStatus, timestamp',
      rooms: 'id, syncStatus',
      performers: 'id, isActive, syncStatus',
      sessions: 'id, date, status, syncStatus',
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService extends AppDatabase {
  constructor() {
    super();
  }

  async clearAllData(): Promise<void> {
    await this.transaction('rw', this.tables, async () => {
      await Promise.all(this.tables.map(table => table.clear()));
    });
  }

  async getSyncStats() {
    const [pending, synced, error] = await Promise.all([
      this.taskLogs.where('syncStatus').equals('pending').count(),
      this.taskLogs.where('syncStatus').equals('synced').count(),
      this.taskLogs.where('syncStatus').equals('error').count(),
    ]);

    return { pending, synced, error };
  }
}