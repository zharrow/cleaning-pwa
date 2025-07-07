import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TuiButtonModule,
  TuiDialogModule,
  TuiDialogService,
  TuiNotification,
  TuiAlertService,
} from '@taiga-ui/core';
import {
  TuiTableModule,
  TuiToggleModule,
  TuiInputModule,
} from '@taiga-ui/kit';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-performers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiButtonModule,
    TuiDialogModule,
    TuiTableModule,
    TuiToggleModule,
    TuiInputModule,
    LoadingSpinnerComponent,
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
                routerLink="/admin"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Retour
              </button>
              <h1 class="text-xl font-semibold">Gestion des exécutants</h1>
            </div>
            <button
              tuiButton
              size="m"
              (click)="openAddDialog()"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Ajouter un exécutant
            </button>
          </div>
        </div>
      </header>

      <!-- Contenu -->
      <main class="container-app py-6">
        @if (loading()) {
          <app-loading-spinner text="Chargement des exécutants..." />
        } @else {
          <div class="bg-white rounded-lg shadow-sm">
            <table tuiTable [columns]="columns" class="w-full">
              <thead>
                <tr tuiThGroup>
                  <th *tuiHead="'name'" tuiTh>Nom</th>
                  <th *tuiHead="'status'" tuiTh>Statut</th>
                  <th *tuiHead="'actions'" tuiTh [sorter]="null">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (performer of performers(); track performer.id) {
                  <tr tuiTr>
                    <td *tuiCell="'name'" tuiTd>
                      {{ performer.name }}
                    </td>
                    <td *tuiCell="'status'" tuiTd>
                      <tui-toggle
                        [ngModel]="performer.isActive"
                        (ngModelChange)="toggleStatus(performer)"
                      >
                        {{ performer.isActive ? 'Actif' : 'Inactif' }}
                      </tui-toggle>
                    </td>
                    <td *tuiCell="'actions'" tuiTd>
                      <button
                        tuiButton
                        appearance="flat"
                        size="s"
                        (click)="openEditDialog(performer)"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Dialog d'ajout/modification -->
        <ng-template #performerDialog let-observer>
          <form [formGroup]="performerForm" (ngSubmit)="savePerformer(observer)">
            <h3 class="text-lg font-semibold mb-4">
              {{ editingPerformer() ? 'Modifier' : 'Ajouter' }} un exécutant
            </h3>
            
            <div class="mb-4">
              <tui-input
                formControlName="name"
                [tuiTextfieldLabelOutside]="true"
              >
                Nom complet
                <input tuiTextfield placeholder="Ex: Marie Dupont" />
              </tui-input>
            </div>

            <div class="flex gap-3 justify-end">
              <button
                tuiButton
                type="button"
                appearance="flat"
                (click)="observer.complete()"
              >
                Annuler
              </button>
              <button
                tuiButton
                type="submit"
                [disabled]="performerForm.invalid || saving()"
                [showLoader]="saving()"
              >
                {{ editingPerformer() ? 'Modifier' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </ng-template>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PerformersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogs = inject(TuiDialogService);
  private alerts = inject(TuiAlertService);

  loading = signal(true);
  saving = signal(false);
  performers = signal<any[]>([]);
  editingPerformer = signal<any>(null);

  columns = ['name', 'status', 'actions'];

  performerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    this.loadPerformers();
  }

  private async loadPerformers(): Promise<void> {
    try {
      this.loading.set(true);
      // TODO: Appeler l'API
      this.performers.set([
        { id: '1', name: 'Marie Dupont', isActive: true },
        { id: '2', name: 'Jean Martin', isActive: true },
        { id: '3', name: 'Sophie Leroux', isActive: false },
      ]);
    } catch (error) {
      console.error('Erreur chargement performers:', error);
    } finally {
      this.loading.set(false);
    }
  }

  openAddDialog(): void {
    this.editingPerformer.set(null);
    this.performerForm.reset();
    this.dialogs.open(this.performerDialog).subscribe();
  }

  openEditDialog(performer: any): void {
    this.editingPerformer.set(performer);
    this.performerForm.patchValue({
      name: performer.name,
    });
    this.dialogs.open(this.performerDialog).subscribe();
  }

  async savePerformer(observer: any): Promise<void> {
    if (this.performerForm.invalid) return;

    try {
      this.saving.set(true);
      const data = this.performerForm.value;
      
      if (this.editingPerformer()) {
        // TODO: API update
        console.log('Update performer:', this.editingPerformer().id, data);
      } else {
        // TODO: API create
        console.log('Create performer:', data);
      }

      await this.loadPerformers();
      observer.complete();
      
      this.alerts.open(
        this.editingPerformer() ? 'Exécutant modifié' : 'Exécutant ajouté',
        { status: TuiNotification.Success }
      ).subscribe();
    } catch (error) {
      console.error('Erreur sauvegarde performer:', error);
      this.alerts.open('Erreur lors de la sauvegarde', {
        status: TuiNotification.Error,
      }).subscribe();
    } finally {
      this.saving.set(false);
    }
  }

  async toggleStatus(performer: any): Promise<void> {
    try {
      performer.isActive = !performer.isActive;
      // TODO: API call
      console.log('Toggle status:', performer.id, performer.isActive);
    } catch (error) {
      console.error('Erreur changement statut:', error);
      performer.isActive = !performer.isActive; // Rollback
    }
  }

  performerDialog!: any;
}