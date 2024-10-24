import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Chws, DataFromPython, Districts, Sites } from '@ih-app/models/Sync';
import { AuthService } from '@ih-app/services/auth.service';
import { SyncService } from '@ih-app/services/sync.service';
import { KeyValue } from '@angular/common';
import { capitaliseDataGiven, isNumber, notNull, returnDataAsArray } from '@ih-app/shared/functions';
import { ActivatedRoute } from '@angular/router'
import { getMondays, getDateInFormat } from '@ih-src/app/shared/dates-utils';

declare var $: any;
declare var initDataTable: any;

@Component({
  selector: 'sync-weekly-data',
  templateUrl: './sync-weekly-data.component.html',
  styleUrls: ['./sync-weekly-data.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SyncWeeklyDataComponent implements OnInit {
  ThinkMdWeeklyForm!: FormGroup;
  tab4_messages: DataFromPython | null = null;
  tab4_messages_error: string | null = null;
  weekly_Choosen_Dates: string[] = [];
  is_weekly_date_error: boolean = false;
  weekly_date_error_Msg: string = '';

  loading4: boolean = false;

  LoadingMsg: string = "Loading...";

  Districts$: Districts[] = [];
  Sites$: Sites[] = [];
  Chws$: Chws[] = [];
  Dhis2Chws$: { code: string, name: string, siteId: string }[] = [];

  chws$: Chws[] = [];
  sites$: Sites[] = [];
  dhis2Chws$: { code: string, name: string, siteId: string }[] = [];

  constructor(private auth: AuthService, private route: ActivatedRoute, private sync: SyncService) {
  }


  ngOnInit(): void {
    this.initAllData();
    this.ThinkMdWeeklyForm = this.createThinkmdWeeklyFormGroup();
  }

  createThinkmdWeeklyFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl("", [Validators.required, Validators.minLength(7)]),
      useToken: new FormControl(true),
      InsertIntoDhis2: new FormControl(false, []),
      districts: new FormControl("", [Validators.required]),
      sites: new FormControl("", [Validators.required]),
    });
  }

  async initAllData() {
    this.loading4 = true;
    this.LoadingMsg = 'Chargement des Districts ...';
    this.sync.getDistrictsList().subscribe(async (_d$: { status: number, data: Districts[] }) => {
      if (_d$.status == 200) this.Districts$ = _d$.data;
      this.loading4 = false;
    });
  }

  genarateSites() {
    this.sites$ = [];
    this.chws$ = [];
    const dist: string[] = returnDataAsArray(this.ThinkMdWeeklyForm.value.districts);
    this.ThinkMdWeeklyForm.value["sites"] = "";
    this.ThinkMdWeeklyForm.value["chws"] = [];

    if (notNull(dist)) {
      for (let d = 0; d < this.Sites$.length; d++) {
        const site = this.Sites$[d];
        if (notNull(site)) if (dist.includes(site.district.id)) this.sites$.push(site)
      }
    } else {
      this.sites$ = [];
    }
  }

  genarateWeekyDataChws() {
    const dhis2Sites: string[] = returnDataAsArray(this.ThinkMdWeeklyForm.value.sites);
    this.dhis2Chws$ = [];
    if (notNull(dhis2Sites)) {
      for (let d = 0; d < this.Dhis2Chws$.length; d++) {
        const chs = this.Dhis2Chws$[d];
        if (notNull(chs)) if (dhis2Sites.includes(chs.siteId)) this.dhis2Chws$.push(chs)
      }
    } else {
      this.dhis2Chws$ = this.Dhis2Chws$;
    }
  }

  cleanWeeklyDateError(): void {
    this.is_weekly_date_error = false;
    this.weekly_date_error_Msg = '';
  }

  WeeklyDateIsValid(): boolean {
    var t: number = 0;
    for (let i = 0; i < this.weekly_Choosen_Dates.length; i++) {
      const dt = this.weekly_Choosen_Dates[i];
      if (!getMondays(dt).includes(dt)) t++;
    }
    return t == 0;
  }

  removeWeekDate(date: string): void {
    const index = this.weekly_Choosen_Dates.indexOf(date);
    this.weekly_Choosen_Dates.splice(index, 1);
    // this.weekly_Choosen_Dates.r
  }

  runThinkMdWeekly(): void {
    if (this.dhis2Chws$.length > 0) {
      this.addToDateList();
      if (this.weekly_Choosen_Dates.length > 1 && this.WeeklyDateIsValid()) {
        this.is_weekly_date_error = false;
        this.weekly_date_error_Msg = '';
        this.loading4 = true;
        this.tab4_messages = null;
        this.tab4_messages_error = null;
        this.ThinkMdWeeklyForm.value['chws'] = this.dhis2Chws$;

        this.sync.syncThinkMdWeeklyChwsData(this.ThinkMdWeeklyForm.value).subscribe((response: any) => {
          this.loading4 = false;
          try {
            this.tab4_messages = JSON.parse(response);
          } catch (error) {
            this.tab4_messages_error = response.toString();
          }
          // console.log(response);
        }, (err: any) => { this.loading4 = false; this.tab4_messages_error = err.toString(); console.log(err.error) });
      } else {
        this.is_weekly_date_error = true;
        if (this.weekly_Choosen_Dates.length <= 1) {
          this.weekly_date_error_Msg = 'Vous devez choisir au moins 2 dates';
        } else if (!this.WeeklyDateIsValid()) {
          this.weekly_date_error_Msg = 'Toutes les dates doivent être un Lundi de la semaine';
        }
      }
    } else {
      this.tab4_messages_error = 'Impossible de récupérer les données du dhis2! Veuillez rafraichir la page et rééssayer!';
    }
  }

  dateTransform(date: string): string {
    return getDateInFormat(date, 0, 'fr')
  }

  getValue(obj: any, keys: any): any {
    return obj[keys.pop()]
  }

  addToDateList() {
    const start_date: string = this.ThinkMdWeeklyForm.value.start_date;
    if (!this.weekly_Choosen_Dates.includes(start_date) && start_date != null && start_date != '') {
      this.weekly_Choosen_Dates.push(start_date);
    }
    this.ThinkMdWeeklyForm.value.start_date = '';
    this.ThinkMdWeeklyForm.value.end_date = '';
    this.ThinkMdWeeklyForm.value.weekly_Choosen_Dates = this.weekly_Choosen_Dates;
    this.cleanWeeklyDateError();
  }
  genarateColor(data: any): string {
    if (isNumber(data)) {
      const d = parseInt(data);
      if (d <= 5) return 'danger'
      if (d > 5 && d <= 30) return 'warning'
      if (d > 30 && d < 40) return 'infos'
      return 'good';
    }
    return '';
  }


  capitaliseData(str: any, inputSeparator: string = ' ', outPutSeparator: string = ' '): string {
    return capitaliseDataGiven(str, inputSeparator, outPutSeparator)
  }

  getItemAsArray(data: KeyValue<unknown, unknown>): string[] {
    return data.value as string[];
  }

  initTable(tableId: string) {
    initDataTable(tableId);
  }

}
