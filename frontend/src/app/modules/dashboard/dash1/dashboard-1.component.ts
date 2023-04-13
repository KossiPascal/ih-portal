import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataIndicators } from '@ih-app/models/DataAggragate';
import { Chws, CompareData, Dhis2Sync, Districts, FilterParams, Sites } from '@ih-app/models/Sync';
import { AuthService } from '@ih-app/services/auth.service';
import { AppStorageService } from '@ih-app/services/cookie.service';
import { SyncService } from '@ih-app/services/sync.service';
import { Functions, DateUtils, notNull } from '@ih-app/shared/functions';
import { Roles } from '@ih-app/shared/roles';



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
  constructor(private store: AppStorageService, private auth: AuthService, private sync: SyncService) {
    if (!this.roles.isSupervisorMentor() && !this.roles.isChws() && !this.roles.onlySeeData()) location.href = this.auth.userValue()?.defaultRedirectUrl!;
  }

  public roles = new Roles(this.store);

  aggradateDataForm!: FormGroup;
  initDate!: { start_date: string, end_date: string };
  chwOU: Chws | null = null;

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



  // initDataTable(tableId, paging = true) {
  //   $("#" + tableId)
  //     .DataTable({
  //       paging: paging,
  //       searching: false,
  //       ordering: true,
  //       info: false,
  //       responsive: false,
  //       lengthChange: false,
  //       autoWidth: false,
  //       sort: false,
  //       pageLength: 50,
  //       destroy: true,
  //       // "orderMulti": true,
  //       // "orderCellsTop": true,
  //       // "orderClasses": false,
  //       // "stateSave": true,
  //       // "pageLength": 50,

  //       // "language": {
  //       //     "aria": {
  //       //         "sortAscending": " - click/return to sort ascending"
  //       //     },
  //       //     "language": {
  //       //         "lengthMenu": 'Display <select>'+
  //       //         '<option value="10">10</option>'+
  //       //         '<option value="20">20</option>'+
  //       //         '<option value="30">30</option>'+
  //       //         '<option value="40">40</option>'+
  //       //         '<option value="50">50</option>'+
  //       //         '<option value="-1">All</option>'+
  //       //         '</select> records'
  //       //     },
  //       //     "loadingRecords": "Please wait - loading..."
  //       // },

  //       // "displayStart": 20,
  //       // "processing": true,
  //       // "scrollY": "200px",
  //       // "paginate": false,
  //       // "retrieve": true,
  //       // "scrollY": "200",
  //       // "scrollCollapse": true,
  //       buttons: ["copy", "csv", "excel", "pdf", "print"],
  //       // "buttons": ["copy", "csv", "excel", "pdf", "print", "colvis"]
  //     })
  //     .buttons()
  //     // .container()
  //     // .appendTo("#" + tableId + "_wrapper .col-md-6:eq(0)");
  // }

  ngOnInit(): void {
    this.chwOU = this.auth.chwsOrgUnit();
    if (this.roles.isChws() && (this.chwOU == null || !notNull(this.chwOU))) {
      location.href = 'chws/select_orgunit';
    }
    this.isLoading = false;
    this.initDate = DateUtils.startEnd21and20Date();
    this.aggradateDataForm = this.createDataFilterFormGroup();
    if (!this.roles.isChws()) {
      this.initAllData();
    } else {
      this.initDataFilted();
    }
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
          // this.initDataFilted();
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
    const sites: string[] = Functions.returnDataAsArray(this.aggradateDataForm.value.sites);
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

    var districts: string[] = [];
    var sites: string[] = [];
    var chws: string[] = [];

    if (!this.roles.isChws()) {
      // const sources: string[] = Functions.returnDataAsArray(this.aggradateDataForm.value.sources) as string[];
      districts = Functions.returnDataAsArray(this.aggradateDataForm.value.districts);
      sites = Functions.returnDataAsArray(this.aggradateDataForm.value.sites);
      // const chws: string[] = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.chws);
    } else {
      if (this.chwOU != null && notNull(this.chwOU)) {
        districts = Functions.returnDataAsArray(this.chwOU.site.district.id);
        sites = Functions.returnDataAsArray(this.chwOU.site.id);
        chws = Functions.returnDataAsArray(this.chwOU.id);
      }
    }


    var params: FilterParams = {
      // sources: sources,
      start_date: startDate,
      end_date: endDate,
      districts: districts,
      sites: sites,
      chws: chws,
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


  // getDataValuesElements(data: { dataValues: { dataElement: string, value: any }[], dataElement: string, value: any }): boolean {
  //   for (let j = 0; j < data.dataValues.length; j++) {
  //     const vals = data.dataValues[j];
  //     if (vals.dataElement == data.dataElement && vals.value == data.value) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

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

  // getChwInfos(chwId: string, byCode: boolean = false): Chws {
  //   var ascs!: Chws;


  //   const selectedChws: Chws[] = this.roles.isChws() && this.chwOU != null ? [this.chwOU] : this.chws$;
  //   for (let i = 0; i < selectedChws.length; i++) {
  //     const asc: Chws = selectedChws[i];
  //     if (notNull(asc)) {
  //       if (byCode == true) {
  //         if (notNull(asc.external_id) && asc.external_id == chwId) return asc;
  //       } else {
  //         if (notNull(asc.id) && asc.id == chwId) return asc;
  //       }
  //     }
  //   }
  //   return ascs;
  // }


}


