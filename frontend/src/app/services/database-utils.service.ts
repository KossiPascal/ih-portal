import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FilterParams } from '@ih-app/models/Sync';
import { Functions } from '@ih-app/shared/functions';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class DatabaseUtilService {

    constructor(private auth: AuthService, private http: HttpClient,) { }


    updateUserFacilityContactPlace(params: { contact: string, parent: string, new_parent: string, userId: string, dhisusersession: string }): any {
        if (!this.auth.isLoggedIn() || this.auth.userValue() == null) this.auth.logout();
        const user = this.auth.userValue();
        params.userId = user?.id;
        params.dhisusersession = user?.dhisusersession!;
        return this.http.post(`${Functions.backenUrl()}/database/couchdb/update_user_facility_contact_place`, params, Functions.HttpHeaders(this.auth));
    }

    getDatabaseEntities(): any {
        if (!this.auth.isLoggedIn() || this.auth.userValue() == null) this.auth.logout();
        const user = this.auth.userValue();
        const params = { userId: user?.id, dhisusersession: user?.dhisusersession };
        return this.http.post(`${Functions.backenUrl()}/database/postgres/entities`, params, Functions.HttpHeaders(this.auth));
    }

    truncateDatabase(params: { procide: boolean, entities: { name: string, table: string }[], userId?: string, dhisusersession?: string }): any {
        if (!this.auth.isLoggedIn() || this.auth.userValue() == null) this.auth.logout();
        const user = this.auth.userValue();
        params.userId = user?.id;
        params.dhisusersession = user?.dhisusersession!;
        return this.http.post(`${Functions.backenUrl()}/database/postgres/truncate`, params, Functions.HttpHeaders(this.auth));
    }

    getDataToDeleteFromCouchDb(params: FilterParams): any {
        if (!this.auth.isLoggedIn() || this.auth.userValue() == null) this.auth.logout();
        const user = this.auth.userValue();
        params.userId = user?.id;
        params.dhisusersession = user?.dhisusersession!;
        return this.http.post(`${Functions.backenUrl()}/database/couchdb/list_data_to_delete`, params, Functions.HttpHeaders(this.auth));
    }

    deleteDataFromCouchDb(data: { _deleted: boolean, _id: string, _rev: string }[], typeOfData: string): any {
        if (!this.auth.isLoggedIn() || this.auth.userValue() == null) this.auth.logout();
        const user = this.auth.userValue();
        return this.http.post(`${Functions.backenUrl()}/database/couchdb/detele_data`, { array_data_to_delete: data, type: typeOfData, userId: user?.id, dhisusersession: user?.dhisusersession }, Functions.HttpHeaders(this.auth));
    }

} 