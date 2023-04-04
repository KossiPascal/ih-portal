// import { Component, OnInit } from '@angular/core';
// import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { Chws, CompareData, Dhis2Sync, Districts, FilterParams, ChwsDataFormDb, Sites } from '@ih-app/models/Sync';
// import { AuthService } from '@ih-app/services/auth.service';
// import { AppStorageService } from '@ih-app/services/cookie.service';
// import { SyncService } from '@ih-app/services/sync.service';
// import { Consts } from '@ih-app/shared/constantes';
// import { Functions, DateUtils, notNull } from '@ih-app/shared/functions';
// import { Roles } from '@ih-app/shared/roles';
// import { async } from 'rxjs';

// // declare var $: any;
// // declare var initJsGridTable: any;
// declare var initDataTable: any;

// @Component({
//   selector: 'app-dashboard-1',
//   templateUrl: `./dashboard-1.component.html`,
//   styleUrls: [
//     './dashboard-1.component.css'
//   ]
// })
// export class Dashboard1Component implements OnInit {
//   constructor(private store: AppStorageService, private auth: AuthService, private sync: SyncService) {
//     if (!this.roles.isSupervisorMentor() && !this.roles.isChws() && !this.roles.onlySeeData()) location.href = this.auth.userValue()?.defaultRedirectUrl!;
//   }


//   public roles = new Roles(this.store);

//   aggradateDataForm!: FormGroup;
//   initDate!: { start_date: string, end_date: string };
//   chwOU: Chws | null = null;

//   createDataFilterFormGroup(): FormGroup {
//     return new FormGroup({
//       start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
//       end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
//       districts: new FormControl(""),
//       sites: new FormControl(""),
//       withRatio: new FormControl(false, [Validators.required]),
//     });
//   }

//   bodyData: CompareData[] = [];
//   ChwsDataFromDb$: ChwsDataFormDb[] = [];
//   Districts$: Districts[] = [];
//   Chws$: Chws[] = [];
//   Sites$: Sites[] = [];
//   chws$: Chws[] = [];
//   sites$: Sites[] = [];
//   initMsg!: string;
//   isLoading!: boolean;
//   dhis2Params!: Dhis2Sync;
//   responseMessage: string = '';

//   identifyBodyData(index: number, item: CompareData) {
//     return item.Code;
//   }

//   ngOnInit(): void {
//     this.chwOU = this.auth.chwsOrgUnit();
//     if (this.roles.isChws() && (this.chwOU == null || !notNull(this.chwOU))) {
//       location.href = 'chws/select_orgunit';
//     }
//     this.isLoading = false;
//     this.initDate = DateUtils.startEnd21and20Date();
//     this.aggradateDataForm = this.createDataFilterFormGroup();
//     if (!this.roles.isChws()) {
//       this.initAllData();
//     } else {
//       this.initDataFilted();
//     }

//   }

//   async initAllData() {
//     this.isLoading = true;
//     this.initMsg = 'Chargement des Districts ...';
//     this.sync.getDistrictsList().subscribe(async (_d$: { status: number, data: Districts[] }) => {
//       if (_d$.status == 200) this.Districts$ = _d$.data;
//       this.initMsg = 'Chargement des Sites ...';
//       this.sync.getSitesList().subscribe(async (_s$: { status: number, data: Sites[] }) => {
//         if (_s$.status == 200) this.Sites$ = _s$.data;
//         this.genarateSites()
//         this.initMsg = 'Chargement des ASC ...';
//         this.sync.getChwsList().subscribe(async (_c$: { status: number, data: Chws[] }) => {
//           if (_c$.status == 200) {
//             this.Chws$ = _c$.data;
//           }
//           this.genarateChws();
//           // this.initDataFilted();
//           this.isLoading = false;
//         }, (err: any) => {
//           this.isLoading = false;
//           console.log(err.error);
//         });
//       }, (err: any) => {
//         this.isLoading = false;
//         console.log(err.error);
//       });
//     }, (err: any) => {
//       this.isLoading = false;
//       console.log(err.error);
//     });
//   }


