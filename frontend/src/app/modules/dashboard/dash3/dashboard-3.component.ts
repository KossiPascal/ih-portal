import { Component, OnInit } from '@angular/core';
import { AggragateData, Chws, Families, FilterParams, MedicMobileData, Patients, Sites, Zones } from '@ih-app/models/Sync';
import { SyncService } from '@ih-app/services/sync.service';
// import * as Highcharts from 'highcharts';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChtOutPutData, DataIndicators } from '@ih-app/models/DataAggragate';

import { IndexDbService } from '@ih-app/services/index-db.service'; // db index start
import { DateUtils, Functions } from '@ih-app/shared/functions';
// import { liveQuery } from 'dexie';



@Component({
  selector: 'app-dashboard-3',
  templateUrl: `./dashboard-3.component.html`
})
export class Dashboard3Component implements OnInit {
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

  allAggragateData: AggragateData[] = [];

  identifyAggragateData(index:number, item: AggragateData) {
    return item.label;
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

  home_actions_forms: string[] = [
    `pcime_c_asc`,
    `pcime_c_referral`,
    `pcime_c_followup`,
    `malnutrition_followup`,
    `pregnancy_family_planning`,
    `prenatal_followup`,
    `postnatal_followup`,
    `newborn_followup`,
    `home_visit`,
    `women_emergency_followup`,
    `fp_follow_up_renewal`,
  ];

  
  vaccination_forms: string[] = [
    `vaccination`,
  ];

  consultations_followup_forms: string[] = [
    `pcime_c_asc`,
    `pregnancy_family_planning`,
    `pcime_c_followup`,
    `pcime_c_referral`,
    `malnutrition_followup`,
    `prenatal_followup`,
    `postnatal_followup`,
    `newborn_followup`,
    `women_emergency_followup`,
    `fp_follow_up_renewal`,
  ];
  consultations_forms: string[] = [
    `pcime_c_asc`,
    `pregnancy_family_planning`
  ];
  followup_forms: string[] = [
    `pcime_c_followup`,
    `pcime_c_referral`,
    `malnutrition_followup`,
    `prenatal_followup`,
    `postnatal_followup`,
    `newborn_followup`,
    `women_emergency_followup`,
    `fp_follow_up_renewal`,
  ];
  all_child_forms: string[] = [
    `pcime_c_asc`,
    `pcime_c_followup`,
    `newborn_followup`,
    `malnutrition_followup`
  ];
  child_followup_forms: string[] = [
    `pcime_c_followup`,
    `newborn_followup`,
    `malnutrition_followup`
  ];
  allForms: string[] = [
    "pcime_c_asc",
    "vaccination_followup",
    "pregnancy_family_planning",
    "delivery",
    "home_visit",
    "newborn_followup",
    "pcime_c_followup",
    "malnutrition_followup",
    "postnatal_followup",
    "prenatal_followup",
    "pcime_c_referral",
    `fp_follow_up_renewal`,
  ]

  ChwsDataFromDb$: MedicMobileData[] = [];
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
    
    // Highcharts.chart('container', this.options);
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
      // this.initMsg = 'Chargement des Zones ...';
      // this.sync.getZone$().subscribe((zones$: any) => {
      //   this.allZones$ = zones$;
        this.initMsg = 'Chargement des ASC ...';
        this.sync.getChwsList().subscribe(async (_chws: any) => {
          this.Chws$ = _chws;
          // this.initMsg = 'Chargement des Familles ...';
          // this.sync.getFamily$().subscribe((Families$: any) => {
          //   this.allFamilies$ = Families$;
            // this.initMsg = 'Chargement des Patients ...';
            // this.sync.getPatients$().subscribe((Patients$: any) => {
            //   this.allPatients$ = Patients$;
              this.initDataFilted();
            // }, (err: any) =>  {
            //   this.isLoading = false;
            //   console.log(err.error);
            // });
          // }, (err: any) =>  {
          //   this.isLoading = false;
          //   console.log(err.error);
          // });
        }, (err: any) =>  {
          this.isLoading = false;
          console.log(err.error);
        });
      // }, (err: any) =>  {
      //   this.isLoading = false;
      //   console.log(err.error);
      // });
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
      districts: []
    }

