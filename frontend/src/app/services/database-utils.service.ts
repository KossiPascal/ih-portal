import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FilterParams } from '@ih-app/models/Sync';
import { Functions } from '@ih-app/shared/functions';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class DatabaseUtilService {

    constructor(private auth: AuthService, private http: HttpClient,) { }


    updateUserFacilityContactPlace(params: { contact: string, parent: string, new_parent: string, user: string, dhisusersession: string }): any {
        if (!this.auth.isLoggedIn() || this.auth.userValue() == null) this.auth.logout();
        const user = this.auth.userValue();
        params.user = user?.id;
        params.dhisusersession = user?.dhisusersession!;
        return this.http.post(`${Functions.backenUrl()}/database/couchdb/update_user_facility_contact_place`, params, Functions.customHttpHeaders(this.auth));
    }

    getDatabaseEntities(): any {
        if (!this.auth.isLoggedIn() || this.auth.userValue() == null) this.auth.logout();
        const user = this.auth.userValue();
        const params = { user: user?.id, dhisusersession: user?.dhisusersession };
        return this.http.post(`${Functions.backenUrl()}/database/postgres/entities`, params, Functions.customHttpHeaders(this.auth));
    }

    truncateDatabase(params: { procide: boolean, entities: { name: string, table: string }[], user?: string, dhisusersession?: string }): any {
        if (!this.auth.isLoggedIn() || this.auth.userValue() == null) this.auth.logout();
        const user = this.auth.userValue();
        params.user = user?.id;
        params.dhisusersession = user?.dhisusersession!;
        return this.http.post(`${Functions.backenUrl()}/database/postgres/truncate`, params, Functions.customHttpHeaders(this.auth));
    }

    getDataToDeleteFromCouchDb(params: FilterParams): any {
        if (!this.auth.isLoggedIn() || this.auth.userValue() == null) this.auth.logout();
        const user = this.auth.userValue();
        params.user = user?.id;
        params.dhisusersession = user?.dhisusersession!;
        return this.http.post(`${Functions.backenUrl()}/database/couchdb/list_data_to_delete`, params, Functions.customHttpHeaders(this.auth));
    }

    deleteDataFromCouchDb(data: { _deleted: boolean, _id: string, _rev: string }[], typeOfData: string): any {
        if (!this.auth.isLoggedIn() || this.auth.userValue() == null) this.auth.logout();
        const user = this.auth.userValue();
        return this.http.post(`${Functions.backenUrl()}/database/couchdb/detele_data`, { array_data_to_delete: data, type: typeOfData, user: user?.id, dhisusersession: user?.dhisusersession }, Functions.customHttpHeaders(this.auth));
    }

} 