//   genarateSites() {
//     this.sites$ = [];
//     this.chws$ = [];
//     const dist: string = this.aggradateDataForm.value["districts"];
//     this.aggradateDataForm.value["sites"] = "";
//     this.aggradateDataForm.value["chws"] = [];

//     if (notNull(dist)) {
//       for (let d = 0; d < this.Sites$.length; d++) {
//         const site = this.Sites$[d];
//         if (notNull(site)) if (dist.includes(site.district.id)) this.sites$.push(site)
//       }
//     } else {
//       this.sites$ = [];
//     }
//   }

//   genarateChws() {
//     const sites: string[] = Functions.returnDataAsArray(this.aggradateDataForm.value.sites);
//     this.chws$ = [];
//     this.aggradateDataForm.value["chws"] = [];
//     if (notNull(sites)) {
//       for (let d = 0; d < this.Chws$.length; d++) {
//         const chws = this.Chws$[d];
//         if (notNull(chws)) if (sites.includes(chws.site.id)) this.chws$.push(chws)
//       }
//     } else {
//       this.chws$ = this.Chws$;
//     }
//   }

//   ParamsToFilter(): FilterParams {
//     const startDate: string = this.aggradateDataForm.value.start_date;
//     const endDate: string = this.aggradateDataForm.value.end_date;

//     var districts: string[] = [];
//     var sites: string[] = [];
//     var chws: string[] = [];

//     if (!this.roles.isChws()) {
//       // const sources: string[] = Functions.returnDataAsArray(this.aggradateDataForm.value.sources) as string[];
//       districts = Functions.returnDataAsArray(this.aggradateDataForm.value.districts);
//       sites = Functions.returnDataAsArray(this.aggradateDataForm.value.sites);
//       // const chws: string[] = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.chws);
//     } else {
//       if (this.chwOU != null && notNull(this.chwOU)) {
//         districts = Functions.returnDataAsArray(this.chwOU.site.district.id);
//         sites = Functions.returnDataAsArray(this.chwOU.site.id);
//         chws = Functions.returnDataAsArray(this.chwOU.id);
//       }
//     }


//     var params: FilterParams = {
//       // sources: sources,
//       start_date: startDate,
//       end_date: endDate,
//       districts: districts,
//       sites: sites,
//       chws: chws,
//       withDhis2Data:true
//     }
//     return params;
//   }

//   initDataFilted(params?: FilterParams): void {
//     this.initMsg = 'Loading Data ...';
//     this.isLoading = true;
//     this.genarateChws();
//     this.sync.getAllChwsDataWithParams(params ?? this.ParamsToFilter()).subscribe((res: { status: number, data: any }) => {
//       if (res.status == 200) {
//         this.ChwsDataFromDb$ = res.data;
//         this.getAllAboutData(params ?? this.ParamsToFilter());
//       } else {
//         this.isLoading = false;
//         this.responseMessage = res.data
//       }
//     }, (err: any) => {
//       this.isLoading = false;
//       console.log(err);
//     });
//   }


//   getAllAboutData(params: FilterParams) {
//     const { start_date, end_date, sites } = params;

//     const selectedChws: Chws[] = this.roles.isChws() && this.chwOU != null ? [this.chwOU] : this.chws$;

//     var outPutData: any = {}
//     for (let i = 0; i < selectedChws.length; i++) {
//       const ascId = selectedChws[i].id;
//       if (notNull(ascId)) {
//         if (!outPutData.hasOwnProperty(ascId)) outPutData[ascId] = {
//           chwId: ascId,
//           app_total_child_followup: 0,
//           dhis_total_child_followup: 0,
//           app_total_mum_fp_followup: 0,
//           dhis_total_mum_fp_followup: 0,

//           app_total_mum_followup: 0,
//           dhis_total_mum_followup: 0,

//           app_total_fp_followup: 0,
//           dhis_total_fp_followup: 0,

//           app_total_active_research: 0,
//           dhis_total_active_research: 0,
//           app_total_consultation_followup: 0,
//           dhis_total_consultation_followup: 0,
//           app_home_visit: 0,
//           dhis_home_visit: 0
//         }
//       }
//     }


