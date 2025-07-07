import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { TuiAlertService, TuiNotification } from '@taiga-ui/core';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private api = inject(ApiService);
  private alerts = inject(TuiAlertService);

  async downloadSessionPDF(sessionId: string): Promise<void> {
    try {
      this.alerts.open('Génération du PDF en cours...', {
        status: TuiNotification.Info,
      }).subscribe();

      // Déclencher la génération
      const response = await this.api.post<{ exportId: string }>(
        `/exports/pdf/${sessionId}`,
        {}
      ).toPromise();

      // Attendre un peu que le PDF soit généré
      setTimeout(async () => {
        const blob = await this.downloadFile(response.exportId);
        const date = new Date().toISOString().split('T')[0];
        saveAs(blob, `rapport-nettoyage-${date}.pdf`);
        
        this.alerts.open('PDF téléchargé avec succès', {
          status: TuiNotification.Success,
        }).subscribe();
      }, 3000);
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      this.alerts.open('Erreur lors du téléchargement', {
        status: TuiNotification.Error,
      }).subscribe();
    }
  }

  async downloadSessionPhotos(sessionId: string): Promise<void> {
    try {
      this.alerts.open('Préparation des photos...', {
        status: TuiNotification.Info,
      }).subscribe();

      const response = await this.api.post<{ exportId: string }>(
        `/exports/zip/${sessionId}`,
        {}
      ).toPromise();

      setTimeout(async () => {
        const blob = await this.downloadFile(response.exportId);
        const date = new Date().toISOString().split('T')[0];
        saveAs(blob, `photos-nettoyage-${date}.zip`);
        
        this.alerts.open('Photos téléchargées avec succès', {
          status: TuiNotification.Success,
        }).subscribe();
      }, 3000);
    } catch (error) {
      console.error('Erreur téléchargement photos:', error);
      this.alerts.open('Erreur lors du téléchargement', {
        status: TuiNotification.Error,
      }).subscribe();
    }
  }

  private async downloadFile(exportId: string): Promise<Blob> {
    const response = await fetch(`${this.api.baseUrl}/exports/${exportId}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erreur téléchargement');
    }
    
    return response.blob();
  }
}