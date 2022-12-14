import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Chws, CompareData, Dhis2Sync, FilterParams, MedicMobileData, Sites } from '@ih-app/models/Sync';
import { SyncService } from '@ih-app/services/sync.service';
import { Functions, DateUtils } from '@ih-app/shared/functions';

// declare var $: any;
// declare var initJsGridTable: any;
declare var initDataTable: any;

@Component({
  selector: 'app-dashboard-2',
  templateUrl: `./dashboard-2.component.html`,
  styleUrls: [
    './dashboard-2.component.css'
  ]
})
export class Dashboard2Component implements OnInit {
  constructor(private syncService: SyncService) { }

  aggradateDataForm!: FormGroup;
  initDate!: { start_date: string, end_date: string };

  createDataFilterFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
      end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
      sites: new FormControl(""),
      sources: new FormControl(""),
    });
  }

  child_forms: string[] = [
    `pcime_c_asc`,
    `pcime_c_referral`,
    `pcime_c_followup`,
    `malnutrition_followup`,
    `newborn_followup`,
  ];

  num_fp_forms: string[] = [
    `pregnancy_family_planning`,
    `prenatal_followup`,
    `postnatal_followup`,
    `women_emergency_followup`,
    `fp_follow_up_renewal`,
  ];

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


  bodyData: CompareData[] = [];
  
  ChwsDataFromDb$: MedicMobileData[] = [];
  Chws$: Chws[] = [];
  Sites$: Sites[] = [];

  initMsg!: string;
  isLoading!: boolean;

  dhis2Params!: Dhis2Sync;

  dhis2Url:string = "dhis2.integratehealth.org/dhis.443"
  
  
  identifyBodyData(index:number, item: CompareData) {
    return item.Code;
  }

  ngOnInit(): void {
    this.isLoading = false;
    this.initDate = DateUtils.startEnd21and20Date();
    this.aggradateDataForm = this.createDataFilterFormGroup();
    this.initAllData();

  }

  async initAllData() {
    const filter:FilterParams = {
      sources: ['portal-integratehealth.org.444']
    }
    this.isLoading = true;
    this.initMsg = 'Chargement des Sites ...';
    this.syncService.getSitesList(filter).subscribe((sites$: any) => {
      this.Sites$ = sites$;
      this.initMsg = 'Chargement des ASC ...';
      this.syncService.getChwsList(filter).subscribe((chws$: any) => {
        this.Chws$ = chws$;
        this.initDataFilted();
      }, (err: any) => console.log(err.error));
    }, (err: any) => console.log(err.error));
  }

  returnEmptyArrayIfNul(data: any): string[] {
    return Functions.notNull(data) ? data : [];
  }

  initDataFilted(): void {
    this.isLoading = true;
    const startDate: string = this.aggradateDataForm.value["start_date"];
    const endDate: string = this.aggradateDataForm.value["end_date"];
    const site: string = this.aggradateDataForm.value["sites"];
    const source: string[] = ['portal-integratehealth.org.444','dhis2.integratehealth.org/dhis.443'] //this.aggradateDataForm.value["source"];

    var paramsTopass: any = {
      start_date: startDate,
      end_date: endDate,
      sites: site,
      source: source
    };

    this.syncService.getAllData(paramsTopass).subscribe((response: any) => {
      this.ChwsDataFromDb$ = response;
      this.getAllAboutData(paramsTopass);
    }, (err: any) => {
      this.isLoading = false;
      console.log(err.error);
    });
  }


  getAllAboutData(params: FilterParams) {
    const { start_date, end_date, sites } = params;

    var outPutData: any = {}

    for (let i = 0; i < this.Chws$!.length; i++) {
      const ascId = this.Chws$![i].id;
      if (Functions.notNull(ascId)) {
        if (!outPutData.hasOwnProperty(ascId)) outPutData[ascId] = {
          chwId: ascId,
          app_total_child_followup: 0,
          dhis_total_child_followup: 0,
          app_total_num_fp_followup: 0,
          dhis_total_num_fp_followup: 0,
          app_total_active_research: 0,
          dhis_total_active_research: 0,
          app_total_consultation_followup: 0,
          dhis_total_consultation_followup: 0,
          app_total_home_visit: 0,
          dhis_total_home_visit: 0
        }
      }
    }







    for (let index = 0; index < this.ChwsDataFromDb$!.length; index++) {
      const data: MedicMobileData = this.ChwsDataFromDb$[index];
      if (data != null) {
        const form = data.form;
        const asc: string = data.chw != null ? Functions.notNull(data.chw.id) ? data.chw.id : '' : '';
        const site: string = data.site != null ?  Functions.notNull(data.site.id) ? data.site.id : '' : '';
        const idSiteValid: boolean = Functions.notNull(site) && Functions.notNull(sites) && sites?.includes(site) || !Functions.notNull(sites);
        const isDateValid: boolean = Functions.notNull(start_date) && Functions.notNull(end_date) ? DateUtils.isBetween(`${start_date}`, data.reported_date, `${end_date}`) : false;

        if (idSiteValid && isDateValid && outPutData.hasOwnProperty(asc)) {
          if (data.source == this.dhis2Url) {
            if (form === "PCIME") outPutData[asc].dhis_total_child_followup += 1
            if (form === "Maternelle" || form === "PF") outPutData[asc].dhis_total_num_fp_followup += 1
            if (form === "Recherche") outPutData[asc].dhis_total_active_research += 1
            if (form !== "Recherche") outPutData[asc].dhis_total_consultation_followup += 1
            outPutData[asc].dhis_total_home_visit += 1
          } else {
    
            if (this.child_forms.includes(form)) outPutData[asc].app_total_child_followup += 1
            if (this.num_fp_forms.includes(form)) outPutData[asc].app_total_num_fp_followup += 1
            if (form === "home_visit") outPutData[asc].app_total_active_research += 1
            if (this.consultations_followup_forms.includes(form)) outPutData[asc].app_total_consultation_followup += 1
            if (this.home_actions_forms.includes(form)) outPutData[asc].app_total_home_visit += 1
          }
        }
      }
    }


    // Object.entries(this.AllDhis2SelectedDataValues).map(([key, value]) => {
    //   // plW6bCSnXKU [PCIME, Maternelle, PF, Recherche]
    //   const vals = value as any;

    //   for (let i = 0; i < vals.length; i++) {
    //     const dataArray = vals[i] as { dataElement: string, value: any }[];

    //     var isResearchFound: boolean = false;
    //     var isChwFound: boolean = false;

    //     for (let j = 0; j < dataArray.length; j++) {
    //       const vals = dataArray[j];
    //       if (vals.dataElement == 'plW6bCSnXKU' && vals.value == 'Recherche') {
    //         isResearchFound = true;
    //       }
    //       if (vals.dataElement == 'JkMyqI3e6or' && vals.value == this.getChwInfos(key).external_id) {
    //         isChwFound = true;
    //       }
    //     }

    //     if (isChwFound) {
    //       outPutData[key].dhis_total_home_visit += 1;
    //       if (isResearchFound == true) {
    //         outPutData[key].dhis_total_active_research += 1
    //       } else {
    //         outPutData[key].dhis_total_consultation_followup += 1
    //       }
    //     }

    //   }

    // });


    this.bodyData = [];



    Object.entries(outPutData).map(([keys, value]) => {
      const vals = value as {
        chwId: string,
        app_total_child_followup: 0,
        dhis_total_child_followup: 0,
        app_total_num_fp_followup: 0,
        dhis_total_num_fp_followup: 0,
        app_total_active_research: number,
        dhis_total_active_research: number,
        app_total_consultation_followup: number,
        dhis_total_consultation_followup: number,
        app_total_home_visit: number,
        dhis_total_home_visit: number
      };
      this.bodyData.push({
        Code: this.getChwInfos(vals.chwId).external_id,
        Name: this.getChwInfos(vals.chwId).name,
        Pcime: vals.app_total_child_followup,
        PcimeDhis2: vals.dhis_total_child_followup,
        MaternellePf: vals.app_total_num_fp_followup,
        MaternellePfDhis2: vals.dhis_total_num_fp_followup,
        Recherche: vals.app_total_active_research,
        RechercheDhis: vals.dhis_total_active_research,
        Consultation: vals.app_total_consultation_followup,
        ConsultationDhis: vals.dhis_total_consultation_followup,
        Total: vals.app_total_home_visit,
        TotalDhis: vals.dhis_total_home_visit,
        TotalDiff: this.getRatio(vals.app_total_home_visit, vals.dhis_total_home_visit, false).value,
        Ratio: this.getRatio(vals.app_total_home_visit, vals.dhis_total_home_visit)
      });
    });

    this.isLoading = false;

  }

  getDataValuesElements(data: { dataValues: { dataElement: string, value: any }[], dataElement: string, value: any }): boolean {
    for (let j = 0; j < data.dataValues.length; j++) {
      const vals = data.dataValues[j];
      if (vals.dataElement == data.dataElement && vals.value == data.value) {
        return true;
      }
    }
    return false;
  }

  getRatio(val1: number, val2: number, isRatio: boolean = true): { value: number, color: string } {
    var finals: number = 0;
    var color: string = 'success';
    var diff: number = val1 - val2;
    if (isRatio) {
      const final = (val1 > 0 ? ((diff) / val1) : val2 / 100) * 100;
      finals = +(final < 0 ? -1 * final : final).toFixed(2);
      if (finals > 0 && finals <= 5) color = 'warning';
      if (finals > 5) color = 'danger';
    } else {
      finals = +(diff < 0 ? -1 * diff : diff).toFixed(2);
    }
    return { value: finals, color: color }
  }

  initTable() {
    initDataTable('compare_data', false)
  }

  getChwInfos(chwId: string, byCode: boolean = false): Chws {
    var ascs!: Chws;
    for (let i = 0; i < this.Chws$!.length; i++) {
      const asc: Chws = this.Chws$![i];
      if (Functions.notNull(asc)) {
        if (byCode == true) {
          if (Functions.notNull(asc.external_id) && asc.external_id == chwId) return asc;
        } else {
          if (Functions.notNull(asc.id) && asc.id == chwId) return asc;
        }
      }
    }
    return ascs;
  }


}


