import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  TuiButtonModule,
  TuiExpandModule,
  TuiLoaderModule,
  TuiNotification,
  TuiAlertService,
  TuiDialogService,
  TuiDialogModule,
} from '@taiga-ui/core';
import {
  TuiBadgeModule,
  TuiAccordionModule,
  TuiCheckboxModule,
  TuiAvatarModule,
  TuiMarkerIconModule,
} from '@taiga-ui/kit';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TaskService } from '../../../core/services/task.service';
import { SessionService } from '../../../core/services/session.service';
import { NetworkService } from '../../../core/services/network.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TaskValidationComponent } from '../task-validation/task-validation.component';
import { TaskStatus, AssignedTask, TaskLog, Room } from '../../../core/models';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

interface RoomTasks {
  room: Room;
  tasks: TaskWithLog[];
  completedCount: number;
  totalCount: number;
  isExpanded: boolean;
}

interface TaskWithLog {
  assignedTask: AssignedTask;
  log?: TaskLog;
  isCompleted: boolean;
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    TuiButtonModule,
    TuiExpandModule,
    TuiLoaderModule,
    TuiBadgeModule,
    TuiAccordionModule,
    TuiCheckboxModule,
    TuiAvatarModule,
    TuiMarkerIconModule,
    TuiDialogModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    TimeAgoPipe,
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b sticky top-0 z-10">
        <div class="container-app">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-4">
              <button
                tuiButton
                appearance="flat"
                size="s"
                routerLink="/dashboard"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Retour
              </button>
              <h1 class="text-xl font-semibold">Checklist du jour</h1>
            </div>
            
            @if (currentSession()) {
              <div class="flex items-center gap-4">
                <div class="text-sm text-gray-600">
                  <span class="font-medium">{{ completedTasksCount() }}</span> / {{ totalTasksCount() }} tâches
                </div>
                <tui-badge
                  [value]="progressPercentage() + '%'"
                  [status]="progressPercentage() === 100 ? 'success' : 'warning'"
                />
              </div>
            }
          </div>
        </div>
      </header>

