import { Component, OnInit } from '@angular/core';
import { AggragateData, Chws, Families, FilterParams, Patients, Sites, Zones } from '@ih-app/models/Sync';
import { SyncService } from '@ih-app/services/sync.service';
// import * as Highcharts from 'highcharts';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChtOutPutData, DataIndicators } from '@ih-app/models/DataAggragate';

import { IndexDbService } from '@ih-app/services/index-db.service'; // db index start
import { DateUtils, Functions } from '@ih-app/shared/functions';
// import { liveQuery } from 'dexie';



@Component({
  selector: 'app-dashboard-1',
  templateUrl: `./dashboard-1.component.html`
})
export class Dashboard1Component implements OnInit {
  constructor(private db: IndexDbService,private sync: SyncService) { }
  
  aggradateDataForm!: FormGroup;
  initDate!: { start_date: string, end_date: string };

  createDataFilterFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
      end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
      sites: new FormControl(""),
      chws: new FormControl(""),
      sources: new FormControl(""),
    });
  }
  initMsg!: string;
  isLoading!: boolean;

  identifyAggragateData(index:number, item: AggragateData) {
    return item.label;
  }

  allAggragateData: AggragateData[] = [];


  sources$: string[] = []

  Chws$: Chws[] = [];
  Sites$: Sites[] = [];

  chws$: Chws[] = [];
  sites$: Sites[] = [];

  Zones$: Zones[] = [];
  Patients$: Patients[] = [];
  Families$: Families[] = [];

  chwsCount: number = 0;
  sitesChwsCount: number = 0;
  zonesChwsCount: number = 0;
  patientsChwsCount: number = 0;
  familiesChwsCount: number = 0;


  
  // sites$ = liveQuery(() => this.db.getAllByParams(this.db.sites,{}));

  ngOnInit(): void {
    this.isLoading = false;
    this.initDate = DateUtils.startEnd21and20Date();
    this.aggradateDataForm = this.createDataFilterFormGroup();
    this.initAllData();
    
  }

  async initAllData() {
    // const sites$ = await this.db.getAllByParams(this.db.sites);
    this.isLoading = true;

    this.initMsg = 'Chargement des Sites ...';
    this.sync.getSitesList().subscribe(async (_sites: any) => {
      this.Sites$ = _sites;
      for (let s = 0; s < this.Sites$.length; s++) {
        const Did = this.Sites$[s].source;
        if (Did != null && Did != '') if (!this.sources$.includes(Did)) this.sources$.push(Did);
      }
      this.initMsg = 'Chargement des Zones ...';
      this.sync.getZoneList().subscribe((zones$: any) => {
        this.Zones$ = zones$;
        this.initMsg = 'Chargement des ASC ...';
        this.sync.getChwsList().subscribe(async (_chws: any) => {
          this.Chws$ = _chws;
          this.initMsg = 'Chargement des Familles ...';
          this.sync.getFamilyList().subscribe((Families$: any) => {
            this.Families$ = Families$;
            this.initMsg = 'Chargement des Patients ...';
            this.sync.getPatientsList().subscribe((Patients$: any) => {
              this.Patients$ = Patients$;
              this.initDataFilted();
            }, (err: any) =>  {
              this.isLoading = false;
              console.log(err.error);
            });
          }, (err: any) =>  {
            this.isLoading = false;
            console.log(err.error);
          });
        }, (err: any) =>  {
          this.isLoading = false;
          console.log(err.error);
        });
      }, (err: any) =>  {
        this.isLoading = false;
        console.log(err.error);
      });
    }, (err: any) =>  {
      this.isLoading = false;
      console.log(err.error);
    });
  }

  formatHostName(val: string): string {
    return val.replace('.org', '').replace('-', '.').trim();
  }

  genarateSites(){
    const sources:string[] = this.aggradateDataForm.value["sources"];
    this.sites$ = [];
    this.chws$ = [];
    this.aggradateDataForm.value["sites"] = [];
    this.aggradateDataForm.value["chws"] = [];
    if (Functions.notNull(sources)) {
      for (let d = 0; d < this.Sites$.length; d++) {
        const site = this.Sites$[d];
        if (Functions.notNull(site)) if(sources.includes(site.source)) this.sites$.push(site)
      }
    } else {
      this.sites$ = this.Sites$;
    }
  }

  genarateChws(){
    const sites:string[] = this.aggradateDataForm.value["sites"];
    this.chws$ = [];
    this.aggradateDataForm.value["chws"] = [];
    if (Functions.notNull(sites)) {
      for (let d = 0; d < this.Chws$.length; d++) {
        const chws = this.Chws$[d];
        if (Functions.notNull(chws)) if(sites.includes(chws.site.id)) this.chws$.push(chws)
      }
    } else {
      this.chws$ = this.Chws$;
    }
  }

  returnEmptyArrayIfNul(data:any):string[]{
    return Functions.notNull(data) ? data : [];
  }

  initDataFilted(): void {
    const startDate:string = this.aggradateDataForm.value["start_date"];
    const endDate:string = this.aggradateDataForm.value["end_date"];
    const chws:string[] = this.returnEmptyArrayIfNul(this.aggradateDataForm.value["chws"]);
    const sites:string[] = this.returnEmptyArrayIfNul(this.aggradateDataForm.value["sites"]);
    const sources:string[] = this.returnEmptyArrayIfNul(this.aggradateDataForm.value["sources"]);

    var paramsTopass: FilterParams = {
      start_date: startDate,
      end_date: endDate,
      sources: sources,
      chws: chws,
      sites: sites,
      district: []
    }

      this.isLoading = true;

      this.initDate.start_date = startDate;
      this.initDate.end_date = endDate;
      this.transformData(paramsTopass);
     

  }


  transformData(params: FilterParams) {
    const { start_date, end_date, chws, sites, sources } = params;

    if (Functions.notNull(start_date) && Functions.notNull(end_date)) {


      this.sitesChwsCount = 0;
      this.familiesChwsCount = 0;
      this.patientsChwsCount = 0;
      this.zonesChwsCount = 0;
      this.chwsCount = 0;
      this.allAggragateData = [];

      for (let i = 0; i < this.Sites$!.length; i++) {
        const site = this.Sites$![i];
        if (Functions.notNull(sources)) {
          if (sources?.includes(site.source)) this.sitesChwsCount++;
        } else {
          this.sitesChwsCount++;
        }
      }

      for (let i = 0; i < this.Families$!.length; i++) {
        const family = this.Families$![i];
        if (Functions.notNull(sites) && Functions.notNull(chws)) {
          if (Functions.notNull(sources)) {
            if (sites?.includes(family.site.id) && chws?.includes(family.zone.chw_id) && sources?.includes(family.site.source)) this.familiesChwsCount++;
          } else {
            if (sites?.includes(family.site.id) && chws?.includes(family.zone.chw_id)) this.familiesChwsCount++;
          }
        } else if (Functions.notNull(sites) && !Functions.notNull(chws)) {

          if (Functions.notNull(sources)) {
            if (sites?.includes(family.site.id) && sources?.includes(family.site.source)) this.familiesChwsCount++;
          } else {
            if (sites?.includes(family.site.id)) this.familiesChwsCount++;
          }
        } else if (Functions.notNull(sources)) {
          if (sources?.includes(family.site.source)) this.familiesChwsCount++;
        } else {
          this.familiesChwsCount++;
        }
      }

      for (let i = 0; i < this.Patients$!.length; i++) {
        const patient = this.Patients$![i];
        if (Functions.notNull(sites) && Functions.notNull(chws)) {
          if (Functions.notNull(sources)) {
            if (sites?.includes(patient.site.id) && chws?.includes(patient.zone.chw_id) && sources?.includes(patient.site.source)) this.patientsChwsCount++;
          } else {
            if (sites?.includes(patient.site.id) && chws?.includes(patient.zone.chw_id)) this.patientsChwsCount++;
          }
        } else if (Functions.notNull(sites) && !Functions.notNull(chws)) {
          if (Functions.notNull(sources)) {
            if (sites?.includes(patient.site.id) && sources?.includes(patient.site.source)) this.patientsChwsCount++;
          } else {
            if (sites?.includes(patient.site.id)) this.patientsChwsCount++;
          }
        } else if (Functions.notNull(sources)) {
          if (sources?.includes(patient.site.source)) this.patientsChwsCount++;
        } else {
          this.patientsChwsCount++;
        }
      }

      for (let i = 0; i < this.Zones$!.length; i++) {
        const zone = this.Zones$![i];
        if (Functions.notNull(sites) && Functions.notNull(chws)) {
          if (Functions.notNull(sources)) {
            if (sites?.includes(zone.site.id) && chws?.includes(zone.chw_id) && sources?.includes(zone.site.source)) this.zonesChwsCount++;
          } else {
            if (sites?.includes(zone.site.id) && chws?.includes(zone.chw_id)) this.zonesChwsCount++;
          }
        } else if (Functions.notNull(sites) && !Functions.notNull(chws)) {
          if (Functions.notNull(sources)) {
            if (sites?.includes(zone.site.id) && sources?.includes(zone.site.source)) this.zonesChwsCount++;
          } else {
            if (sites?.includes(zone.site.id)) this.zonesChwsCount++;
          }
        } else if (Functions.notNull(sources)) {
          if(sources?.includes(zone.site.source)) this.zonesChwsCount++;
        } else {
          this.zonesChwsCount++;
        }
      }

      for (let i = 0; i < this.Chws$!.length; i++) {
        const asc = this.Chws$![i];
        if (Functions.notNull(sites) && Functions.notNull(chws)) {
          if (Functions.notNull(sources)) {
            if (sites?.includes(asc.site.id) && chws?.includes(asc.zone.chw_id) && sources?.includes(asc.site.source)) this.chwsCount++;
          } else {
            if (sites?.includes(asc.site.id) && chws?.includes(asc.zone.chw_id)) this.chwsCount++;
          }
        } else if (Functions.notNull(sites) && !Functions.notNull(chws)) {
          if (Functions.notNull(sources)) {
            if (sites?.includes(asc.site.id) && sources?.includes(asc.site.source)) this.chwsCount++;
          } else {
            if (sites?.includes(asc.site.id)) this.chwsCount++;
          }
        } else if (Functions.notNull(sources)) {
          if (sources?.includes(asc.site.source)) this.chwsCount++;
        } else {
          this.chwsCount++;
        }
      }


      let total_site: AggragateData = { label: Functions.capitaliseDataGiven('total_site_enregistre', '_', ' '), count: this.sitesChwsCount, icon: "ion-stats-bars", color: "bg-success", detailUrl: "/dashboards/dash1" };
      let total_ASC: AggragateData = { label: Functions.capitaliseDataGiven('total_ASC_enregistre', '_', ' '), count: this.chwsCount, icon: "ion-person-add", color: "bg-warning", detailUrl: "/dashboards/dash1" };
      let total_famille: AggragateData = { label: Functions.capitaliseDataGiven('total_famille_enregistre', '_', ' '), count: this.familiesChwsCount, icon: "ion-pie-graph", color: "bg-danger", detailUrl: "/dashboards/dash1" };
      let total_patient: AggragateData = { label: Functions.capitaliseDataGiven('total_patient_enregistre', '_', ' '), count: this.patientsChwsCount, icon: "ion-bag", color: "bg-primary", detailUrl: "/dashboards/dash1" };
      let total_zone: AggragateData = { label: Functions.capitaliseDataGiven('total_zone_enregistre', '_', ' '), count: this.zonesChwsCount, icon: "ion-bag", color: "bg-success", detailUrl: "/dashboards/dash1" };

      this.allAggragateData.push(total_site);
      this.allAggragateData.push(total_ASC);
      this.allAggragateData.push(total_famille);
      this.allAggragateData.push(total_patient);
      this.allAggragateData.push(total_zone);

    }

    this.initMsg = '';
    this.isLoading = false;
  }
  

}
