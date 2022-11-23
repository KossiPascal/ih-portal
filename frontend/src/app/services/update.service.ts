import { Injectable } from '@angular/core';
import { filter, interval, map } from 'rxjs';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';


@Injectable({
    providedIn: "root",
})
export class UpdateService {
    constructor(private swUpdate: SwUpdate) {
        // this.swUpdate.available.subscribe(evt => {
        // });
        if (!this.swUpdate.isEnabled) {
            this.swUpdate.versionUpdates.pipe(filter((evt: any): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
              .subscribe(evt => { document.location.reload(); }),
              map((evt: any) => {
                console.info(`currentVersion=[${evt.currentVersion} | latestVersion=[${evt.latestVersion}]`);
                this.getMsg('onlinemsg');
              });
              interval(6000).subscribe(() => this.swUpdate.checkForUpdate()
              .then(() => {window.location.reload(); console.log('checking for updates')}));
          } else {
            console.log('Nope 🙁');
          }
    }

    public checkForUpdates(): void {
      this.swUpdate.available.subscribe(event => this.promptUser());
    }
  
    private promptUser(): void {
      console.log('updating to new version');
      this.swUpdate.activateUpdate().then(() => document.location.reload()); 
    }

    // function msg
    getMsg(msgClass: string) {
        let element = document.querySelector('.' + msgClass)!;
        element.className += " movedown";
        setTimeout(() => {
        element.classList.forEach(classname => {
            classname == "movedown" ? undefined : element.classList.remove('movedown');
        })
        }, 4000);
    }
}
