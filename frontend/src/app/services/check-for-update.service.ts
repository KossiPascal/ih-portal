import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CheckForUpdateService {

    constructor(private appRef: ApplicationRef, private sw: SwUpdate) {

    }

    SwUpdate(){
        // Allow the app to stabilize first, before starting
        // polling for updates with `interval()`.
        const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
        const everySixHours$ = interval(6 * 60 * 60 * 1000);
        const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

        everySixHoursOnceAppIsStable$.subscribe(async () => {
            try {
                this.sw.available.subscribe(event => {
                    console.log('current version is', event.current);
                    console.log('available version is', event.available);
                });
                this.sw.activated.subscribe(event => {
                    console.log('old version was', event.previous);
                    console.log('new version is', event.current);
                });
        
                this.sw.versionUpdates.subscribe(evt => {
                    switch (evt.type) {
                        case 'VERSION_DETECTED':
                            console.log(`Downloading new app version: ${evt.version.hash}`);
                            break;
                        case 'VERSION_READY':
                            console.log(`Current app version: ${evt.currentVersion.hash}`);
                            console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
                            break;
                        case 'VERSION_INSTALLATION_FAILED':
                            console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
                            break;
                    }
                });
                
                const updateFound = await this.sw.checkForUpdate();
                console.log(updateFound ? 'A new version is available.' : 'Already on the latest version.');
            } catch (err) {
                console.error('Failed to check for updates:', err);
            }
        });


        
    }


}


