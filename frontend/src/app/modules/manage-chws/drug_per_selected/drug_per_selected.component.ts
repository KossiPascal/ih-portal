import { Component, OnInit } from '@angular/core';
import { Chws, Districts, FilterParamsWithYearMonth, Sites } from '@ih-app/models/Sync';
import { SyncService } from '@ih-app/services/sync.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { currentMonth, currentYear, getYearsList, months, notNull, returnDataAsArray } from '@ih-app/shared/functions';
import { AuthService } from '@ih-app/services/auth.service';
import { Roles } from '@ih-app/models/Roles';
import { ChwsDrugData, ChwsDrugQuantityInfo, ChwsUpdateDrugInfo, PatologieData } from '@ih-src/app/models/DataAggragate';
import { startEnd21and20Date } from '@ih-src/app/shared/dates-utils';
import { User } from '@ih-src/app/models/User';
import { Router } from '@angular/router';
import { KeyValue } from '@angular/common';
declare var sortTable: any;
declare var $: any;
declare var table2pdf: any;
declare var table2csv: any;
declare var table2json: any;
declare var table2excel: any;
declare var printTable: any;

@Component({
  selector: 'app-drug-per-chw',
  templateUrl: `./drug_per_selected.component.html`,
  styleUrls: [
    './drug_per_selected.component.css'
  ]
})
export class DrugPerSelectedManageComponent implements OnInit {

  constructor(private auth: AuthService, private sync: SyncService, private router: Router) { }

  public roles = new Roles(this.auth);

  currentUser: User | null | undefined;
  chwsDrugDataForm!: FormGroup;
  initDate!: { start_date: string, end_date: string };
  defaultParams?: FilterParamsWithYearMonth
  chwOU: Chws | null | undefined;

  data_error_messages: string = '';
  data_no_data_found: boolean = false;

  OutputData$!: { cibleId: any, cible: any, drugData: ChwsDrugData, patologieData: PatologieData };
  ChwsDataFromDbError: string = '';

  dataDetail: string = '';

  createDataFilterFormGroup(): FormGroup {
    return new FormGroup({
      // start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
      // end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
      month: new FormControl(this.month$.id, [Validators.required]),
      year: new FormControl(this.year$, [Validators.required]),
      sources: new FormControl(""),
      districts: new FormControl("", !this.roles.isChws() ? [Validators.required] : []),
      sites: new FormControl(""),
      chws: new FormControl(""),
      cmm_start_year_month: new FormControl(this.yearCmmMonthStartList$?.[0]?.id, [Validators.required]),
      cmm_mutipliation: new FormControl(1, [Validators.required]),
    });
  }
  initMsg!: string;
  isLoading!: boolean;

  Districts$: Districts[] = [];
  Sites$: Sites[] = [];
  Chws$: Chws[] = [];

  Months$: { labelEN: string; labelFR: string; id: string; uid: number }[] = [];
  Years$: number[] = [];

  chw$: Chws[] = [];
  site$: Sites[] = [];

  IsOkToUpdate: boolean = false;

  month$!: { labelEN: string; labelFR: string; id: string; uid: number };
  year$!: number;

  response$!: { status: number, data: { chwId: any, chw: Chws, drugData: ChwsDrugData, patologieData: PatologieData } | any }

  drugUpdateResponse$!: { status: number, data: ChwsUpdateDrugInfo }
  drugUpdateErrorMsg: string = '';

  isUpdateLoading: boolean = false;

  editCmm: string = '';
  editQtyValidated: string = '';
  editQtyDelivered: string = '';
  editObservations: string = '';

  yearCmmMonthStartList$!: { id: string, name: string }[];

  editCmmClick(cancel: boolean = false) {
    this.editCmm = cancel == true ? this.editCmm = '' : this.editCmm == 'edit' ? '' : 'edit';
  }

  editQtyValidatedClick(cancel: boolean = false) {
    this.editQtyValidated = cancel == true ? this.editQtyValidated = '' : this.editQtyValidated == 'edit' ? '' : 'edit';
  }

  editQtyDeliveredClick(cancel: boolean = false) {
    this.editQtyDelivered = cancel == true ? this.editQtyDelivered = '' : this.editQtyDelivered == 'edit' ? '' : 'edit';
  }