//     for (let index = 0; index < this.ChwsDataFromDb$!.length; index++) {
//       const data: ChwsDataFormDb = this.ChwsDataFromDb$[index];
//       if (data != null) {
//         const form = data.form;
//         const field = data.fields;;
//         const asc: string = data.chw != null ? notNull(data.chw.id) ? data.chw.id : '' : '';
//         const site: string = data.site != null ? notNull(data.site.id) ? data.site.id : '' : '';
//         const idSiteValid: boolean = notNull(site) && notNull(sites) && sites?.includes(site) || !notNull(sites);
//         const isDateValid: boolean = notNull(start_date) && notNull(end_date) ? DateUtils.isBetween(`${start_date}`, data.reported_date, `${end_date}`) : false;

//         if (idSiteValid && isDateValid && outPutData.hasOwnProperty(asc)) {
//           if (data.source == 'dhis2') {
//             if (form === "PCIME") outPutData[asc].dhis_total_child_followup += 1
//             if (form === "Maternelle") outPutData[asc].dhis_total_mum_followup += 1
//             if (form === "PF") outPutData[asc].dhis_total_fp_followup += 1
//             if (form === "Maternelle" || form === "PF") outPutData[asc].dhis_total_mum_fp_followup += 1
//             if (form === "Recherche") outPutData[asc].dhis_total_active_research += 1
//             if (form !== "Recherche") outPutData[asc].dhis_total_consultation_followup += 1
//             outPutData[asc].dhis_home_visit += 1
//           } else if (data.source == 'Tonoudayo') {
//             if (Consts.child_forms.includes(form)) outPutData[asc].app_total_child_followup += 1

//             if (Consts.mum_forms.includes(form) && form != `pregnancy_family_planning`){
//                 outPutData[asc].app_total_mum_followup += 1
//             }
//             if (Consts.fp_forms.includes(form) && form != `pregnancy_family_planning`) {
//               outPutData[asc].app_total_fp_followup += 1
//             }

//             if(form == `pregnancy_family_planning`) {
//               if (data.fields.hasOwnProperty("s_reg_pregnancy_screen")) {
//                 var isPregnant:boolean = false;
//                 if (data.fields.s_reg_pregnancy_screen.hasOwnProperty("s_reg_urine_result")) {
//                   isPregnant = field.s_reg_pregnancy_screen.s_reg_urine_result == "positive";
//                 }
//                 if (data.fields.s_reg_pregnancy_screen.hasOwnProperty("s_reg_why_urine_test_not_done")) {
//                   isPregnant = field.s_reg_pregnancy_screen.s_reg_why_urine_test_not_done == "already_pregnant";
//                 }
//                 if (!isPregnant) {
//                   outPutData[asc].app_total_fp_followup += 1
//                 } else {
//                   outPutData[asc].app_total_mum_followup += 1
//                 }
//               } else {
//                 outPutData[asc].app_total_fp_followup += 1
//               }
//             }

//             if (Consts.mum_fp_forms.includes(form)) outPutData[asc].app_total_mum_fp_followup += 1

//             if (["death_report","home_visit"].includes(form)) outPutData[asc].app_total_active_research += 1
//             if (Consts.consultations_followup_forms.includes(form)) outPutData[asc].app_total_consultation_followup += 1
//             if (Consts.home_actions_forms.includes(form)) outPutData[asc].app_home_visit += 1
//           }
//         }
//       }
//     }


//     // Object.entries(this.AllDhis2SelectedDataValues).map(([key, value]) => {
//     //   // plW6bCSnXKU [PCIME, Maternelle, PF, Recherche]
//     //   const vals = value as any;

//     //   for (let i = 0; i < vals.length; i++) {
//     //     const dataArray = vals[i] as { dataElement: string, value: any }[];

//     //     var isResearchFound: boolean = false;
//     //     var isChwFound: boolean = false;

//     //     for (let j = 0; j < dataArray.length; j++) {
//     //       const vals = dataArray[j];
//     //       if (vals.dataElement == 'plW6bCSnXKU' && vals.value == 'Recherche') {
//     //         isResearchFound = true;
//     //       }
//     //       if (vals.dataElement == 'JkMyqI3e6or' && vals.value == this.getChwInfos(key).external_id) {
//     //         isChwFound = true;
//     //       }
//     //     }

