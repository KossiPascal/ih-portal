// import { Component, OnInit } from '@angular/core';
// import { AggragateData, Chws, Districts, Families, FilterParams, Patients, Sites, Zones } from '@ih-app/models/Sync';
// import { SyncService } from '@ih-app/services/sync.service';
// // import * as Highcharts from 'highcharts';
// import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { DataIndicators } from '@ih-app/models/DataAggragate';

// import { DateUtils, Functions, notNull } from '@ih-app/shared/functions';
// import { AuthService } from '@ih-app/services/auth.service';
// import { AppStorageService } from '@ih-app/services/cookie.service';
// import { Roles } from '@ih-app/shared/roles';
// // import { liveQuery } from 'dexie';

// @Component({
//   selector: 'app-dashboard-2',
//   templateUrl: `./dashboard-2.component.html`,
//   styleUrls: [
//     './dashboard-2.component.css'
//   ]
// })
// export class Dashboard2Component implements OnInit {


//   constructor(private store: AppStorageService, private auth: AuthService, private sync: SyncService) {
//     if(!this.roles.isSupervisorMentor()  && !this.roles.isChws()) location.href = this.auth.userValue()?.defaultRedirectUrl!;
//    }
  
//   public roles = new Roles(this.store);

//   aggradateDataForm!: FormGroup;
//   initDate!: { start_date: string, end_date: string };
//   defaultParams?: FilterParams
//   chwOU:Chws | null = null;

//   createDataFilterFormGroup(): FormGroup {
//     return new FormGroup({
//       start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
//       end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
//       sources: new FormControl(""),
//       districts: new FormControl("", !this.roles.isChws() ? [Validators.required] : []),
//       sites: new FormControl(""),
//       chws: new FormControl(""),
//       day: new FormControl(this.day,[Validators.required])
//     });
//   }
//   initMsg!: string;
//   isLoading!: boolean;
//   allAggragateData: AggragateData[] = [];

//   identifyAggragateData(index: number, chw: DataIndicators) {
//     return chw.total_vad;
//   }

 

//   public options: any = {
//     Chart: {
//       type: 'area',
//       height: 700
//     },
//     title: {
//       text: 'Données par ASC'
//     },
//     credits: {
//       enabled: false
//     },
//     xAxis: {
//       categories: ['ASC1', 'ASC2', 'ASC3', 'ASC4', 'ASC5', 'ASC6', 'ASC7'],
//       tickmarkPlacement: 'on',
//       title: {
//         enabled: true
//       }
//     },
//     yAxis: {
//       categories: [],
//       max: 5268,
//       min: 0,
//       tickmarkPlacement: 'on',
//       title: {
//         enabled: false
//       }
//     },
//     series: [
//       {
//         name: 'Recherche Active',
//         data: [502, 635, 809, 947, 1402, 3634, 5268]
//       },
//       {
//         name: 'Pcime',
//         data: [163, 203, 276, 408, 547, 729, 628]
//       },
//       {
//         name: 'Maternel',
//         data: [18, 31, 54, 156, 339, 818, 1201]
//       }
//     ]
//   }


//   data_error_messages:string = ''; 
//   data_no_data_found:boolean = false;

//   ChwsDataFromDb$: {chw:Chws, data:DataIndicators}[] = [];

//   selectedChwData:{chw:Chws, data:DataIndicators}|any = null;
//   ChwsDataFromDbError: string = '';

//   Sources$: string[] = [];
//   Districts$: Districts[] = [];
//   Sites$: Sites[] = [];
//   Chws$: Chws[] = [];
//   Zones$: Zones[] = [];
//   Patients$: Patients[] = [];
//   Families$: Families[] = [];

//   chws$: Chws[] = [];
//   sites$: Sites[] = [];
//   days$:number[] = Functions.range(18,1);
//   day:number = 18;

//   ngOnInit(): void {
//     this.chwOU = this.auth.chwsOrgUnit();
//     if (this.roles.isChws() && (this.chwOU==null || !notNull(this.chwOU))) {
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
//     // Highcharts.chart('container', this.options);
//   }

//   async initAllData() {
//     // const sites$ = await this.db.getAllByParams(this.db.sites);
//     // sites$ = liveQuery(() => this.db.getAllByParams(this.db.sites,{}));
//     this.isLoading = true;
//     const filter: FilterParams = this.ParamsToFilter();
//     this.initMsg = 'Chargement des Districts ...';
//     this.sync.getDistrictsList(filter).subscribe(async (_d$: { status: number, data: Districts[] }) => {
//       if (_d$.status == 200) this.Districts$ = _d$.data;
//       this.initMsg = 'Chargement des Sites ...';
//       this.sync.getSitesList(filter).subscribe(async (_s$: { status: number, data: Sites[] }) => {
//         if (_s$.status == 200) this.Sites$ = _s$.data;
//         this.genarateSites();
//         this.initMsg = 'Chargement des ASC ...';
//         this.sync.getChwsList(filter).subscribe(async (_c$: { status: number, data: Chws[] }) => {
//           if (_c$.status == 200) this.Chws$ = _c$.data;
//           this.genarateChws();
//           this.isLoading = false;
//           // this.initDataFilted();
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



