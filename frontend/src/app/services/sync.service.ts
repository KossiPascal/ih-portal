import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Chws, Dhis2Sync, Families, FilterParams, ChwsDataFormDb, Patients, Sites, Sync, Zones, SyncOrgUnit } from "@ih-app/models/Sync";
import { CustomHttpHeaders, backenUrl, notNull } from '@ih-app/shared/functions';
import { AuthService } from "./auth.service";
import { IndexDbService } from "./index-db/index-db.service";
import { ChwsUpdateDrugInfo, DataIndicators, MeetingReport, Person, Team } from "@ih-app/models/DataAggragate";
import { AppStorageService } from "./local-storage.service";

@Injectable({
  providedIn: "root",
})
export class SyncService {
  userId!: Pick<Sync, "id">;
  allChwsList: Chws[] = [];
  allSitesList: Sites[] = [];
  allZonesList: Zones[] = [];
  allPatientsList: Patients[] = [];
  allFamiliesList: Families[] = [];
  sslMsg: string = 'By disabling SSL certificate verification, you make TLS connections and HTTPS requests insecure!';
  httpOptions: { headers: HttpHeaders } = { headers: new HttpHeaders({ "Content-Type": "application/json" }) };


  // db index start
  chwsTable = this.db.chws;
  sitesTable = this.db.sites;
  // db index end


  constructor(
    private http: HttpClient,
    private store: AppStorageService,
    private auth: AuthService,
    private db: IndexDbService,
  ) { }

  syncAllToLocalStorage(): void {

    this.getSitesList().subscribe(async (sitesList: Sites[]) => {
      for (let s = 0; s < sitesList.length; s++) {
        await this.db.createOrUpdate(this.db.sites, sitesList[s])
      }
      this.getZonesList().subscribe(async (zonesList: Zones[]) => {
        for (let z = 0; z < zonesList.length; z++) {
          await this.db.createOrUpdate(this.db.zones, zonesList[z]);
        }
        this.getChwsList().subscribe(async (chwsList: Chws[]) => {
          for (let c = 0; c < chwsList.length; c++) {
            await this.db.createOrUpdate(this.db.chws, chwsList[c]);
          }
          this.getFamilyList().subscribe(async (FamiliesList: Families[]) => {
            for (let f = 0; f < FamiliesList.length; f++) {
              await this.db.createOrUpdate(this.db.families, FamiliesList[f]);
            }
            this.getPatientsList().subscribe(async (PatientsList: Patients[]) => {
              for (let p = 0; p < PatientsList.length; p++) {
                await this.db.createOrUpdate(this.db.patients, PatientsList[p]);
              }

              this.getAllChwsDataWithParams().subscribe(async (data: ChwsDataFormDb[]) => {
                for (let dt = 0; dt < data.length; dt++) {
                  await this.db.createOrUpdate(this.db.mobileData, data[dt]);
                }
              }, (err: any) => { console.log(err.error); });
            }, (err: any) => { console.log(err.error); });
          }, (err: any) => { console.log(err.error); });
        }, (err: any) => { console.log(err.error); });
      }, (err: any) => { console.log(err.error); });
    }, (err: any) => { console.log(err.error); });
  }

  // isLocalSyncSuccess(): boolean {
  //   const sync_date = this.store.get('sync_date');
  //   if (notNull(sync_date)) return isGreater(sync_date, new Date())
  //   return false;
  // }

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


