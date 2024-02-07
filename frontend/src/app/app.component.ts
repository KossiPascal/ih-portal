import { Component, OnInit } from '@angular/core';
import { AuthService } from '@ih-services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { User } from './models/User';
import { Chws } from './models/Sync';
import { Consts } from './shared/constantes';
import { GetRolesIdsOrNames, Roles, UserRoles } from './models/Roles';
import { AppLink } from './models/Interfaces';
import { Router } from '@angular/router';
import { ServiceWorkerService } from './services/service-worker.service';
import { interval, Subject } from 'rxjs';
import { takeWhile, takeUntil, switchMap, catchError } from 'rxjs/operators';
import { AppStorageService } from './services/local-storage.service';
import { ConfigService } from './services/config.service';

declare var $: any;
@Component({
  selector: 'app-root',
  templateUrl: `./app.component.html`,
  styleUrls: [`./app.component.css`]
})

export class AppComponent implements OnInit {
  isOnline: boolean = false;
  appLogo: any = Consts.APP_LOGO_1
  infosModalMessage: string = '';
  private onDestroy$ = new Subject<void>();
  countdown: number = 10;
  // updateSubscription?: Subscription;
  separation: string = '_____________________________________';

  checkChangeForUser!: boolean;

  updateModalId: string = 'active-update-modal';

  constructor(public translate: TranslateService, private conf: ConfigService, private auth: AuthService, private store: AppStorageService, private swService: ServiceWorkerService, private router: Router) {
    this.CheckReloadUser();
  }

