import { Injectable } from '@angular/core';
import { ScriptStore, StyleStore } from './script.store';

@Injectable({
  providedIn: 'root'
})
export class ScriptLoaderService {

  private scripts: any = {};
  private styles: any = {};

  constructor() {
    ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src
      };
    });

    StyleStore.forEach((script: any) => {
      this.styles[script.name] = {
        loaded: false,
        src: script.src
      };
    });
  }

  load(...scripts: string[]) {
    var promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }

  loadStyles(...scripts: string[]) {
    var promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadStyle(script)));
    return Promise.all(promises);
  }

  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      //resolve if already loaded
      if (this.scripts[name].loaded) {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      }
      else {
        //load script
        let script = document.createElement('script') as any;
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        if (script.readyState) {  //IE
          script.onreadystatechange = () => {
            if (script.readyState === "loaded" || script.readyState === "complete") {
              script.onreadystatechange = null;
              this.scripts[name].loaded = true;
              resolve({ script: name, loaded: true, status: 'Loaded' });
            }
          };
        } else {  //Others
          script.onload = () => {
            this.scripts[name].loaded = true;
            resolve({ script: name, loaded: true, status: 'Loaded' });
          };
        }
        script.onerror = (error: any) => resolve({ script: name, loaded: false, status: 'Loaded' });
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    });
  }

  loadStyle(name: string) {
    return new Promise((resolve, reject) => {
      //resolve if already loaded
      if (this.styles[name].loaded) {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      }
      else {
        //load style
        let style = document.createElement('link') as any;
        style.type = "text/css";
        style.rel = "stylesheet";
        style.href = this.styles[name].src;
        if (style.readyState) {  //IE
          style.onreadystatechange = () => {
            if (style.readyState === "loaded" || style.readyState === "complete") {
              style.onreadystatechange = null;
              this.styles[name].loaded = true;
              resolve({ style: name, loaded: true, status: 'Loaded' });
            }
          };
        } else {  //Others
          style.onload = () => {
            this.styles[name].loaded = true;
            resolve({ style: name, loaded: true, status: 'Loaded' });
          };
        }
        style.onerror = (error: any) => resolve({ style: name, loaded: false, status: 'Loaded' });
        document.getElementsByTagName('head')[0].appendChild(style);
      }
    });
  }

}