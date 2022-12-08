import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataFromPython, Dhis2Sync, OrgUnitImport, Sites } from '@ih-app/models/Sync';
import { AuthService } from '@ih-app/services/auth.service';
import { SyncService } from '@ih-app/services/sync.service';
import * as moment from 'moment';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { KeyValue } from '@angular/common';
import { DateUtils, Functions } from '@ih-app/shared/functions';
import { ActivatedRoute } from '@angular/router'

declare var $: any;
declare var initDataTable: any;


@Component({
  selector: 'app-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SyncComponent implements OnInit {

  thinkmdToDhis2Form!: FormGroup;
  medicToDhis2Form!: FormGroup;
  medicThinkMdWeeklyForm!: FormGroup;
  tab1_messages: DataFromPython | null = null;
  tab2_messages: DataFromPython | null = null;
  tab3_messages: DataFromPython | null = null;
  dates: moment.Moment[] = [];
  weekly_Choosen_Dates: string[] = [];
  is_weekly_date_error: boolean = false;
  weekly_date_error_Msg:string = '';

  activePage:any = '';

  loading1!: boolean;
  loading2!: boolean;
  loading3!: boolean;

  start_date_error: boolean = false;
  end_date_error: boolean = false;


  LoadingMsg: string = "Loading..."

  medicUrl$: any = {
    "hth-togo.app.medicmobile.org": 443,
    "portal-integratehealth.org": 444
  }

  dhisUrl$: any = {
    "dhis2.integratehealth.org/dhis": 443
  }

  sitesList: Sites[] = [];

  constructor(private route:ActivatedRoute, private syncService: SyncService, private http: HttpClient, private authService: AuthService) { }

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      this.activePage = params['cible'];
    });
    

    this.syncService.getSitesList().subscribe((sitesList: any) => {
      this.sitesList = sitesList;
    }, (err: any) => console.log(err.error));

    this.loading1 = false;
    this.loading2 = false;
    this.loading3 = false;
    
    this.thinkmdToDhis2Form = this.createThinkmdFormGroup();
    this.medicToDhis2Form = this.createMedicFormGroup();
    this.medicThinkMdWeeklyForm = this.createMedicThinkmdFormGroup();

  }

  createFormGroup(cible: string): FormGroup {
    return new FormGroup({
      start_date: new FormControl("", cible === 'medic' || cible === 'allChwsData' || cible === 'medic_thinkMd' ? [Validators.required, Validators.minLength(7)] : []),
      end_date: new FormControl("", cible === 'medic' || cible === 'thinkMd' || cible === 'allChwsData' ? [Validators.required, Validators.minLength(7)] : []),

      weekly_Choosen_Dates: new FormControl(""),

      thinkmd_host: new FormControl("10az.online.tableau.com", cible === 'thinkMd' || cible === 'medic_thinkMd' ? [Validators.required] : []),
      thinkmd_site: new FormControl("datasincbeta", cible === 'thinkMd' || cible === 'medic_thinkMd' ? [Validators.required] : []),
      useToken: new FormControl(false),
      thinkmd_token_username: new FormControl(""),
      thinkmd_token: new FormControl(""),
      thinkmd_username: new FormControl("seaq@santeintegree.org"),
      thinkmd_password: new FormControl(""),

      medic_host: new FormControl("", cible === 'medic' || cible === 'allChwsData' || cible === 'allOrgUnit' || cible === 'medic_thinkMd' ? [Validators.required, Validators.minLength(3)] : []),
      medic_username: new FormControl("admin", cible === 'medic' || cible === 'allChwsData' || cible === 'allOrgUnit' || cible === 'medic_thinkMd' ? [Validators.required] : []),
      medic_password: new FormControl(""),
      medic_database: new FormControl("medic", cible === 'medic' || cible === 'medic_thinkMd' ? [Validators.required] : []),

      InsertIntoDhis2: new FormControl(false, []),
      dhis2_host: new FormControl("dhis2.integratehealth.org/dhis"),
      dhis2_username: new FormControl("admin"),
      dhis2_password: new FormControl(""),
      ssl_verification: new FormControl(false, cible === 'allChwsData' || cible === 'allOrgUnit' ? [Validators.required] : []),
    });
  }

  createChwsDataFormGroup(): FormGroup {
    return this.createFormGroup('allChwsData');
  }

  createDhis2ChwsDataFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl("", [Validators.required, Validators.minLength(7)]),
      end_date: new FormControl("", [Validators.required, Validators.minLength(7)]),
      sites: new FormControl(""),
    });
  }

  createOrgUnitAndPersonFormGroup(): FormGroup {
    return this.createFormGroup('allOrgUnit');
  }

  createThinkmdFormGroup(): FormGroup {
    return this.createFormGroup('thinkMd');
  }

  createMedicFormGroup(): FormGroup {
    return this.createFormGroup('medic');
  }

  createMedicThinkmdFormGroup(): FormGroup {
    return this.createFormGroup('medic_thinkMd');
  }


  isValidParams(fForm: FormGroup, type: string): boolean {
    if (fForm != undefined) {
      const parent: any = fForm.value;
      if (parent != undefined) {
        const s_date: string = parent['start_date'];
        const e_date: string = parent['end_date'];
        const isStart: boolean = DateUtils.isDayInDate(s_date, 21)
        const isEnd: boolean = DateUtils.isDayInDate(e_date, 20);
        const dateDiff: number = DateUtils.daysDiff(s_date, e_date);
        if (parent['InsertIntoDhis2'] == true && type == 'medic') {
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

  cleanWeeklyDateError(): void {
    this.is_weekly_date_error = false;
    this.weekly_date_error_Msg = '';
  }

  WeeklyDateIsValid(): boolean {
    var t:number = 0;
    for (let i = 0; i < this.weekly_Choosen_Dates.length; i++) {
      const dt = this.weekly_Choosen_Dates[i];
      if(!DateUtils.getMondays(dt).includes(dt)) t++;
    }
    return t == 0;
  }

  genarateColor(data:any):string {
    if (Functions.isNumber(data)) {
      const d = parseInt(data);
      if (d <= 5) return 'danger'
      if (d > 5 && d <= 30) return 'warning'
      if (d > 30 && d < 40) return 'infos'
      return 'good';
    }
    return '';
  }
 
  removeWeekDate(date:string):void {
    const index = this.weekly_Choosen_Dates.indexOf(date);
    this.weekly_Choosen_Dates.splice(index, 1);
    // this.weekly_Choosen_Dates.r
  }

  runThinkmdToDhis2(): void {
    if (this.isValidParams(this.thinkmdToDhis2Form, 'thinkMd')) {
      this.start_date_error = false;
      this.loading1 = true;
      this.tab1_messages = null;
      this.syncService
        .thinkmdToDhis2Script(this.thinkmdToDhis2Form.value).subscribe((response: any) => {
          this.loading1 = false;
          this.tab1_messages = JSON.parse(response);
          // console.log(response);
        }, (err: any) => { this.loading1 = false; this.tab1_messages = err.message; console.log(err.error) });

    }
  }

  runMedicToDhis2(): void {
    if (this.isValidParams(this.medicToDhis2Form, 'medic')) {
      this.start_date_error = false;
      this.end_date_error = false;
      this.loading2 = true;
      this.tab2_messages = null;
      this.syncService
        .medicToDhis2Script(this.medicToDhis2Form.value).subscribe((response: any) => {
          this.loading2 = false;
          this.tab2_messages = JSON.parse(response);
          // console.log(response);
        }, (err: any) => { this.loading2 = false; this.tab2_messages = err.message; console.log(err.error) });
    }
  }

  runMedicThinkMdWeekly(): void {
    this.addToDateList();
    if (this.weekly_Choosen_Dates.length > 1 && this.WeeklyDateIsValid()) {
      this.is_weekly_date_error = false;
      this.weekly_date_error_Msg = '';
      this.loading3 = true;
      this.tab3_messages = null;
      this.syncService.syncWeeklyChwsData(this.medicThinkMdWeeklyForm.value).subscribe((response: any) => {
        this.loading3 = false;
        this.tab3_messages = JSON.parse(response);
        // console.log(response);
      }, (err: any) => { this.loading3 = false; this.tab3_messages = err.message; console.log(err.error) });
    } else {
      this.is_weekly_date_error = true;
      if (this.weekly_Choosen_Dates.length <= 1) {
        this.weekly_date_error_Msg = 'Vous devez choisir au moins 2 dates';
      } else if (!this.WeeklyDateIsValid()) {
        this.weekly_date_error_Msg = 'Toutes les dates doivent être un Lundi de la semaine';
      }
    }
  }



  remove(arr: any, what: any) {
    var found = arr.indexOf(what);
    while (found !== -1) {
      arr.splice(found, 1);
      found = arr.indexOf(what);
    }
    return arr;
  }

  getValue(obj: any, keys: any): any {
    return obj[keys.pop()]
  }

  addToDateList() {
    const start_date:string = this.medicThinkMdWeeklyForm.value.start_date;
    if (!this.weekly_Choosen_Dates.includes(start_date) && start_date != null && start_date != '') {
      this.weekly_Choosen_Dates.push(start_date);
    }
    this.medicThinkMdWeeklyForm.value.start_date = '';
    this.medicThinkMdWeeklyForm.value.end_date = '';
    this.medicThinkMdWeeklyForm.value.weekly_Choosen_Dates = this.weekly_Choosen_Dates;
    this.cleanWeeklyDateError();
  }

  renameKeyIfFoundInObject(obj: any, oldKey: string, newKey: string) {
    try {
      let allKeys = Object.keys(obj).includes(oldKey);
      if (allKeys) {
        obj[newKey] = obj[oldKey];
        delete obj[oldKey];
      }
    } catch (error) {

    }
    return obj;
  }

  getKeyPath(parent: string, attributename: string) {
    return parent != '' ? parent + "." + attributename : attributename;
  }

  listatts(parent: string, currentJson: any) {
    var attList: any[] = []
    currentJson = this.renameKeyIfFoundInObject(currentJson, 'length', '_length')
    if (typeof currentJson !== 'object' || currentJson == undefined || currentJson.length > 0) return;
    for (var attributename in currentJson) {
      const attrKey = this.getKeyPath(parent, attributename);
      if (Object.prototype.hasOwnProperty.call(currentJson, attributename)) {
        let childAtts = this.listatts(attrKey, currentJson[attributename])
        if (childAtts != undefined && childAtts.length > 0) {
          attList = [...attList, ...childAtts]
        } else {
          let keys = attrKey.split('.') as string[];
          let val = this.getValue(currentJson, keys);
          if (Array.isArray(val)) {
            var list: any[] = []
            val.forEach((element: any) => {
              if (typeof element == 'string') {
                list.push(`"${element}"`);
              } else {
                let childAtts2 = this.listatts(attrKey, element);
                if (childAtts2 != undefined && childAtts2.length > 0) {
                  attList = [...attList, ...childAtts2]
                }
              }
            });
            if (list.length > 0) attList.push(`"${attrKey}" : [${list}]`)
          } else attList.push(`"${attrKey}" : "${val}"`)
        }
      }
    }
    return attList
  }

  writeContents(content: any, fileName: string, contentType: string) {
    var a = document.createElement('a');
    var file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  isObject(obj: any): boolean {
    return obj !== undefined && obj !== null && obj.constructor == Object;
  }

  testJson() {
    let data = {
      'data': {
        "_id": "d1a1ab15-d49f-4dbd-902f-7a9439e39f9f",
        "_rev": "2-8db714ee4d3c9aba5dcb8015d62caa91",
        "form": "pcime_c_asc",
        "from": "00228 93 22 32 66",
        "type": "data_record",
        "fields": {
          "MAM": "false",
          "meta": {
            "instanceID": "uuid:0f9f00e8-ea59-4dce-91fe-53ad5ea9b681"
          },
          "inputs": {
            "meta": {
              "location": {
                "lat": "",
                "long": "",
                "error": "",
                "message": ""
              },
              "deprecatedID": ""
            },
            "source": "contact",
            "contact": {
              "_id": "412133d8-88fa-4fca-af79-c4ba264d9ebf",
              "sex": "male",
              "name": "Kezeri abourasakou",
              "date_of_birth": "2018-05-25"
            },
            "source_id": ""
          },
          "s_fever": {
            "n_congrats": "",
            "n_conduct_mrdt": "",
            "s_frequent_fever": "yes",
            "s_fever_warm_body": "yes",
            "s_fever_child_since": "3",
            "n_fever_evaluation_note": "",
            "s_fever_child_sleep_net": "yes",
            "s_fever_child_TDR_result": "positive"
          },
          "referral": "true",
          "has_fever": "true",
          "beyond_72h": "false",
          "high_fever": "false",
          "next_visit": "30856607",
          "patient_id": "412133d8-88fa-4fca-af79-c4ba264d9ebf",
          "s_constant": {
            "s_use_scale": "",
            "s_constant_child_weight": "15",
            "s_note_child_temparature": "",
            "s_constant_child_temperature": "39.4",
            "s_constant_child_brachial_perimeter": "172"
          },
          "s_diarrhea": {
            "s_diarrhea_child_has": "no",
            "n_diarrhea_evaluation_note": ""
          },
          "within_24h": "false",
          "within_48h": "true",
          "within_72h": "false",
          "group_review": {
            "fever": {
              "r_fever": "",
              "r_uncomplicated_give_advices": ""
            },
            "submit": "",
            "followup": "",
            "r_summary": "",
            "r_symptoms": "",
            "r_refer_USP": "",
            "r_patient_id": "",
            "r_danger_signs": "",
            "r_malaria_sign": "",
            "r_patient_info": "",
            "r_accompany_USP": "",
            "r_malaria_fever": "",
            "r_no_malnutrition": "",
            "r_diagnosis_treatment": "",
            "s_have_you_refer_child": "yes",
            "r_pre_tranfer_treatement": {
              "r_drink_water": "",
              "r_continue_suckle": "",
              "r_lumartemcoartem": "",
              "r_dose_paracetamol": "",
              "r_no_oral_ingestion": "",
              "r_refer_USP_immediatly": "",
              "r_pre_tranfer_treatement_1": ""
            },
            "r_refer_USP_danger_signs": "",
            "r_paludial_fever_treatment": {
              "r_paludial_paracetamol": "",
              "r_paludial_paracetamol_one": "",
              "r_paludial_fever_treatment_1": "",
              "r_paludial_fever_treatment_lumartem_coartem": "",
              "r_paludial_fever_treatment_lumartem_coartem_2": ""
            },
            "r_accompany_USP_danger_signs": "",
            "r_danger_signs_child_throwup": "",
            "r_danger_signs_urine_cocacola": "",
            "r_danger_signs_child_cannot_drink": "",
            "r_followup_next_visit_any_referral": ""
          },
          "has_diarrhea": "false",
          "patient_name": "Kezeri abourasakou",
          "s_cough_cold": {
            "s_cough_cold_has_cough_cold": "no",
            "n_cough_cold_evaluation_note": ""
          },
          "accompaniment": "true",
          "has_pneumonia": "false",
          "has_cough_cold": "false",
          "patient_sex_en": "Male",
          "patient_sex_fr": "Homme",
          "referral_fever": "true",
          "referral_mucus": "false",
          "s_danger_signs": {
            "has_danger_sign": "true",
            "s_danger_signs_note": {
              "s_danger_signs_note_child": "",
              "s_danger_signs_blood_stools": "no",
              "s_danger_signs_child_throwup": "yes",
              "s_danger_signs_urine_cocacola": "yes",
              "s_danger_signs_child_convulsion": "no",
              "s_danger_signs_child_often_sick": "no",
              "s_danger_signs_diarrhea_more_14": "no",
              "s_danger_signs_child_cannot_drink": "yes"
            },
            "has_accompaniment_ds": "true",
            "s_danger_signs_observe": {
              "n_danger_signs_exist": "",
              "s_danger_signs_child_anemia": "no",
              "s_danger_signs_child_slimming": "no",
              "s_danger_signs_child_convulsing": "no",
              "s_danger_signs_child_unconscious": "no",
              "s_danger_signs_child_difficulty_breathing": "no"
            },
            "s_danger_signs_child_research": {
              "s_danger_signs_edema": "no",
              "s_danger_signs_rashes": "no",
              "s_danger_signs_fontanelle": "no",
              "s_danger_signs_dehydration": "no",
              "n_danger_signs_child_present": "",
              "s_danger_signs_neck_stiffness": "no"
            },
            "s_danger_signs_continue_survey": "yes"
          },
          "MAS_complicated": "false",
          "assessment_time": {
            "s_assessment_time": "c_assessment_time_1"
          },
          "no_malnutrition": "true",
          "has_malnutrition": "false",
          "show_car_advices": "true",
          "MAS_uncomplicated": "false",
          "beginning_illness": {
            "s_begining_illness": "morning_day_before_yesterday"
          },
          "non_malaria_fever": "false",
          "referral_diarrhea": "false",
          "s_vaccinal_status": {
            "s_one_day": {
              "s_vaccinal_status_BCG": "yes",
              "s_vaccinal_status_VPO_0": "yes"
            },
            "s_six_weeks": {
              "s_vaccinal_status_VPO_1": "yes",
              "s_vaccinal_status_DTC_B1": "yes",
              "s_vaccinal_status_rota_1": "yes",
              "s_vaccinal_status_pneumo_1": "yes"
            },
            "s_ten_weeks": {
              "s_vaccinal_status_VPO_2": "yes",
              "s_vaccinal_status_DTC_B2": "yes",
              "s_vaccinal_status_rota_2": "yes",
              "s_vaccinal_status_pneumo_2": "yes"
            },
            "s_nine_months": {
              "s_vaccinal_status_VAA": "yes",
              "s_vaccinal_status_VAR": "yes",
              "s_vaccinal_status_vit_A": "yes"
            },
            "s_forteen_weeks": {
              "s_vaccinal_status_VPO_3": "yes",
              "s_vaccinal_status_DTC_B3": "yes",
              "s_vaccinal_status_rota_3": "yes",
              "s_vaccinal_status_pneumo_3": "yes"
            },
            "s_health_issues": {
              "s_other_health_issues": "no"
            }
          },
          "fever_with_malaria": "true",
          "has_simple_malaria": "true",
          "fever_with_diarrhea": "false",
          "patient_age_display": "4 years and 1 month old",
          "patient_age_in_days": "1507",
          "referral_cough_cold": "false",
          "s_drug_administered": {
            "s_para": "paracetamol_500",
            "other_drug": "",
            "s_lumartem": "yes",
            "n_drug_administered_tablet_type": ""
          },
          "s_nutritional_state": {
            "n_nutritional_state_branchial_perimeter": ""
          },
          "patient_age_in_years": "4",
          "diarrhea_with_malaria": "false",
          "patient_age_in_months": "49",
          "referral_danger_signs": "true",
          "patient_age_display_fr": "4 ans et 1 mois",
          "referral_missed_vaccine": "false",
          "referral_MAS_complicated": "false",
          "show_nutritional_advices": "true"
        },
        "contact": {
          "_id": "4e6fb542-a057-489d-86da-b19f062e0da3",
          "parent": {
            "_id": "60867fb9-1202-4c43-9a44-a314ac1009a1",
            "parent": {
              "_id": "5827654a-1c65-4aa3-a917-c83f294d965e"
            }
          }
        },
        "sent_by": "Skon Toba",
        "geolocation": {
          "speed": 0.7175227999687195,
          "heading": 167,
          "accuracy": 6.699999809265137,
          "altitude": 232.07999959647987,
          "latitude": 9.6057433,
          "longitude": 1.0205783,
          "altitudeAccuracy": null
        },
        "_attachments": {
          "content": {
            "stub": true,
            "digest": "md5-q/AHW2DGudmdiQlHXlPdSw==",
            "length": 10945,
            "revpos": 1,
            "content_type": "application/xml"
          }
        },
        "content_type": "xml",
        "hidden_fields": [
          "meta", "nano", "mobo", {
            "toto": {
              "tttttttttttt": "ttttttttttttt"
            }
          }
        ],
        "reported_date": 1657434950915,
        "geolocation_log": [
          {
            "recording": {
              "speed": 0.7175227999687195,
              "heading": 167,
              "accuracy": 6.699999809265137,
              "altitude": 232.07999959647987,
              "latitude": 9.6057433,
              "longitude": 1.0205783,
              "altitudeAccuracy": null
            },
            "timestamp": 1657434953883
          }
        ]
      }
    };


    var match = ["contact", "fields", "geolocation", "_attachments", "hidden_fields", "geolocation_log"];

    const res = this.listatts('', data.data);


    for (const [key, value] of Object.entries(JSON.parse(`{${res}}`))) {
      console.log(`${key}: ${value}`);
    }

    // 

    // this.writeContents(this.fileContent, 'result.json', 'text/plain');
    this.writeContents(`[{${res}}]`, './result.json', 'json');


    // fs.readFile(__dirname + './result.json', 'utf8', function readFileCallback(err: any, data: any) {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     // let obj = JSON.parse(data); //now it an object
    //     // obj.table.push({id: 2, square:3}); //add some data
    //     // let json = JSON.stringify(obj); //convert it back to json
    //     // fs.writeFile('myjsonfile.json', json, 'utf8', callback); // write it back 
    //   }
    // });


  }

  genarateDataAsTable(jsonData: any): string {
    if (jsonData != undefined && jsonData != null) {
      let keys = Object.keys(jsonData);
      let values = Object.values(jsonData);

      console.log(jsonData);
      // keys.forEach(())
      // keys.forEach(k => {
      //   console.log(k);

      // });
    }
    return ``;
  }

  capitaliseData(str: any, inputSeparator: string = ' ', outPutSeparator: string = ' '): string {
    return Functions.capitaliseDataGiven(str, inputSeparator, outPutSeparator)
  }


  getItemAsArray(data: KeyValue<unknown, unknown>): string[] {
    return data.value as string[];
  }

  initTable(tableId: string) {
    initDataTable(tableId);
  }


  isSelected: MatCalendarCellClassFunction<any> = (date: moment.Moment) => {
    return (this.dates.find(x => x.isSame(date))) ? "selected" : 'notSelected';
  };

  select(date: moment.Moment, calendar: any) {
    const index = this.dates.findIndex(x => x.isSame(date));
    if (index < 0) this.dates.push(date);
    else this.dates.splice(index, 1);

    calendar.updateTodaysDate();
  }

}
