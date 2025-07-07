import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { 
  TuiButtonModule,
  TuiDataListModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiSvgModule,
} from '@taiga-ui/core';
import { 
  TuiAvatarModule,
  TuiBadgeModule,
  TuiMarkerIconModule,
  TuiProgressModule,
} from '@taiga-ui/kit';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { SessionService } from '../../core/services/session.service';
import { NetworkService } from '../../core/services/network.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { getDateLabel } from '../../shared/utils/date.utils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TuiButtonModule,
    TuiDataListModule,
    TuiHostedDropdownModule,
    TuiLoaderModule,
    TuiSvgModule,
    TuiAvatarModule,
    TuiBadgeModule,
    TuiMarkerIconModule,
    TuiProgressModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b">
        <div class="container-app">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-4">
              <h1 class="text-xl font-semibold text-gray-900">
                Tableau de bord
              </h1>
              <tui-badge 
                [value]="networkService.isOnline() ? 'En ligne' : 'Hors ligne'"
                [status]="networkService.isOnline() ? 'success' : 'error'"
              />
            </div>
            
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-600">
                {{ currentDate() }}
              </span>
              
              <tui-hosted-dropdown [content]="userMenu">
                <button tuiButton appearance="flat" size="s">
                  <tui-avatar
                    [text]="userInitials()"
                    size="xs"
                    class="mr-2"
                  ></tui-avatar>
                  {{ authService.currentUser()?.fullName }}
                </button>
              </tui-hosted-dropdown>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenu principal -->
      <main class="container-app py-6">
        @if (loading()) {
          <app-loading-spinner text="Chargement des données..." />
        } @else {
          <!-- Résumé de la session du jour -->
          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold">Session d'aujourd'hui</h2>
              <button
                tuiButton
                routerLink="/tasks"
                size="m"
                appearance="primary"
              >
                Commencer le nettoyage
              </button>
            </div>
            
            @if (todaySession()) {
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Progression -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-2">Progression</p>
                  <div class="flex items-center gap-3">
                    <tui-progress
                      [value]="progressPercentage()"
                      [max]="100"
                      size="m"
                      class="flex-1"
                    ></tui-progress>
                    <span class="text-lg font-semibold">
                      {{ progressPercentage() }}%
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ completedTasks() }} / {{ totalTasks() }} tâches
                  </p>
                </div>
                
                <!-- Statut -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-2">Statut</p>
                  <tui-badge
                    [value]="getSessionStatusLabel(todaySession()!.status)"
                    [status]="getSessionStatusColor(todaySession()!.status)"
                    size="l"
                  />
                </div>
                
                <!-- Actions rapides -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-2">Actions</p>
                  <div class="flex gap-2">
                    <button
                      tuiButton
                      routerLink="/sessions/{{ todaySession()!.id }}"
                      size="s"
                      appearance="flat"
                    >
                      Voir détails
                    </button>
                    @if (todaySession()!.status === 'COMPLETEE') {
                      <button
                        tuiButton
                        (click)="exportPDF()"
                        size="s"
                        appearance="flat"
                      >
                        Exporter PDF
                      </button>
                    }
                  </div>
                </div>
              </div>
            } @else {
              <app-empty-state
                title="Aucune session aujourd'hui"
                description="Créez une nouvelle session pour commencer"
                actionLabel="Créer une session"
                (action)="createSession()"
              />
            }
          </div>

          <!-- Tâches par pièce -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold mb-4">Tâches par pièce</h2>
            
            @if (tasksByRoom().length > 0) {
              <div class="space-y-4">
                @for (room of tasksByRoom(); track room.id) {
                  <div class="border rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="font-medium">{{ room.name }}</h3>
                      <span class="text-sm text-gray-600">
                        {{ room.completedTasks }} / {{ room.totalTasks }} tâches
                      </span>
                    </div>
                    <tui-progress
                      [value]="room.progress"
                      [max]="100"
                      size="s"
                    ></tui-progress>
                  </div>
                }
              </div>
            } @else {
              <app-empty-state
                title="Aucune tâche configurée"
                description="Configurez les tâches dans l'administration"
                actionLabel="Aller à l'administration"
                routerLink="/admin/tasks"
              />
            }
          </div>
        }
      </main>

      <!-- Menu utilisateur -->
      <ng-template #userMenu>
        <tui-data-list>
          <button tuiOption routerLink="/admin">
            <i class="mr-2">⚙️</i>
            Administration
          </button>
          <button tuiOption (click)="logout()">
            <i class="mr-2">🚪</i>
            Déconnexion
          </button>
        </tui-data-list>
      </ng-template>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  networkService = inject(NetworkService);
  private taskService = inject(TaskService);
  private sessionService = inject(SessionService);
  private router = inject(Router);

  loading = signal(true);
  todaySession = signal<any>(null);
  tasks = signal<any[]>([]);

  currentDate = computed(() => getDateLabel(new Date()));
  completedTasks = computed(() => this.tasks().filter(t => t.status === 'FAIT').length);
  totalTasks = computed(() => this.tasks().length);
  progressPercentage = computed(() => {
    const total = this.totalTasks();
    if (total === 0) return 0;
    return Math.round((this.completedTasks() / total) * 100);
  });

  tasksByRoom = computed(() => {
    const rooms = new Map<string, any>();
    
    this.tasks().forEach(task => {
      const roomId = task.assignedTask?.room?.id;
      if (!roomId) return;
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          name: task.assignedTask.room.name,
          totalTasks: 0,
          completedTasks: 0,
          progress: 0,
        });
      }
      
      const room = rooms.get(roomId);
      room.totalTasks++;
      if (task.status === 'FAIT') {
        room.completedTasks++;
      }
      room.progress = Math.round((room.completedTasks / room.totalTasks) * 100);
    });
    
    return Array.from(rooms.values());
  });

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      this.loading.set(true);
      
      // Charger la session du jour
      const session = await this.sessionService.getTodaySession();
      this.todaySession.set(session);
      
      if (session) {
        // Charger les tâches de la session
        const tasks = await this.taskService.getSessionTasks(session.id);
        this.tasks.set(tasks);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      this.loading.set(false);
    }
  }

  userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    
    return user.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  getSessionStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      EN_COURS: 'En cours',
      COMPLETEE: 'Complétée',
      INCOMPLETE: 'Incomplète',
    };
    return labels[status] || status;
  }

  getSessionStatusColor(status: string): string {
    const colors: Record<string, string> = {
      EN_COURS: 'warning',
      COMPLETEE: 'success',
      INCOMPLETE: 'error',
    };
    return colors[status] || 'neutral';
  }

  async createSession(): Promise<void> {
    try {
      const session = await this.sessionService.createTodaySession();
      this.todaySession.set(session);
      await this.loadData();
    } catch (error) {
      console.error('Erreur création session:', error);
    }
  }

  async exportPDF(): Promise<void> {
    if (!this.todaySession()) return;
    
    try {
      await this.sessionService.exportSessionPDF(this.todaySession()!.id);
    } catch (error) {
      console.error('Erreur export PDF:', error);
    }
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}