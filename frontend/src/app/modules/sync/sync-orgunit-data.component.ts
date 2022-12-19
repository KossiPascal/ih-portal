import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Dhis2Sync, OrgUnitImport, Sites } from '@ih-app/models/Sync';
import { AuthService } from '@ih-app/services/auth.service';
import { SyncService } from '@ih-app/services/sync.service';
import * as moment from 'moment';
import { DateUtils, Functions } from '@ih-app/shared/functions';


declare var $: any;
declare var initDataTable: any;


@Component({
  selector: 'app-sync',
  templateUrl: './sync-orgunit-data.component.html',
  styleUrls: ['./sync.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SyncOrgUnitDataComponent implements OnInit {

  chwsDataForm!: FormGroup;
  dhis2ChwsDataForm!: FormGroup;
  orgUnitAndPersonForm!: FormGroup;
  tab4_messages: OrgUnitImport | null = null;
  tab5_messages: OrgUnitImport | null = null;
  tab6_messages: OrgUnitImport | null = null;
  dates: moment.Moment[] = [];
  weekly_Choosen_Dates: string[] = [];
  is_weekly_date_error: boolean = false;
  weekly_date_error_Msg:string = '';

  loading4!: boolean;
  loading5!: boolean;
  loading6!: boolean;

  start_date_error: boolean = false;
  end_date_error: boolean = false;


  LoadingMsg: string = "Loading..."

  getPort(host:string){
    return host == 'portal-integratehealth.org' ? 444 : 443;
  }

  sitesList: Sites[] = [];

  medicUrl$: any = {
    "hth-togo.app.medicmobile.org": 443,
    "portal-integratehealth.org": 444
  }

  constructor(private syncService: SyncService, private http: HttpClient, private authService: AuthService) { }

  ngOnInit(): void {

    this.syncService.getSitesList().subscribe((sitesList: any) => {
      this.sitesList = sitesList;
    }, (err: any) => console.log(err.error));

    this.loading4 = false;
    this.loading5 = false;
    this.loading6 = false;

    this.chwsDataForm = this.createChwsDataFormGroup();
    this.dhis2ChwsDataForm = this.createDhis2ChwsDataFormGroup();
    this.orgUnitAndPersonForm = this.createOrgUnitAndPersonFormGroup();

  }

  createFormGroup(cible: string): FormGroup {
    return new FormGroup({
      start_date: new FormControl("", cible === 'medic' || cible === 'allChwsData' || cible === 'medic_thinkMd' ? [Validators.required, Validators.minLength(7)] : []),
      end_date: new FormControl("", cible === 'medic' || cible === 'thinkMd' || cible === 'allChwsData' ? [Validators.required, Validators.minLength(7)] : []),

      weekly_Choosen_Dates: new FormControl(""),

      thinkmd_host: new FormControl("10az.online.tableau.com", cible === 'thinkMd' || cible === 'medic_thinkMd' ? [Validators.required] : []),
      thinkmd_site: new FormControl("datasincbeta", cible === 'thinkMd' || cible === 'medic_thinkMd' ? [Validators.required] : []),
      useToken: new FormControl(false),
      thinkmd_token_username: new FormControl(""),
      thinkmd_token: new FormControl(""),
      thinkmd_username: new FormControl("seaq@santeintegree.org"),
      thinkmd_password: new FormControl(""),

      medic_host: new FormControl("", cible === 'medic' || cible === 'allChwsData' || cible === 'allOrgUnit' || cible === 'medic_thinkMd' ? [Validators.required, Validators.minLength(3)] : []),
      medic_username: new FormControl("admin", cible === 'medic' || cible === 'allChwsData' || cible === 'allOrgUnit' || cible === 'medic_thinkMd' ? [Validators.required] : []),
      medic_password: new FormControl(""),
      medic_database: new FormControl("medic", cible === 'medic' || cible === 'medic_thinkMd' ? [Validators.required] : []),

      InsertIntoDhis2: new FormControl(false, []),
      dhis2_host: new FormControl("dhis2.integratehealth.org/dhis"),
      dhis2_username: new FormControl("admin"),
      dhis2_password: new FormControl(""),
      ssl_verification: new FormControl(false, cible === 'allChwsData' || cible === 'allOrgUnit' ? [Validators.required] : []),
    });
  }

  createChwsDataFormGroup(): FormGroup {
    return this.createFormGroup('allChwsData');
  }

  createDhis2ChwsDataFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl("", [Validators.required, Validators.minLength(7)]),
      end_date: new FormControl("", [Validators.required, Validators.minLength(7)]),
      sites: new FormControl(""),
    });
  }

  createOrgUnitAndPersonFormGroup(): FormGroup {
    return this.createFormGroup('allOrgUnit');
  }

  createThinkmdFormGroup(): FormGroup {
    return this.createFormGroup('thinkMd');
  }

  createMedicFormGroup(): FormGroup {
    return this.createFormGroup('medic');
  }

  createMedicThinkmdFormGroup(): FormGroup {
    return this.createFormGroup('medic_thinkMd');
  }


  isValidParams(fForm: FormGroup, type: string): boolean {
    if (fForm != undefined) {
      const parent: any = fForm.value;
      if (parent != undefined) {
        const s_date: string = parent['start_date'];
        const e_date: string = parent['end_date'];
        const isStart: boolean = DateUtils.isDayInDate(s_date, 21)
        const isEnd: boolean = DateUtils.isDayInDate(e_date, 20);
        const dateDiff: number = DateUtils.daysDiff(s_date, e_date);
        if (parent['InsertIntoDhis2'] == true && type == 'medic') {
          if (dateDiff > 31) {
            this.start_date_error = true
            this.end_date_error = true
          } else {
            this.start_date_error = !isStart;
            this.end_date_error = !isEnd;
          }
          return isStart && isEnd && dateDiff <= 31;
        }
        if (type == 'thinkMd') {
          this.end_date_error = !isEnd;
          return isEnd
        };
      }
    }
    return true;
  }



  startDateError(): string {
    return this.start_date_error ? 'borderError' : '';
  }

  endDateError(): string {
    return this.end_date_error ? 'borderError' : '';
  }

  cleanError(): void {
    this.start_date_error = false;
    this.end_date_error = false;
  }

  cleanWeeklyDateError(): void {
    this.is_weekly_date_error = false;
    this.weekly_date_error_Msg = '';
  }

  WeeklyDateIsValid(): boolean {
    var t:number = 0;
    for (let i = 0; i < this.weekly_Choosen_Dates.length; i++) {
      const dt = this.weekly_Choosen_Dates[i];
      if(!DateUtils.getMondays(dt).includes(dt)) t++;
    }
    return t == 0;
  }

  genarateColor(data:any):string {
    if (Functions.isNumber(data)) {
      const d = parseInt(data);
      if (d <= 5) return 'danger'
      if (d > 5 && d <= 30) return 'warning'
      if (d > 30 && d < 40) return 'infos'
      return 'good';
    }
    return '';
  }
 
  removeWeekDate(date:string):void {
    const index = this.weekly_Choosen_Dates.indexOf(date);
    this.weekly_Choosen_Dates.splice(index, 1);
    // this.weekly_Choosen_Dates.r
  }

  syncAllSiteZoneFamilyPersonFromDb(): void {
    this.loading4 = true;
    this.tab4_messages = null;
    const port = this.getPort(this.orgUnitAndPersonForm.value['medic_host']);
    this.orgUnitAndPersonForm.value['port'] = port;
    this.orgUnitAndPersonForm.value['ssl_verification'] = `${port}` == '444' ? true : false;
    this.syncService.syncSiteZoneFamilyPerson(this.orgUnitAndPersonForm.value).subscribe((response: OrgUnitImport) => {
      this.loading4 = false;
      this.tab4_messages = response;
      // console.log(response);
    }, (err: any) => {
      this.loading4 = false;
      this.tab4_messages = err.error as OrgUnitImport;
    });
  }

  syncAllChwsDataFromDb(): void {
    this.loading5 = true;
    this.tab5_messages = null;
    const port = this.getPort(this.chwsDataForm.value['medic_host']);
    this.chwsDataForm.value['port'] = port;
    this.chwsDataForm.value['ssl_verification'] = `${port}` == '444' ? true : false;
    this.syncService.syncChwsData(this.chwsDataForm.value).subscribe((response: OrgUnitImport) => {
      this.loading5 = false;
      this.tab5_messages = response;
      // console.log(response);
    }, (err: any) => {
      this.loading5 = false;
      this.tab5_messages = err.error as OrgUnitImport;
    });
  }

  syncAllChwsDataFromDhis2(): void {
    this.loading6 = true;
    this.tab6_messages = null;
    const startDate: string = this.dhis2ChwsDataForm.value['start_date'];
    const endDate: string = this.dhis2ChwsDataForm.value['end_date'];
    const site: string = this.dhis2ChwsDataForm.value["sites"];
    const dhis2Params: Dhis2Sync = {
      orgUnitFilter: site,
      // orgUnitFilter: 'orgUnit:in:k52TtOanhCc',
      filter: [`RlquY86kI66:GE:${startDate}:LE:${endDate}`],
      // filter: [`RlquY86kI66:GE:2022-06-21:LE:2022-06-31`],
      fields: ['event', 'orgUnit', 'orgUnitName', 'dataValues[dataElement,value]']
    }

    this.syncService.syncDhis2ChwsData(dhis2Params).subscribe((response: OrgUnitImport) => {
      this.loading6 = false;
      this.tab6_messages = response;
      // console.log(response);
    }, (err: any) => {
      this.loading6 = false;
      this.tab6_messages = err.error as OrgUnitImport;
    });
  }

}
