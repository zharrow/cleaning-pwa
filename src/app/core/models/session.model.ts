import { BaseModel } from './base.model';

export interface Session extends BaseModel {
  id: string;
  date: Date;
  status: SessionStatus;
  notes?: string;
  completedTasks?: number;
  totalTasks?: number;
}

export enum SessionStatus {
  EN_COURS = 'EN_COURS',
  COMPLETEE = 'COMPLETEE',
  INCOMPLETE = 'INCOMPLETE',
}