//     //     if (isChwFound) {
//     //       outPutData[key].dhis_home_visit += 1;
//     //       if (isResearchFound == true) {
//     //         outPutData[key].dhis_total_active_research += 1
//     //       } else {
//     //         outPutData[key].dhis_total_consultation_followup += 1
//     //       }
//     //     }

//     //   }

//     // });


//     this.bodyData = [];



//     Object.entries(outPutData).map(([keys, value]) => {
//       const vals = value as {
//         chwId: string,
//         app_total_child_followup: 0,
//         dhis_total_child_followup: 0,
//         app_total_mum_fp_followup: 0,
//         dhis_total_mum_fp_followup: 0,
//         app_total_mum_followup: 0,
//         dhis_total_mum_followup: 0,
//         app_total_fp_followup: 0,
//         dhis_total_fp_followup: 0,
//         app_total_active_research: number,
//         dhis_total_active_research: number,
//         app_total_consultation_followup: number,
//         dhis_total_consultation_followup: number,
//         app_home_visit: number,
//         dhis_home_visit: number
//       };
//       this.bodyData.push({
//         Code: this.getChwInfos(vals.chwId).external_id,
//         Name: this.getChwInfos(vals.chwId).name,
//         Pcime: vals.app_total_child_followup,
//         PcimeDhis2: vals.dhis_total_child_followup,

//         Maternelle: vals.app_total_mum_followup,
//         MaternelleDhis2: vals.dhis_total_mum_followup,

//         Pf: vals.app_total_fp_followup,
//         PfDhis2: vals.dhis_total_fp_followup,

//         MaternellePf: vals.app_total_mum_fp_followup,
//         MaternellePfDhis2: vals.dhis_total_mum_fp_followup,
//         Recherche: vals.app_total_active_research,
//         RechercheDhis: vals.dhis_total_active_research,
//         Consultation: vals.app_total_consultation_followup,
//         ConsultationDhis: vals.dhis_total_consultation_followup,
//         Total: vals.app_home_visit,
//         TotalDhis: vals.dhis_home_visit,
//       });
//     });

//     this.isLoading = false;

//   }

//   getDataValuesElements(data: { dataValues: { dataElement: string, value: any }[], dataElement: string, value: any }): boolean {
//     for (let j = 0; j < data.dataValues.length; j++) {
//       const vals = data.dataValues[j];
//       if (vals.dataElement == data.dataElement && vals.value == data.value) {
//         return true;
//       }
//     }
//     return false;
//   }

//   isRatioChecked():boolean{
//     return this.aggradateDataForm.value.withRatio == true;
//   }

//   getRatio(val1: number, val2: number, isRatio: boolean = true): { value: number, color: string } {
//     var finals: number = 0;
//     var color: string = 'success';
//     var diff: number = val1 - val2;
//     if (isRatio) {
//       const final = (val1 > 0 ? ((diff) / val1) : val2 / 100) * 100;
//       finals = +(final < 0 ? -1 * final : final).toFixed(2);
//       if (finals > 0 && finals <= 5) color = 'warning';
//       if (finals > 5) color = 'danger';
//     } else {
//       finals = +(diff < 0 ? -1 * diff : diff).toFixed(2);
//     }
//     return { value: finals, color: color }
//   }

//   initTable() {
//     initDataTable('compare_data', false)
//   }

//   getChwInfos(chwId: string, byCode: boolean = false): Chws {
//     var ascs!: Chws;


//     const selectedChws: Chws[] = this.roles.isChws() && this.chwOU != null ? [this.chwOU] : this.chws$;
//     for (let i = 0; i < selectedChws.length; i++) {
//       const asc: Chws = selectedChws[i];
//       if (notNull(asc)) {
//         if (byCode == true) {
//           if (notNull(asc.external_id) && asc.external_id == chwId) return asc;
//         } else {
//           if (notNull(asc.id) && asc.id == chwId) return asc;
//         }
//       }
//     }
//     return ascs;
//   }


// }