  editObservationsClick(cancel: boolean = false) {
    this.editObservations = cancel == true ? this.editObservations = '' : this.editObservations == 'edit' ? '' : 'edit';
  }
  GenerateHearder(data: { cibleId: any; cible: any; drugData: ChwsDrugData, patologieData: PatologieData }) {
    const c = data.cible;
    try {
      return `${c.site.district.name} > ${c.site.name} > <strong>${c.name}</strong> (${c.external_id}) `;
    } catch (error) {
      try {
        return `${c.district.name} > <strong>${c.name}</strong> (${c.external_id}) `;
      } catch (error) {
        try {
          return `<strong>${c.name}</strong> (${c.id}) `;
        } catch (error) { }
      }
    }
    return ``;
  }

  yearCmmMonthStart(): void {
    const y = parseInt(this.getValue(`action_year`)?.value ?? this.year$);
    const m = this.getValue(`action_month`)?.value ?? this.month$.id;
    const nY = y + 1;
    const lY = y - 1;
    const dataList = [];

    const isThisYearJanuaryToJune = m >= '01' && m <= '06';
    const isThisYearJulyToDecember = m >= '07' && m <= '12';

    if (isThisYearJanuaryToJune) {
      dataList.push({ id: `juillet_${lY}_juin_${y}`, name: `Jul. ${lY.toString().slice(-2)} - Jui. ${y.toString().slice(-2)}` });
    } else if (isThisYearJulyToDecember) {
      dataList.push({ id: `juillet_${y}_juin_${nY}`, name: `Jul. ${y.toString().slice(-2)} - Jui. ${nY.toString().slice(-2)}` });
    }
    dataList.push({ id: `janvier_decembre_${y}`, name: `Jan. - Déc. ${y.toString().slice(-2)}` });

    this.yearCmmMonthStartList$ = dataList;
  }


  IsOkToUpdateFields(): void {
    const year = this.chwsDrugDataForm.value.year;
    const month = this.chwsDrugDataForm.value.month;
    const district = this.chwsDrugDataForm.value.districts;
    const site = this.chwsDrugDataForm.value.sites;
    const chw = this.chwsDrugDataForm.value.chws;

    this.IsOkToUpdate = (district ?? '') != '' && (site ?? '') != '' && (chw ?? '') != '' && (year ?? '') != '' && (month ?? '') != '';
  }

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser();
    this.chwOU = this.auth.ChwLogged();
    if (this.roles.isChws() && (this.chwOU == null || !notNull(this.chwOU))) {
      // location.href = 'chws/select_orgunit';
      this.router.navigate(['chws/select_orgunit']);
    }

    this.isLoading = false;
    this.initDate = startEnd21and20Date();

    this.Months$ = months();
    this.Years$ = getYearsList();

    this.year$ = currentYear(this.initDate.end_date);
    this.month$ = currentMonth(this.initDate.end_date);

    this.yearCmmMonthStart();

