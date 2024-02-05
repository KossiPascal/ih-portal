import { Component, OnInit } from '@angular/core';
import { Chws, Districts, FilterParams, Sites } from '@ih-app/models/Sync';
import { SyncService } from '@ih-app/services/sync.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { currentMonth, currentYear, getYearsList, months, notNull, previousMonth, returnDataAsArray, returnEmptyArrayIfNul } from '@ih-app/shared/functions';
import { AuthService } from '@ih-app/services/auth.service';
import { Roles } from '@ih-app/models/Roles';
import { ChwsDrugData, ChwsDrugQantityInfo, ChwsUpdateDrugInfo } from '@ih-src/app/models/DataAggragate';
import { startEnd21and20Date } from '@ih-src/app/shared/dates-utils';
import { User } from '@ih-src/app/models/User';
import { Router } from '@angular/router';
declare var sortTable: any;
declare var $: any;
declare var table2pdf: any;
declare var table2csv: any;
declare var table2json: any;
declare var table2excel: any;
declare var printTable: any;

@Component({
  selector: 'app-chws-drug',
  templateUrl: `./chws_drug.component.html`,
  styleUrls: [
    './chws_drug.component.css'
  ]
})
export class ChwsDrugManageComponent implements OnInit {

  constructor(private auth: AuthService, private sync: SyncService, private router: Router) {
  }

  public roles = new Roles(this.auth);

  currentUser:User | null | undefined;
  chwsDrugDataForm!: FormGroup;
  initDate!: { start_date: string, end_date: string };
  defaultParams?: FilterParams
  chwOU: Chws | null | undefined;

  data_error_messages: string = '';
  data_no_data_found: boolean = false;

  FinalChwsOutputData$: { chwId: any, chw: Chws, data: ChwsDrugData }[] = [];
  selectedChwData: { chwId: any, chw: Chws, data: ChwsDrugData } | any = null;
  ChwsDataFromDbError: string = '';

