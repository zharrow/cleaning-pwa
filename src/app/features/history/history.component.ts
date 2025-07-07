import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  TuiButtonModule,
  TuiLoaderModule,
  TuiHostedDropdownModule,
  TuiDataListModule,
  TuiSvgModule,
} from '@taiga-ui/core';
import {
  TuiTableModule,
  TuiBadgeModule,
  TuiPaginationModule,
} from '@taiga-ui/kit';
import { SessionService } from '../../core/services/session.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { formatDate } from '../../shared/utils/date.utils';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TuiButtonModule,
    TuiLoaderModule,
    TuiHostedDropdownModule,
    TuiDataListModule,
    TuiSvgModule,
    TuiTableModule,
    TuiBadgeModule,
    TuiPaginationModule,
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
              <h1 class="text-xl font-semibold">Historique des sessions</h1>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenu -->
      <main class="container-app py-6">
        @if (loading()) {
          <app-loading-spinner text="Chargement de l'historique..." />
        } @else {
          @if (sessions().length === 0) {
            <app-empty-state
              title="Aucune session dans l'historique"
              description="Les sessions de nettoyage apparaîtront ici"
              icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          } @else {
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
              <table tuiTable [columns]="columns" class="w-full">
                <thead>
                  <tr tuiThGroup>
                    <th *tuiHead="'date'" tuiTh>Date</th>
                    <th *tuiHead="'status'" tuiTh>Statut</th>
                    <th *tuiHead="'progress'" tuiTh>Progression</th>
                    <th *tuiHead="'notes'" tuiTh>Notes</th>
                    <th *tuiHead="'actions'" tuiTh [sorter]="null">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (session of paginatedSessions(); track session.id) {
                    <tr tuiTr>
                      <td *tuiCell="'date'" tuiTd>
                        {{ formatDate(session.date) }}
                      </td>
                      <td *tuiCell="'status'" tuiTd>
                        <tui-badge
                          [value]="getStatusLabel(session.status)"
                          [status]="getStatusColor(session.status)"
                        />
                      </td>
                      <td *tuiCell="'progress'" tuiTd>
                        <span class="font-medium">
                          {{ session.completedTasks || 0 }} / {{ session.totalTasks || 0 }}
                        </span>
                        <span class="text-gray-600 text-sm ml-2">
                          ({{ getProgressPercentage(session) }}%)
                        </span>
                      </td>
                      <td *tuiCell="'notes'" tuiTd>
                        {{ session.notes || '-' }}
                      </td>
                      <td *tuiCell="'actions'" tuiTd>
                        <tui-hosted-dropdown [content]="actions" [(open)]="dropdownOpen">
                          <button
                            tuiButton
                            type="button"
                            appearance="flat"
                            size="s"
                            iconRight="tuiIconChevronDown"
                          >
                            Actions
                          </button>
                        </tui-hosted-dropdown>
                        
                        <ng-template #actions>
                          <tui-data-list>
                            <button
                              tuiOption
                              [routerLink]="['/sessions', session.id]"
                              (click)="dropdownOpen = false"
                            >
                              <tui-svg src="tuiIconEye" class="mr-2"></tui-svg>
                              Voir détails
                            </button>
                            @if (session.status === 'COMPLETEE') {
                              <button
                                tuiOption
                                (click)="exportPDF(session)"
                              >
                                <tui-svg src="tuiIconFile" class="mr-2"></tui-svg>
                                Exporter PDF
                              </button>
                              <button
                                tuiOption
                                (click)="exportPhotos(session)"
                              >
                                <tui-svg src="tuiIconImage" class="mr-2"></tui-svg>
                                Exporter photos
                              </button>
                            }
                          </tui-data-list>
                        </ng-template>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
              
              <!-- Pagination -->
              <div class="p-4 border-t">
                <tui-pagination
                  [length]="totalPages()"
                  [index]="currentPage()"
                  (indexChange)="onPageChange($event)"
                ></tui-pagination>
              </div>
            </div>
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
export class HistoryComponent implements OnInit {
  private sessionService = inject(SessionService);

  loading = signal(true);
  sessions = signal<any[]>([]);
  currentPage = signal(0);
  pageSize = 10;
  dropdownOpen = false;

  columns = ['date', 'status', 'progress', 'notes', 'actions'];
  formatDate = formatDate;

  totalPages = signal(1);
  paginatedSessions = signal<any[]>([]);

  ngOnInit(): void {
    this.loadSessions();
  }

  private async loadSessions(): Promise<void> {
    try {
      this.loading.set(true);
      const sessions = await this.sessionService.getSessions(100).toPromise();
      this.sessions.set(sessions || []);
      this.updatePagination();
    } catch (error) {
      console.error('Erreur chargement sessions:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private updatePagination(): void {
    const allSessions = this.sessions();
    const total = Math.ceil(allSessions.length / this.pageSize);
    this.totalPages.set(total);
    
    const start = this.currentPage() * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedSessions.set(allSessions.slice(start, end));
  }

  onPageChange(index: number): void {
    this.currentPage.set(index);
    this.updatePagination();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      EN_COURS: 'En cours',
      COMPLETEE: 'Complétée',
      INCOMPLETE: 'Incomplète',
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      EN_COURS: 'warning',
      COMPLETEE: 'success',
      INCOMPLETE: 'error',
    };
    return colors[status] || 'neutral';
  }

  getProgressPercentage(session: any): number {
    if (!session.totalTasks || session.totalTasks === 0) return 0;
    return Math.round((session.completedTasks / session.totalTasks) * 100);
  }

  async exportPDF(session: any): Promise<void> {
    this.dropdownOpen = false;
    await this.sessionService.exportSessionPDF(session.id);
  }

  async exportPhotos(session: any): Promise<void> {
    this.dropdownOpen = false;
    await this.sessionService.exportSessionPhotos(session.id);
  }
}