import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  TuiButtonModule,
  TuiSvgModule,
} from '@taiga-ui/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TuiButtonModule,
    TuiSvgModule,
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
              <h1 class="text-xl font-semibold">Administration</h1>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenu -->
      <main class="container-app py-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Pièces -->
          <a
            routerLink="/admin/rooms"
            class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg">Pièces</h3>
                <p class="text-gray-600">Gérer les pièces à nettoyer</p>
              </div>
            </div>
            <button tuiButton size="s" appearance="secondary" class="w-full">
              Gérer les pièces
              <tui-svg src="tuiIconArrowRight" class="ml-2"></tui-svg>
            </button>
          </a>

          <!-- Tâches -->
          <a
            routerLink="/admin/tasks"
            class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg">Tâches</h3>
                <p class="text-gray-600">Configurer les tâches de nettoyage</p>
              </div>
            </div>
            <button tuiButton size="s" appearance="secondary" class="w-full">
              Gérer les tâches
              <tui-svg src="tuiIconArrowRight" class="ml-2"></tui-svg>
            </button>
          </a>

          <!-- Exécutants -->
          <a
            routerLink="/admin/performers"
            class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg">Exécutants</h3>
                <p class="text-gray-600">Gérer le personnel de nettoyage</p>
              </div>
            </div>
            <button tuiButton size="s" appearance="secondary" class="w-full">
              Gérer les exécutants
              <tui-svg src="tuiIconArrowRight" class="ml-2"></tui-svg>
            </button>
          </a>
        </div>

        <!-- Section stats -->
        <div class="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold mb-4">Statistiques rapides</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="text-center">
              <p class="text-3xl font-bold text-blue-600">5</p>
              <p class="text-gray-600">Pièces actives</p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-green-600">12</p>
              <p class="text-gray-600">Tâches configurées</p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-purple-600">3</p>
              <p class="text-gray-600">Exécutants</p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-orange-600">30</p>
              <p class="text-gray-600">Sessions ce mois</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminDashboardComponent {}

// Exemple simple pour un des composants admin (les autres suivront le même pattern)