  createDataFilterFormGroup(): FormGroup {
    return new FormGroup({
      // start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
      // end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
      month: new FormControl(this.month$.id, [Validators.required]),
      year: new FormControl(this.year$, [Validators.required]),
      sources: new FormControl(""),
      districts: new FormControl("", !this.roles.isChws() ? [Validators.required] : []),
      sites: new FormControl("", !this.roles.isChws() ? [Validators.required] : []),
      chws: new FormControl(""),
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

  month$!: { labelEN: string; labelFR: string; id: string; uid: number };
  year$!: number;

  response$!: { status: number, data: { chwId: any, chw: Chws, data: ChwsDrugData }[] | any }

  drugUpdateResponse$!: { status: number, data: ChwsUpdateDrugInfo }
  drugUpdateErrorMsg: string = '';

  isUpdateLoading: { [id: number]: string }[] = [];

  editCmm: { [id: number]: string }[] = [];
  editQtyValidated: { [id: number]: string }[] = [];
  editQtyDelivered: { [id: number]: string }[] = [];
  editObservations: { [id: number]: string }[] = [];
  editTheoreticalQtyOrder: { [id: number]: string }[] = [];

  editCmmClick(id: number, cancel: boolean = false) {
    this.editCmm[id] = cancel == true ? this.editCmm[id] = '' : this.editCmm[id] == 'edit' ? '' : 'edit';
  }

  editQtyValidatedClick(id: number, cancel: boolean = false) {
    this.editQtyValidated[id] = cancel == true ? this.editQtyValidated[id] = '' : this.editQtyValidated[id] == 'edit' ? '' : 'edit';
  }

  editQtyDeliveredClick(id: number, cancel: boolean = false) {
    this.editQtyDelivered[id] = cancel == true ? this.editQtyDelivered[id] = '' : this.editQtyDelivered[id] == 'edit' ? '' : 'edit';
  }

  editObservationsClick(id: number, cancel: boolean = false) {
    this.editObservations[id] = cancel == true ? this.editObservations[id] = '' : this.editObservations[id] == 'edit' ? '' : 'edit';
  }

  editTheoreticalQtyOrderClick(id: number, cancel: boolean = false) {
    this.editTheoreticalQtyOrder[id] = cancel == true ? this.editTheoreticalQtyOrder[id] = '' : this.editTheoreticalQtyOrder[id] == 'edit' ? '' : 'edit';
  }

  

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser();
    this.chwOU = this.currentUser?.chw_found;
    if (this.roles.isChws() && (this.chwOU == null || !notNull(this.chwOU))){
      // location.href = 'chws/select_orgunit';
      this.router.navigate(['chws/select_orgunit']);
    }

    this.isLoading = false;
    this.initDate = startEnd21and20Date();

    this.Months$ = months();
    this.Years$ = getYearsList();

    this.year$ = currentYear(this.initDate.end_date);
    this.month$ = currentMonth(this.initDate.end_date);

    this.chwsDrugDataForm = this.createDataFilterFormGroup();
    if (!this.roles.isChws())
      this.initAllData();
    else
      this.initDataFilted();
  }


  saveOrUpdate(event: Event, id: number) {
    event.preventDefault();

    if (this.FinalChwsOutputData$.length > 0) {
      this.isUpdateLoading[id] = 'true';
      const dt = this.FinalChwsOutputData$[0];
      var order = 0;
      const objectKeysLen = this.objectKeys(dt.data).length;

      for (let k = 0; k < objectKeysLen; k++) {
        const key = this.getKey(this.toChwsDrugData(this.sortedArray(dt.data), k).key);
        const drug_name = this.getLabel(this.toChwsDrugData(this.sortedArray(dt.data), k).key);

        const orgUnit = this.getDataInfo(id);

        if (orgUnit && orgUnit.district && orgUnit.site && orgUnit.chw) {
          const yc = this.getValue(`year_cmm_${id}_${key}`);
          const qv = this.getValue(`quantity_validated_${id}_${key}`);
          const dq = this.getValue(`delivered_quantity_${id}_${key}`);
          const os = this.getValue(`observations_${id}_${key}`);
          const tq = this.getValue(`theoretical_quantity_to_order_${id}_${key}`);
          
          if (yc?.index == key || qv?.index == key || dq?.index == key || os?.index == key || tq?.index == key) {

            var dataUpdated: ChwsUpdateDrugInfo = {
              year: this.chwsDrugDataForm.value.year,
              month: this.chwsDrugDataForm.value.month,
              district: orgUnit.district,
              site: orgUnit.site,
              chw: orgUnit.chw,
              drug_index: key,
              drug_name: drug_name,
              year_cmm: yc?.value,
              quantity_validated: qv?.value,
              delivered_quantity: dq?.value,
              theoretical_quantity_to_order: tq?.value,
              observations: os?.value,
            };

            this.sync.ihDrugUpdateDataPerChw(dataUpdated).subscribe((_res$: {
              status: number, data: {
                chwId: any;
                chw: Chws;
                data: ChwsDrugData;
              }[]
            }) => {
              // this.drugUpdateResponse$
              order += 1;
              if (_res$.status == 200) {
                if (order == objectKeysLen - 1 && _res$.data) {
                  const modifiedArray = this.FinalChwsOutputData$.map(item=>{
                    if (item.chwId == orgUnit.chw) return _res$.data[0];
                    return item;
                  });
                  this.FinalChwsOutputData$ = modifiedArray.sort((a, b) => {
                    return a.chw.external_id.localeCompare(b.chw.external_id);
                  });
                  this.editCmmClick(id, true);
                  this.editQtyValidatedClick(id, true);
                  this.editQtyDeliveredClick(id, true);
                  this.editObservationsClick(id, true);
                  this.editTheoreticalQtyOrderClick(id, true);
                }
              } else {
                this.drugUpdateErrorMsg += _res$.data.toString();
              }
              if (order == objectKeysLen - 1) {
                this.isUpdateLoading[id] = 'false';
              }
            }, (err: any) => {
              this.drugUpdateErrorMsg += err.toString();
              this.isUpdateLoading[id] = 'false';
            });
          }
        }
      }
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

  getDataInfo(id: number): { district: string, site: string, chw: string } | undefined {
    const elem = (document.getElementById(`data-info-${id}`) as HTMLInputElement);
    if (elem != null) return { district: elem.dataset['district'] ?? '', site: elem.dataset['site'] ?? '', chw: elem.dataset['chw'] ?? '' };
    return undefined;
  }

  showHideMsg(elem:string): void {

  }

  convertQty(v:any){
    return v == 0 || v == '' || v == undefined ? undefined : v;
  }

  toChwsDrugData(obj: any, index: any): { key: string, val: ChwsDrugQantityInfo } {
    const val = obj[parseInt(index)];
    return { key: val[0], val: val[1] as ChwsDrugQantityInfo };
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
    const filter: FilterParams = this.ParamsToFilter();
    this.initMsg = 'Chargement des Districts ...';
    this.sync.getDistrictsList(filter).subscribe(async (_d$: { status: number, data: Districts[] }) => {
      if (_d$.status == 200){ 
        this.Districts$ = _d$.data.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
      }
      this.initMsg = 'Chargement des Sites ...';
      this.sync.getSitesList(filter).subscribe(async (_s$: { status: number, data: Sites[] }) => {
        if (_s$.status == 200){ 
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
    const dist: string[] = returnEmptyArrayIfNul(this.chwsDrugDataForm.value.districts);
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
    const sites: string[] = returnEmptyArrayIfNul(this.chwsDrugDataForm.value.sites);
    this.chw$ = [];
    this.chwsDrugDataForm.value.chws = [];
    if (notNull(sites))
      for (let d = 0; d < this.Chws$.length; d++) {
        const chws = this.Chws$[d];
        if (notNull(chws)) if (sites.includes(chws.site.id)) this.chw$.push(chws)
      }
    else
      this.chw$ = [];

  }

  ParamsToFilter(): FilterParams {
    const _moth: string = this.chwsDrugDataForm.value.month;
    const _year: string = this.chwsDrugDataForm.value.year;

    const src: string = this.chwsDrugDataForm.value.sources;
    const sources: string[] = notNull(src) ? returnDataAsArray(src) : [];
    var districts: string[] = [];
    var sites: string[] = [];
    var chws: string[] = [];

    if (!this.roles.isChws()) {
      districts = returnEmptyArrayIfNul(this.chwsDrugDataForm.value.districts);
      sites = returnEmptyArrayIfNul(this.chwsDrugDataForm.value.sites);
      chws = returnEmptyArrayIfNul(this.chwsDrugDataForm.value.chws);
    } else {
      if (this.chwOU != null && notNull(this.chwOU)) {
        districts = returnDataAsArray(this.chwOU.site.district.id);
        sites = returnDataAsArray(this.chwOU.site.id);
        chws = returnDataAsArray(this.chwOU.id);
        this.chw$ = [this.chwOU];
      }
    }
    const prevM = previousMonth(_moth);
    const prevY = prevM == '12' ? parseInt(_year) - 1 : _year;

    var params: FilterParams = {
      start_date: `${prevY}-${prevM}-21`,
      end_date: `${_year}-${_moth}-20`,
      districts: districts,
      sites: sites,
      chws: chws,
    }
    return params;
  }

  sort(id: string) {
    return sortTable(id);
  }

  isNumber = (data: any): boolean => !isNaN(2);
  showClass = (data: any) => this.isNumber(data) ? 'col-sm-6 col-6' : '';


  initDataFilted(params?: FilterParams): void {
    this.isLoading = true;

    const filters: FilterParams = params ?? this.ParamsToFilter();

    if (
      this.defaultParams?.start_date != filters.start_date ||
      this.defaultParams?.end_date != filters.end_date ||
      this.defaultParams?.districts != filters.districts ||
      this.defaultParams?.sites != filters.sites ||
      this.defaultParams?.chws != filters.chws
    ) {
      this.sync.ihDrugDataPerChw(filters).subscribe((_res$: { status: number, data: { chwId: any, chw: Chws, data: ChwsDrugData }[] | any }) => {
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

  startTraitement(params?: FilterParams) {
    this.isLoading = true;
    const filters: FilterParams = params ?? this.ParamsToFilter();
    if (this.response$.status == 200) {
      const fOutData$ = this.response$.data as { chwId: any, chw: Chws, data: ChwsDrugData }[];
      this.FinalChwsOutputData$ = fOutData$.sort((a, b) => {
        return a.chw.external_id.localeCompare(b.chw.external_id);
      });
      this.defaultParams = filters;
      this.data_no_data_found = this.FinalChwsOutputData$.length <= 0;
    } else {
      this.data_error_messages = this.response$.data.toString();
      this.data_no_data_found = true;
    }
    this.isLoading = false;
  }
}
