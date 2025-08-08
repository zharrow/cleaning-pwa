import { Room } from './room.model';
import { AssignedTask, TaskLog, TaskStatus } from './task.model';

export * from './user.model';
export * from './task.model';
export * from './room.model';
export * from './performer.model';
export * from './session.model';
export * from './base.model';

// Types utilitaires pour l'application
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationOptions {
  appearance: 'positive' | 'negative' | 'warning' | 'info';
  hasIcon?: boolean;
  autoClose?: number;
}

// Interfaces pour les formulaires
export interface TaskValidationForm {
  performerId: string;
  status: TaskStatus;
  notes?: string;
  photos?: File[];
}

export interface SessionForm {
  date: Date;
  notes?: string;
}

// Types pour les états de l'application
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AppState {
  loading: LoadingState;
  error?: string;
  user?: any; // À remplacer par le type User quand il sera défini
}

// Corrections pour les erreurs Observable dans dashboard.component.ts
export interface TaskServiceMethods {
  getSessionTasks(sessionId: string): Promise<TaskLog[]>; // Retourne Promise au lieu d'Observable
  // Ou si on garde Observable:
  // getSessionTasks(sessionId: string): Observable<TaskLog[]>;
}

// Interface pour les données avec logs combinées
export interface TaskWithLog {
  assignedTask: AssignedTask;
  log?: TaskLog;
  isCompleted: boolean;
  isOverdue: boolean;
}

export interface RoomTasks {
  room: Room;
  tasks: TaskWithLog[];
  completedCount: number;
  totalCount: number;
  isExpanded: boolean;
}