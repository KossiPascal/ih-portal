// import { Component, HostBinding, OnInit } from '@angular/core';
// import { SwUpdate } from '@angular/service-worker';
// import { takeWhile } from 'rxjs/operators';
// import { AuthService } from '@ih-services/auth.service';
// import { interval, Subscription } from 'rxjs';
// import { TranslateService } from '@ngx-translate/core';
// import { ConfigService } from './services/config.service';
// import { User } from './models/User';
// import { Chws } from './models/Sync';
// import { Consts } from './shared/constantes';
// import { Title } from '@angular/platform-browser';
// import { GetRolesIdsOrNames, Roles, UserRoles } from './models/Roles';
// import { AppLink } from './models/Interfaces';
// import { Router } from '@angular/router';
// import { ServiceWorkerService } from './services/service-worker.service';

// declare var $: any;
// @Component({
//   selector: 'app-root',
//   templateUrl: `./app.component.html`,
//   styleUrls: [`./app.component.css`]
// })

// export class AppComponent implements OnInit {

//   isAuthenticated: boolean = false;
//   errorFound: boolean = false;

//   isOnline: boolean = false;
//   modalVersion: boolean = false;

//   checkForAppNewVersion: boolean = true;

//   updateCheckText = '';
//   modalPwaEvent!: any;
//   modalPwaPlatform: 'ios' | 'android' | undefined;
//   private readonly retryFailedUpdateAfterSec = 5 * 60;
//   private existingUpdateLoop?: any;

//   appLogo: any = Consts.APP_LOGO_1
//   userData: User | null = null;

//   chwOU: Chws | null = null;

//   separation: string = '_____________________________________';

//   @HostBinding('attr.app-version')
//   appVersion: any;
//   updateSubscription?: Subscription;

//   userPages: string[] = [];
//   userActions: string[] = [];

//   constructor(private titleService: Title, private conf: ConfigService, public translate: TranslateService, private auth: AuthService, private sw: SwUpdate,private swService: ServiceWorkerService, private router: Router) { }

//   public roles = new Roles(this.auth);

//   ngOnInit(): void {
//     this.userData = this.auth.currentUser();
//     this.userPages = (GetRolesIdsOrNames(this.userData?.roles as UserRoles[], 'pages') ?? []) as string[];
//     // this.userActions = (GetRolesIdsOrNames(userData?.roles as UserRoles[], 'actions') ?? []) as string[];
//     this.translate.addLangs(['en', 'fr']);
//     this.translate.setDefaultLang('en');
//     const browserLang = this.translate.getBrowserLang();
//     this.translate.use(browserLang?.match(/en|fr/) ? browserLang : 'en');

//     this.chwOU = this.auth.chwsOrgUnit();
//     this.UpdateVersion(false);
//     const appTitle = this.titleService.getTitle();
//     this.checkForAppNewVersion = true;

//     this.getMsg('offlinemsg');
//     this.errorFound = window.location.pathname.includes('auths/error/');
//     this.isAuthenticated = this.auth.isLoggedIn();

//     this.updateOnlineStatus();
//     window.addEventListener('online', this.updateOnlineStatus.bind(this));
//     window.addEventListener('offline', this.updateOnlineStatus.bind(this));
//     // this.checkForUpdates();
//     // this.versionUpdateChecker();
//     this.updateChecker();
//     this.appVersion = this.store.get('appVersion');
//   }


//   versionUpdateChecker() {
//     // This avoids multiple updates retrying in parallel
//     if (this.existingUpdateLoop) {
//       clearTimeout(this.existingUpdateLoop);
//       this.existingUpdateLoop = undefined;
//     }

//     window.navigator.serviceWorker.getRegistrations()
//       .then((registrations) => {
//         const registration = registrations && registrations.length && registrations[0];
//         if (!registration) {
//           console.warn('Cannot update service worker - no active workers found');
//           return;
//         }

//         registration.onupdatefound = () => {
//           const installingWorker = registration.installing;
//           if (installingWorker != null) {
//             installingWorker.onstatechange = () => {
//               switch (installingWorker.state) {
//                 case 'activated':
//                   registration.onupdatefound = null;
//                   this.ShowUpdateVersionModal();
//                   break;
//                 case 'redundant':
//                   console.warn(
//                     'Service worker failed to install or marked as redundant. ' +
//                     `Retrying install in ${this.retryFailedUpdateAfterSec}secs.`
//                   );
//                   this.existingUpdateLoop = setTimeout(() => this.versionUpdateChecker(), this.retryFailedUpdateAfterSec * 1000);
//                   registration.onupdatefound = null;
//                   break;
//                 default:
//                   console.debug(`Service worker state changed to ${installingWorker.state}!`);
//               }
//             };
//           }
//         };

