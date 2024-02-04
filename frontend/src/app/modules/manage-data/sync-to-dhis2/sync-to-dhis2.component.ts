import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Chws, DataFromPython, Districts, Sites } from '@ih-app/models/Sync';
import { AuthService } from '@ih-app/services/auth.service';
import { SyncService } from '@ih-app/services/sync.service';
import * as moment from 'moment';
import { KeyValue } from '@angular/common';
import { capitaliseDataGiven, notNull, returnEmptyArrayIfNul } from '@ih-app/shared/functions';
import { ActivatedRoute } from '@angular/router'
import { DataIndicators } from '@ih-app/models/DataAggragate';
import { startEnd21and20Date, isDayInDate, daysDiff } from '@ih-src/app/shared/dates-utils';

@Component({
  selector: 'sync-to-dhis2',
  templateUrl: './sync-to-dhis2.component.html',
  styleUrls: ['./sync-to-dhis2.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SyncToDhis2Component implements OnInit {
  thinkmdToDhis2Form!: FormGroup;
  ihChtToDhis2Form!: FormGroup;
  tab1_messages: DataFromPython | null = null;
  tab1_messages_error: string | null = null;
  tab3_messages: { chw: Chws, data: DataIndicators | any }[] = [];
  tab3_error_messages: string = '';
  tab3_no_data_found: boolean = false;
  tab4_messages: DataFromPython | null = null;
  tab4_messages_error: string | null = null;
  dates: moment.Moment[] = [];
  initDate!: { start_date: string, end_date: string };

  loading1: boolean = false;
  loading3: boolean = false;
  loading4: boolean = false;

  start_date_error: boolean = false;
  end_date_error: boolean = false;
  LoadingMsg: string = "Loading...";

  Districts$: Districts[] = [];
  Sites$: Sites[] = [];
  Chws$: Chws[] = [];
  Dhis2Chws$: { code: string, name: string, siteId: string }[] = [];

  chws$: Chws[] = [];
  sites$: Sites[] = [];
  dhis2Chws$: { code: string, name: string, siteId: string }[] = [];

  Tab1Dhis2Import: { ErrorCount: number, ErrorMsg: string, Created: number, Updated: number, Deleted: number } = {
    ErrorCount: 0,
    ErrorMsg: '',
    Created: 0,
    Updated: 0,
    Deleted: 0
  }

  Tab3Dhis2Import: { ErrorCount: number, ErrorMsg: string, Created: number, Updated: number, Deleted: number } = {
    ErrorCount: 0,
    ErrorMsg: '',
    Created: 0,
    Updated: 0,
    Deleted: 0
  }

  constructor(private auth: AuthService, private route: ActivatedRoute, private sync: SyncService) {
  }


  ngOnInit(): void {
    this.initDate = startEnd21and20Date();
    this.initAllData();
    this.thinkmdToDhis2Form = this.createThinkmdFormGroup();
    this.ihChtToDhis2Form = this.createIhChtFormGroup();
  }

  generateCount(data: any): any {
    const dt = data as { tonoudayo: 11, dhis2: 0 };
    const ct = dt.tonoudayo + dt.dhis2;
    return !isNaN(ct) ? ct : data;
  }

  createDhis2ChwsDataFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
      end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
      sites: new FormControl(""),
    });
  }

  createThinkmdFormGroup(): FormGroup {
    return new FormGroup({
      end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
      weekly_Choosen_Dates: new FormControl(""),
      useToken: new FormControl(true),
      InsertIntoDhis2: new FormControl(false, []),
      districts: new FormControl("", [Validators.required]),
      sites: new FormControl("", [Validators.required]),
      // dhis2_username: new FormControl(""),
      // dhis2_password: new FormControl(""),
    });
  }

  getSiteById(siteId: string): Sites | null {
    for (let d = 0; d < this.Sites$.length; d++) {
      const site = this.Sites$[d];
      if (siteId == site.id) return site;
    }
    return null;
  }

  createIhChtFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
      end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
      districts: new FormControl("", [Validators.required]),
      sites: new FormControl("", [Validators.required]),
      InsertIntoDhis2: new FormControl(false, []),
    });
  }

  capitaliseDataGiven(str: any, inputSeparator?: string, outPutSeparator?: string): string {
    return capitaliseDataGiven(str, inputSeparator, outPutSeparator);
  }

  async initAllData() {
    this.loading3 = true;
    this.LoadingMsg = 'Chargement des Districts ...';
    this.sync.getDistrictsList().subscribe(async (_d$: { status: number, data: Districts[] }) => {
      if (_d$.status == 200) this.Districts$ = _d$.data;
      this.LoadingMsg = 'Chargement des Sites ...';
      this.sync.getSitesList().subscribe(async (_s$: { status: number, data: Sites[] }) => {
        if (_s$.status == 200) this.Sites$ = _s$.data;
        this.genarateSites(this.ihChtToDhis2Form)
        this.LoadingMsg = 'Chargement des ASC ...';
        this.sync.getChwsList().subscribe(async (_c$: { status: number, data: Chws[] }) => {
          if (_c$.status == 200) this.Chws$ = _c$.data;
          this.genarateChws(this.ihChtToDhis2Form);
          for (let i = 0; i < this.Chws$.length; i++) {
            const ch = this.Chws$[i];

            var name0 = `${ch.name}`.replace("'", '`')
            var name1 = name0.toString().replace("’", '`')
            var name2 = name1.replace('’', '`')
            var name = name2.replace("'", '`')

            this.Dhis2Chws$.push({ code: ch.external_id, name: name, siteId: ch.site.id });
          }
          this.loading3 = false;
          this.LoadingMsg = '';
        }, (err: any) => {
          this.loading3 = false;
          console.log(err.error);
        });
      }, (err: any) => {
        this.loading3 = false;
        console.log(err.error);
      });

    });
  }

  genarateSites(cibleForm: FormGroup) {
    this.sites$ = [];
    this.chws$ = [];
    const dist: string[] = returnEmptyArrayIfNul(cibleForm.value.districts);
    cibleForm.value["sites"] = "";
    cibleForm.value["chws"] = [];

    if (notNull(dist)) {
      for (let d = 0; d < this.Sites$.length; d++) {
        const site = this.Sites$[d];
        if (notNull(site)) if (dist.includes(site.district.id)) this.sites$.push(site)
      }
    } else {
      this.sites$ = [];
    }
  }

  getExternalIdByName(nameOrId: string): string {
    for (let i = 0; i < this.Chws$.length; i++) {
      const ch = this.Chws$[i];
      if (nameOrId == ch.name) return ch.external_id;

    }
    return nameOrId;
  }

  genarateChws(cibleForm: FormGroup) {
    const sites: string[] = returnEmptyArrayIfNul(cibleForm.value.sites);
    this.chws$ = [];
    cibleForm.value["chws"] = [];
    if (notNull(sites)) {
      for (let d = 0; d < this.Chws$.length; d++) {
        const chws = this.Chws$[d];
        if (notNull(chws)) if (sites.includes(chws.site.id)) this.chws$.push(chws)
      }
    } else {
      this.chws$ = [];
    }
  }


  ParamsToFilter() {
    return {
      start_date: this.ihChtToDhis2Form.value.start_date,
      end_date: this.ihChtToDhis2Form.value.end_date,
      sources: ['Tonoudayo'],
      districts: returnEmptyArrayIfNul(this.ihChtToDhis2Form.value.districts),
      sites: returnEmptyArrayIfNul(this.ihChtToDhis2Form.value.sites),
      InsertIntoDhis2: this.ihChtToDhis2Form.value.InsertIntoDhis2,
    }
  }

  isValidParams(fForm: FormGroup, type: string): boolean {
    if (fForm != undefined) {
      const parent: any = fForm.value;
      if (parent != undefined) {
        const s_date: string = parent['start_date'];
        const e_date: string = parent['end_date'];
        const isStart: boolean = isDayInDate(s_date, 21)
        const isEnd: boolean = isDayInDate(e_date, 20);
        const dateDiff: number = daysDiff(s_date, e_date);
        if (parent['InsertIntoDhis2'] == true && type == 'cht') {
          if (dateDiff > 31) {
            this.start_date_error = true
            this.end_date_error = true
          } else {
            this.start_date_error = !isStart;
            this.end_date_error = !isEnd;
          }
          return isStart && isEnd && dateDiff <= 31;
        }
        if (type == 'thinkMd') {
          this.end_date_error = !isEnd;
          return isEnd
        };
      }
    }
    return true;
  }

  startDateError(): string {
    return this.start_date_error ? 'borderError' : '';
  }

  endDateError(): string {
    return this.end_date_error ? 'borderError' : '';
  }

  cleanError(): void {
    this.start_date_error = false;
    this.end_date_error = false;
  }


  runThinkmdToDhis2(): void {
    if (this.isValidParams(this.thinkmdToDhis2Form, 'thinkMd')) {
      this.start_date_error = false;
      this.loading1 = true;
      this.tab1_messages = null;
      this.tab1_messages_error = null;
      this.Tab1Dhis2Import = { ErrorCount: 0, ErrorMsg: '', Created: 0, Updated: 0, Deleted: 0 };
      // this.thinkmdToDhis2Form.value['useToken'] = true;
      this.sync.thinkmdToDhis2Script(this.thinkmdToDhis2Form.value).subscribe((response: any) => {
        try {
          var respData: DataFromPython | null = response;
          if (this.thinkmdToDhis2Form.value.InsertIntoDhis2 == true && respData?.DataFordhis2) {
            var t1 = 0;
            var t2 = 0;
            for (let i = 0; i < respData?.DataFordhis2.length; i++) {
              t1++;
              var chwsData = respData?.DataFordhis2[i] as DataIndicators;
              const nOrId = chwsData.orgUnit;
              chwsData.orgUnit = this.getExternalIdByName(nOrId!);

              this.sync.insertOrUpdateDhis2Data(chwsData).subscribe((resp: { status: number, data: any }) => {
                t2++;
                if (resp.status == 200) {
                  if (resp.data == 'Created') this.Tab1Dhis2Import.Created! += 1;
                  if (resp.data == 'Updated') this.Tab1Dhis2Import.Updated! += 1;
                  if (resp.data == 'Deleted') this.Tab1Dhis2Import.Deleted! += 1;
                } else {
                  if (resp.data == 'ErrorCount') this.Tab1Dhis2Import.ErrorCount! += 1;
                  if (resp.data == 'ErrorMsg') this.Tab1Dhis2Import.ErrorMsg! += 1;
                }

                if (t1 == t2) {
                  this.tab1_messages = respData;
                  this.loading1 = false;
                }

              }, (err: any) => { this.loading1 = false; this.tab1_messages_error = err.toString(); console.log(err.error) });
            }
          } else {
            this.tab1_messages = respData;
            this.loading1 = false;
          }
        } catch (error) {
          this.loading1 = false;
          this.tab1_messages_error = response.toString();
        }
      }, (err: any) => { this.loading1 = false; this.tab1_messages_error = err.toString(); console.log(err.error) });


    }
  }

  flushIhChtDataToDhis2(): void {
    if (this.isValidParams(this.ihChtToDhis2Form, 'cht')) {
      this.start_date_error = false;
      this.end_date_error = false;
      this.loading3 = true;
      this.tab3_messages = [];
      this.tab3_error_messages = '';
      this.tab3_no_data_found = false;
      this.Tab3Dhis2Import = { ErrorCount: 0, ErrorMsg: '', Created: 0, Updated: 0, Deleted: 0 };
      this.sync.ihChtDataPerChw(this.ParamsToFilter()).subscribe((_resp: { status: number, data: { chw: Chws, data: DataIndicators }[] | any }) => {
        // this.loading3 = false;
        if (_resp.status == 200) {
          var respData = _resp.data as { chw: Chws, data: DataIndicators }[];
          try {
            if (this.ihChtToDhis2Form.value.InsertIntoDhis2 == true && respData.length > 0) {
              var s1 = 0;
              var s2 = 0;
              for (let i = 0; i < respData.length; i++) {
                s1++;
                this.sync.insertOrUpdateDhis2Data(respData[i].data).subscribe((_dhisResp: { status: number, data: any, chw: string }) => {
                  s2++;
                  if (_dhisResp.status == 200) {
                    if (_dhisResp.data == 'Created') this.Tab3Dhis2Import.Created! += 1;
                    if (_dhisResp.data == 'Updated') this.Tab3Dhis2Import.Updated! += 1;
                    if (_dhisResp.data == 'Deleted') this.Tab3Dhis2Import.Deleted! += 1;
                  } else {
                    if (_dhisResp.data == 'ErrorCount') this.Tab3Dhis2Import.ErrorCount! += 1;
                    if (_dhisResp.data == 'ErrorMsg') this.Tab3Dhis2Import.ErrorMsg! += '\n\n' + _dhisResp.data;
                  }

                  if (s1 == s2) {
                    this.loading3 = false;
                    this.tab3_messages = respData;
                    this.tab3_no_data_found = respData.length <= 0;
                  }
                }, (err: any) => { this.loading3 = false; this.tab3_error_messages = err.toString(); console.log(err.error) });
              }
            } else {
              this.loading3 = false;
              this.tab3_messages = respData;
              this.tab3_no_data_found = respData.length <= 0;
            }
          } catch (error) {
            this.loading3 = false;
            this.tab3_no_data_found = true;
            this.tab3_error_messages = _resp.data.toString();
          }

        } else {
          this.loading3 = false;
          this.tab3_no_data_found = true;
          this.tab3_error_messages = _resp.data.toString();
        }
      }, (err: any) => {
        this.tab3_no_data_found = false; this.loading3 = false; this.tab3_error_messages = err.toString()
      });
    }
  }

  capitaliseData(str: any, inputSeparator: string = ' ', outPutSeparator: string = ' '): string {
    return capitaliseDataGiven(str, inputSeparator, outPutSeparator)
  }

  getItemAsArray(data: KeyValue<unknown, unknown>): string[] {
    return data.value as string[];
  }

}