    this.chwsDrugDataForm = this.createDataFilterFormGroup();
    if (!this.roles.isChws())
      this.initAllData();
    else
      this.initDataFilted();
  }

  saveOrUpdate(event: Event) {
    event.preventDefault();
    this.isUpdateLoading = true;
    if (this.OutputData$) {
      const year = this.chwsDrugDataForm.value.year;
      const month = this.chwsDrugDataForm.value.month;
      const district = this.chwsDrugDataForm.value.districts;
      const site = this.chwsDrugDataForm.value.sites;
      const chw = this.chwsDrugDataForm.value.chws;
      const cmm_start_year_month = this.chwsDrugDataForm.value.cmm_start_year_month;
      const cmm_mutipliation = this.chwsDrugDataForm.value.cmm_mutipliation;

      if ((district ?? '') != '' && (site ?? '') != '' && (chw ?? '') != '' && (year ?? '') != '' && (month ?? '') != '') {
        const dt = this.OutputData$;
        var order = 0;

        const objectKeysLen = this.objectKeys(dt.drugData).length;
        for (let k = 0; k < objectKeysLen; k++) {
          const key = this.getKey(this.toChwsDrugData(this.sortedArray(dt.drugData), k).key);
          const drug_name = this.getLabel(this.toChwsDrugData(this.sortedArray(dt.drugData), k).key);

          const yc = this.getValue(`year_chw_cmm_${key}`);
          const qv = this.getValue(`quantity_validated_${key}`);
          const dq = this.getValue(`delivered_quantity_${key}`);
          const os = this.getValue(`observations_${key}`);

          if (yc?.index == key || qv?.index == key || dq?.index == key || os?.index == key) {

            const dataUpdated: ChwsUpdateDrugInfo = {
              year: year,
              month: month,
              district: district,
              site: site,
              chw: chw,
              drug_index: key,
              drug_name: drug_name,
              year_chw_cmm: yc?.value,
              quantity_validated: qv?.value,
              delivered_quantity: dq?.value,
              observations: os?.value,
              cmm_start_year_month: cmm_start_year_month,
              cmm_mutipliation: cmm_mutipliation,
            };

            this.sync.ihDrugUpdateYearCmmPerChw(dataUpdated).subscribe((_res: { status: number, data: string }) => {
              if (_res.status == 200) {
                this.sync.ihDrugUpdateDataPerChw(dataUpdated).subscribe((_res$: { status: number, data: { chwId: string, chw: Chws, drugData: ChwsDrugData, patologieData: PatologieData } }) => {
                  order += 1;
                  if (_res$.status == 200) {
                    if (order == objectKeysLen - 1 && _res$.data) {
                      if (this.OutputData$.cibleId == chw) {
                        const dataFound = _res$.data;
                        this.OutputData$ = {
                          cibleId: dataFound.chwId,
                          cible: dataFound.chw,
                          drugData: dataFound.drugData,
                          patologieData: dataFound.patologieData
                        };
                      }
                      this.editCmmClick(true);
                      this.editQtyValidatedClick(true);
                      this.editQtyDeliveredClick(true);
                      this.editObservationsClick(true);
                    }
                  } else {
                    this.drugUpdateErrorMsg += _res$.data.toString();
                  }
                  if (order == objectKeysLen - 1) {
                    this.isUpdateLoading = false;
                  }
                }, (err: any) => {
                  this.drugUpdateErrorMsg += err.toString();
                  this.isUpdateLoading = false;
                });
              } else {
                this.drugUpdateErrorMsg += _res.data;
                this.isUpdateLoading = false;
              }
            });
          }
        }
      } else {
        this.isUpdateLoading = false;
      }
    } else {
      this.isUpdateLoading = false;
    }
  }

  getValue(id: string): { value: any, index: number | undefined } | undefined {
    const elem = (document.getElementById(id) as HTMLInputElement);
    if (elem != null) {
      const idx = elem.dataset['drugIndex'];
      return { value: elem.value, index: idx ? parseInt(idx) : undefined };
    }
    return undefined;
  }

  showHideMsg(elem1?: string): void {
    this.dataDetail = (elem1 ?? '');
  }

  cancelArobase(data:any){
    return `${data}`.split('@@@').join(' | ');
  }

  rewriteName(data:any){
    return `${data}`.split('_').join(' ');
  }

  totalPatologie(data: KeyValue<string,number>[]) {
    var total = 0;
    for (let i = 0; i < data.length; i++) {
      const kv = data[i];
      total+=kv.value;
    }
    return total;
  }

  BorrowingLendingShowHideMsg(drug_name: string, borrowing?: string, lending?: string): void {
    var borrowingItem = `<strong style="font-size:18px; color:blue;">${drug_name}</strong><br><br>`;
    var lendingItem = '';
    const classs = 'class="table table-sm" style="margin: auto;"';
    const style = 'style="border: 1px dashed rgb(177, 177, 177);"';
    const headStyle = 'style="border: 1px dashed rgb(177, 177, 177);background: rgb(0, 0, 67); color: white;"';

    if ((borrowing ?? '') != '') {
      borrowingItem += `<strong style="color:green;">Emprunts de médicaments</strong><br>`;
      borrowingItem += `<table ${classs}> <tr> <th ${headStyle}>Date</th> <th ${headStyle}>Quantité</th> <th ${headStyle}>ASC</th> </tr>`;
      const borrowingArray = borrowing?.split('|||') ?? [];
      for (let i = 0; i < borrowingArray.length; i++) {
        const brw = borrowingArray[i].split('@@@');
        borrowingItem += `<tr><td ${style}>${brw[2]}</td><td ${style}>${brw[1]}</td><td ${style}>${brw[0]}</td></tr>`;
      }
      borrowingItem += `</table>`;
      borrowingItem += `<br><br>`;
    }

    if ((lending ?? '') != '') {
      borrowingItem += `<strong style="color:green;">Prêts de médicaments</strong><br>`;
      lendingItem += `<table ${classs}> <tr style="background-color:blue!important;"><th ${headStyle}>Date</th><th ${headStyle}>Quantité</th><th ${headStyle}>ASC</th></tr>`;
      const lendingArray = lending?.split('|||') ?? [];
      for (let i = 0; i < lendingArray.length; i++) {
        const ldg = lendingArray[i].split('@@@');
        lendingItem += `<tr><td ${style}>${ldg[2]}</td><td ${style}>${ldg[1]}</td><td ${style}>${ldg[0]}</td></tr>`;
      }
      lendingItem += `</table>`;
      lendingItem += `<br>`;
    }

    this.dataDetail = `${borrowingItem}${lendingItem}`;
  }

  convertQty(v: any) {
    return v == 0 || v == '' || v == null || v == '0' || v == undefined ? undefined : v;
  }

  EcartColor(data: ChwsDrugQuantityInfo): { value: string, ecart: string, color: string } {
    const inventory = this.convertQty(data.inventory_quantity) ?? 0;
    const theoretical = this.convertQty(data.theoretical_quantity) ?? 0;
    if (inventory != 0 && theoretical != 0) {
      const diff = inventory - theoretical;
      const ec = (diff / theoretical) * 100;
      const ecart = ec < 0 ? -1 * ec : ec; // const ecart = Math.round((ec < 0 ? -1 * ec : ec) * 10) / 10;
      const sEcart = ecart > 100 ? '> 100%' : `${ecart.toFixed(0)}%`
      return { value: `${diff}`, ecart: sEcart, color: ecart > 5 ? 'red' : 'green' };
    }
    return { value: '', ecart: '', color: '' };
  }

  toChwsDrugData(obj: any, index: any): { key: string, val: ChwsDrugQuantityInfo } {
    const val = obj[parseInt(index)];
    return { key: val[0], val: val[1] as ChwsDrugQuantityInfo };
  }

  sortedArray(obj: ChwsDrugData) {
    return (Object.entries(obj)).sort((a, b) => {
      const aL = a[0].split('_');
      const bL = b[0].split('_');
      const aI = parseInt(aL[aL.length - 1]);
      const bI = parseInt(bL[bL.length - 1]);
      return aI - bI;
    });
  }

  objectKeys(obj: ChwsDrugData) {
    return Object.keys(this.sortedArray(obj));
  }

  patologiesObjectKeys(obj: PatologieData) {
    return Object.keys(obj);
  }

  getKey(name: string): number {
    const nL = name.split('_');
    return parseInt(nL[nL.length - 1]);
  }

  getLabel(name: string): string {
    const nL = name.split('_');
    return nL.slice(0, -1).join(' ');
  }

  csv(id: string) {
    table2csv('data2csv', ',', id);
  }

  excel(id: string) {
    table2excel('data2excel', id);
  }

  pdf(id: string) {
    table2pdf('data2pdf', 'l', id);
  }

  json(id: string) {
    table2json('data2json', id)
  }

  print(id: string) {
    printTable('data2print', id);
  }

  async initAllData() {
    this.isLoading = true;
    const filter: FilterParamsWithYearMonth = this.ParamsToFilter();
    this.initMsg = 'Chargement des Districts ...';
    this.sync.getDistrictsList(filter).subscribe(async (_d$: { status: number, data: Districts[] }) => {
      if (_d$.status == 200) {
        this.Districts$ = _d$.data.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
      }
      this.initMsg = 'Chargement des Sites ...';
      this.sync.getSitesList(filter).subscribe(async (_s$: { status: number, data: Sites[] }) => {
        if (_s$.status == 200) {
          this.Sites$ = _s$.data.sort((a, b) => {
            return a.name.localeCompare(b.name);
          });
        }
        this.genarateSites();
        this.initMsg = 'Chargement des ASC ...';
        this.sync.getChwsList(filter).subscribe(async (_c$: { status: number, data: Chws[] }) => {
          if (_c$.status == 200) {
            this.Chws$ = _c$.data.sort((a, b) => {
              return a.name.localeCompare(b.name);
            });
          }
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

  genarateSites() {
    this.site$ = [];
    this.chw$ = [];
    const dist: string[] = returnDataAsArray(this.chwsDrugDataForm.value.districts);
    this.chwsDrugDataForm.value.sites = [];
    this.chwsDrugDataForm.value.chws = [];

    if (notNull(dist)) {
      for (let d = 0; d < this.Sites$.length; d++) {
        const site = this.Sites$[d];
        if (notNull(site)) if (dist.includes(site.district.id)) this.site$.push(site)
      }
    } else {
      this.site$ = [];
    }
  }

  genarateChws() {
    const sites: string[] = returnDataAsArray(this.chwsDrugDataForm.value.sites);
    this.chw$ = [];
    this.chwsDrugDataForm.value.chws = [];
    if (notNull(sites)) {
      for (let d = 0; d < this.Chws$.length; d++) {
        const chws = this.Chws$[d];
        if (notNull(chws)) if (sites.includes(chws.site.id)) this.chw$.push(chws)
      }
    } else {
      this.chw$ = [];
    }

  }

  ParamsToFilter(): FilterParamsWithYearMonth {
    const _moth: string = this.chwsDrugDataForm.value.month;
    const _year: string = this.chwsDrugDataForm.value.year;
    const cmm_start_year_month = this.chwsDrugDataForm.value.cmm_start_year_month;
    const cmm_mutipliation = this.chwsDrugDataForm.value.cmm_mutipliation;

    var districts: string[] = [];
    var sites: string[] = [];
    var chws: string[] = [];

    if (!this.roles.isChws()) {
      districts = returnDataAsArray(this.chwsDrugDataForm.value.districts);
      sites = returnDataAsArray(this.chwsDrugDataForm.value.sites);
      chws = returnDataAsArray(this.chwsDrugDataForm.value.chws);
    } else {
      if (this.chwOU != null && notNull(this.chwOU)) {
        districts = returnDataAsArray(this.chwOU.site.district.id);
        sites = returnDataAsArray(this.chwOU.site.id);
        chws = returnDataAsArray(this.chwOU.id);
        this.chw$ = [this.chwOU];
      }
    }
    // const prevM = previousMonth(_moth);
    // const prevY = prevM == '12' ? parseInt(_year) - 1 : _year;

    const params: FilterParamsWithYearMonth = {
      year: parseInt(_year),
      month: _moth,
      districts: districts,
      sites: sites,
      chws: chws,
      cmm_start_year_month: cmm_start_year_month,
      cmm_mutipliation: cmm_mutipliation,
    }
    return params;
  }

  sort(id: string) {
    return sortTable(id);
  }

  isNumber = (data: any): boolean => !isNaN(data);

  showClass = (data: any) => this.isNumber(data) ? 'col-sm-6 col-6' : '';

  initDataFilted(params?: FilterParamsWithYearMonth): void {
    this.isLoading = true;

    const filters: FilterParamsWithYearMonth = params ?? this.ParamsToFilter();

    if (
      this.defaultParams?.year != filters.year ||
      this.defaultParams?.month != filters.month ||
      this.defaultParams?.districts != filters.districts ||
      this.defaultParams?.sites != filters.sites ||
      this.defaultParams?.chws != filters.chws
    ) {
      this.sync.ihDrugDataPerSelected(filters).subscribe((_res$: { status: number, data: { cibleId: any, cible: any, drugData: ChwsDrugData, patologieData: PatologieData } | any }) => {
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

  startTraitement(params?: FilterParamsWithYearMonth) {
    this.isLoading = true;

    this.IsOkToUpdateFields();

    const filters: FilterParamsWithYearMonth = params ?? this.ParamsToFilter();
    if (this.response$.status == 200) {
      const fOutData$ = this.response$.data as { cibleId: any, cible: any, drugData: ChwsDrugData, patologieData: PatologieData };
      this.OutputData$ = fOutData$;
      // this.OutputData$ = fOutData$.sort((a, b) => {
      //   return a.chw.external_id.localeCompare(b.chw.external_id);
      // });
      this.defaultParams = filters;
      this.data_no_data_found = (this.OutputData$ ?? null) == null;
    } else {
      this.data_error_messages = this.response$.data.toString();
      this.data_no_data_found = true;
    }
    this.isLoading = false;

  }
}
