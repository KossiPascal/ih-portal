import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Functions } from '@ih-app/shared/functions';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ConfigService {

    constructor(private auth:AuthService,private http: HttpClient,) { }

    getConfigs(): any {
        return this.http.get(`${Functions.backenUrl()}/configs`, Functions.customHttpHeaders(this.auth));
    }

    appVersion(): any {
        return this.http.get(`${Functions.backenUrl()}/configs/appVersion`, Functions.customHttpHeaders(this.auth));
    }
      
} 