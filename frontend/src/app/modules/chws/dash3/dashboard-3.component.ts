import { Component, OnInit } from '@angular/core';
import { AggragateData, Chws, Districts, Families, FilterParams, Patients, Sites, Zones } from '@ih-app/models/Sync';
import { SyncService } from '@ih-app/services/sync.service';
import { FormControl, FormGroup } from '@angular/forms';
import { IndexDbService } from '@ih-src/app/services/index-db/index-db.service';
import { capitaliseDataGiven, notNull, patientAgeDetails, returnDataAsArray } from '@ih-app/shared/functions';
import { AuthService } from '@ih-app/services/auth.service';
import { User } from '@ih-src/app/models/User';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-3',
  templateUrl: `./dashboard-3.component.html`,
  styleUrls: [
    './dashboard-3.component.css'
  ]
})
export class ChwsDashboard3Component implements OnInit {
  constructor(private auth: AuthService, private db: IndexDbService, private sync: SyncService, private router: Router) {
  }


  aggradateDataForm!: FormGroup;

  createDataFilterFormGroup(): FormGroup {
    return new FormGroup({
      districts: new FormControl("", []),
      sites: new FormControl("", []),
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
    
  chwOU: Chws | null | undefined;
  currentUser:User | null | undefined;

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser();
    this.chwOU = this.auth.ChwLogged();
    if (this.chwOU == null || !notNull(this.chwOU)) {
      // location.href = 'chws/select_orgunit';
      this.router.navigate(['chws/select_orgunit']);
    }
    this.isLoading = false;
    this.aggradateDataForm = this.createDataFilterFormGroup();
    this.initAllData(false);
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
          });
        }, (err: any) => {
          this.isLoading = false;
        });
      }, (err: any) => {
        this.isLoading = false;
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
          });
        }, (err: any) => {
          this.isLoading = false;
        });
      }, (err: any) => {
        this.isLoading = false;
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
    const districts: string[] = returnDataAsArray(this.chwOU?.site.district.id);
    const sites: string[] = returnDataAsArray(this.chwOU?.site.id);
    const chws: string[] = returnDataAsArray(this.chwOU?.id);

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

    let total_famille: AggragateData = { label: capitaliseDataGiven('total_famille_enregistre', '_', ' '), count: this.familiesChwsCount, icon: "ion-person-add", color: "bg-danger", detailUrl: "/view-chws-data/dashboard1" };
    let total_patient: AggragateData = { label: capitaliseDataGiven('total_patient_enregistre', '_', ' '), count: this.patientsChwsCount, icon: "ion-person-add", color: "bg-success", detailUrl: "/view-chws-data/dashboard1" };

    let total_patient_cible: AggragateData = { label: capitaliseDataGiven('total_patient_cible', '_', ' '), count: this.patientsCibleChwsCount, icon: "ion-person-add", color: "bg-warning", detailUrl: "/view-chws-data/dashboard1" };

    this.allAggragateData.push(total_famille);
    this.allAggragateData.push(total_patient);
    this.allAggragateData.push(total_patient_cible);


    this.initMsg = '';
    this.isLoading = false;
  }


}