//         registration.update();
//       });
//   }

//   updateChecker() {
//     if (this.sw.isEnabled) {
//       this.sw.available.subscribe(() => {
//         this.ShowUpdateVersionModal();
//       });
//     }
//   }

//   async checkForUpdates() {
//     console.log('Service Worker is Enable: ', this.sw.isEnabled);
//     if (this.sw.isEnabled && this.auth.isLoggedIn() && this.checkForAppNewVersion) this.checkForAvailableVersion();
//     interval(30000)
//       .pipe(takeWhile(() => this.sw.isEnabled && this.auth.isLoggedIn() && this.checkForAppNewVersion))
//       .subscribe(() => {
//         this.sw.checkForUpdate().then((updateFound) => {
//           if (updateFound) this.checkForAvailableVersion();
//         });
//       });
//   }

//   private checkForAvailableVersion(): void {
//     this.sw.activateUpdate().then((activate) => {
//       if (activate) {
//         this.sw.versionUpdates.subscribe(evt => {
//           switch (evt.type) {
//             case 'VERSION_DETECTED':
//               // console.log(`Downloading new app version: ${evt.version.hash}`);
//               this.ShowUpdateVersionModal();
//               break;
//             case 'VERSION_READY':
//               // console.log(`Current app version: ${evt.currentVersion.hash}`);
//               // console.log(`Last app version: ${evt.latestVersion.hash}`);
//               break;
//             case 'NO_NEW_VERSION_DETECTED':
//               // console.log(`Current app version: '${evt.version.hash}'`);
//               break;
//             case 'VERSION_INSTALLATION_FAILED':
//               // console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
//               break;
//           }
//         });
//       } else {
//         // console.log('Service Worker for Update is Inactive');
//       }
//     });
//   }

//   clickModal(btnId: string) {
//     $('#' + btnId).trigger('click');
//   }

//   ShowUpdateVersionModal() {
//     this.checkForAppNewVersion = false;
//     this.clickModal('active-update-modal')
//   }

//   UpdateVersion(reload: boolean = true) {
//     this.conf.appVersion().subscribe((newVersion: any) => {
//       if (reload) this.ShowUpdateVersionModal()
//       this.store.set('appVersion', newVersion);
//       this.appVersion = newVersion;
//       if (reload) this.clickModal('close-update-modal');
//       if (reload) window.location.reload();
//     }, (err: any) => { console.log(err.toString()) });
//   }

//   appVersionExist(): boolean {
//     var nullField: any[] = [undefined, 'undefined', null, 'null', ''];
//     return !nullField.includes(this.appVersion);
//   }

//   private updateOnlineStatus(): void {
//     this.isOnline = window.navigator.onLine;
//     console.info(`isOnline=[${this.isOnline}]`);
//   }

//   // private loadModalPwa(): void {
//   //   if (this.platform.ANDROID) {
//   //     window.addEventListener('beforeinstallprompt', (event: any) => {
//   //       event.preventDefault();
//   //       this.modalPwaEvent = event;
//   //       this.modalPwaPlatform = 'android';
//   //     });
//   //   }

//   //   if (this.platform.IOS && this.platform.SAFARI) {
//   //     const isInStandaloneMode = ('standalone' in window.navigator) && ((<any>window.navigator)['standalone']);
//   //     if (!isInStandaloneMode) {
//   //       this.modalPwaPlatform = 'ios';
//   //     }
//   //   }
//   // }

//   public closeVersion(): void {
//     this.modalVersion = false;
//   }

//   public addToHomeScreen(): void {
//     this.modalPwaEvent.prompt();
//     this.modalPwaPlatform = undefined;
//   }

//   public closePwa(): void {
//     this.modalPwaPlatform = undefined;
//   }

//   logout() {
//     this.auth.logout();
//   }

//   getMsg(msgClass: string) {
//     let element = document.querySelector('.' + msgClass)!;
//     if (element != null) {
//       element.className += " movedown";
//       setTimeout(() => {
//         element.classList.forEach(classname => {
//           classname == "movedown" ? undefined : element.classList.remove('movedown');
//         })
//       }, 4000);
//     }
//   }


