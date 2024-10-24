import { Component, OnInit } from '@angular/core';
import { AggragateData, Chws, Districts, Families, FilterParams, Patients, Sites, Zones } from '@ih-app/models/Sync';
import { SyncService } from '@ih-app/services/sync.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IndexDbService } from '@ih-src/app/services/index-db/index-db.service'; // db index start
import { capitaliseDataGiven, notNull, patientAgeDetails, returnDataAsArray } from '@ih-app/shared/functions';
import { AuthService } from '@ih-app/services/auth.service';


@Component({
  selector: 'app-dashboard-3',
  templateUrl: `./dashboard-3.component.html`,
  styleUrls: [
    './dashboard-3.component.css'
  ]
})
export class Dashboard3Component implements OnInit {
  constructor(private auth: AuthService, private db: IndexDbService, private sync: SyncService) {
  }

  aggradateDataForm!: FormGroup;

  createDataFilterFormGroup(): FormGroup {
    return new FormGroup({
      districts: new FormControl("", [Validators.required]),
      sites: new FormControl("", [Validators.required]),
      chws: new FormControl(""),
    });
  }
  initMsg!: string;
  isLoading!: boolean;

  identifyAggragateData(index: number, item: AggragateData) {
    return item.label;
  }

  allAggragateData: AggragateData[] = [];
  Districts$: Districts[] = [];
  Sites$: Sites[] = [];
  Chws$: Chws[] = [];
  Zones$: Zones[] = [];
  Patients$: Patients[] = [];
  Families$: Families[] = [];

  chws$: Chws[] = [];
  sites$: Sites[] = [];

  districtsChwsCount: number = 0;
  sitesChwsCount: number = 0;
  zonesChwsCount: number = 0;
  patientsChwsCount: number = 0;
  patientsCibleChwsCount: number = 0;
  familiesChwsCount: number = 0;
  chwsCount: number = 0;


  ngOnInit(): void {
    this.isLoading = false;
    this.aggradateDataForm = this.createDataFilterFormGroup();
    this.initAllData(true);
  }

  async initAllData(firstInit: boolean = false) {
    const filter: FilterParams = this.ParamsToFilter();
    if (firstInit == true) {
      this.isLoading = true;
      this.initMsg = 'Chargement des Districts ...';
      this.sync.getDistrictsList(filter).subscribe(async (_d$: { status: number, data: Districts[] }) => {
        if (_d$.status == 200) this.Districts$ = _d$.data;
        this.initMsg = 'Chargement des Sites ...';
        this.sync.getSitesList(filter).subscribe(async (_s$: { status: number, data: Sites[] }) => {
          if (_s$.status == 200) this.Sites$ = _s$.data;
          this.initMsg = 'Chargement des ASC ...';
          this.sync.getChwsList(filter).subscribe(async (_c$: { status: number, data: Chws[] }) => {
            if (_c$.status == 200) this.Chws$ = _c$.data;
          }, (err: any) => {
            this.isLoading = false;
            console.log(err.error);
          });
        }, (err: any) => {
          this.isLoading = false;
          console.log(err.error);
        });
      }, (err: any) => {
        this.isLoading = false;
        console.log(err.error);
      });

    } else {
      this.isLoading = false;
    }

    if (firstInit == false) {
      this.isLoading = true;
      this.initMsg = 'Chargement des Zones ...';
      this.sync.getZonesList(filter).subscribe(async (_z$: { status: number, data: Zones[] }) => {
        if (_z$.status == 200) this.Zones$ = _z$.data;
        this.initMsg = 'Chargement des Familles ...';
        this.sync.getFamilyList(filter).subscribe(async (_f$: { status: number, data: Families[] }) => {
          if (_f$.status == 200) this.Families$ = _f$.data;
          this.initMsg = 'Chargement des Patients ...';
          this.sync.getPatientsList(filter).subscribe(async (_p$: { status: number, data: Patients[] }) => {
            if (_p$.status == 200) this.Patients$ = _p$.data;
            this.initDataFilted(filter);
          }, (err: any) => {
            this.isLoading = false;
            console.log(err);
          });
        }, (err: any) => {
          this.isLoading = false;
          console.log(err.error);
        });
      }, (err: any) => {
        this.isLoading = false;
        console.log(err.error);
      });
    } else {
      this.isLoading = false;
    }
  }

