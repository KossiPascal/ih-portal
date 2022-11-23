import { Injectable } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';

function promptUser(event: VersionEvent): boolean {
  return true;
}

// #docregion sw-activate
@Injectable()
export class PromptUpdateService {

  constructor(updates: SwUpdate) {
    updates.versionUpdates.subscribe(event => {
      if (promptUser(event)) {
        updates.activateUpdate().then(() => document.location.reload());
      }
    });
  }
}
// #enddocregion sw-activate