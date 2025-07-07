import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  TuiButtonModule, 
  TuiErrorModule, 
  TuiTextfieldControllerModule,
  TuiNotification,
  TuiAlertService
} from '@taiga-ui/core';
import { 
  TuiInputModule, 
  TuiInputPasswordModule,
  TuiFieldErrorPipeModule 
} from '@taiga-ui/kit';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiButtonModule,
    TuiInputModule,
    TuiInputPasswordModule,
    TuiErrorModule,
    TuiTextfieldControllerModule,
    TuiFieldErrorPipeModule,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-primary-100">
            <svg class="h-12 w-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Nettoyage Micro-Crèche
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Connectez-vous pour accéder à l'application
          </p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="space-y-4">
            <div>
              <tui-input
                formControlName="email"
                [tuiTextfieldCleaner]="true"
                [tuiTextfieldLabelOutside]="true"
                [tuiAutoFocus]="true"
              >
                Email
                <input
                  tuiTextfield
                  type="email"
                  placeholder="email@example.com"
                />
              </tui-input>
              <tui-error
                formControlName="email"
                [error]="'Email requis' | tuiFieldError | async"
              ></tui-error>
            </div>

            <div>
              <tui-input-password
                formControlName="password"
                [tuiTextfieldLabelOutside]="true"
              >
                Mot de passe
                <input
                  tuiTextfield
                  type="password"
                  placeholder="••••••••"
                />
              </tui-input-password>
              <tui-error
                formControlName="password"
                [error]="'Mot de passe requis' | tuiFieldError | async"
              ></tui-error>
            </div>
          </div>

          @if (error()) {
            <div class="rounded-md bg-red-50 p-4">
              <p class="text-sm text-red-800">{{ error() }}</p>
            </div>
          }

          <div>
            <button
              tuiButton
              type="submit"
              size="l"
              [showLoader]="loading()"
              [disabled]="loading() || loginForm.invalid"
              class="w-full"
            >
              Se connecter
            </button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Mode démo : utilisez les identifiants fournis
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alerts = inject(TuiAlertService);

  loading = signal(false);
  error = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.loginForm.value;

    try {
      await this.authService.login(email!, password!);
      
      this.alerts.open('Connexion réussie !', {
        status: TuiNotification.Success,
      }).subscribe();
    } catch (error: any) {
      console.error('Erreur connexion:', error);
      
      let message = 'Erreur de connexion';
      if (error.code === 'auth/user-not-found') {
        message = 'Utilisateur non trouvé';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Mot de passe incorrect';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Email invalide';
      }
      
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}