  formatHostName(val: string): string {
    return val.replace('.org', '').replace('-', '.').trim();
  }

  genarateSites() {
    this.sites$ = [];
    this.chws$ = [];
    const dist: string[] = returnDataAsArray(this.aggradateDataForm.value.districts);
    this.aggradateDataForm.value["sites"] = [];
    this.aggradateDataForm.value["chws"] = [];

    if (notNull(dist)) {
      for (let d = 0; d < this.Sites$.length; d++) {
        const site = this.Sites$[d];
        if (notNull(site)) if (dist.includes(site.district.id)) this.sites$.push(site)
      }
    } else {
      this.sites$ = [];
    }
  }

  genarateChws() {
    const sites: string[] = returnDataAsArray(this.aggradateDataForm.value.sites);
    this.chws$ = [];
    this.aggradateDataForm.value["chws"] = [];
    if (notNull(sites)) {
      for (let d = 0; d < this.Chws$.length; d++) {
        const chws = this.Chws$[d];
        if (notNull(chws)) if (sites.includes(chws.site.id)) this.chws$.push(chws)
      }
    } else {
      this.chws$ = [];
    }
  }

  ParamsToFilter(): FilterParams {
    const districts: string[] = returnDataAsArray(this.aggradateDataForm.value.districts);
    const sites: string[] = returnDataAsArray(this.aggradateDataForm.value.sites);
    const chws: string[] = returnDataAsArray(this.aggradateDataForm.value.chws);

    var params: FilterParams = {
      districts: districts,
      sites: sites,
      chws: chws,
      withDhis2Data: false
    }
    return params;
  }

