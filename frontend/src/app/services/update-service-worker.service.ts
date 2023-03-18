/*
Handles service worker updates
*/
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { interval, takeWhile } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UpdateServiceWorkerService {
  private readonly retryFailedUpdateAfterSec = 5 * 60;
  private existingUpdateLoop?: any;

  constructor(private auth: AuthService, private router: Router, private sw: SwUpdate) { }

  update(onSuccess: any) {
    // This avoids multiple updates retrying in parallel
    if (this.existingUpdateLoop) {
      clearTimeout(this.existingUpdateLoop);
      this.existingUpdateLoop = undefined;
    }

    window.navigator.serviceWorker.getRegistrations()
      .then((registrations) => {
        const registration = registrations && registrations.length && registrations[0];
        if (!registration) {
          console.warn('Cannot update service worker - no active workers found');
          return;
        }

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker != null) {
            installingWorker.onstatechange = () => {
              switch (installingWorker.state) {
                case 'activated':
                  registration.onupdatefound = null;
                  onSuccess();
                  break;
                case 'redundant':
                  console.warn(
                    'Service worker failed to install or marked as redundant. ' +
                    `Retrying install in ${this.retryFailedUpdateAfterSec}secs.`
                  );
                  this.existingUpdateLoop = setTimeout(() => this.update(onSuccess), this.retryFailedUpdateAfterSec * 1000);
                  registration.onupdatefound = null;
                  break;
                default:
                  console.debug(`Service worker state changed to ${installingWorker.state}!`);
              }
            };
          }
        };

        registration.update();
      });
  }


  checkForAppNewVersion: boolean = true;
  isAppUpdateFound:boolean = false;
  
  private async checkForUpdates(onSuccess: any) {
    console.log('Service Worker is Enable: ', this.sw.isEnabled);
    if (this.sw.isEnabled && this.auth.isLoggedIn() && this.checkForAppNewVersion) this.checkForAvailableVersion(onSuccess);
    interval(30000)
      .pipe(takeWhile(() => this.sw.isEnabled && this.auth.isLoggedIn() && this.checkForAppNewVersion))
      .subscribe(() => {
        this.sw.checkForUpdate().then((updateFound) => {
          this.isAppUpdateFound = updateFound;
          if (updateFound) this.checkForAvailableVersion(onSuccess);
        });
      });
  }

  private checkForAvailableVersion(onSuccess: any): void {
    this.sw.activateUpdate().then((activate) => {
      if (activate) {
        this.sw.versionUpdates.subscribe(evt => {
          switch (evt.type) {
            case 'VERSION_DETECTED':
              // console.log(`Downloading new app version: ${evt.version.hash}`);
              onSuccess();
              break;
            case 'VERSION_READY':
              // console.log(`Current app version: ${evt.currentVersion.hash}`);
              // console.log(`Last app version: ${evt.latestVersion.hash}`);
              break;
            case 'NO_NEW_VERSION_DETECTED':
              // console.log(`Current app version: '${evt.version.hash}'`);
              break;
            case 'VERSION_INSTALLATION_FAILED':
              // console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
              break;
          }
        });
      } else {
        // console.log('Service Worker for Update is Inactive');
      }
    });
  }

}
