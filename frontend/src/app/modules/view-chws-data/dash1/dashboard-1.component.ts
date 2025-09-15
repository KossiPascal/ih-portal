import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataIndicators } from '@ih-app/models/DataAggragate';
import { Chws, CompareData, Dhis2Sync, Districts, FilterParams, Sites } from '@ih-app/models/Sync';
import { AuthService } from '@ih-app/services/auth.service';
import { SyncService } from '@ih-app/services/sync.service';
import { notNull, returnDataAsArray } from '@ih-app/shared/functions';
import { Roles } from '@ih-src/app/models/Roles';
import { startEnd21and20Date } from '@ih-src/app/shared/dates-utils';


@Component({
  selector: 'app-dashboard-1',
  templateUrl: `./dashboard-1.component.html`,
  styleUrls: [
    './dashboard-1.component.css'
  ],
})
export class Dashboard1Component implements OnInit {
  sum(arg0: any) {
    throw new Error('Method not implemented.');
  }

  constructor(private auth: AuthService, private sync: SyncService) {
  }
  
  public roles = new Roles(this.auth);

  aggradateDataForm!: FormGroup;
  initDate!: { start_date: string, end_date: string };

  createDataFilterFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
      end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
      districts: new FormControl(""),
      sites: new FormControl(""),
      withRatio: new FormControl(false, [Validators.required]),
    });
  }

  // bodyData: CompareData[] = [];
  FinalChwsOutputData$: { chw: Chws, data: DataIndicators }[] = [];
  Districts$: Districts[] = [];
  Chws$: Chws[] = [];
  Sites$: Sites[] = [];
  chws$: Chws[] = [];
  sites$: Sites[] = [];
  initMsg!: string;
  isLoading!: boolean;
  dhis2Params!: Dhis2Sync;
  responseMessage: string = '';

  identifyBodyData(index: number, item: CompareData) {
    return item.Code;
  }

  ngOnInit(): void {
    this.isLoading = false;
    this.initDate = startEnd21and20Date();
    this.aggradateDataForm = this.createDataFilterFormGroup();
    this.initAllData();
  }

  async initAllData() {
    this.isLoading = true;
    this.initMsg = 'Chargement des Districts ...';
    this.sync.getDistrictsList().subscribe(async (_d$: { status: number, data: Districts[] }) => {
      if (_d$.status == 200) this.Districts$ = _d$.data;
      this.initMsg = 'Chargement des Sites ...';
      this.sync.getSitesList().subscribe(async (_s$: { status: number, data: Sites[] }) => {
        if (_s$.status == 200) this.Sites$ = _s$.data;
        this.genarateSites()
        this.initMsg = 'Chargement des ASC ...';
        this.sync.getChwsList().subscribe(async (_c$: { status: number, data: Chws[] }) => {
          if (_c$.status == 200) {
            this.Chws$ = _c$.data;
          }
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

  genarateSites() {
    this.sites$ = [];
    this.chws$ = [];
    const dist: string = this.aggradateDataForm.value["districts"];
    this.aggradateDataForm.value["sites"] = "";
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
      this.chws$ = this.Chws$;
    }
  }

  ParamsToFilter(): FilterParams {
    const startDate: string = this.aggradateDataForm.value.start_date;
    const endDate: string = this.aggradateDataForm.value.end_date;
    const districts: string[] = returnDataAsArray(this.aggradateDataForm.value.districts);
    const sites: string[] = returnDataAsArray(this.aggradateDataForm.value.sites);

    var params: FilterParams = {
      start_date: startDate,
      end_date: endDate,
      districts: districts,
      sites: sites,
      withDhis2Data: true
    }
    return params;
  }

  initDataFilted(params?: FilterParams): void {
    this.initMsg = 'Loading Data ...';
    this.isLoading = true;
    this.genarateChws();

    this.sync.ihChtDataPerChw(params ?? this.ParamsToFilter()).subscribe((_res$: { status: number, data: { chw: Chws, data: DataIndicators }[] | any }) => {
      if (_res$.status == 200) {
        this.FinalChwsOutputData$ = _res$.data;
      } else {
        this.responseMessage = _res$.data
      }
      this.isLoading = false;
    }, (err: any) => {
      this.isLoading = false;
      console.log(err);
    });
  }

  isRatioChecked(): boolean {
    return this.aggradateDataForm.value.withRatio == true;
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

}


