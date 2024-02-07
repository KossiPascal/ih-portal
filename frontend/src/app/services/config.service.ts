import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CustomHttpHeaders, backenUrl, notNull } from "@ih-app/shared/functions";
import { AuthService } from './auth.service';
import { AppStorageService } from './local-storage.service';

@Injectable({ providedIn: 'root' })
export class ConfigService {

    constructor(private auth: AuthService, private http: HttpClient, private store: AppStorageService) { }

    private ApiParams(params?:any){
        if (!this.auth.isLoggedIn()) {
          return this.auth.logout();
        }
        const fparams:any = notNull(params) ? params : {};
        fparams['userId'] = this.auth.getUserId();
        fparams['appLoadToken'] = this.auth.getAppLoadToken();
        fparams['accessRoles'] = this.auth.RolePagesActions('roles');
        fparams['accessPages'] = this.auth.RolePagesActions('pages');
        fparams['accessActions'] = this.auth.RolePagesActions('actions');
        fparams['dhisusername'] = undefined;
        fparams['dhispassword'] = undefined;
        return fparams;
      }

    getConfigs(): any {
        const fparams = this.ApiParams();
        return this.http.post(`${backenUrl()}/configs`, fparams, CustomHttpHeaders(this.store));
    }

    appVersion(): any {
        const fparams = this.ApiParams();
        return this.http.post(`${backenUrl()}/configs/appVersion`, fparams, CustomHttpHeaders(this.store));
    }

} 