//   pageTouched(event: Event) {
//     const d1 = this.auth.getExpiration()?.toDate();
//     const d2 = new Date();
//     if (d1) {
//       const d11 = d1.getTime();
//       const d22 = d2.getTime();
//       if ((d11 - 300000) < d22) { // avant 5 min d'action
//         this.auth.NewUserToken().subscribe((res: any) => {
//            this.auth.setUser(res.data as User)
//         }, (err: any) => { console.log(err.error) });
//       }
//     }
//   }

//   NavigateTo(event: Event, link: string) {
//     event.preventDefault();
//     this.router.navigate([link]);
//   }

//   HasPageAccess(link: string): boolean {
//     return this.userPages.includes(link.trim())
//   }

//   ADMIN: AppLink[] = [
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'admin/users-list',
//       label: 'Admin Users',
//       show: true
//     },
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'admin/roles-list',
//       label: 'Admin Roles',
//       show: true
//     },
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'admin/database-utils',
//       label: 'Admin Truncate Database',
//       show: true
//     },
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'admin/documentations',
//       label: 'Documentation',
//       show: true
//     }
//   ];


//   VOIR_DONNEES_ASC: AppLink[] = [
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'view-chws-data/dashboard1',
//       label: 'Activité Des ASC',
//       show: true
//     },
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'view-chws-data/dashboard2',
//       label: 'Détails Par ASC',
//       show: true
//     },
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'view-chws-data/dashboard3',
//       label: 'Effectifs Des Patients',
//       show: true
//     },
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'view-chws-data/dashboard4',
//       label: 'Visite de Ménages',
//       show: true
//     },
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'view-chws-data/dashboard5',
//       label: 'Patients Uniques Visités',
//       show: true
//     },
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'view-chws-data/highchartmap1',
//       label: 'M . A . P - 1',
//       show: true
//     },
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'view-chws-data/highchartmap2',
//       label: 'M . A . P - 2',
//       show: true
//     },
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'view-chws-data/highchartmap3',
//       label: 'M . A . P - 3',
//       show: true
//     },
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'view-chws-data/googlemap',
//       label: 'GOOGLE MAP',
//       show: true
//     }
//   ];

//   GESTION_DE_DONNEES: AppLink[] = [
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'manage-data/auto-full-sync',
//       label: 'Sync All One Time',
//       show: true
//     },
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'manage-data/sync-steply',
//       label: 'Sync OrgUnits & Data',
//       show: true
//     },
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'manage-data/sync-to-dhis2',
//       label: 'Données Apps vers Dhis2',
//       show: true
//     },
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'manage-data/sync-weekly-data',
//       label: 'ThinkMd par semaine',
//       show: true
//     }
//   ];

//   GESTIONS_DE_RAPPORTS: AppLink[] = [
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'manage-reports/meeting-report',
//       label: 'RAPPORT DE REUNION',
//       show: true
//     }
//   ];

//   GESTIONS_DES_ASC: AppLink[] = [
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'manage-chws/replacements',
//       label: 'Gestion ASC Remplaçantes',
//       show: true
//     },
//     {
//       icon: 'far fa-circle nav-icon',
//       link: 'manage-chws/chws-drug',
//       label: 'Situation Médicament ASC',
//       show: true
//     },
//   ];

//   CHWS_PAGES: AppLink[] = [
//     {
//       icon: 'fas far fa-info',
//       link: 'chws/dashboard1',
//       label: 'Activité Des ASC',
//       show: true
//     },
//     {
//       icon: 'fas far fa-info',
//       link: 'chws/dashboard2',
//       label: 'Détails Par ASC',
//       show: true
//     },
//     {
//       icon: 'fas far fa-info',
//       link: 'chws/dashboard3',
//       label: ' Effectifs Des Patients',
//       show: true
//     },
//     {
//       icon: 'fas far fa-info',
//       link: 'chws/dashboard4',
//       label: 'Visite de Ménages',
//       show: true
//     },
//     {
//       icon: 'fas far fa-info',
//       link: 'chws/select_orgunit',
//       label: 'Choisir ASC',
//       show: true
//     },
//     {
//       icon: 'fas far fa-bell',
//       link: 'auths/cache-list',
//       label: 'Effacer Le Cache',
//       show: true
//     },
//   ];

//   // this.userActions




//   //   auths/login
//   //   auths/register
//   //   auths/lock-screen
//   //   auths/change-password
//   //   auths/forgot-password
//   //   auths/error

// }

