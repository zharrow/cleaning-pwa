import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButtonModule } from '@taiga-ui/core';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule, TuiButtonModule],
  template: `
    @if (showPrompt() && deferredPrompt) {
      <div class="install-prompt animate-fade-in">
        <div class="flex items-center gap-3">
          <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          <div class="flex-1">
            <p class="font-medium">Installer l'application</p>
            <p class="text-sm text-gray-600">Accès rapide depuis votre écran d'accueil</p>
          </div>
          <button tuiButton size="s" (click)="installPWA()">
            Installer
          </button>
          <button tuiButton size="s" appearance="flat" (click)="dismissPrompt()">
            Plus tard
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .install-prompt {
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      max-width: 500px;
      margin: 0 auto;
    }
    
    @media (min-width: 768px) {
      .install-prompt {
        left: auto;
        right: 20px;
        width: 400px;
      }
    }
  `]
})
export class InstallPromptComponent implements OnInit {
  showPrompt = signal(false);
  deferredPrompt: any;

  ngOnInit(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      
      // Afficher le prompt après un délai
      setTimeout(() => {
        if (!localStorage.getItem('install_prompt_dismissed')) {
          this.showPrompt.set(true);
        }
      }, 30000); // 30 secondes
    });
  }

  async installPWA(): Promise<void> {
    if (!this.deferredPrompt) return;
    
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ PWA installation acceptée');
    } else {
      console.log('❌ PWA installation refusée');
    }
    
    this.deferredPrompt = null;
    this.showPrompt.set(false);
  }

  dismissPrompt(): void {
    localStorage.setItem('install_prompt_dismissed', 'true');
    this.showPrompt.set(false);
  }
}