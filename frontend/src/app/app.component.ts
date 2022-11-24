import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '@ih-services/auth.service';
import { Platform } from '@angular/cdk/platform';
import { TitleService } from '@ih-services/title.service';
import { interval } from 'rxjs';
import { SyncService } from './services/sync.service';
// import { UpdateService } from '../../../zfor_delete/update.service';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: `./app.component.html`,
  styleUrls: [`./app.component.css`]
})

export class AppComponent implements OnInit {

  isAuthenticated!: boolean;
  errorFound!: boolean;
  updateCheckText = '';
  isOnline!: boolean;
  modalVersion!: boolean;
  modalPwaEvent!: any;
  modalPwaPlatform: 'ios' | 'android' | undefined;
  isAdmin: boolean = false;
  time: number = 0;
  localSync: string = '';

  constructor(public translate: TranslateService, private platform: Platform, private sync: SyncService, private auth: AuthService, private router: Router, private swUpdate: SwUpdate, private titleService: TitleService, private activatedRoute: ActivatedRoute) {
    this.isAuthenticated = this.auth.isLoggedIn();
    this.isOnline = false;
    this.modalVersion = false;

    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('en');
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang?.match(/en|fr/) ? browserLang : 'en'); //this enabled setting lang automatically
    // translate.use('en');


    // this.updateService.checkForUpdates();

    interval(6000)
      // .pipe(takeWhile(() => this.isOnline))
      .subscribe(res => {
        if (this.isOnline) this.time++;
      })

    // if(this.auth.isLoggedIn()) this.sync.syncAllToLocalStorage();

  }

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    const appTitle = this.titleService.getTitle();
    this.localSync = this.sync.isLocalSyncSuccess() ? 'syncSuccess' : 'syncError'

    this.router
      .events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          const child = this.activatedRoute.firstChild;
          if (child) {
            if (child.snapshot.data['title']) {
              return child.snapshot.data['title'];
            }
          }
          return appTitle;
        })
      ).subscribe((ttl: string) => {
        this.titleService.setTitle(ttl);
      });

    this.getMsg('offlinemsg');
    this.errorFound = window.location.pathname.includes('errorFound/');
    this.isAuthenticated = this.auth.isLoggedIn();

    this.updateOnlineStatus();
    window.addEventListener('online', this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));
    this.loadModalPwa();
  }

  // updateCheck(): void {
  //   this.swUpdate
  //     .checkForUpdate()
  //     .then(() => { this.updateCheckText = 'resolved'; console.log('resolved') })
  //     .catch(err => { this.updateCheckText = `rejected: ${err.message}` })
  //     .finally(() => { console.log('finally') });
  // }

  private updateOnlineStatus(): void {
    this.isOnline = window.navigator.onLine;
    console.info(`isOnline=[${this.isOnline}]`);
  }

  public updateVersion(): void {
    this.modalVersion = false;
    this.updateCheckText = '';
    window.location.reload();
    document.location.reload();
  }

  public closeVersion(): void {
    this.modalVersion = false;
    this.updateCheckText = '';
    this.getMsg('offlinemsg');
  }


  private loadModalPwa(): void {
    if (!this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(filter((evt: any): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(evt => {
          this.modalVersion = true;
          this.updateCheckText = `${evt.currentVersion}`;
          // this.updateVersion(); 
          // console.info(`currentVersion=[${evt.currentVersion} | latestVersion=[${evt.latestVersion}]`);
          this.getMsg('onlinemsg');
        });
      // map((evt: any) => {
      //   console.info(`currentVersion=[${evt.currentVersion} | latestVersion=[${evt.latestVersion}]`);
      //   this.getMsg('onlinemsg');
      // });
      interval(6000).subscribe(() => this.swUpdate.checkForUpdate()
        .then(() => { window.location.reload(); console.log('checking for updates') }));
    } else {
      console.log('Nope 🙁');
    }

    if (this.platform.ANDROID) {
      window.addEventListener('beforeinstallprompt', (event:any) => {
        event.preventDefault();
        this.modalPwaEvent = event;
        this.modalPwaPlatform = 'android';
      });
    }

    if (this.platform.IOS && this.platform.SAFARI) {
      const isInStandaloneMode = ('standalone' in window.navigator) && ((<any>window.navigator)['standalone']);
      if (!isInStandaloneMode) {
        this.modalPwaPlatform = 'ios';
      }
    }
  }

  public addToHomeScreen(): void {
    this.modalPwaEvent?.prompt();
    this.modalPwaPlatform = undefined;
    this.updateVersion();
  }

  public closePwa(): void {
    this.modalPwaPlatform = undefined;
  }

  logout() {
    this.auth.logout();
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

// 
// warningMsg
// 


// this.getMsg('offlineMsg');