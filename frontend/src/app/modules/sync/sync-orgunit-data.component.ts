import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Districts, OrgUnitImport, Sites } from '@ih-app/models/Sync';
import { AuthService } from '@ih-app/services/auth.service';
import { SyncService } from '@ih-app/services/sync.service';
import * as moment from 'moment';
import { DateUtils, Functions } from '@ih-app/shared/functions';



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
  tab6_messages: OrgUnitImport[] = [];
  dates: moment.Moment[] = [];
  weekly_Choosen_Dates: string[] = [];
  is_weekly_date_error: boolean = false;
  weekly_date_error_Msg: string = '';

  loading4!: boolean;
  loading5!: boolean;
  loading6!: boolean;

  start_date_error: boolean = false;
  end_date_error: boolean = false;


  LoadingMsg: string = "Loading..."

  Districts$: Districts[] = [];
  Sites$: Sites[] = [];


  sites$: Sites[] = [];

  initDate!: { start_date: string, end_date: string };



  constructor(private sync: SyncService, private http: HttpClient, private authService: AuthService) { }

  ngOnInit(): void {
    this.initDate = DateUtils.startEnd21and20Date();
    this.sync.getDistrictsList().subscribe(async (_d$: { status: number, data: Districts[] }) => {
      if (_d$.status == 200) {
        this.Districts$ = _d$.data;
        this.sync.getSitesList().subscribe(async (res: { status: number, data: Sites[] }) => {
          if (res.status == 200) this.Sites$ = res.data;
        }, (err: any) => console.log(err));
      }
    }, (err: any) => console.log(err));

    this.loading4 = false;
    this.loading5 = false;
    this.loading6 = false;

    this.chwsDataForm = this.createChwsDataFormGroup();
    this.dhis2ChwsDataForm = this.createDhis2ChwsDataFormGroup();
    this.orgUnitAndPersonForm = this.createOrgUnitAndPersonFormGroup();

  }

  createOrgUnitAndPersonFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl("", [Validators.required, Validators.minLength(7)]),
      end_date: new FormControl("", [Validators.required, Validators.minLength(7)]),
      site: new FormControl(true, [Validators.required]),
      zone: new FormControl(true, [Validators.required]),
      family: new FormControl(true, [Validators.required]),
      patient: new FormControl(true, [Validators.required]),
      chw: new FormControl(true, [Validators.required])
    });
  }

  createChwsDataFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
      end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
    });
  }

  createDhis2ChwsDataFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
      end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
      districts:new FormControl("", [Validators.required]),
      sites: new FormControl("", [Validators.required]),
      username: new FormControl("", [Validators.required]),
      password: new FormControl("", [Validators.required]),
      

    });
  }

  genarateSites() {
    this.sites$ = [];
    const dist: string[] = Functions.returnEmptyArrayIfNul(this.dhis2ChwsDataForm.value.districts);
    this.dhis2ChwsDataForm.value.sites = "";
    if (Functions.notNull(dist)) {
      for (let d = 0; d < this.Sites$.length; d++) {
        const site = this.Sites$[d];
        if (Functions.notNull(site)) if (dist.includes(site.district.id)) this.sites$.push(site)
      }
    } else {
      this.sites$ = [];
    }
  }

  getSiteById(id:string):string{
    for (let x = 0; x < this.sites$.length; x++) {
      const sit = this.sites$[x];
      if (sit.external_id == id) return sit.name;
    }
    return id;
  }

  syncOrgUnitsFromCouchDb(): void {
    this.loading4 = true;
    this.tab4_messages = null;
    this.sync.syncOrgUnits(this.orgUnitAndPersonForm.value).subscribe((response: OrgUnitImport) => {
      this.loading4 = false;
      this.tab4_messages = response;
      // console.log(response);
    }, (err: any) => {
      this.loading4 = false;
      this.tab4_messages = err.error as OrgUnitImport;
    });
  }

  syncChwsDataFromCouchDb(): void {
    this.loading5 = true;
    this.tab5_messages = null;
    this.sync.syncCouchDbChwsData(this.chwsDataForm.value).subscribe((response: OrgUnitImport) => {
      this.loading5 = false;
      this.tab5_messages = response;
      // console.log(response);
    }, (err: any) => {
      this.loading5 = false;
      this.tab5_messages = err.error as OrgUnitImport;
    });
  }

 async syncChwsDataFromDhis2(): Promise<void> {
    const sites: string[] = Functions.returnEmptyArrayIfNul(this.dhis2ChwsDataForm.value.sites);

    this.tab6_messages = [];
    var i:number = 0;
    this.loading6 = true;

    for (let ou = 0; ou < sites.length; ou++) {
      await this.sync.syncDhis2ChwsData({
        orgUnit: sites[ou],
        // orgUnit: 'orgUnit:in:k52TtOanhCc',
        filter: [`RlquY86kI66:GE:${this.dhis2ChwsDataForm.value.start_date}:LE:${this.dhis2ChwsDataForm.value.end_date}`],
        // filter: [`RlquY86kI66:GE:2022-06-21:LE:2022-06-31`],
        fields: ['event', 'orgUnit', 'orgUnitName', 'dataValues[dataElement,value]'],
        username:this.dhis2ChwsDataForm.value.username,
        password:this.dhis2ChwsDataForm.value.password
      }).subscribe((response: OrgUnitImport) => {
        this.tab6_messages.push(response);
        this.loading6 = false;
        return;
        // console.log(response);
      }, (err: any) => {
        this.loading6 = false;
        this.tab6_messages.push(err.error as OrgUnitImport);
        return;
      });
      
    }
   


  }

}
