import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

// Taiga UI
import { TuiRootModule, TuiDialogModule, TuiAlertModule } from '@taiga-ui/core';

// Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

// Environnement et routes
import { environment } from '../environments/environment';
import { routes } from './app.routes';

// Interceptors
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { offlineInterceptor } from './core/interceptors/offline.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Router avec les nouvelles fonctionnalités
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions()
    ),
    
    // Animations pour Taiga UI
    provideAnimations(),
    
    // HTTP avec interceptors
    provideHttpClient(
      withInterceptors([authInterceptor, offlineInterceptor])
    ),
    
    // Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    
    // Service Worker pour PWA
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    
    // Taiga UI modules globaux
    importProvidersFrom(TuiRootModule, TuiDialogModule, TuiAlertModule),
  ]
};