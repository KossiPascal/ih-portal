import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FilterParams } from '@ih-app/models/Sync';
import { AuthService } from './auth.service';
import { CustomHttpHeaders, backenUrl, notNull } from "@ih-app/shared/functions";
import { AppStorageService } from './local-storage.service';

@Injectable({ providedIn: 'root' })
export class DatabaseUtilService {

    constructor(private auth: AuthService, private store: AppStorageService, private http: HttpClient,) { }

    private ApiParams(params?:any, mustLoggedIn:boolean = true){
        if (mustLoggedIn && !this.auth.isLoggedIn()) {
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


    updateUserFacilityContactPlace(params: { contact: string, parent: string, new_parent: string }): any {
        const fparams = this.ApiParams(params);
        return this.http.post(`${backenUrl()}/database/couchdb/update_user_facility_contact_place`, fparams, CustomHttpHeaders(this.store));
    }

    getDatabaseEntities(): any {
        const fparams = this.ApiParams();
        return this.http.post(`${backenUrl()}/database/postgres/entities`, fparams, CustomHttpHeaders(this.store));
    }

    truncateDatabase(params: { procide: boolean, entities: { name: string, table: string }[] }): any {
        const fparams = this.ApiParams(params);
        return this.http.post(`${backenUrl()}/database/postgres/truncate`, fparams, CustomHttpHeaders(this.store));
    }

    getDataToDeleteFromCouchDb(params: FilterParams): any {
        const fparams = this.ApiParams(params);
        return this.http.post(`${backenUrl()}/database/couchdb/list_data_to_delete`, fparams, CustomHttpHeaders(this.store));
    }

    deleteDataFromCouchDb(data: { _deleted: boolean, _id: string, _rev: string }[], typeOfData: string): any {
        const fparams = this.ApiParams({ array_data_to_delete: data, type: typeOfData });
        return this.http.post(`${backenUrl()}/database/couchdb/detele_data`, fparams, CustomHttpHeaders(this.store));
    }

} 