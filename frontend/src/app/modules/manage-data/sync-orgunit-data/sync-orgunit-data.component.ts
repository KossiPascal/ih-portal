import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CouchDbUsers, Districts, OrgUnitImport, Sites } from '@ih-app/models/Sync';
import { AuthService } from '@ih-app/services/auth.service';
import { SyncService } from '@ih-app/services/sync.service';
import { notNull, returnDataAsArray } from '@ih-app/shared/functions';
import { startEnd21and20Date } from '@ih-src/app/shared/dates-utils';

@Component({
  selector: 'sync-orgunit-data',
  templateUrl: './sync-orgunit-data.component.html',
  styleUrls: ['./sync-orgunit-data.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SyncOrgUnitDataComponent implements OnInit {


  chwsDataForm!: FormGroup;
  dhis2ChwsDataForm!: FormGroup;
  orgUnitAndPersonForm!: FormGroup;

  tab1_messages: OrgUnitImport | null = null;
  tab2_messages: OrgUnitImport | null = null;
  tab3_messages: OrgUnitImport[] = [];
  tab4_messages!: string|null;

  loading1!: boolean;
  loading2!: boolean;
  loading3!: boolean;
  loading4!: boolean;

  users$!:CouchDbUsers[];


  LoadingMsg: string = "Loading..."
  Districts$: Districts[] = [];
  Sites$: Sites[] = [];
  sites$: Sites[] = [];
  initDate!: { start_date: string, end_date: string };

  constructor(private sync: SyncService, private auth: AuthService) { 
  }
  

  ngOnInit(): void {

    this.initDate = startEnd21and20Date();

    this.sync.getDistrictsList().subscribe(async (_d$: { status: number, data: Districts[] }) => {
      if (_d$.status == 200) {
        this.Districts$ = _d$.data;
        this.sync.getSitesList().subscribe(async (res: { status: number, data: Sites[] }) => {
          if (res.status == 200) this.Sites$ = res.data;
          this.getChtUsersFromDb();
        }, (err: any) => console.log(err));
      }
    }, (err: any) => console.log(err));

    this.loading1 = false;
    this.loading2 = false;
    this.loading3 = false;
    this.loading4 = false;

    this.chwsDataForm = this.createChwsDataFormGroup();
    this.dhis2ChwsDataForm = this.createDhis2ChwsDataFormGroup();
    this.orgUnitAndPersonForm = this.createOrgUnitAndPersonFormGroup();

  }

  createOrgUnitAndPersonFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
      end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
      site: new FormControl(true, [Validators.required]),
      zone: new FormControl(true, [Validators.required]),
      family: new FormControl(true, [Validators.required]),
      patient: new FormControl(true, [Validators.required]),
      chw: new FormControl(true, [Validators.required]),
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
      // username: new FormControl("", [Validators.required]),
      // password: new FormControl("", [Validators.required]),
    });
  }

  genarateSites() {
    this.sites$ = [];
    const dist: string[] = returnDataAsArray(this.dhis2ChwsDataForm.value.districts);
    this.dhis2ChwsDataForm.value.sites = "";
    if (notNull(dist)) {
      for (let d = 0; d < this.Sites$.length; d++) {
        const site = this.Sites$[d];
        if (notNull(site)) if (dist.includes(site.district.id)) this.sites$.push(site)
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
    this.loading1 = true;
    this.tab1_messages = null;
    this.sync.syncOrgUnits(this.orgUnitAndPersonForm.value).subscribe((response: OrgUnitImport) => {
      this.loading1 = false;
      this.tab1_messages = response;
      // console.log(response);
    }, (err: any) => {
      this.loading1 = false;
      this.tab1_messages = err.error as OrgUnitImport;
    });
  }

  syncChtUsersFromCouchDb(): void {
    this.loading4 = true;
    this.tab4_messages = null;
    this.sync.syncCouchDbUsers().subscribe((res: {status:number, data:CouchDbUsers[]|string}) => {
      if (res.status == 200) {
        this.users$ = res.data as CouchDbUsers[];
      } else {
        this.tab4_messages = res.data as string;
      }
      this.loading4 = false;
      // console.log(response);
    }, (err: any) => {
      this.tab4_messages = err.error;
      this.loading4 = false;
    });
  }

  getChtUsersFromDb(): void {
    this.sync.getChtUsers().subscribe((res: {status:number, data:CouchDbUsers[]|string}) => {
      if (res.status == 200) {
        this.users$ = res.data as CouchDbUsers[];
      }
    }, (err: any) => {
    });
  }
  // syncCouchDbUsers
  syncChtOrgUnitFromCouchDb(): void {
    this.loading2 = true;
    this.tab2_messages = null;
    this.sync.syncCouchDbOrgUnit(this.chwsDataForm.value).subscribe((response: OrgUnitImport) => {
      this.loading2 = false;
      this.tab2_messages = response;
      // console.log(response);
    }, (err: any) => {
      this.loading2 = false;
      this.tab2_messages = err.error as OrgUnitImport;
    });
  }

 async syncChwsDataFromDhis2(): Promise<void> {
    const sites: string[] = returnDataAsArray(this.dhis2ChwsDataForm.value.sites);

    this.tab3_messages = [];
    this.loading3 = true;
    var resp = [];

    for (let ou = 0; ou < sites.length; ou++) {
      await this.sync.syncDhis2ChwsData({
        orgUnit: sites[ou],
        // orgUnit: 'orgUnit:in:k52TtOanhCc',
        filter: [`RlquY86kI66:GE:${this.dhis2ChwsDataForm.value.start_date}:LE:${this.dhis2ChwsDataForm.value.end_date}`],
        // filter: [`RlquY86kI66:GE:2022-06-21:LE:2022-06-31`],
        fields: ['event', 'orgUnit', 'orgUnitName', 'dataValues[dataElement,value]'],
        // username:this.dhis2ChwsDataForm.value.username,
        // password:this.dhis2ChwsDataForm.value.password
      }).subscribe((response: OrgUnitImport) => {
        this.tab3_messages.push(response);
        resp.push('Ok');
        if (resp.length == sites.length) this.loading3 = false;
        return;
        // console.log(response);
      }, (err: any) => {
        this.loading3 = false;
        this.tab3_messages.push(err.error as OrgUnitImport);
        return;
      });
      
    }
  }

}