      <!-- Contenu -->
      <main class="container-app py-6">
        @if (loading()) {
          <app-loading-spinner text="Chargement des tâches..." />
        } @else {
          @if (!currentSession()) {
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p class="text-yellow-800">
                Aucune session de nettoyage pour aujourd'hui.
                <button
                  tuiButton
                  size="s"
                  appearance="flat"
                  (click)="createSession()"
                  class="ml-2"
                >
                  Créer une session
                </button>
              </p>
            </div>
          }

          @if (roomTasks().length === 0) {
            <app-empty-state
              title="Aucune tâche configurée"
              description="Configurez les tâches dans l'administration"
              actionLabel="Aller à l'administration"
              routerLink="/admin/tasks"
            />
          } @else {
            <!-- Liste des pièces -->
            <div class="space-y-4">
              @for (roomData of roomTasks(); track roomData.room.id) {
                <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                  <!-- En-tête de la pièce -->
                  <button
                    class="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    (click)="toggleRoom(roomData)"
                  >
                    <div class="flex items-center gap-3">
                      <tui-marker-icon
                        [src]="getRoomIcon(roomData.room.name)"
                        [color]="roomData.completedCount === roomData.totalCount ? 'var(--tui-success)' : 'var(--tui-warning)'"
                      ></tui-marker-icon>
                      <div class="text-left">
                        <h3 class="font-medium text-lg">{{ roomData.room.name }}</h3>
                        <p class="text-sm text-gray-600">
                          {{ roomData.completedCount }} / {{ roomData.totalCount }} tâches complétées
                        </p>
                      </div>
                    </div>
                    <svg
                      class="w-5 h-5 text-gray-400 transition-transform"
                      [class.rotate-180]="roomData.isExpanded"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  <!-- Tâches de la pièce -->
                  <tui-expand [expanded]="roomData.isExpanded">
                    <div class="border-t">
                      @for (taskData of roomData.tasks; track taskData.assignedTask.id) {
                        <div
                          class="p-4 border-b last:border-0 hover:bg-gray-50 transition-colors"
                          [class.bg-green-50]="taskData.isCompleted"
                        >
                          <div class="flex items-start gap-3">
                            <tui-checkbox
                              [ngModel]="taskData.isCompleted"
                              (ngModelChange)="onTaskClick(taskData)"
                              [disabled]="validatingTask()"
                            ></tui-checkbox>
                            
                            <div class="flex-1">
                              <h4 class="font-medium" [class.line-through]="taskData.isCompleted">
                                {{ taskData.assignedTask.taskTemplate?.name }}
                              </h4>
                              
                              @if (taskData.assignedTask.taskTemplate?.description) {
                                <p class="text-sm text-gray-600 mt-1">
                                  {{ taskData.assignedTask.taskTemplate.description }}
                                </p>
                              }
                              
                              @if (taskData.log) {
                                <div class="mt-2 flex items-center gap-4 text-sm">
                                  <span class="flex items-center gap-1">
                                    <tui-avatar
                                      [text]="taskData.log.performer?.name || 'U'"
                                      size="xs"
                                    ></tui-avatar>
                                    {{ taskData.log.performer?.name }}
                                  </span>
                                  <span class="text-gray-600">
                                    {{ taskData.log.timestamp | timeAgo }}
                                  </span>
                                  <tui-badge
                                    [value]="getStatusLabel(taskData.log.status)"
                                    [status]="getStatusColor(taskData.log.status)"
                                    size="s"
                                  />
                                </div>
                                
                                @if (taskData.log.notes) {
                                  <p class="text-sm text-gray-600 mt-2 italic">
                                    "{{ taskData.log.notes }}"
                                  </p>
                                }
                              }
                            </div>
                            
                            @if (taskData.assignedTask.defaultPerformer) {
                              <div class="text-right text-sm text-gray-600">
                                <p class="font-medium">Assigné à :</p>
                                <p>{{ taskData.assignedTask.defaultPerformer.name }}</p>
                              </div>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </tui-expand>
                </div>
              }
            </div>

            <!-- Actions globales -->
            @if (currentSession() && progressPercentage() === 100) {
              <div class="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <svg class="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h3 class="text-lg font-semibold text-green-800 mb-2">
                  Toutes les tâches sont complétées !
                </h3>
                <p class="text-green-700 mb-4">
                  Félicitations, la session de nettoyage est terminée.
                </p>
                <div class="flex gap-3 justify-center">
                  <button
                    tuiButton
                    appearance="primary"
                    (click)="completeSession()"
                  >
                    Terminer la session
                  </button>
                  <button
                    tuiButton
                    appearance="flat"
                    (click)="exportPDF()"
                  >
                    Exporter le rapport
                  </button>
                </div>
              </div>
            }
          }
        }
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private sessionService = inject(SessionService);
  private networkService = inject(NetworkService);
  private alerts = inject(TuiAlertService);
  private dialogs = inject(TuiDialogService);
  private router = inject(Router);

  loading = signal(true);
  validatingTask = signal(false);
  currentSession = signal<any>(null);
  assignedTasks = signal<AssignedTask[]>([]);
  taskLogs = signal<TaskLog[]>([]);
  performers = signal<any[]>([]);

  roomTasks = computed(() => {
    const tasks = this.assignedTasks();
    const logs = this.taskLogs();
    const roomMap = new Map<string, RoomTasks>();

    // Grouper par pièce
    tasks.forEach(task => {
      if (!task.room) return;
      
      const roomId = task.room.id!;
      if (!roomMap.has(roomId)) {
        roomMap.set(roomId, {
          room: task.room,
          tasks: [],
          completedCount: 0,
          totalCount: 0,
          isExpanded: false,
        });
      }

      const log = logs.find(l => l.assignedTaskId === task.id);
      const roomData = roomMap.get(roomId)!;
      
      roomData.tasks.push({
        assignedTask: task,
        log,
        isCompleted: !!log,
      });
      
      roomData.totalCount++;
      if (log) roomData.completedCount++;
    });

    // Trier par ordre d'affichage
    return Array.from(roomMap.values())
      .sort((a, b) => a.room.displayOrder - b.room.displayOrder);
  });

  completedTasksCount = computed(() => this.taskLogs().length);
  totalTasksCount = computed(() => this.assignedTasks().length);
  progressPercentage = computed(() => {
    const total = this.totalTasksCount();
    if (total === 0) return 0;
    return Math.round((this.completedTasksCount() / total) * 100);
  });

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      this.loading.set(true);

      // Charger la session du jour
      const session = await this.sessionService.getTodaySession();
      this.currentSession.set(session);

      if (session) {
        // Charger les tâches assignées
        const tasks = await this.taskService.getAssignedTasks().toPromise();
        this.assignedTasks.set(tasks || []);

        // Charger les logs de la session
        const logs = await this.taskService.getSessionTasks(session.id!).toPromise();
        this.taskLogs.set(logs || []);
      }

      // Charger les performers (depuis le cache ou l'API)
      // TODO: Implémenter PerformerService
      this.performers.set([
        { id: '1', name: 'Marie Dupont' },
        { id: '2', name: 'Jean Martin' },
        { id: '3', name: 'Sophie Leroux' },
      ]);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      this.alerts.open('Erreur lors du chargement des données', {
        status: TuiNotification.Error,
      }).subscribe();
    } finally {
      this.loading.set(false);
    }
  }

  toggleRoom(roomData: RoomTasks): void {
    roomData.isExpanded = !roomData.isExpanded;
  }

