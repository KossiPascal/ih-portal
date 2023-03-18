import { Component, HostBinding, OnInit } from '@angular/core';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { filter, map, takeWhile } from 'rxjs/operators';
import { AuthService } from '@ih-services/auth.service';
import { Platform } from '@angular/cdk/platform';
import { TitleService } from '@ih-services/title.service';
import { interval, Subscription } from 'rxjs';
import { SyncService } from './services/sync.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from './services/config.service';
import { Roles } from './shared/roles';
import { User } from './models/User';
import { AppStorageService } from './services/cookie.service';
import { Chws } from './models/Sync';
import { UpdateServiceWorkerService } from './services/update-service-worker.service';

declare var $: any;
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

  appLogo: any = this.auth.appLogoPath()
  userData: User | null = this.auth.userValue()
  chwOU: Chws | null = null;
  checkForAppNewVersion: boolean = true;
  isAppUpdateFound:boolean = false;
 
  separation:string = '_____________________________________';

  @HostBinding('attr.app-version')
  appVersion: any;
  updateSubscription?: Subscription;

  constructor(private store: AppStorageService, private conf: ConfigService, public translate: TranslateService, private platform: Platform, private sync: SyncService, private auth: AuthService, private router: Router, private sw: UpdateServiceWorkerService, private titleService: TitleService, private activatedRoute: ActivatedRoute) {
    this.isAuthenticated = this.auth.isLoggedIn();
    this.isOnline = false;
    this.modalVersion = false;

    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('en');
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang?.match(/en|fr/) ? browserLang : 'en'); //this enabled setting lang automatically
    // translate.use('en');
    // this.updateService.checkForUpdates();
    // if(this.auth.isLoggedIn()) this.sync.syncAllToLocalStorage();

  }

  public roles = new Roles(this.store);

  ngOnInit(): void {
    this.chwOU = this.auth.chwsOrgUnit();
   this.UpdateVersion(false);
    const appTitle = this.titleService.getTitle();
    this.checkForAppNewVersion = true;

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
    this.errorFound = window.location.pathname.includes('error/');
    this.isAuthenticated = this.auth.isLoggedIn();

    this.updateOnlineStatus();
    window.addEventListener('online', this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));
    // this.checkForUpdates();

    this.sw.update(this.ShowUpdateVersionModal());
    this.appVersion = localStorage.getItem('appVersion');
  }

 
  clickModal(btnId: string) {
    $('#' + btnId).trigger('click');
  }

  ShowUpdateVersionModal() {
    this.checkForAppNewVersion = false;
    this.clickModal('active-update-modal')
  }

  UpdateVersion(reload:boolean = true) {
    this.conf.appVersion().subscribe((newVersion: any) => {
      if(reload)this.ShowUpdateVersionModal()
        localStorage.setItem('appVersion', newVersion);
        this.appVersion = newVersion;
        if(reload) this.clickModal('close-update-modal');
        if(reload) window.location.reload();
    }, (err: any) => { console.log(err.toString()) });
  }


  appVersionExist(): boolean {
    var nullField: any[] = [undefined, 'undefined', null, 'null', ''];
    return !nullField.includes(this.appVersion);
  }

  private updateOnlineStatus(): void {
    this.isOnline = window.navigator.onLine;
    console.info(`isOnline=[${this.isOnline}]`);
  }

  // private loadModalPwa(): void {
  //   if (this.platform.ANDROID) {
  //     window.addEventListener('beforeinstallprompt', (event: any) => {
  //       event.preventDefault();
  //       this.modalPwaEvent = event;
  //       this.modalPwaPlatform = 'android';
  //     });
  //   }

  //   if (this.platform.IOS && this.platform.SAFARI) {
  //     const isInStandaloneMode = ('standalone' in window.navigator) && ((<any>window.navigator)['standalone']);
  //     if (!isInStandaloneMode) {
  //       this.modalPwaPlatform = 'ios';
  //     }
  //   }
  // }

  public closeVersion(): void {
    this.modalVersion = false;
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


  // function msg
  getMsg(msgClass: string) {
    let element = document.querySelector('.' + msgClass)!;
    if (element != null) {
      element.className += " movedown";
      setTimeout(() => {
        element.classList.forEach(classname => {
          classname == "movedown" ? undefined : element.classList.remove('movedown');
        })
      }, 4000);
    }
  }


  pageTouched(event: Event) {
    const d1 = this.auth.getExpiration()?.toDate();
    const d2 = new Date();
    if (d1) {
      const d11 = d1.getTime();
      const d22 = d2.getTime();
      if ((d11 - 300000) < d22) { // avant 5 min d'action
        this.conf.NewUserToken().subscribe((res: any) => {
          this.store.set("user", JSON.stringify(res.data));
        }, (err: any) => { console.log(err.error) });
      }
    }
  }
}