    this.isLoading = true;

    if (this.initDate.start_date == startDate && this.initDate.end_date == endDate && this.ChwsDataFromDb$?.length != 0) {
      this.getAllAboutData(paramsTopass);
    } else {
      this.initDate.start_date = startDate;
      this.initDate.end_date = endDate;
      this.initMsg = `Chargement des données du ${DateUtils.getDateInFormat(paramsTopass.start_date, 0, 'fr')} au ${DateUtils.getDateInFormat(paramsTopass.end_date, 0, 'fr')}`;
      this.sync.getAllChwsDataWithParams(paramsTopass).subscribe((response: MedicMobileData[]) => {
        this.ChwsDataFromDb$ = response;
        this.getAllAboutData(paramsTopass);
      }, (err: any) => {
        this.isLoading = false;
        console.log(err.error);
      });
    }
  }

  getAllAboutData(params: FilterParams) {
    this.initMsg = 'Démarrage du calcule des indicateurs ...';
    const { start_date, end_date, chws, sites, sources } = params;
    if (Functions.notNull(start_date) && Functions.notNull(end_date)) {

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

      for (let i = 0; i < this.Chws$!.length; i++) {
        const ascId = this.Chws$![i].id;
        if (ascId != null && ascId != '') {
          Object.entries(outPutData).map(([key, val]) => {
            const vals: any = val as any;
            if (!vals.hasOwnProperty(ascId)) vals[ascId] = { chwId: ascId, count: 0 }
          });
        }
      }

      for (let index = 0; index < this.ChwsDataFromDb$!.length; index++) {
        const data: MedicMobileData = this.ChwsDataFromDb$[index];

        if (data != null) {
          const form = data.form;
          const field = data.fields;
          const asc: string = data.chw != null ? data.chw.id != null && data.chw.id != '' ? data.chw.id : '' : '';
          const site: string = data.site != null ? data.site.id != null && data.site.id != '' ? data.site.id : '' : '';
          const source: string = data.source != null && data.source != '' ? data.source : '';

          const idChwValid: boolean = Functions.notNull(asc) && Functions.notNull(chws) && chws?.includes(asc) || !Functions.notNull(chws);
          const idSiteValid: boolean = Functions.notNull(site) && Functions.notNull(sites) && sites?.includes(site) || !Functions.notNull(sites);
          const idHostValid: boolean = Functions.notNull(source) && Functions.notNull(sources) && sources?.includes(source) || !Functions.notNull(sources);
          const isDateValid: boolean = Functions.notNull(start_date) && Functions.notNull(end_date) ? DateUtils.isBetween(`${start_date}`, data.reported_date, `${end_date}`) : false;


          if (idChwValid && idSiteValid && isDateValid && idHostValid) {

            if (form === "home_visit") outPutData.total_home_visit[asc].count += 1

            if (form === "pcime_c_asc") {
              outPutData.total_pcime_soins[asc].count += 1

              if (field["group_review.s_have_you_refer_child"] == "yes") outPutData.total_reference_pcime_soins[asc].count += 1

              if (field["has_diarrhea"] == "true") {
                outPutData.total_diarrhee_pcime_soins[asc].count += 1
                if (field["within_24h"] == "true") outPutData.prompt_diarrhee_24h_pcime_soins[asc].count += 1
                if (field["within_24h"] == "true" || field["within_48h"] == "true") outPutData.prompt_diarrhee_48h_pcime_soins[asc].count += 1
                if (field["within_24h"] == "true" || field["within_48h"] == "true" || field["within_72h"] == "true") outPutData.prompt_diarrhee_72h_pcime_soins[asc].count += 1
              }

              if (field["fever_with_malaria"] == "true") {
                outPutData.total_paludisme_pcime_soins[asc].count += 1
                if (field["within_24h"] == "true") outPutData.prompt_paludisme_24h_pcime_soins[asc].count += 1
                if (field["within_24h"] == "true" || field["within_48h"] == "true") outPutData.prompt_paludisme_48h_pcime_soins[asc].count += 1
                if (field["within_24h"] == "true" || field["within_48h"] == "true" || field["within_72h"] == "true") outPutData.prompt_paludisme_72h_pcime_soins[asc].count += 1
              }

              if (field["has_pneumonia"] == "true") {
                outPutData.total_pneumonie_pcime_soins[asc].count += 1
                if (field["within_24h"] == "true") outPutData.prompt_pneumonie_24h_pcime_soins[asc].count += 1
                if (field["within_24h"] == "true" || field["within_48h"] == "true") outPutData.prompt_pneumonie_48h_pcime_soins[asc].count += 1
                if (field["within_24h"] == "true" || field["within_48h"] == "true" || field["within_72h"] == "true") outPutData.prompt_pneumonie_72h_pcime_soins[asc].count += 1
              }

              if (field["has_malnutrition"] == "true") outPutData.total_malnutrition_pcime_soins[asc].count += 1
            }

            if (form === "pcime_c_followup") {
              outPutData.total_pcime_suivi[asc].count += 1
              if (field["group_review.s_have_you_refer_child"] == "yes") outPutData.total_reference_pcime_suivi[asc].count += 1
            }

            if (form === "newborn_followup") {
              outPutData.total_newborn_suivi[asc].count += 1
              if (field["group_summary.s_have_you_refer_child"] == "yes") outPutData.total_reference_newborn[asc].count += 1
            }

            if (form === "malnutrition_followup") {
              outPutData.total_malnutrition_suivi[asc].count += 1
              if (field["results_page.s_have_you_refer_child"] == "yes") outPutData.total_reference_malnutrition_suivi[asc].count += 1
            }

            if (form === "prenatal_followup") {
              outPutData.total_prenatal_suivi[asc].count += 1
              if (field["group_summary.s_have_you_refer_child"] == "yes") outPutData.total_reference_prenatal_suivi[asc].count += 1
            }

            if (form === "postnatal_followup") {
              outPutData.total_postnatal_suivi[asc].count += 1
              if (field["group_summary.s_have_you_refer_child"] == "yes") outPutData.total_reference_postnatal_suivi[asc].count += 1
              if (field["follow_up_count"] == "1") outPutData.total_vad_femme_postpartum_NC[asc].count += 1
            }

            if (form === "pregnancy_family_planning") {
              outPutData.total_pregnancy_family_planning[asc].count += 1
              var pregnant_1 = field["s_reg_pregnancy_screen.s_reg_urine_result"] == "positive"
              var pregnant_2 = field["s_reg_pregnancy_screen.s_reg_why_urine_test_not_done"] == "already_pregnant"

              if (field["s_reg_pregnancy_screen.s_reg_urine_test"] == "yes") outPutData.total_test_de_grossesse_domicile[asc].count += 1
              if (field["s_summary.s_have_you_refer_child"] == "yes" && !pregnant_1 && !pregnant_2) outPutData.total_reference_family_planning_soins[asc].count += 1
              if (pregnant_1 || pregnant_2) {
                outPutData.total_vad_femme_enceinte_soins[asc].count += 1
                if (field["s_reg_mode.s_reg_how_found"] != "fp_followup") outPutData.total_vad_femme_enceinte_NC_soins[asc].count += 1
                if (field["s_summary.s_have_you_refer_child"] == "yes") outPutData.total_reference_femme_enceinte_soins[asc].count += 1
              }
              if (field["s_fam_plan_screen.agreed_to_fp"] == "yes") outPutData.total_vad_family_planning_NC[asc].count += 1
            }

            if (form === "women_emergency_followup") {
              outPutData.total_vad_women_emergency_suivi[asc].count += 1
              if (field["group_summary.s_have_you_refer_child"] == "yes") outPutData.total_reference_women_emergency_suivi[asc].count += 1
              if (field["initial.woman_status"] == "pregnant") outPutData.total_femme_enceinte_women_emergency_suivi[asc].count += 1
              if (field["initial.woman_status"] == "postpartum") outPutData.total_femme_postpartum_women_emergency_suivi[asc].count += 1
            }

            if (form === "fp_follow_up_renewal") {
              outPutData.total_family_planning_renewal_suivi[asc].count += 1
              if (field["check$2.s_refer_for_health_state"] == "true") outPutData.total_reference_family_planning_renewal_suivi[asc].count += 1
            }
          }
        }
      }

      this.transformData(outPutData, params);
    }
  }


  transformData(allDatasFound: ChtOutPutData, params: FilterParams) {
    const { start_date, end_date, chws, sites, sources } = params;

    if (Functions.notNull(start_date) && Functions.notNull(end_date)) {

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

      for (let i = 0; i < this.Chws$!.length; i++) {
        const chws$: Chws = this.Chws$![i];
        const ascId = chws$.id;
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
      }

      // this.sitesChwsCount = 0;
      // this.familiesChwsCount = 0;
      // this.patientsChwsCount = 0;
      // this.zonesChwsCount = 0;
      // this.chwsCount = 0;
      this.allAggragateData = [];

      // for (let i = 0; i < this.allSites$!.length; i++) {
      //   const site = this.allSites$![i];
      //   if (Functions.notNull(sources)) {
      //     if (sources?.includes(site.source)) this.sitesChwsCount++;
      //   } else {
      //     this.sitesChwsCount++;
      //   }
      // }

      // for (let i = 0; i < this.allFamilies$!.length; i++) {
      //   const family = this.allFamilies$![i];
      //   if (Functions.notNull(sites) && Functions.notNull(chws)) {
      //     if (Functions.notNull(sources)) {
      //       if (sites?.includes(family.site.id) && chws?.includes(family.zone.chw_id) && sources?.includes(family.site.source)) this.familiesChwsCount++;
      //     } else {
      //       if (sites?.includes(family.site.id) && chws?.includes(family.zone.chw_id)) this.familiesChwsCount++;
      //     }
      //   } else if (Functions.notNull(sites) && !Functions.notNull(chws)) {

      //     if (Functions.notNull(sources)) {
      //       if (sites?.includes(family.site.id) && sources?.includes(family.site.source)) this.familiesChwsCount++;
      //     } else {
      //       if (sites?.includes(family.site.id)) this.familiesChwsCount++;
      //     }
      //   } else if (Functions.notNull(sources)) {
      //     if (sources?.includes(family.site.source)) this.familiesChwsCount++;
      //   } else {
      //     this.familiesChwsCount++;
      //   }
      // }

      // for (let i = 0; i < this.allPatients$!.length; i++) {
      //   const patient = this.allPatients$![i];
      //   if (Functions.notNull(sites) && Functions.notNull(chws)) {
      //     if (Functions.notNull(sources)) {
      //       if (sites?.includes(patient.site.id) && chws?.includes(patient.zone.chw_id) && sources?.includes(patient.site.source)) this.patientsChwsCount++;
      //     } else {
      //       if (sites?.includes(patient.site.id) && chws?.includes(patient.zone.chw_id)) this.patientsChwsCount++;
      //     }
      //   } else if (Functions.notNull(sites) && !Functions.notNull(chws)) {
      //     if (Functions.notNull(sources)) {
      //       if (sites?.includes(patient.site.id) && sources?.includes(patient.site.source)) this.patientsChwsCount++;
      //     } else {
      //       if (sites?.includes(patient.site.id)) this.patientsChwsCount++;
      //     }
      //   } else if (Functions.notNull(sources)) {
      //     if (sources?.includes(patient.site.source)) this.patientsChwsCount++;
      //   } else {
      //     this.patientsChwsCount++;
      //   }
      // }

      // for (let i = 0; i < this.allZones$!.length; i++) {
      //   const zone = this.allZones$![i];
      //   if (Functions.notNull(sites) && isNotNull(chws)) {
      //     if (Functions.notNull(sources)) {
      //       if (sites?.includes(zone.site.id) && chws?.includes(zone.chw_id) && sources?.includes(zone.site.source)) this.zonesChwsCount++;
      //     } else {
      //       if (sites?.includes(zone.site.id) && chws?.includes(zone.chw_id)) this.zonesChwsCount++;
      //     }
      //   } else if (Functions.notNull(sites) && !isNotNull(chws)) {
      //     if (Functions.notNull(sources)) {
      //       if (sites?.includes(zone.site.id) && sources?.includes(zone.site.source)) this.zonesChwsCount++;
      //     } else {
      //       if (sites?.includes(zone.site.id)) this.zonesChwsCount++;
      //     }
      //   } else if (Functions.notNull(sources)) {
      //     if(sources?.includes(zone.site.source)) this.zonesChwsCount++;
      //   } else {
      //     this.zonesChwsCount++;
      //   }
      // }

      // for (let i = 0; i < this.allChws$!.length; i++) {
      //   const asc = this.allChws$![i];
      //   if (Functions.notNull(sites) && Functions.notNull(chws)) {
      //     if (Functions.notNull(sources)) {
      //       if (sites?.includes(asc.site.id) && chws?.includes(asc.zone.chw_id) && sources?.includes(asc.site.source)) this.chwsCount++;
      //     } else {
      //       if (sites?.includes(asc.site.id) && chws?.includes(asc.zone.chw_id)) this.chwsCount++;
      //     }
      //   } else if (Functions.notNull(sites) && !Functions.notNull(chws)) {
      //     if (Functions.notNull(sources)) {
      //       if (sites?.includes(asc.site.id) && sources?.includes(asc.site.source)) this.chwsCount++;
      //     } else {
      //       if (sites?.includes(asc.site.id)) this.chwsCount++;
      //     }
      //   } else if (Functions.notNull(sources)) {
      //     if (sources?.includes(asc.site.source)) this.chwsCount++;
      //   } else {
      //     this.chwsCount++;
      //   }
      // }



      // let total_site: AggragateData = { label: Functions.capitaliseDataGiven('total_site_enregistre', '_', ' '), count: this.sitesChwsCount, icon: "ion-stats-bars", color: "bg-success", detailUrl: "/dashboards/dash1" };
      // let total_ASC: AggragateData = { label: Functions.capitaliseDataGiven('total_ASC_enregistre', '_', ' '), count: this.chwsCount, icon: "ion-person-add", color: "bg-warning", detailUrl: "/dashboards/dash1" };
      // let total_famille: AggragateData = { label: Functions.capitaliseDataGiven('total_famille_enregistre', '_', ' '), count: this.familiesChwsCount, icon: "ion-pie-graph", color: "bg-danger", detailUrl: "/dashboards/dash1" };
      // let total_patient: AggragateData = { label: Functions.capitaliseDataGiven('total_patient_enregistre', '_', ' '), count: this.patientsChwsCount, icon: "ion-bag", color: "bg-primary", detailUrl: "/dashboards/dash1" };
      // let total_zone: AggragateData = { label: Functions.capitaliseDataGiven('total_zone_enregistre', '_', ' '), count: this.zonesChwsCount, icon: "ion-bag", color: "bg-success", detailUrl: "/dashboards/dash1" };

      // this.allAggragateData.push(total_site);
      // this.allAggragateData.push(total_ASC);
      // this.allAggragateData.push(total_famille);
      // this.allAggragateData.push(total_patient);
      // this.allAggragateData.push(total_zone);


      let datas = Object.entries(chwsData).map(([key, val]) => {
        let finalData: AggragateData = { label: Functions.capitaliseDataGiven(key, '_', ' '), count: 0, icon: "ion-bag", color: "bg-info", detailUrl: "/dashboards/dash1" };
        finalData.count = val as number;
        this.allAggragateData.push(finalData);
        return ``;
      });
    }

    this.initMsg = '';
    this.isLoading = false;
  }
  

}