  ngOnInit(): void {
    this.translate.addLangs(['en', 'fr']);
    this.translate.setDefaultLang('en');
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/en|fr/) ? browserLang : 'en');

    this.swService.registerServiceWorker();
    this.swService.checkForUpdates(this.updateModalId);
    this.checkChangeForUser = this.isAuthenticated();
    this.UpdateVersion(false)
  }

  roles(): Roles {
    return new Roles(this.auth);
  }
  cancelDefaultAction(event: Event) {
    event.preventDefault();
  }

  currentUser(): User | null {
    return this.auth.currentUser();
  }

  ChwLogged(): Chws | null | undefined {
    return this.auth.ChwLogged();
  }



  UpdateVersion(reload: boolean = true) {
    this.conf.appVersion().subscribe((newVersion: any) => {
      this.store.set('appVersion', newVersion, false);
      this.UpdateUserToken(reload);
    }, (err: any) => { console.log(err.toString()) });
  }

  UpdateUserToken(updateReload?: boolean) {
    this.auth.NewUserToken(updateReload).subscribe((res: { status: number, data: User | string }) => {
      if (res.status == 200) {
        this.auth.setUser(res.data as User);
      }
      this.checkChangeForUser = true;
      if (updateReload) {
        // document.location.reload();
        window.location.reload();
      }
    }, (err: any) => {
      console.log(err.error);
      this.checkChangeForUser = true;
    });
  }

  userPages(): string[] {
    return (GetRolesIdsOrNames(this.currentUser()?.roles as UserRoles[], 'pages') ?? []) as string[];
  };

  appVersion(): string | null {
    return this.store.get('appVersion');
  }

  errorFound(): boolean {
    return window.location.pathname.includes('auths/error/');
  }

  isAuthenticated(): boolean {
    return this.auth.isLoggedIn();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  CheckReloadUser() {
    interval(10000)
      .pipe(
        takeWhile(() => this.checkChangeForUser),
        takeUntil(this.onDestroy$),
        switchMap(() => this.auth.CheckReloadUser()),
        catchError((error: any) => {
          console.error('Error occurred while checking/reloading user:', error);
          return [];
        })
      )
      .subscribe((r) => {
        if (r) {
          const res = r as { status: number, data: User | string };
          if (res.status == 200) {
            this.auth.setUser(res.data as User);
          } else if (res.status == 201) {
            this.auth.logout();
          }  else if (res.status == 202) {
            this.checkChangeForUser = false;
            $('#'+this.updateModalId).trigger('click');
          }
        }
      });
  }


  logout(event: Event) {
    event.preventDefault();
    $('#modal-logout-close').trigger('click');
    this.logAllOut();
  }

  logAllOut() {
    this.swService.unregisterServiceWorker();
    this.auth.logout();
  }

  pageTouched(event: Event) {
    const expiresIn = this.auth.getExpiresIn();
    if (expiresIn) {
      // const restOfTime = Math.floor((Date.now() - expiresIn) / 1000);
      if ((Number(expiresIn) - (1000 * 60 * 5)) < Date.now()) { // avant 5 min d'action
        this.auth.NewUserToken(true).subscribe((res: { status: number, data: User | string }) => {
          if (res.status == 200) {
            this.auth.setUser(res.data as User);
          }
          this.checkChangeForUser = true;
        }, (err: any) => {
          console.log(err.error);
          this.checkChangeForUser = true;
        });
      }
    }
  }



  NavigateTo(event: Event, link: string) {
    event.preventDefault();
    this.router.navigate([link]);
  }

  HasPageAccess(link: string): boolean {
    return this.userPages().includes(link.trim())
  }

  SHOW_ADMIN(): boolean {
    console.log(this.userPages);
    return this.ADMIN.some(apl => this.userPages().includes(apl.link.trim()));
  }
  SHOW_VOIR_DONNEES_ASC(): boolean {
    return this.VOIR_DONNEES_ASC.some(apl => this.userPages().includes(apl.link.trim()));
  }
  SHOW_GESTION_DE_DONNEES(): boolean {
    return this.GESTION_DE_DONNEES.some(apl => this.userPages().includes(apl.link.trim()));
  }
  SHOW_GESTIONS_DE_RAPPORTS(): boolean {
    return this.GESTIONS_DE_RAPPORTS.some(apl => this.userPages().includes(apl.link.trim()));
  }
  SHOW_GESTIONS_DES_ASC(): boolean {
    return this.GESTIONS_DES_ASC.some(apl => this.userPages().includes(apl.link.trim()));
  }
  SHOW_CHWS_PAGES(): boolean {
    return this.CHWS_PAGES.some(apl => this.userPages().includes(apl.link.trim()));
  }


  ADMIN: AppLink[] = [
    {
      icon: 'far fa-circle nav-icon',
      link: 'admin/users-list',
      label: 'Admin Users',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'admin/roles-list',
      label: 'Admin Roles',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'admin/api-access-list',
      label: 'Admin API Access',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'admin/database-utils',
      label: 'Admin Truncate Database',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'admin/documentations',
      label: 'Documentation',
      show: true
    }
  ];
  VOIR_DONNEES_ASC: AppLink[] = [
    {
      icon: 'far fa-circle nav-icon',
      link: 'view-chws-data/dashboard1',
      label: 'Activité Des ASC',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'view-chws-data/dashboard2',
      label: 'Détails Par ASC',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'view-chws-data/dashboard3',
      label: 'Effectifs Des Patients',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'view-chws-data/dashboard4',
      label: 'Visite de Ménages',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'view-chws-data/highchartmap1',
      label: 'M . A . P - 1',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'view-chws-data/highchartmap2',
      label: 'M . A . P - 2',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'view-chws-data/highchartmap3',
      label: 'M . A . P - 3',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'view-chws-data/googlemap',
      label: 'GOOGLE MAP',
      show: true
    }
  ];
  GESTION_DE_DONNEES: AppLink[] = [
    {
      icon: 'far fa-circle nav-icon',
      link: 'manage-data/auto-full-sync',
      label: 'Sync All One Time',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'manage-data/sync-steply',
      label: 'Sync OrgUnits & Data',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'manage-data/sync-to-dhis2',
      label: 'Données Apps vers Dhis2',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'manage-data/sync-weekly-data',
      label: 'ThinkMd par semaine',
      show: true
    }
  ];
  GESTIONS_DE_RAPPORTS: AppLink[] = [
    {
      icon: 'far fa-circle nav-icon',
      link: 'manage-reports/meeting-report',
      label: 'RAPPORT DE REUNION',
      show: true
    }
  ];
  GESTIONS_DES_ASC: AppLink[] = [
    {
      icon: 'far fa-circle nav-icon',
      link: 'manage-chws/replacements',
      label: 'Gestion ASC Remplaçantes',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'manage-chws/chws-drug',
      label: 'Situation Médicament ASC',
      show: true
    },
  ];
  CHWS_PAGES: AppLink[] = [
    {
      icon: 'far fa-circle nav-icon',
      link: 'chws/dashboard1',
      label: 'Activité Des ASC',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'chws/dashboard2',
      label: 'Détails Par ASC',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'chws/dashboard3',
      label: ' Effectifs Des Patients',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'chws/dashboard4',
      label: 'Visite de Ménages',
      show: true
    },
    {
      icon: 'far fa-circle nav-icon',
      link: 'manage-chws/chws-drug',
      label: 'Situation Médicament ASC',
      show: true
    },
    {
      icon: 'fas far fa-info',
      link: 'chws/select_orgunit',
      label: 'Choisir ASC',
      show: true
    },
    {
      icon: 'fas far fa-bell',
      link: 'auths/cache-list',
      label: 'Effacer Le Cache',
      show: true
    }
  ];

  //   auths/login
  //   auths/register
  //   auths/lock-screen
  //   auths/change-password
  //   auths/forgot-password
  //   auths/error

}

