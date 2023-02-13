import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FilterParams } from '@ih-app/models/Sync';
import { Functions } from '@ih-app/shared/functions';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class DatabaseUtilService {

    constructor(private auth: AuthService, private http: HttpClient,) { }


    updateUserFacilityContactPlace(data: { contact: string, parent: string, new_parent: string }): any {
        return this.http.post(`${Functions.backenUrl()}/database/couchdb/update_user_facility_contact_place`, data, Functions.customHttpHeaders(this.auth));
    }

    truncateDatabase(data: any): any {
        return this.http.post(`${Functions.backenUrl()}/database/postgres/truncate`, data, Functions.customHttpHeaders(this.auth));
    }

    getDataToDeleteFromCouchDb(data: FilterParams): any {
        return this.http.post(`${Functions.backenUrl()}/database/couchdb/list_data_to_delete`, data, Functions.customHttpHeaders(this.auth));
    }

    deleteDataFromCouchDb(data: { _deleted:boolean, _id: string, _rev: string }[], typeOfData:string): any {
        return this.http.post(`${Functions.backenUrl()}/database/couchdb/detele_data`, { array_data_to_delete: data, type:typeOfData }, Functions.customHttpHeaders(this.auth));
    }

} 