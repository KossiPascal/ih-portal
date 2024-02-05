import { Component, OnInit } from '@angular/core';
import { AggragateData, Chws, Districts, Families, FilterParams, Patients, Sites, Zones } from '@ih-app/models/Sync';
import { SyncService } from '@ih-app/services/sync.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataIndicators } from '@ih-app/models/DataAggragate';
import { capitaliseDataGiven, notNull, range, returnDataAsArray, returnEmptyArrayIfNul } from '@ih-app/shared/functions';
import { AuthService } from '@ih-app/services/auth.service';
import { startEnd21and20Date } from '@ih-src/app/shared/dates-utils';
import { User } from '@ih-src/app/models/User';
import { Router } from '@angular/router';

declare var sortTable: any;

@Component({
  selector: 'app-dashboard-2',
  templateUrl: `./dashboard-2.component.html`,
  styleUrls: [
    './dashboard-2.component.css'
  ]
})
export class ChwsDashboard2Component implements OnInit {

  constructor(private auth: AuthService, private sync: SyncService, private router: Router) {
  }

  aggradateDataForm!: FormGroup;
  initDate!: { start_date: string, end_date: string };
  defaultParams?: FilterParams

  createDataFilterFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
      end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
      sources: new FormControl(""),
      districts: new FormControl("", []),
      sites: new FormControl("", []),
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

  generateCount(data: any): number {
    const dt = data as { tonoudayo: 11, dhis2: 0 };
    return dt.tonoudayo + dt.dhis2;
  }

  isNumber(data: any): boolean {
    return !isNaN(this.generateCount(data));
  }

  showClass(data: any) {
    return this.isNumber(data) ? 'col-sm-6 col-6' : '';
  }

  data_error_messages: string = '';
  data_no_data_found: boolean = false;

  FinalChwsOutputData$: { chw: Chws, data: DataIndicators }[] = [];

  selectedChwData: { chw: Chws, data: DataIndicators } | any = null;
  ChwsDataFromDbError: string = '';

  response$!: { status: number, data: { chw: Chws, data: DataIndicators }[] | any }

  Sources$: string[] = [];
  Districts$: Districts[] = [];
  Sites$: Sites[] = [];
  Chws$: Chws[] = [];
  Zones$: Zones[] = [];
  Patients$: Patients[] = [];
  Families$: Families[] = [];

  chws$: Chws[] = [];
  sites$: Sites[] = [];
  days$: number[] = range(24, 1);
  day: number = 22;


    
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
    this.initDate = startEnd21and20Date();
    this.aggradateDataForm = this.createDataFilterFormGroup();
    this.initDataFilted();
  }

  async initAllData() {
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

  sort() {
    sortTable('export_table');
  }

  capitaliseDataGiven(str: any, inputSeparator?: string, outPutSeparator?: string): string {
    return capitaliseDataGiven(str, inputSeparator, outPutSeparator);
  }

  seeSelectedChwData(data: { chw: Chws, data: DataIndicators }) {
    this.selectedChwData = data;
  }

  genarateSites() {
    this.sites$ = [];
    this.chws$ = [];
    const dist: string[] = returnEmptyArrayIfNul(this.aggradateDataForm.value.districts);
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
    const sites: string[] = returnEmptyArrayIfNul(this.aggradateDataForm.value.sites);
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
    const sources: string[] = notNull(src) ? returnDataAsArray(src) : [];

    const districts: string[] = returnDataAsArray(this.chwOU?.site.district.id);
    const sites: string[] = returnDataAsArray(this.chwOU?.site.id);
    const chws: string[] = returnDataAsArray(this.chwOU?.id);
    this.chws$ = [this.chwOU!];


    var params: FilterParams = {
      start_date: startDate,
      end_date: endDate,
      sources: sources,
      districts: districts,
      sites: sites,
      chws: chws,
      withDhis2Data: true
    }
    return params;
  }

  returnEmptyArrayIfNul(data: any): string[] {
    return notNull(data) ? data : [];
  }

  getVadPerDay(datas: { chw: Chws, data: DataIndicators }): { val: string, class: string } {
    const total_vad = this.sum(datas.data)
    const div = total_vad / this.day;
    var val = (div).toFixed(div < 1 ? 1 : 0);
    if (datas.chw.name.includes('(R)') && total_vad <= 0) {
      return { val: val, class: '' };
    } else {
      var _class = 'bg-success';
      if (total_vad > 0 && div < (this.day * 10 / this.day) && div >= (this.day * 5 / this.day)) _class = 'bg-warning';
      if (total_vad == 0 || total_vad > 0 && div < (this.day * 5 / this.day)) _class = 'bg-danger';
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
    ) {
      this.FinalChwsOutputData$ = [];
      this.data_error_messages = '';
      this.data_no_data_found = false;
      this.ChwsDataFromDbError = '';
      this.sync.ihChtDataPerChw(filters).subscribe((_res$: { status: number, data: { chw: Chws, data: DataIndicators }[] | any }) => {
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

  sum(data: DataIndicators) {
    return data.total_vad.tonoudayo + data.total_vad.dhis2;
  }


  startTraitement(params?: FilterParams) {
    this.isLoading = true;
    const filters: FilterParams = params ?? this.ParamsToFilter();
    if (this.response$.status == 200) {
      this.FinalChwsOutputData$ = this.response$.data as { chw: Chws, data: DataIndicators }[]
      this.defaultParams = filters;
      this.data_no_data_found = this.FinalChwsOutputData$.length <= 0;
    } else {
      this.data_error_messages = this.response$.data.toString();
      this.data_no_data_found = true;
    }
    this.isLoading = false;
  }



}