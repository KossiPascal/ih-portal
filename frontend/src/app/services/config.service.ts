import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CustomHttpHeaders, backenUrl } from "@ih-app/shared/functions";
import { AuthService } from './auth.service';
import { AppStorageService } from './local-storage.service';

@Injectable({ providedIn: 'root' })
export class ConfigService {

    constructor(private auth: AuthService, private http: HttpClient, private store: AppStorageService) { }

    getConfigs(): any {
        const userId = this.auth.getUserId()!;
        return this.http.post(`${backenUrl()}/configs`, { userId: userId, dhisusername: undefined, undefined: undefined }, CustomHttpHeaders(this.store));
    }

    appVersion(): any {
        return this.http.post(`${backenUrl()}/configs/appVersion`, { getversion: true }, CustomHttpHeaders(this.store));
    }

} 