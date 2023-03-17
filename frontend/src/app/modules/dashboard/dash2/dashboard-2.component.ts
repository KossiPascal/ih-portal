import { Component, OnInit } from '@angular/core';
import { AggragateData, Chws, ChwsDataFormDb, Districts, Families, FilterParams, Patients, Sites, Zones } from '@ih-app/models/Sync';
import { SyncService } from '@ih-app/services/sync.service';
// import * as Highcharts from 'highcharts';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChtOutPutData, DataIndicators } from '@ih-app/models/DataAggragate';

import { DateUtils, Functions, notNull } from '@ih-app/shared/functions';
import { AuthService } from '@ih-app/services/auth.service';
import { AppStorageService } from '@ih-app/services/cookie.service';
import { Roles } from '@ih-app/shared/roles';
// import { liveQuery } from 'dexie';

@Component({
  selector: 'app-dashboard-2',
  templateUrl: `./dashboard-2.component.html`,
  styleUrls: [
    './dashboard-2.component.css'
  ]
})
export class Dashboard2Component implements OnInit {


  constructor(private store: AppStorageService, private auth: AuthService, private sync: SyncService) {
    if (!this.roles.isSupervisorMentor() && !this.roles.isChws()) location.href = this.auth.userValue()?.defaultRedirectUrl!;
  }

  public roles = new Roles(this.store);

  aggradateDataForm!: FormGroup;
  initDate!: { start_date: string, end_date: string };
  defaultParams?: FilterParams
  chwOU: Chws | null = null;

  createDataFilterFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
      end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
      sources: new FormControl(""),
      districts: new FormControl("", !this.roles.isChws() ? [Validators.required] : []),
      sites: new FormControl("", !this.roles.isChws() ? [Validators.required] : []),
      chws: new FormControl(""),
      day: new FormControl(this.day, [Validators.required])
    });
  }
  initMsg!: string;
  isLoading!: boolean;
  allAggragateData: AggragateData[] = [];

  identifyAggragateData(index: number, chw: DataIndicators) {
    return chw.total_vad;
  }



  public options: any = {
    Chart: {
      type: 'area',
      height: 700
    },
    title: {
      text: 'Données par ASC'
    },
    credits: {
      enabled: false
    },
    xAxis: {
      categories: ['ASC1', 'ASC2', 'ASC3', 'ASC4', 'ASC5', 'ASC6', 'ASC7'],
      tickmarkPlacement: 'on',
      title: {
        enabled: true
      }
    },
    yAxis: {
      categories: [],
      max: 5268,
      min: 0,
      tickmarkPlacement: 'on',
      title: {
        enabled: false
      }
    },
    series: [
      {
        name: 'Recherche Active',
        data: [502, 635, 809, 947, 1402, 3634, 5268]
      },
      {
        name: 'Pcime',
        data: [163, 203, 276, 408, 547, 729, 628]
      },
      {
        name: 'Maternel',
        data: [18, 31, 54, 156, 339, 818, 1201]
      }
    ]
  }


  data_error_messages: string = '';
  data_no_data_found: boolean = false;

  FinalChwsOutputData$: { chw: Chws, data: DataIndicators }[] = [];

  selectedChwData: { chw: Chws, data: DataIndicators } | any = null;
  ChwsDataFromDbError: string = '';

  response$!: { status: number, data: ChwsDataFormDb[] | any };

  Sources$: string[] = [];
  Districts$: Districts[] = [];
  Sites$: Sites[] = [];
  Chws$: Chws[] = [];
  Zones$: Zones[] = [];
  Patients$: Patients[] = [];
  Families$: Families[] = [];

  chws$: Chws[] = [];
  sites$: Sites[] = [];
  days$: number[] = Functions.range(18, 1);
  day: number = 18;

  

  ngOnInit(): void {
    this.chwOU = this.auth.chwsOrgUnit();
    if (this.roles.isChws() && (this.chwOU == null || !notNull(this.chwOU))) {
      location.href = 'chws/select_orgunit';
    }
    this.isLoading = false;
    this.initDate = DateUtils.startEnd21and20Date();
    this.aggradateDataForm = this.createDataFilterFormGroup();
    if (!this.roles.isChws()) {
      this.initAllData();
    } else {
      this.initDataFilted();
    }
    // Highcharts.chart('container', this.options);
  }

  async initAllData() {
    // const sites$ = await this.db.getAllByParams(this.db.sites);
    // sites$ = liveQuery(() => this.db.getAllByParams(this.db.sites,{}));
    this.isLoading = true;
    const filter: FilterParams = this.ParamsToFilter();
    this.initMsg = 'Chargement des Districts ...';
    this.sync.getDistrictsList(filter).subscribe(async (_d$: { status: number, data: Districts[] }) => {
      if (_d$.status == 200) this.Districts$ = _d$.data;
      this.initMsg = 'Chargement des Sites ...';
      this.sync.getSitesList(filter).subscribe(async (_s$: { status: number, data: Sites[] }) => {
        if (_s$.status == 200) this.Sites$ = _s$.data;
        this.genarateSites();
        this.initMsg = 'Chargement des ASC ...';
        this.sync.getChwsList(filter).subscribe(async (_c$: { status: number, data: Chws[] }) => {
          if (_c$.status == 200) this.Chws$ = _c$.data;
          this.genarateChws();
          this.isLoading = false;
          // this.initDataFilted();
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
  }



  capitaliseDataGiven(str: any, inputSeparator?: string, outPutSeparator?: string): string {
    return Functions.capitaliseDataGiven(str, inputSeparator, outPutSeparator);
  }

  seeSelectedChwData(data: { chw: Chws, data: DataIndicators }) {
    this.selectedChwData = data;
  }

  genarateSites() {
    this.sites$ = [];
    this.chws$ = [];
    const dist: string[] = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.districts);
    this.aggradateDataForm.value.sites = [];
    this.aggradateDataForm.value.chws = [];

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
    const sites: string[] = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.sites);
    this.chws$ = [];
    this.aggradateDataForm.value.chws = [];
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
    const startDate: string = this.aggradateDataForm.value.start_date;
    const endDate: string = this.aggradateDataForm.value.end_date;
    const src: string = this.aggradateDataForm.value.sources;
    const sources: string[] = notNull(src) ? Functions.returnDataAsArray(src) : [];
    var districts: string[] = [];
    var sites: string[] = [];
    var chws: string[] = [];

    if (!this.roles.isChws()) {
      districts = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.districts);
      sites = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.sites);
      chws = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.chws);
    } else {
      if (this.chwOU != null && notNull(this.chwOU)) {
        districts = Functions.returnDataAsArray(this.chwOU.site.district.id);
        sites = Functions.returnDataAsArray(this.chwOU.site.id);
        chws = Functions.returnDataAsArray(this.chwOU.id);

        this.chws$ = [this.chwOU];
      }
    }

    var params: FilterParams = {
      start_date: startDate,
      end_date: endDate,
      sources: sources,
      districts: districts,
      sites: sites,
      chws: chws
    }
    return params;
  }

  returnEmptyArrayIfNul(data: any): string[] {
    return notNull(data) ? data : [];
  }

  getVadPerDay(datas: { chw: Chws, data: DataIndicators }): { val: string, class: string } {
    const div = datas.data.total_vad / this.day;
    var val = (div).toFixed(div < 1 ? 1 : 0);
    if (datas.chw.name.includes('(R)') && datas.data.total_vad <= 0) {
      return { val: val, class: '' };
    } else {
      var _class = 'bg-success';
      if (datas.data.total_vad > 0 && div < (this.day * 10 / this.day) && div >= (this.day * 5 / this.day)) _class = 'bg-warning';
      if (datas.data.total_vad == 0 || datas.data.total_vad > 0 && div < (this.day * 5 / this.day)) _class = 'bg-danger';
      return { val: val, class: _class };
    }
  }

  initDataFilted(params?: FilterParams): void {
    this.isLoading = true;
    this.selectedChwData = null;
    this.day = this.aggradateDataForm.value.day;

    const filters: FilterParams = params ?? this.ParamsToFilter();

    if (
      this.defaultParams?.start_date != filters.start_date ||
      this.defaultParams?.end_date != filters.end_date ||
      this.defaultParams?.districts != filters.districts ||
      this.defaultParams?.sites != filters.sites
      // this.defaultParams?.chws != filters.chws
    ) {
      this.FinalChwsOutputData$ = [];

      this.data_error_messages = '';
      this.data_no_data_found = false;
      this.ChwsDataFromDbError = '';

      this.sync.getAllChwsDataWithParams(filters).subscribe((_res$: { status: number, data: ChwsDataFormDb[] | any }) => {
        this.response$ = _res$;
        this.startTraitement(filters);
      }, (err: any) => {
        this.isLoading = false;
        this.ChwsDataFromDbError = err.toString();
      });
    } else {
      this.startTraitement(filters);
    }
  }



  startTraitement(params?: FilterParams) {
    this.isLoading = true;
    const filters: FilterParams = params ?? this.ParamsToFilter();
    if (this.response$.status == 200) {
      this.FinalChwsOutputData$ = this.getAllAboutData(this.response$.data as ChwsDataFormDb[], this.chws$, filters);
      this.defaultParams = filters;
      this.data_no_data_found = this.FinalChwsOutputData$.length <= 0;
    } else {
      this.data_error_messages = this.response$.data.toString();
      this.data_no_data_found = true;
    }
    this.isLoading = false;
  }



  // ###########################################################################




  getAllAboutData(ChwsDataFromDb$: ChwsDataFormDb[], Chws$: Chws[], params?: FilterParams): { chw: Chws, data: DataIndicators }[] {

    const filters: FilterParams = params ?? this.ParamsToFilter();
    const { start_date, end_date, sources, districts, sites, chws } = filters;

    for (let i = 0; i < ChwsDataFromDb$.length; i++) {
      const chwData = ChwsDataFromDb$[i];
      if (!this.Sources$.includes(chwData.source)) this.Sources$.push(chwData.source);
    }

    var outPutData: ChtOutPutData = {
      total_home_visit: {},
      total_pcime_soins: {},
      total_pcime_suivi: {},
      total_reference_pcime_suivi: {},
      total_reference_pcime_soins: {},
      total_diarrhee_pcime_soins: {},
      total_paludisme_pcime_soins: {},
      total_pneumonie_pcime_soins: {},
      total_malnutrition_pcime_soins: {},
      prompt_diarrhee_24h_pcime_soins: {},
      prompt_diarrhee_48h_pcime_soins: {},
      prompt_diarrhee_72h_pcime_soins: {},
      prompt_paludisme_24h_pcime_soins: {},
      prompt_paludisme_48h_pcime_soins: {},
      prompt_paludisme_72h_pcime_soins: {},
      prompt_pneumonie_24h_pcime_soins: {},
      prompt_pneumonie_48h_pcime_soins: {},
      prompt_pneumonie_72h_pcime_soins: {},
      total_pregnancy_family_planning: {},
      total_reference_family_planning_soins: {},
      total_reference_femme_enceinte_soins: {},
      total_vad_femme_enceinte_soins: {},
      total_vad_femme_enceinte_NC_soins: {},
      total_test_de_grossesse_domicile: {},
      total_newborn_suivi: {},
      total_reference_newborn: {},
      total_malnutrition_suivi: {},
      total_reference_malnutrition_suivi: {},
      total_prenatal_suivi: {},
      total_reference_prenatal_suivi: {},
      total_postnatal_suivi: {},
      total_reference_postnatal_suivi: {},
      total_vad_femme_postpartum_NC: {},
      total_vad_women_emergency_suivi: {},
      total_reference_women_emergency_suivi: {},
      total_femme_enceinte_women_emergency_suivi: {},
      total_femme_postpartum_women_emergency_suivi: {},
      total_family_planning_renewal_suivi: {},
      total_reference_family_planning_renewal_suivi: {},
      total_vad_family_planning_NC: {}
    }

    for (let i = 0; i < Chws$.length; i++) {
      const ascId = Chws$[i].id;
      if (ascId != null && ascId != '') {
        Object.entries(outPutData).map(([key, val]) => {
          const vals: any = val as any;
          if (!vals.hasOwnProperty(ascId)) vals[ascId] = { chwId: ascId, count: 0 }
        });
      }
    }

    for (let i = 0; i < ChwsDataFromDb$.length; i++) {
      const data: ChwsDataFormDb = ChwsDataFromDb$[i];

      if (data) {
        const form = data.form;
        const field = data.fields;
        const source: string = data.source != null && data.source != '' ? data.source : '';
        const district: string = data.district.id != null ? data.district.id != null && data.district.id != '' ? data.district.id : '' : '';
        const site: string = data.site != null ? data.site.id != null && data.site.id != '' ? data.site.id : '' : '';
        const chw: string = data.chw != null ? data.chw.id != null && data.chw.id != '' ? data.chw.id : '' : '';

        const idSourceValid: boolean = notNull(source) && notNull(sources) && sources?.includes(source) || !notNull(sources);
        const idDistrictValid: boolean = notNull(district) && notNull(districts) && districts?.includes(district) || !notNull(districts);
        const idSiteValid: boolean = notNull(site) && notNull(sites) && sites?.includes(site) || !notNull(sites);
        const idChwValid: boolean = notNull(chw) && notNull(chws) && chws?.includes(chw) || !notNull(chws);
        const isDateValid: boolean = notNull(start_date) && notNull(end_date) ? DateUtils.isBetween(`${start_date}`, data.reported_date, `${end_date}`) : false;

        if (isDateValid && idSourceValid && idDistrictValid && idSiteValid && idChwValid) {
          if (data.source == 'Tonoudayo') {

            if (form != undefined && ["death_report", "home_visit"].includes(form)) {
              outPutData.total_home_visit[chw].count += 1
            }
            if (form === "pcime_c_asc") {
              outPutData.total_pcime_soins[chw].count += 1
              if (field["group_review.s_have_you_refer_child"] == "yes") outPutData.total_reference_pcime_soins[chw].count += 1

              if (field["has_diarrhea"] == "true") {
                outPutData.total_diarrhee_pcime_soins[chw].count += 1
                if (field["within_24h"] == "true") outPutData.prompt_diarrhee_24h_pcime_soins[chw].count += 1
                if (field["within_24h"] == "true" || field["within_48h"] == "true") outPutData.prompt_diarrhee_48h_pcime_soins[chw].count += 1
                if (field["within_24h"] == "true" || field["within_48h"] == "true" || field["within_72h"] == "true") outPutData.prompt_diarrhee_72h_pcime_soins[chw].count += 1
              }

              if (field["fever_with_malaria"] == "true") {
                outPutData.total_paludisme_pcime_soins[chw].count += 1
                if (field["within_24h"] == "true") outPutData.prompt_paludisme_24h_pcime_soins[chw].count += 1
                if (field["within_24h"] == "true" || field["within_48h"] == "true") outPutData.prompt_paludisme_48h_pcime_soins[chw].count += 1
                if (field["within_24h"] == "true" || field["within_48h"] == "true" || field["within_72h"] == "true") outPutData.prompt_paludisme_72h_pcime_soins[chw].count += 1
              }

              if (field["has_pneumonia"] == "true") {
                outPutData.total_pneumonie_pcime_soins[chw].count += 1
                if (field["within_24h"] == "true") outPutData.prompt_pneumonie_24h_pcime_soins[chw].count += 1
                if (field["within_24h"] == "true" || field["within_48h"] == "true") outPutData.prompt_pneumonie_48h_pcime_soins[chw].count += 1
                if (field["within_24h"] == "true" || field["within_48h"] == "true" || field["within_72h"] == "true") outPutData.prompt_pneumonie_72h_pcime_soins[chw].count += 1
              }

              if (field["has_malnutrition"] == "true") outPutData.total_malnutrition_pcime_soins[chw].count += 1
            }
            if (form === "pcime_c_followup") {
              outPutData.total_pcime_suivi[chw].count += 1
              if (field["group_review.s_have_you_refer_child"] == "yes") outPutData.total_reference_pcime_suivi[chw].count += 1
            }
            if (form === "newborn_followup") {
              outPutData.total_newborn_suivi[chw].count += 1
              if (field["group_summary.s_have_you_refer_child"] == "yes") outPutData.total_reference_newborn[chw].count += 1
            }
            if (form === "malnutrition_followup") {
              outPutData.total_malnutrition_suivi[chw].count += 1
              if (field["results_page.s_have_you_refer_child"] == "yes") outPutData.total_reference_malnutrition_suivi[chw].count += 1
            }

            if (form === "prenatal_followup") {
              outPutData.total_prenatal_suivi[chw].count += 1
              if (field["group_summary.s_have_you_refer_child"] == "yes") outPutData.total_reference_prenatal_suivi[chw].count += 1
            }
            if (form === "postnatal_followup") {
              outPutData.total_postnatal_suivi[chw].count += 1
              if (field["group_summary.s_have_you_refer_child"] == "yes") outPutData.total_reference_postnatal_suivi[chw].count += 1
              if (field["follow_up_count"] == "1") outPutData.total_vad_femme_postpartum_NC[chw].count += 1
            }

            if (form === "pregnancy_family_planning") {
              outPutData.total_pregnancy_family_planning[chw].count += 1
              var pregnant_1 = field["s_reg_pregnancy_screen.s_reg_urine_result"] == "positive"
              var pregnant_2 = field["s_reg_pregnancy_screen.s_reg_why_urine_test_not_done"] == "already_pregnant"

              if (field["s_reg_pregnancy_screen.s_reg_urine_test"] == "yes") outPutData.total_test_de_grossesse_domicile[chw].count += 1
              if (field["s_summary.s_have_you_refer_child"] == "yes" && !pregnant_1 && !pregnant_2) outPutData.total_reference_family_planning_soins[chw].count += 1
              if (pregnant_1 || pregnant_2) {
                outPutData.total_vad_femme_enceinte_soins[chw].count += 1
                if (field["s_reg_mode.s_reg_how_found"] != "fp_followup") outPutData.total_vad_femme_enceinte_NC_soins[chw].count += 1
                if (field["s_summary.s_have_you_refer_child"] == "yes") outPutData.total_reference_femme_enceinte_soins[chw].count += 1
              }
              if (field["s_fam_plan_screen.agreed_to_fp"] == "yes") outPutData.total_vad_family_planning_NC[chw].count += 1
            }
            if (form === "women_emergency_followup") {
              outPutData.total_vad_women_emergency_suivi[chw].count += 1
              if (field["group_summary.s_have_you_refer_child"] == "yes") outPutData.total_reference_women_emergency_suivi[chw].count += 1
              if (field["initial.woman_status"] == "pregnant") outPutData.total_femme_enceinte_women_emergency_suivi[chw].count += 1
              if (field["initial.woman_status"] == "postpartum") outPutData.total_femme_postpartum_women_emergency_suivi[chw].count += 1
            }
            if (form === "fp_follow_up_renewal") {
              outPutData.total_family_planning_renewal_suivi[chw].count += 1
              if (field["checklist2.s_refer_for_health_state"] == "true") outPutData.total_reference_family_planning_renewal_suivi[chw].count += 1
            }

          } else if (data.source == 'dhis2') {
            console.log(data.fields)
            if (form === "PCIME") {
              if (data.fields['zNldrz5EUPR'] == 'Soins' && (data.fields['BLWjEQQdBFi']*365) >= 60) {
                outPutData.total_pcime_soins[chw].count += 1;

                if (data.fields['pMjjh6JLEz2'] == 'Oui') outPutData.total_reference_pcime_soins[chw].count += 1 // référence

                if (data.fields['NPHYf8WAR9l'] == 'true') {// diarrhee
                  outPutData.total_diarrhee_pcime_soins[chw].count += 1
                  if (data.fields['U3c13SP8AQz'] == '≤24') outPutData.prompt_diarrhee_24h_pcime_soins[chw].count += 1
                  if (data.fields['U3c13SP8AQz'] == '≤24' || data.fields['U3c13SP8AQz'] == '≤48') outPutData.prompt_diarrhee_48h_pcime_soins[chw].count += 1
                  if (data.fields['U3c13SP8AQz'] == '≤24' || data.fields['U3c13SP8AQz'] == '≤48' || data.fields['U3c13SP8AQz'] == '≤72') outPutData.prompt_diarrhee_72h_pcime_soins[chw].count += 1
                }
                if (data.fields['Gl7HGePuIi3'] == 'true') {// paludisme
                  outPutData.total_paludisme_pcime_soins[chw].count += 1
                  if (data.fields['U3c13SP8AQz'] == '≤24') outPutData.prompt_paludisme_24h_pcime_soins[chw].count += 1
                  if (data.fields['U3c13SP8AQz'] == '≤24' || data.fields['U3c13SP8AQz'] == '≤48') outPutData.prompt_paludisme_48h_pcime_soins[chw].count += 1
                  if (data.fields['U3c13SP8AQz'] == '≤24' || data.fields['U3c13SP8AQz'] == '≤48' || data.fields['U3c13SP8AQz'] == '≤72') outPutData.prompt_paludisme_72h_pcime_soins[chw].count += 1
                }
                if (data.fields['LP33fMJRWrT'] == 'true') {// pneumonie
                  outPutData.total_pneumonie_pcime_soins[chw].count += 1
                  if (data.fields['U3c13SP8AQz'] == '≤24') outPutData.prompt_pneumonie_24h_pcime_soins[chw].count += 1
                  if (data.fields['U3c13SP8AQz'] == '≤24' || data.fields['U3c13SP8AQz'] == '≤48') outPutData.prompt_pneumonie_48h_pcime_soins[chw].count += 1
                  if (data.fields['U3c13SP8AQz'] == '≤24' || data.fields['U3c13SP8AQz'] == '≤48' || data.fields['U3c13SP8AQz'] == '≤72') outPutData.prompt_pneumonie_72h_pcime_soins[chw].count += 1
                }

                if (data.fields['y84NNODZ705'] == 'true') outPutData.total_malnutrition_pcime_soins[chw].count += 1 // malnutrition

              }

              if (data.fields['zNldrz5EUPR'] == 'Suivi' && (data.fields['BLWjEQQdBFi']*365) >= 60) {
                outPutData.total_pcime_suivi[chw].count += 1
                if (data.fields['pMjjh6JLEz2'] == 'Oui') {
                  // référence
                  outPutData.total_reference_pcime_suivi[chw].count += 1
                }
                
              }

              if ((data.fields['BLWjEQQdBFi']*365) < 60){
                outPutData.total_newborn_suivi[chw].count += 1
                if (data.fields['pMjjh6JLEz2'] == 'Oui') {
                  // référence
                  outPutData.total_reference_newborn[chw].count += 1
                }
              }

            }
            if (form === "Maternelle") {
              outPutData.total_pregnancy_family_planning[chw].count += 1
              if(data.fields['rFlbd27poqd'] == 'CPN1') {
                outPutData.total_prenatal_suivi[chw].count += 1
                if (data.fields['pMjjh6JLEz2'] == 'Oui') outPutData.total_reference_prenatal_suivi[chw].count += 1 // référence
              }
              if(data.fields['WRwCp1UsW3b'] == "CPON1" && data.fields['reULiF7LW3w'] == 'Post_Partum') {
                outPutData.total_postnatal_suivi[chw].count += 1
                if (data.fields['pMjjh6JLEz2'] == 'Oui') outPutData.total_reference_postnatal_suivi[chw].count += 1 // référence
                if(data.fields['WaN8nOieIhs'] == 'NC') outPutData.total_vad_femme_postpartum_NC[chw].count += 1
              }
              if(data.fields['DNzefvCYfZz'] == "true") {//test_de_grossesse
                outPutData.total_test_de_grossesse_domicile[chw].count += 1 
              }
              if (data.fields['reULiF7LW3w'] = 'Enceinte') {
                outPutData.total_vad_femme_enceinte_soins[chw].count += 1
                if (data.fields['pMjjh6JLEz2'] == 'Oui') outPutData.total_reference_femme_enceinte_soins[chw].count += 1 // référence
                if(data.fields['WaN8nOieIhs'] == 'NC') outPutData.total_vad_femme_enceinte_NC_soins[chw].count += 1
              }
            }

            if (form === "PF") {
              outPutData.total_pregnancy_family_planning[chw].count += 1
              if(data.fields['WaN8nOieIhs'] == 'NC') outPutData.total_vad_family_planning_NC[chw].count += 1
              if(data.fields['WaN8nOieIhs'] == 'AC') outPutData.total_family_planning_renewal_suivi[chw].count += 1
              if (data.fields['pMjjh6JLEz2'] == 'Oui') {// référence
                if(data.fields['WaN8nOieIhs'] == 'NC') outPutData.total_reference_family_planning_soins[chw].count += 1
                if(data.fields['WaN8nOieIhs'] == 'AC') outPutData.total_reference_family_planning_renewal_suivi[chw].count += 1
              }
            }
            if (form === "Recherche") {
              outPutData.total_home_visit[chw].count += 1
            }
          }
        }
      }
    }

    return this.transformChwsData(outPutData, Chws$);

  }

  transformChwsData(allDatasFound: ChtOutPutData, Chws$: Chws[]): { chw: Chws, data: DataIndicators }[] {

    var allAggragateData: { chw: Chws, data: DataIndicators }[] = [];

    for (let i = 0; i < Chws$.length; i++) {
      const chw: Chws = Chws$[i];
      const ascId = chw.id!;
      var chwsData: DataIndicators = {

        total_vad: 0,
        total_vad_pcime_c: 0,
        total_suivi_pcime_c: 0,
        total_vad_femmes_enceinte: 0,
        total_vad_femmes_postpartum: 0,
        total_recherche_active: 0,
        total_vad_family_planning: 0,
        reference_femmes_pf: 0,
        reference_pcime: 0,
        reference_femmes_enceinte_postpartum: 0,
        total_diarrhee_pcime_soins: 0,
        total_paludisme_pcime_soins: 0,
        total_pneumonie_pcime_soins: 0,
        total_malnutrition_pcime_soins: 0,
        prompt_diarrhee_24h_pcime_soins: 0,
        prompt_diarrhee_48h_pcime_soins: 0,
        prompt_diarrhee_72h_pcime_soins: 0,
        prompt_paludisme_24h_pcime_soins: 0,
        prompt_paludisme_48h_pcime_soins: 0,
        prompt_paludisme_72h_pcime_soins: 0,
        prompt_pneumonie_24h_pcime_soins: 0,
        prompt_pneumonie_48h_pcime_soins: 0,
        prompt_pneumonie_72h_pcime_soins: 0,
        total_vad_femmes_enceintes_NC: 0,
        total_vad_femme_postpartum_NC: 0,
        total_test_de_grossesse_domicile: 0,
      };

      const total_vad = allDatasFound.total_home_visit[ascId]["count"] + allDatasFound.total_pcime_soins[ascId]["count"] + allDatasFound.total_pregnancy_family_planning[ascId]["count"] + allDatasFound.total_pcime_suivi[ascId]["count"] + allDatasFound.total_newborn_suivi[ascId]["count"] + allDatasFound.total_prenatal_suivi[ascId]["count"] + allDatasFound.total_postnatal_suivi[ascId]["count"] + allDatasFound.total_malnutrition_suivi[ascId]["count"] + allDatasFound.total_vad_women_emergency_suivi[ascId]["count"] + allDatasFound.total_family_planning_renewal_suivi[ascId]["count"];
      const total_vad_pcime_c = allDatasFound.total_pcime_soins[ascId]["count"] + allDatasFound.total_pcime_suivi[ascId]["count"] + allDatasFound.total_newborn_suivi[ascId]["count"] + allDatasFound.total_malnutrition_suivi[ascId]["count"];
      const total_suivi_pcime_c = allDatasFound.total_pcime_suivi[ascId]["count"] + allDatasFound.total_newborn_suivi[ascId]["count"] + allDatasFound.total_malnutrition_suivi[ascId]["count"];
      const reference_femmes_pf = allDatasFound.total_reference_family_planning_soins[ascId]["count"] + allDatasFound.total_reference_family_planning_renewal_suivi[ascId]["count"];
      const reference_pcime = allDatasFound.total_reference_pcime_soins[ascId]["count"] + allDatasFound.total_reference_pcime_suivi[ascId]["count"] + allDatasFound.total_reference_newborn[ascId]["count"] + allDatasFound.total_reference_malnutrition_suivi[ascId]["count"];
      const reference_femmes_enceinte_postpartum = allDatasFound.total_reference_femme_enceinte_soins[ascId]["count"] + allDatasFound.total_reference_prenatal_suivi[ascId]["count"] + allDatasFound.total_reference_postnatal_suivi[ascId]["count"] + allDatasFound.total_reference_women_emergency_suivi[ascId]["count"];
      const total_vad_femmes_enceinte = allDatasFound.total_vad_femme_enceinte_soins[ascId]["count"] + allDatasFound.total_prenatal_suivi[ascId]["count"] + allDatasFound.total_femme_enceinte_women_emergency_suivi[ascId]["count"];
      const total_vad_femmes_postpartum = allDatasFound.total_postnatal_suivi[ascId]["count"] + allDatasFound.total_femme_postpartum_women_emergency_suivi[ascId]["count"];
      const total_vad_family_planning = total_vad - (total_vad_pcime_c + total_vad_femmes_enceinte + total_vad_femmes_postpartum + allDatasFound["total_home_visit"][ascId]["count"]);

      chwsData.total_vad += total_vad;
      chwsData.total_vad_pcime_c += total_vad_pcime_c;
      chwsData.total_suivi_pcime_c += total_suivi_pcime_c;
      chwsData.total_vad_femmes_enceinte += total_vad_femmes_enceinte;
      chwsData.total_vad_femmes_postpartum += total_vad_femmes_postpartum;
      chwsData.total_recherche_active += allDatasFound.total_home_visit[ascId]["count"];
      chwsData.total_vad_family_planning = total_vad_family_planning;
      chwsData.reference_femmes_pf += reference_femmes_pf;
      chwsData.reference_pcime += reference_pcime;
      chwsData.reference_femmes_enceinte_postpartum = reference_femmes_enceinte_postpartum;
      chwsData.total_diarrhee_pcime_soins += allDatasFound.total_diarrhee_pcime_soins[ascId]["count"];
      chwsData.total_paludisme_pcime_soins += allDatasFound.total_paludisme_pcime_soins[ascId]["count"];
      chwsData.total_pneumonie_pcime_soins += allDatasFound.total_pneumonie_pcime_soins[ascId]["count"];
      chwsData.total_malnutrition_pcime_soins += allDatasFound.total_malnutrition_pcime_soins[ascId]["count"];
      chwsData.prompt_diarrhee_24h_pcime_soins += allDatasFound.prompt_diarrhee_24h_pcime_soins[ascId]["count"];
      chwsData.prompt_diarrhee_48h_pcime_soins += allDatasFound.prompt_diarrhee_48h_pcime_soins[ascId]["count"];
      chwsData.prompt_diarrhee_72h_pcime_soins += allDatasFound.prompt_diarrhee_72h_pcime_soins[ascId]["count"];
      chwsData.prompt_paludisme_24h_pcime_soins += allDatasFound.prompt_paludisme_24h_pcime_soins[ascId]["count"];
      chwsData.prompt_paludisme_48h_pcime_soins += allDatasFound.prompt_paludisme_48h_pcime_soins[ascId]["count"];
      chwsData.prompt_paludisme_72h_pcime_soins += allDatasFound.prompt_paludisme_72h_pcime_soins[ascId]["count"];
      chwsData.prompt_pneumonie_24h_pcime_soins += allDatasFound.prompt_pneumonie_24h_pcime_soins[ascId]["count"];
      chwsData.prompt_pneumonie_48h_pcime_soins += allDatasFound.prompt_pneumonie_48h_pcime_soins[ascId]["count"];
      chwsData.prompt_pneumonie_72h_pcime_soins += allDatasFound.prompt_pneumonie_72h_pcime_soins[ascId]["count"];
      chwsData.total_vad_femmes_enceintes_NC += allDatasFound.total_vad_femme_enceinte_NC_soins[ascId]["count"];
      chwsData.total_vad_femme_postpartum_NC += allDatasFound.total_vad_femme_postpartum_NC[ascId]["count"];
      chwsData.total_test_de_grossesse_domicile += allDatasFound.total_test_de_grossesse_domicile[ascId]["count"];

      allAggragateData.push({ chw: chw, data: chwsData });
    }
    return allAggragateData;
  }

}

// {
// "dataElement": "poTUIjg7MyZ",//ASC_Liste des PF
// "value": tryCatch(arrayData['pf_administree']),//"Pilule"
// },
// {
// {
// "dataElement": "sUzIuALcZ9P", //Suivi après référencement
// "value": getBool(arrayData['suiviApresReference']),//"true"
// }