  async onTaskClick(taskData: TaskWithLog): Promise<void> {
    if (taskData.isCompleted) {
      // Demander confirmation pour modifier
      const confirmed = await this.confirmModification(taskData);
      if (!confirmed) return;
    }

    this.openValidationDialog(taskData);
  }

  private async confirmModification(taskData: TaskWithLog): Promise<boolean> {
    return new Promise((resolve) => {
      this.dialogs
        .open('Cette tâche a déjà été validée. Voulez-vous modifier la validation ?', {
          label: 'Confirmation',
          size: 's',
          data: {
            buttons: ['Annuler', 'Modifier'],
          },
        })
        .subscribe((result) => {
          resolve(result === 1);
        });
    });
  }

  private openValidationDialog(taskData: TaskWithLog): void {
    this.dialogs
      .open<any>(
        new PolymorpheusComponent(TaskValidationComponent),
        {
          label: taskData.assignedTask.taskTemplate?.name || 'Validation de tâche',
          size: 'm',
          data: {
            task: taskData.assignedTask,
            performers: this.performers(),
            existingLog: taskData.log,
          },
        }
      )
      .subscribe(async (result) => {
        if (result) {
          await this.validateTask(taskData, result);
        }
      });
  }

  private async validateTask(taskData: TaskWithLog, validationData: any): Promise<void> {
    if (!this.currentSession()) return;

    try {
      this.validatingTask.set(true);

      const log = await this.taskService.validateTask({
        sessionId: this.currentSession()!.id!,
        assignedTaskId: taskData.assignedTask.id!,
        performerId: validationData.performerId,
        status: validationData.status,
        notes: validationData.notes,
        photos: validationData.photos,
      });

      // Mettre à jour les logs localement
      const logs = [...this.taskLogs()];
      const existingIndex = logs.findIndex(l => l.assignedTaskId === taskData.assignedTask.id);
      
      if (existingIndex >= 0) {
        logs[existingIndex] = log;
      } else {
        logs.push(log);
      }
      
      this.taskLogs.set(logs);

      this.alerts.open('Tâche validée avec succès', {
        status: TuiNotification.Success,
      }).subscribe();
    } catch (error) {
      console.error('Erreur validation tâche:', error);
      this.alerts.open('Erreur lors de la validation', {
        status: TuiNotification.Error,
      }).subscribe();
    } finally {
      this.validatingTask.set(false);
    }
  }

  async createSession(): Promise<void> {
    try {
      const session = await this.sessionService.createTodaySession();
      this.currentSession.set(session);
      await this.loadData();
    } catch (error) {
      console.error('Erreur création session:', error);
      this.alerts.open('Erreur lors de la création de la session', {
        status: TuiNotification.Error,
      }).subscribe();
    }
  }

  async completeSession(): Promise<void> {
    if (!this.currentSession()) return;

    try {
      await this.sessionService.updateSessionStatus(
        this.currentSession()!.id!,
        'COMPLETEE' as any
      );
      
      this.alerts.open('Session terminée avec succès !', {
        status: TuiNotification.Success,
      }).subscribe();

      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Erreur fermeture session:', error);
      this.alerts.open('Erreur lors de la fermeture de la session', {
        status: TuiNotification.Error,
      }).subscribe();
    }
  }

  async exportPDF(): Promise<void> {
    if (!this.currentSession()) return;

    try {
      await this.sessionService.exportSessionPDF(this.currentSession()!.id!);
      this.alerts.open('Export PDF en cours...', {
        status: TuiNotification.Info,
      }).subscribe();
    } catch (error) {
      console.error('Erreur export PDF:', error);
      this.alerts.open('Erreur lors de l\'export', {
        status: TuiNotification.Error,
      }).subscribe();
    }
  }

  getRoomIcon(roomName: string): string {
    const icons: Record<string, string> = {
      'Salle de jeu': 'tuiIconGamepad',
      'Cuisine': 'tuiIconCutlery',
      'Salle de bain': 'tuiIconDroplet',
      'Dortoir': 'tuiIconMoon',
      'Entrée': 'tuiIconHome',
      'Bureau': 'tuiIconDesktop',
    };
    return icons[roomName] || 'tuiIconFolder';
  }

  getStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
      [TaskStatus.FAIT]: 'Fait',
      [TaskStatus.PARTIEL]: 'Partiel',
      [TaskStatus.REPORTE]: 'Reporté',
      [TaskStatus.IMPOSSIBLE]: 'Impossible',
    };
    return labels[status] || status;
  }

  getStatusColor(status: TaskStatus): string {
    const colors: Record<TaskStatus, string> = {
      [TaskStatus.FAIT]: 'success',
      [TaskStatus.PARTIEL]: 'warning',
      [TaskStatus.REPORTE]: 'info',
      [TaskStatus.IMPOSSIBLE]: 'error',
    };
    return colors[status] || 'neutral';
  }
}