//   capitaliseDataGiven(str: any, inputSeparator?: string, outPutSeparator?: string): string {
//     return Functions.capitaliseDataGiven(str,inputSeparator, outPutSeparator);
//   }

//   seeSelectedChwData(data:{ chw: Chws, data: DataIndicators}){
//     this.selectedChwData = data;
//   }

//   genarateSites() {
//     this.sites$ = [];
//     this.chws$ = [];
//     const dist: string[] = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.districts);
//     this.aggradateDataForm.value.sites = [];
//     this.aggradateDataForm.value.chws = [];

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
//     const sites: string[] = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.sites);
//     this.chws$ = [];
//     this.aggradateDataForm.value.chws = [];
//     if (notNull(sites)) {
//       for (let d = 0; d < this.Chws$.length; d++) {
//         const chws = this.Chws$[d];
//         if (notNull(chws)) if (sites.includes(chws.site.id)) this.chws$.push(chws)
//       }
//     } else {
//       this.chws$ = [];
//     }
//   }

//   ParamsToFilter(): FilterParams {
//     const startDate: string = this.aggradateDataForm.value.start_date;
//     const endDate: string = this.aggradateDataForm.value.end_date;
//     const sources: string[] = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.sources);
//     var districts: string[] = [];
//     var sites: string[] = [];
//     var chws: string[] = [];

//     if (!this.roles.isChws()) {
//       districts = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.districts);
//       sites = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.sites);
//       chws = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.chws);
//     } else{
//       if (this.chwOU!=null && notNull(this.chwOU)) {
//         districts = Functions.returnDataAsArray(this.chwOU.site.district.id);
//         sites = Functions.returnDataAsArray(this.chwOU.site.id);
//         chws = Functions.returnDataAsArray(this.chwOU.id);
//       }
//     }

//     var params: FilterParams = {
//       start_date: startDate,
//       end_date: endDate,
//       sources: sources,
//       districts: districts,
//       sites: sites,
//       chws: chws,
//       params:'onlydata'
//     }
//     return params;
//   }

//   returnEmptyArrayIfNul(data: any): string[] {
//     return notNull(data) ? data : [];
//   }

//   getVadPerDay(datas: { chw: Chws, data: DataIndicators }):{val:string, class:string} {
//     const div = datas.data.total_vad/this.day;
//     var val =(div).toFixed(div < 1 ? 1 : 0);
//     if (datas.chw.name.includes('(R)') && datas.data.total_vad <= 0) {
//       return {val:val, class:''};
//     } else {
//       var _class = 'bg-success';
//       if (datas.data.total_vad > 0 && div< (this.day*10/this.day) && div >= (this.day*5/this.day)) _class = 'bg-warning';
//       if (datas.data.total_vad == 0 || datas.data.total_vad > 0 && div< (this.day*5/this.day)) _class = 'bg-danger';
//       return {val:val, class:_class};
//     }
//   }

//   initDataFilted(params?: FilterParams): void {
//     this.isLoading = true;
//     this.selectedChwData = null;
//     this.day = this.aggradateDataForm.value.day;

//     const filters: FilterParams = params ?? this.ParamsToFilter();
//     if (
//       this.defaultParams?.start_date != filters.start_date || 
//       this.defaultParams?.end_date != filters.end_date || 
//       this.defaultParams?.districts != filters.districts || 
//       this.defaultParams?.sites != filters.sites || 
//       this.defaultParams?.chws != filters.chws
//       ) {
//       this.ChwsDataFromDb$ = [];
//       this.data_error_messages = ''; 
//       this.data_no_data_found = false;
//       this.ChwsDataFromDbError = '';
//       this.sync.ihChtDataPerChw(filters).subscribe((_res$: {status:number, data: {chw:Chws, data:DataIndicators}[]|any}) => {
//         if (_res$.status == 200){
//           this.ChwsDataFromDb$ = _res$.data;
//           for (let i = 0; i < _res$.data.length; i++) {
//             const chwData = _res$.data[i];
//             if (!this.Sources$.includes(chwData.source)) this.Sources$.push(chwData.source);
//           }
//           this.defaultParams = filters;
//           this.data_no_data_found = this.ChwsDataFromDb$.length <= 0;
//         } else {
//           this.data_error_messages = _res$.data.toString();
//           this.data_no_data_found = true;
//         }
//         this.isLoading = false;
//       }, (err: any) => {
//         this.isLoading = false;
//         this.ChwsDataFromDbError = err.toString();
//       });
//     } else {
//     }
//   }


// }