  initDataFilted(params?: FilterParams): void {

    this.isLoading = true;
    const { start_date, end_date, chws, sites, districts } = params ?? this.ParamsToFilter();

    this.districtsChwsCount = 0;
    this.sitesChwsCount = 0;
    this.familiesChwsCount = 0;
    this.patientsChwsCount = 0;
    this.patientsCibleChwsCount = 0;
    this.zonesChwsCount = 0;
    this.chwsCount = 0;
    this.allAggragateData = [];

    for (let i = 0; i < this.Districts$!.length; i++) {
      const dist = this.Districts$![i];
      if (notNull(districts)) {
        if (districts?.includes(dist.id)) this.districtsChwsCount++;
      } else {
        this.districtsChwsCount++;
      }
    }

    for (let i = 0; i < this.Sites$!.length; i++) {
      const site = this.Sites$![i];
      if (notNull(districts) && notNull(sites)) {
        if (districts?.includes(site.district.id) && sites?.includes(site.id)) this.sitesChwsCount++;
      } else if (notNull(districts) && !notNull(sites)) {
        if (districts?.includes(site.district.id)) this.sitesChwsCount++;
      } else {
        this.sitesChwsCount++;
      }
    }

    for (let i = 0; i < this.Zones$!.length; i++) {
      const zone = this.Zones$![i];
      if (notNull(districts) && notNull(sites) && notNull(chws)) {
        if (districts?.includes(zone.site.district.id) && sites?.includes(zone.site.id) && chws?.includes(zone.chw_id)) this.zonesChwsCount++;
      } else if (notNull(districts) && notNull(sites) && !notNull(chws)) {
        if (districts?.includes(zone.site.district.id) && sites?.includes(zone.site.id)) this.zonesChwsCount++;
      } else if (notNull(districts) && !notNull(sites) && !notNull(chws)) {
        if (districts?.includes(zone.site.district.id)) this.zonesChwsCount++;
      } else {
        this.zonesChwsCount++;
      }
    }

    for (let i = 0; i < this.Chws$!.length; i++) {
      const asc = this.Chws$![i];
      if (notNull(districts) && notNull(sites) && notNull(chws)) {
        if (districts?.includes(asc.site.district.id) && sites?.includes(asc.site.id) && chws?.includes(asc.zone.chw_id)) this.chwsCount++;
      } else if (notNull(districts) && notNull(sites) && !notNull(chws)) {
        if (districts?.includes(asc.site.district.id) && sites?.includes(asc.site.id)) this.chwsCount++;
      } else if (notNull(districts) && !notNull(sites) && !notNull(chws)) {
        if (districts?.includes(asc.site.district.id)) this.chwsCount++;
      } else {
        this.chwsCount++;
      }
    }

    for (let i = 0; i < this.Families$!.length; i++) {
      const family = this.Families$![i];
      if (notNull(districts) && notNull(sites) && notNull(chws)) {
        if (districts?.includes(family.site.district.id) && sites?.includes(family.site.id) && chws?.includes(family.zone.chw_id)) this.familiesChwsCount++;
      } else if (notNull(districts) && notNull(sites) && !notNull(chws)) {
        if (districts?.includes(family.site.district.id) && sites?.includes(family.site.id)) this.familiesChwsCount++;
      } else if (notNull(districts) && !notNull(sites) && !notNull(chws)) {
        if (districts?.includes(family.site.district.id)) this.familiesChwsCount++;
      } else {
        this.familiesChwsCount++;
      }
    }

    for (let i = 0; i < this.Patients$!.length; i++) {
      const patient = this.Patients$![i];
      const isInCible = patientAgeDetails(patient).is_in_cible;

      if (notNull(districts) && notNull(sites) && notNull(chws)) {
        if (districts?.includes(patient.site.district.id) && sites?.includes(patient.site.id) && chws?.includes(patient.zone.chw_id)) {
          this.patientsChwsCount++;
          if (isInCible) this.patientsCibleChwsCount++;
        }
      } else if (notNull(districts) && notNull(sites) && !notNull(chws)) {
        if (districts?.includes(patient.site.district.id) && sites?.includes(patient.site.id)) {
          this.patientsChwsCount++;
          if (isInCible) this.patientsCibleChwsCount++;
        }
      } else if (notNull(districts) && !notNull(sites) && !notNull(chws)) {
        if (districts?.includes(patient.site.district.id)) {
          this.patientsChwsCount++;
          if (isInCible) this.patientsCibleChwsCount++;
        }
      } else {
        this.patientsChwsCount++;
        if (isInCible) this.patientsCibleChwsCount++;
      }
    }


    let total_district: AggragateData = { label: capitaliseDataGiven('total_district_enregistre', '_', ' '), count: this.districtsChwsCount, icon: "ion-stats-bars", color: "bg-info", detailUrl: "/view-chws-data/dashboard1" };
    let total_site: AggragateData = { label: capitaliseDataGiven('total_site_enregistre', '_', ' '), count: this.sitesChwsCount, icon: "ion-stats-bars", color: "bg-info", detailUrl: "/view-chws-data/dashboard1" };

    let total_ASC: AggragateData = { label: capitaliseDataGiven('total_ASC_enregistre', '_', ' '), count: this.chwsCount, icon: "ion-pie-graph", color: "bg-primary", detailUrl: "/view-chws-data/dashboard1" };
    let total_zone: AggragateData = { label: capitaliseDataGiven('total_zone_enregistre', '_', ' '), count: this.zonesChwsCount, icon: "ion-pie-graph", color: "bg-primary", detailUrl: "/view-chws-data/dashboard1" };

    let total_famille: AggragateData = { label: capitaliseDataGiven('total_famille_enregistre', '_', ' '), count: this.familiesChwsCount, icon: "ion-person-add", color: "bg-danger", detailUrl: "/view-chws-data/dashboard1" };
    let total_patient: AggragateData = { label: capitaliseDataGiven('total_patient_enregistre', '_', ' '), count: this.patientsChwsCount, icon: "ion-person-add", color: "bg-success", detailUrl: "/view-chws-data/dashboard1" };

    let total_patient_cible: AggragateData = { label: capitaliseDataGiven('total_patient_cible', '_', ' '), count: this.patientsCibleChwsCount, icon: "ion-person-add", color: "bg-warning", detailUrl: "/view-chws-data/dashboard1" };

    if (total_district.count > 1) this.allAggragateData.push(total_district);
    if (total_site.count > 1) this.allAggragateData.push(total_site);
    if (total_ASC.count > 1) this.allAggragateData.push(total_ASC);
    if (total_zone.count > 1) this.allAggragateData.push(total_zone);

    this.allAggragateData.push(total_famille);
    this.allAggragateData.push(total_patient);
    this.allAggragateData.push(total_patient_cible);


    this.initMsg = '';
    this.isLoading = false;
  }


}
