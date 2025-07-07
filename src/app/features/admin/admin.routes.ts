import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
  },
  {
    path: 'rooms',
    loadComponent: () => import('./rooms/rooms.component').then(m => m.RoomsComponent),
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/tasks.component').then(m => m.TasksComponent),
  },
  {
    path: 'performers',
    loadComponent: () => import('./performers/performers.component').then(m => m.PerformersComponent),
  },
];