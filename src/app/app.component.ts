import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TuiRootModule } from '@taiga-ui/core';
import { OfflineIndicatorComponent } from './shared/components/offline-indicator/offline-indicator.component';
import { UpdatePromptComponent } from './shared/components/update-prompt/update-prompt.component';
import { NetworkService } from './core/services/network.service';
import { SwUpdateService } from './core/services/sw-update.service';
import { SyncService } from './core/services/sync.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TuiRootModule,
    OfflineIndicatorComponent,
    UpdatePromptComponent,
  ],
  template: `
    <tui-root>
      <router-outlet />
      <app-offline-indicator />
      <app-update-prompt />
    </tui-root>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `],
})
export class AppComponent implements OnInit {
  private networkService = inject(NetworkService);
  private swUpdateService = inject(SwUpdateService);
  private syncService = inject(SyncService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    // Initialiser les services globaux
    this.networkService.initialize();
    this.swUpdateService.initialize();
    this.syncService.initialize();
    
    // Demander la permission pour les notifications (optionnel)
    // this.notificationService.requestPermission();
    
    // Détection de l'installation PWA
    this.detectPWAInstallation();
  }

  private detectPWAInstallation(): void {
    // Détecter si l'app est installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('🎉 App installée en mode PWA');
      
      // Tracker l'installation
      if (!localStorage.getItem('pwa_installed')) {
        localStorage.setItem('pwa_installed', 'true');
        localStorage.setItem('pwa_install_date', new Date().toISOString());
      }
    }

    // Écouter l'événement d'installation
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installée avec succès');
    });
  }
}