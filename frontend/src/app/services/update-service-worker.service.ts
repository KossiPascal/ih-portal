/*
Handles service worker updates
*/
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UpdateServiceWorkerService {
  private readonly retryFailedUpdateAfterSec = 5 * 60;
  private existingUpdateLoop?: any;

  constructor() { }

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







  // private async checkForUpdates() {
  //   console.log('Service Worker is Enable: ', this.sw.isEnabled);
  //   if (this.sw.isEnabled && this.auth.isLoggedIn() && this.checkForAppNewVersion) this.checkForAvailableVersion();
  //   interval(30000)
  //     .pipe(takeWhile(() => this.sw.isEnabled && this.auth.isLoggedIn() && this.checkForAppNewVersion))
  //     .subscribe(() => {
  //       this.sw.checkForUpdate().then((updateFound) => {
  //         this.isAppUpdateFound = updateFound;
  //         if (updateFound) this.checkForAvailableVersion();
  //       });
  //     });
  // }

  // private checkForAvailableVersion(): void {
  //   this.sw.activateUpdate().then((activate) => {
  //     if (activate) {
  //       this.sw.versionUpdates.subscribe(evt => {
  //         switch (evt.type) {
  //           case 'VERSION_DETECTED':
  //             // console.log(`Downloading new app version: ${evt.version.hash}`);
  //             this.ShowUpdateVersionModal();
  //             break;
  //           case 'VERSION_READY':
  //             // console.log(`Current app version: ${evt.currentVersion.hash}`);
  //             // console.log(`Last app version: ${evt.latestVersion.hash}`);
  //             break;
  //           case 'NO_NEW_VERSION_DETECTED':
  //             // console.log(`Current app version: '${evt.version.hash}'`);
  //             break;
  //           case 'VERSION_INSTALLATION_FAILED':
  //             // console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
  //             break;
  //         }
  //       });
  //     } else {
  //       // console.log('Service Worker for Update is Inactive');
  //     }
  //   });
  // }

}
