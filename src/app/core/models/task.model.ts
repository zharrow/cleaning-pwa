import { BaseModel } from './base.model';
import { Room } from './room.model';
import { Performer } from './performer.model';

export interface TaskTemplate extends BaseModel {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface AssignedTask extends BaseModel {
  id: string;
  taskTemplateId: string;
  taskTemplate?: TaskTemplate;
  roomId: string;
  room?: Room;
  defaultPerformerId?: string;
  defaultPerformer?: Performer;
  frequencyDays: number;
  timesPerDay: number;
  suggestedTime?: string;
  isActive: boolean;
}

export interface TaskLog extends BaseModel {
  id: string;
  sessionId: string;
  assignedTaskId: string;
  assignedTask?: AssignedTask;
  performerId: string;
  performer?: Performer;
  status: TaskStatus;
  notes?: string;
  photos?: string[];
  timestamp: Date;
}

export enum TaskStatus {
  FAIT = 'FAIT',
  PARTIEL = 'PARTIEL',
  REPORTE = 'REPORTE',
  IMPOSSIBLE = 'IMPOSSIBLE',
}

// Type guards pour vérifier la validité des données
export function isValidAssignedTask(task: any): task is AssignedTask {
  return task && 
    typeof task.id === 'string' && 
    typeof task.taskTemplateId === 'string' &&
    typeof task.roomId === 'string' &&
    typeof task.frequencyDays === 'number' &&
    typeof task.timesPerDay === 'number' &&
    typeof task.isActive === 'boolean';
}

export function isValidTaskLog(log: any): log is TaskLog {
  return log &&
    typeof log.id === 'string' &&
    typeof log.sessionId === 'string' &&
    typeof log.assignedTaskId === 'string' &&
    typeof log.performerId === 'string' &&
    Object.values(TaskStatus).includes(log.status) &&
    log.timestamp instanceof Date;
}