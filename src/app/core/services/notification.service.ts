import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { ApiService } from './api.service';
import { TuiAlertService, TuiNotification } from '@taiga-ui/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private swPush = inject(SwPush);
  private api = inject(ApiService);
  private alerts = inject(TuiAlertService);

  async requestPermission(): Promise<void> {
    if (!('Notification' in window)) {
      console.log('Ce navigateur ne supporte pas les notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notifications autorisées');
      await this.subscribeToNotifications();
    } else {
      console.log('❌ Notifications refusées');
    }
  }

  private async subscribeToNotifications(): Promise<void> {
    if (!this.swPush.isEnabled) {
      return;
    }

    try {
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: 'YOUR_VAPID_PUBLIC_KEY'
      });
      
      // Envoyer la subscription au backend
      await this.api.post('/notifications/subscribe', sub.toJSON()).toPromise();
      
      this.alerts.open('Notifications activées', {
        status: TuiNotification.Success,
      }).subscribe();
    } catch (err) {
      console.error('Erreur subscription notifications:', err);
    }
  }

  async showLocalNotification(title: string, body: string, data?: any): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-96x96.png',
      vibrate: [200, 100, 200],
      data,
      requireInteraction: false,
      actions: [
        { action: 'view', title: 'Voir' },
        { action: 'dismiss', title: 'Ignorer' }
      ]
    });

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();
      
      if (data?.url) {
        window.location.href = data.url;
      }
    };
  }
}