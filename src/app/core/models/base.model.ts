export interface BaseModel {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  syncStatus?: 'synced' | 'pending' | 'error';
  lastSyncAt?: Date;
}