import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FilterParams } from '@ih-app/models/Sync';
import { AuthService } from './auth.service';
import { CustomHttpHeaders, backenUrl } from "@ih-app/shared/functions";
import { AppStorageService } from './local-storage.service';

@Injectable({ providedIn: 'root' })
export class DatabaseUtilService {

    constructor(private auth: AuthService, private store: AppStorageService, private http: HttpClient,) { }


    updateUserFacilityContactPlace(params: { contact: string, parent: string, new_parent: string, userId: string | null | undefined, dhisusername: string|undefined, dhispassword: string|undefined }): any {
        const userId = this.auth.getUserId();
        params.userId = userId;
        params.dhisusername = undefined;
        params.dhispassword = undefined;
        return this.http.post(`${backenUrl()}/database/couchdb/update_user_facility_contact_place`, params, CustomHttpHeaders(this.store));
    }

    getDatabaseEntities(): any {
        const userId = this.auth.getUserId();
        const params = { userId: userId, dhisusername: undefined, dhispassword: undefined };
        return this.http.post(`${backenUrl()}/database/postgres/entities`, params, CustomHttpHeaders(this.store));
    }

    truncateDatabase(params: { procide: boolean, entities: { name: string, table: string }[], userId?: string | null | undefined, dhisusername?: string, dhispassword?: string }): any {
        const userId = this.auth.getUserId();
        params.userId = userId;
        params.dhisusername = undefined;
        params.dhispassword = undefined;
        return this.http.post(`${backenUrl()}/database/postgres/truncate`, params, CustomHttpHeaders(this.store));
    }

    getDataToDeleteFromCouchDb(params: FilterParams): any {
        const userId = this.auth.getUserId();
        params.userId = userId;
        params.dhisusername = undefined;
        params.dhispassword = undefined;
        return this.http.post(`${backenUrl()}/database/couchdb/list_data_to_delete`, params, CustomHttpHeaders(this.store));
    }

    deleteDataFromCouchDb(data: { _deleted: boolean, _id: string, _rev: string }[], typeOfData: string): any {
        const userId = this.auth.getUserId();
        return this.http.post(`${backenUrl()}/database/couchdb/detele_data`, { array_data_to_delete: data, type: typeOfData, userId: userId, dhisusername: undefined, dhispassword: undefined }, CustomHttpHeaders(this.store));
    }

} 