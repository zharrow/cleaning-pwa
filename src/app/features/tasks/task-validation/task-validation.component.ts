import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TuiButtonModule,
  TuiTextfieldControllerModule,
  TuiHintModule,
  TuiSvgModule,
} from '@taiga-ui/core';
import {
  TuiSelectModule,
  TuiTextareaModule,
  TuiFileLikeModule,
  TuiInputFilesModule,
} from '@taiga-ui/kit';
import { TaskStatus } from '../../../core/models';

@Component({
  selector: 'app-task-validation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiButtonModule,
    TuiSelectModule,
    TuiTextareaModule,
    TuiTextfieldControllerModule,
    TuiHintModule,
    TuiSvgModule,
    TuiFileLikeModule,
    TuiInputFilesModule,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="space-y-4">
        <!-- Sélection du performer -->
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">
            Exécutant
          </label>
          <tui-select
            formControlName="performerId"
            [tuiTextfieldLabelOutside]="true"
          >
            Choisir l'exécutant
            <tui-data-list-wrapper
              *tuiDataList
              [items]="performers"
              [itemContent]="performerContent"
            ></tui-data-list-wrapper>
          </tui-select>
        </div>

        <!-- Statut -->
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">
            Statut
          </label>
          <div class="grid grid-cols-2 gap-2">
            @for (status of statuses; track status.value) {
              <button
                type="button"
                [class.active]="form.value.status === status.value"
                (click)="setStatus(status.value)"
                class="status-button"
                [class.status-fait]="status.value === 'FAIT'"
                [class.status-partiel]="status.value === 'PARTIEL'"
                [class.status-reporte]="status.value === 'REPORTE'"
                [class.status-impossible]="status.value === 'IMPOSSIBLE'"
              >
                {{ status.label }}
              </button>
            }
          </div>
        </div>

        <!-- Notes (optionnel) -->
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">
            Notes (optionnel)
          </label>
          <tui-textarea
            formControlName="notes"
            [rows]="3"
            placeholder="Ajouter un commentaire..."
          ></tui-textarea>
        </div>

        <!-- Photos (optionnel) -->
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">
            Photos (optionnel)
          </label>
          <tui-input-files
            formControlName="photos"
            accept="image/*"
            [multiple]="true"
            [maxFileSize]="10 * 1024 * 1024"
          ></tui-input-files>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <button
            tuiButton
            type="submit"
            appearance="primary"
            [disabled]="form.invalid || loading"
            [showLoader]="loading"
          >
            Valider
          </button>
          <button
            tuiButton
            type="button"
            appearance="flat"
            (click)="cancel.emit()"
          >
            Annuler
          </button>
        </div>
      </div>
    </form>

    <ng-template #performerContent let-item>
      {{ item.name }}
    </ng-template>
  `,
  styles: [`
    .status-button {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      background: white;
      font-weight: 500;
      transition: all 0.2s;
      
      &:hover {
        background: #f9fafb;
      }
      
      &.active {
        border-color: currentColor;
        background: currentColor;
        color: white;
      }
      
      &.status-fait { color: #059669; }
      &.status-partiel { color: #f59e0b; }
      &.status-reporte { color: #6366f1; }
      &.status-impossible { color: #ef4444; }
    }
  `]
})
export class TaskValidationComponent {
  @Input() task: any;
  @Input() performers: any[] = [];
  @Input() loading = false;
  @Output() validate = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  statuses = [
    { value: TaskStatus.FAIT, label: 'Fait' },
    { value: TaskStatus.PARTIEL, label: 'Partiel' },
    { value: TaskStatus.REPORTE, label: 'Reporté' },
    { value: TaskStatus.IMPOSSIBLE, label: 'Impossible' },
  ];

  form = this.fb.group({
    performerId: ['', Validators.required],
    status: [TaskStatus.FAIT, Validators.required],
    notes: [''],
    photos: [[]],
  });

  ngOnInit(): void {
    if (this.task?.defaultPerformer) {
      this.form.patchValue({
        performerId: this.task.defaultPerformer.id,
      });
    }
  }

  setStatus(status: TaskStatus): void {
    this.form.patchValue({ status });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.validate.emit(this.form.value);
  }
}