  getAllChwsDataWithParams(params?: FilterParams): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/get/data`, fparams, CustomHttpHeaders(this.store));
  }

  getDataInformations(params?: FilterParams): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/get/datainfos`, fparams, CustomHttpHeaders(this.store));
  }


  syncDhis2ChwsData(params: Dhis2Sync): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/dhis2/data`, fparams, CustomHttpHeaders(this.store));
  }


  getDistrictsList(params?: FilterParams): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/districts`, fparams, CustomHttpHeaders(this.store));
  }

  getSitesList(params?: FilterParams): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/sites`, fparams, CustomHttpHeaders(this.store));
  }

  getZonesList(params?: FilterParams): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/zones`, fparams, CustomHttpHeaders(this.store));
  }

  ihDrugUpdateDataPerChw(params: ChwsUpdateDrugInfo): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/update_drug_per_chw`, fparams, CustomHttpHeaders(this.store));
  }

  ihDrugUpdateYearCmmPerChw(params: ChwsUpdateDrugInfo): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/update_drug_year_cmm_per_chw`, fparams, CustomHttpHeaders(this.store));
  }

  getChwsList(params?: FilterParams): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/app/chws`, fparams, CustomHttpHeaders(this.store));
  }

  getDhis2Chws(): any {
    const fparams = this.ApiParams();
    return this.http.post(`${backenUrl()}/sync/dhis2/chws`, fparams, CustomHttpHeaders(this.store));
  }

  getFamilyList(params?: FilterParams): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/families`, fparams, CustomHttpHeaders(this.store));
  }

  getPatientsList(params?: FilterParams): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/patients`, fparams, CustomHttpHeaders(this.store));
  }

  syncCouchDbOrgUnit(params: Sync): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/fetch/data`, fparams, CustomHttpHeaders(this.store));
  }

  syncCouchDbUsers(): any {
    const fparams = this.ApiParams();
    return this.http.post(`${backenUrl()}/sync/save-couchdb-users`, fparams, CustomHttpHeaders(this.store));
  }

  getChtUsers(): any {
    const fparams = this.ApiParams();
    return this.http.post(`${backenUrl()}/sync/get-cht-users`, fparams, CustomHttpHeaders(this.store));
  }

  

  syncThinkMdWeeklyChwsData(params: Sync): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/python/thinkmd_weekly`, fparams, CustomHttpHeaders(this.store));
  }


  syncAll(params: { start_date: string, end_date: string }): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/fetch/all`, fparams, CustomHttpHeaders(this.store));
  }


  syncOrgUnits(params: SyncOrgUnit): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/fetch/orgunits`, fparams, CustomHttpHeaders(this.store));
  }


  thinkmdToDhis2Script(params: Sync): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/python/thinkmd_to_dhis2`, fparams, CustomHttpHeaders(this.store));
  }

  ihChtDataPerChw(params: any): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/ih_cht_data_per_chw`, fparams, CustomHttpHeaders(this.store));
  }

  ihDrugDataPerChw(params: any): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/ih_drug_data_per_chw`, fparams, CustomHttpHeaders(this.store));
  }

  ihDrugDataPerSelected(params: any): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/ih_drug_data_per_selected`, fparams, CustomHttpHeaders(this.store));
  }

  insertOrUpdateDhis2Data(chwsDataToDhis2: DataIndicators): any {
    const fparams = this.ApiParams({ chwsDataToDhis2: chwsDataToDhis2});
    return this.http.post(`${backenUrl()}/sync/dhis2/insert_or_update`, fparams, CustomHttpHeaders(this.store));
  }

  syncGeojsonData(): any {
    const fparams = this.ApiParams();
    return this.http.post(`${backenUrl()}/sync/geojson`, fparams, CustomHttpHeaders(this.store));
  }

  SaveOrUpdateReport(params: MeetingReport): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/flush_meeting_reports`, fparams, CustomHttpHeaders(this.store));
  }

  GetReports(team: number): any {
    const fparams = this.ApiParams({team:team});
    return this.http.post(`${backenUrl()}/sync/get_meeting_reports`, fparams, CustomHttpHeaders(this.store));
  }

  SaveOrUpdatePerson(params: Person): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/flush_meeting_person`, fparams, CustomHttpHeaders(this.store));
  }

  GetPersons(params?: Person): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/get_meeting_person`, fparams, CustomHttpHeaders(this.store));
  }

  SaveOrUpdateTeam(params: Team): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/flush_meeting_team`, fparams, CustomHttpHeaders(this.store));
  }

  GetTeams(params?: Team): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/sync/get_meeting_team`, fparams, CustomHttpHeaders(this.store));
  }

  DeleteReport(dataId: number): any {
    const fparams = this.ApiParams({ dataId: dataId });
    return this.http.post(`${backenUrl()}/sync/delete_meeting_report`, fparams, CustomHttpHeaders(this.store));

  }
  DeletePerson(dataId: number): any {
    const fparams = this.ApiParams({ dataId: dataId });
    return this.http.post(`${backenUrl()}/sync/delete_meeting_person`, fparams, CustomHttpHeaders(this.store));

  }
  DeleteTeam(dataId: number): any {
    const fparams = this.ApiParams({ dataId: dataId });
    return this.http.post(`${backenUrl()}/sync/delete_meeting_team`, fparams, CustomHttpHeaders(this.store));

  }


  getDataByReportsDateView(syncData: Sync) {
    // const response = this.http.request('get', sync.Url(), sync.headerOption());
    // return response;
    // var response = https.get(sync.headerOption(), (res:any) => res);
    // var body = "";
    // response.on('data', (data:any) => body += data.toString());
    // var result = response.on('end', async () => JSON.parse(body));
    // response.on('error', (err:any) => console.error(`Fetching from couchdb Error. ${err}`));
    // return result;
    // {
    //   // var finalJson = {};
    //   const repository = await getSyncRepository();
    //   JSON.parse(body).rows.forEach(async (row: any) => {
    //     // const _sync = new Sync();
    //     // let dataId = row.doc.hasOwnProperty('_id') ? row.doc._id : '';
    //     // let dataRev = row.doc.hasOwnProperty('_rev') ? row.doc._rev : '';
    //     // _sync._id = dataId.concat('--').concat(dataRev);
    //     // if (row.doc.hasOwnProperty('form')) _sync.form = row.doc.form;
    //     // if (row.doc.hasOwnProperty('from')) _sync.from = row.doc.from;
    //     // if (row.doc.hasOwnProperty('contact')) _sync.contact = row.doc.contact;
    //     // if (row.doc.hasOwnProperty('type')) _sync.type = row.doc.type;
    //     // if (row.doc.hasOwnProperty('sent_by')) _sync.sent_by = row.doc.sent_by;
    //     // if (row.doc.hasOwnProperty('reported_date')) _sync.reported_date = row.doc.reported_date;
    //     if (row.doc.hasOwnProperty('fields')) {
    //       // _sync.fields = row.doc.fields;
    //       // if (row.doc.fields.hasOwnProperty('patient_id')) {
    //       //     _sync.patient_id = row.doc.fields.patient_id;
    //       // }
    //       // const res = listatts('', row.doc.fields);
    //       // resp.json(`{${res}}`)
    //     }
    //     resp.status(200).json({ status: 200, message: `Fetching Data from couchdb Finished Successfully` });

    //     // if (row.doc.hasOwnProperty('geolocation')) {
    //     //     if (!row.doc.geolocation.hasOwnProperty('code')) {
    //     //         _sync.geolocation = row.doc.geolocation;
    //     //     }
    //     // }
    //     // await repository.save(_sync);
    //     // if (!finalJson.hasOwnProperty(row.doc.form)) {
    //     //     finalJson[row.doc.form] = [];
    //     // }
    //     // finalJson[row.doc.form].push(row.doc);
    //   });

    //   // Object.entries(finalJson).forEach(async (entry: [string, object[]]) => {
    //   //     let [key, data] = entry;
    //   //     const _sync = new Sync();
    //   //     _sync.id = key;
    //   //     _sync.couchdb = data;
    //   //     await repository.save(_sync);
    //   // }); 
    //   if (use_SSL_verification !== true) {
    //     process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = undefined;
    //   }
    //   // resp.status(200).json({status:200,message:`Fetching Data from couchdb Finished Successfully`});
    // }
  };

  // getAll(): Observable<any> {
  //   return this.http
  //     .get<any>(`${backenUrl()}/sync/all`, { responseType: "json" })
  //     .pipe(
  //       catchError(this.errorHandlerService.handleError<any>("getAll", []))
  //     );
  // }

  // downloadAll(sync: Omit<Sync, "id">):Observable<Sync>{
  //   return this.http
  //   .post<Sync>(`${backenUrl()}/sync/download`, sync, this.httpOptions)
  //   .pipe(
  //     first(),
  //     catchError(this.errorHandlerService.handleError<Sync>("sync/download"))
  //   );
  // }

}
