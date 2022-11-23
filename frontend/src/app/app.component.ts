import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map, takeWhile } from 'rxjs/operators';
import { AuthService } from '@ih-services/auth.service';
import { Platform } from '@angular/cdk/platform';
import { Title } from '@angular/platform-browser';
import { TitleService } from '@ih-services/title.service';
import { interval, Observable } from 'rxjs';
import { SyncService } from './services/sync.service';
import { Chws, Sites } from './models/Sync';
import { IndexDbService } from './services/index-db.service';
import { UpdateService } from './services/update.service';

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
  modalPwaEvent: any;
  modalPwaPlatform: string | undefined;
  isAdmin: boolean = false;
  time: number = 0;
  localSync: string = '';


  constructor(private sw: UpdateService, private platform: Platform, private sync: SyncService, private auth: AuthService, private router: Router, private swUpdate: SwUpdate, private titleService: TitleService, private activatedRoute: ActivatedRoute) {
    this.isAuthenticated = this.auth.isLoggedIn();
    this.isOnline = false;
    this.modalVersion = false;
    this.sw.checkForUpdates();

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

  private updateOnlineStatus(): void {
    this.isOnline = window.navigator.onLine;
    console.info(`isOnline=[${this.isOnline}]`);
  }

  public updateVersion(): void {
    this.modalVersion = false;
    window.location.reload();
  }

  public closeVersion(): void {
    this.modalVersion = false;
    this.getMsg('offlinemsg');
  }

  private loadModalPwa(): void {
    if (this.platform.ANDROID) {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        this.modalPwaEvent = event;
        this.modalPwaPlatform = 'ANDROID';
      });
    }

    if (this.platform.IOS && this.platform.SAFARI) {
      const isInStandaloneMode = ('standalone' in window.navigator) && ((<any>window.navigator)['standalone']);
      if (!isInStandaloneMode) {
        this.modalPwaPlatform = 'IOS';
      }
    }
  }

  public addToHomeScreen(): void {
    this.modalPwaEvent.prompt();
    this.modalPwaPlatform = undefined;
  }

  public closePwa(): void {
    this.modalPwaPlatform = undefined;
  }

  logout() {
    this.auth.logout();
  }

  updateCheck(): void {
    this.swUpdate
      .checkForUpdate()
      .then(() => this.updateCheckText = 'resolved')
      .catch(err => this.updateCheckText = `rejected: ${err.message}`);
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