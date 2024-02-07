import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ConfigService } from './config.service';
import { AppStorageService } from './local-storage.service';
import { AuthService } from './auth.service';
declare var $: any;
@Injectable({
  providedIn: 'root'
})
export class ServiceWorkerService {

  constructor(private swUpdate: SwUpdate, private auth: AuthService, private conf: ConfigService, private store: AppStorageService) { }

  registerServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/ngsw-worker.js')
        .then(registration => {
          // console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          // console.error('Service Worker registration failed:', error);
        });
    }
  }

  checkForUpdates(modalId: string): void {
    if (this.swUpdate.isEnabled) {
      // interval(60000).subscribe(() => { this.swUpdate.checkForUpdate().then(() => {}); });
      this.swUpdate.available.subscribe(event => {
        this.activateUpdate(modalId);
      });
    }
  }

  UpdateVersion() {
    this.conf.appVersion().subscribe((newVersion: any) => {
      const user = this.auth.currentUser();
      if (user) {
        return this.store.set('appVersion', newVersion, user.useLocalStorage);
      }
    }, (err: any) => { console.log(err.toString()) });
  }

  activateUpdate(modalId: string): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.activateUpdate().then(() => {
        $('#' + modalId).trigger('click');
      });
    }
  }

  unregisterServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }
  }
}
