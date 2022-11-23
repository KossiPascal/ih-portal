import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ErrorHandlerService } from "./error-handler.service";
import { Chws, Dhis2Sync, Families, FilterParams, MedicMobileData, Patients, Sites, Sync, Zones } from "@ih-app/models/Sync";
import { Router } from "@angular/router";
import { DateUtils, Functions } from '@ih-app/shared/functions';
import { AuthService } from "./auth.service";
import { IndexDbService } from "./index-db.service";

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
    private errorHandlerService: ErrorHandlerService,
    private router: Router,
    private auth: AuthService,
    private db: IndexDbService,
  ) { }

  syncAllToLocalStorage(): void {

    this.getSitesList().subscribe(async (sitesList: Sites[]) => {
      for (let s = 0; s < sitesList.length; s++) {
        await this.db.createOrUpdate(this.db.sites, sitesList[s])
      }
      this.getZoneList().subscribe(async (zonesList: Zones[]) => {
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

              this.getAllData().subscribe(async (data: MedicMobileData[]) => {
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

  isLocalSyncSuccess(): boolean {
    const sync_date = localStorage.getItem('sync_date');
    if (Functions.isNotNull(sync_date)) return DateUtils.isGreater(sync_date, new Date())
    return false;
  }


  getAllData(params?: FilterParams): any {
    if (!this.auth.isLoggedIn()) this.auth.logout();
    if (Functions.isNotNull(params)) params!.user = this.auth.userId();
    const sendParams = Functions.isNotNull(params) ? params : { user: this.auth.userId() };
    return this.http.post(`${Functions.backenUrl()}/sync/all`, sendParams, Functions.customHttpHeaders(this.auth));
  }


  syncDhis2ChwsData(params: Dhis2Sync): any {
    if (!this.auth.isLoggedIn()) this.auth.logout();
    params.user = this.auth.userId()
    return this.http.post(`${Functions.backenUrl()}/sync/dhis2_data`, params, Functions.customHttpHeaders(this.auth));
  }


  getDistrictsList(params?: any): any {
    if (!this.auth.isLoggedIn()) this.auth.logout();
    if (Functions.isNotNull(params)) params.user = this.auth.userId();
    const sendParams = Functions.isNotNull(params) ? params : { user: this.auth.userId() };
    return this.http.post(`${Functions.backenUrl()}/sync/districts`, sendParams, Functions.customHttpHeaders(this.auth));
  }

  getSitesList(params?: any): any {
    if (!this.auth.isLoggedIn()) this.auth.logout();
    if (Functions.isNotNull(params)) params.user = this.auth.userId();
    const sendParams = Functions.isNotNull(params) ? params : { user: this.auth.userId() };
    return this.http.post(`${Functions.backenUrl()}/sync/sites`, sendParams, Functions.customHttpHeaders(this.auth));
  }

  getZoneList(params?: any): any {
    if (!this.auth.isLoggedIn()) this.auth.logout();
    if (Functions.isNotNull(params)) params.user = this.auth.userId();
    const sendParams = Functions.isNotNull(params) ? params : { user: this.auth.userId() };
    return this.http.post(`${Functions.backenUrl()}/sync/zones`, sendParams, Functions.customHttpHeaders(this.auth));
  }

  getChwsList(params?: any): any {
    if (!this.auth.isLoggedIn()) this.auth.logout();
    if (Functions.isNotNull(params)) params.user = this.auth.userId();
    const sendParams = Functions.isNotNull(params) ? params : { user: this.auth.userId() };
    return this.http.post(`${Functions.backenUrl()}/sync/chws`, sendParams, Functions.customHttpHeaders(this.auth));
  }

  getFamilyList(params?: any): any {
    if (!this.auth.isLoggedIn()) this.auth.logout();
    if (Functions.isNotNull(params)) params.user = this.auth.userId();
    const sendParams = Functions.isNotNull(params) ? params : { user: this.auth.userId() };
    return this.http.post(`${Functions.backenUrl()}/sync/families`, sendParams, Functions.customHttpHeaders(this.auth));
  }

  getPatientsList(params?: any): any {
    if (!this.auth.isLoggedIn()) this.auth.logout();
    if (Functions.isNotNull(params)) params.user = this.auth.userId();
    const sendParams = Functions.isNotNull(params) ? params : { user: this.auth.userId() };
    return this.http.post(`${Functions.backenUrl()}/sync/patients`, sendParams, Functions.customHttpHeaders(this.auth));
  }

  syncChwsData(params: Sync): any {
    if (!this.auth.isLoggedIn()) this.auth.logout();
    // if (params.ssl_verification !== true) console.log(this.sslMsg);
    params.user = this.auth.userId()
    return this.http.post(`${Functions.backenUrl()}/sync/data`, params, Functions.customHttpHeaders(this.auth));
  }

  syncWeeklyChwsData(params: Sync): any {
    if (!this.auth.isLoggedIn()) this.auth.logout();
    // if (params.ssl_verification !== true) console.log(this.sslMsg);
    params.user = this.auth.userId()
    return this.http.post(`${Functions.backenUrl()}/python/medicThinkmdWeekly`, params, Functions.customHttpHeaders(this.auth));
  }


  syncSiteZoneFamilyPerson(params: Sync): any {
    if (!this.auth.isLoggedIn()) this.auth.logout();
    // if (params.ssl_verification !== true) console.log(this.sslMsg);
    params.user = this.auth.userId()
    return this.http.post(`${Functions.backenUrl()}/sync/site_family_person`, params, Functions.customHttpHeaders(this.auth));
  }


  thinkmdToDhis2Script(params: Sync): any {
    if (!this.auth.isLoggedIn()) this.auth.logout();
    params.user = this.auth.userId()
    return this.http.post(`${Functions.backenUrl()}/python/thinkmdToDhis2`, params, Functions.customHttpHeaders(this.auth));
  }

  medicToDhis2Script(params: Sync): any {
    if (!this.auth.isLoggedIn()) this.auth.logout();
    params.user = this.auth.userId()
    return this.http.post(`${Functions.backenUrl()}/python/medicToDhis2`, params, Functions.customHttpHeaders(this.auth));
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
    //       // const res = Functions.listatts('', row.doc.fields);
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
    //     process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '1';
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
