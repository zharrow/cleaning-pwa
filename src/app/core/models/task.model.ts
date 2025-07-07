

export interface AssignedTask extends BaseModel {
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