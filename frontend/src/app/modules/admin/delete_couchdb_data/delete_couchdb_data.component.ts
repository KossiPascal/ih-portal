import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Districts, Chws, Sites, Zones, FilterParams } from '@ih-app/models/Sync';
import { AuthService } from '@ih-app/services/auth.service';
import { DatabaseUtilService } from '@ih-app/services/database-utils.service';
import { SyncService } from '@ih-app/services/sync.service';
import { notNull, returnDataAsArray } from '@ih-app/shared/functions';


@Component({
  selector: 'app-user',
  templateUrl: `./delete_couchdb_data.component.html`,

})
export class DeleteCouchdbDataComponent implements OnInit {

  responseMsg: string = '';
  dataListToDeleteForm!: FormGroup;
  foundedDataToDelete: any[] = []
  selectedListToBeDelete: { _deleted: boolean, _id: string, _rev: string }[] = [];

  Districts$: Districts[] = [];
  Sites$: Sites[] = [];
  Zones$: Zones[] = [];
  Chws$: Chws[] = [];

  sites$: Sites[] = [];
  zones$: Zones[] = [];
  chws$: Chws[] = [];

  types$: string[] = ['data', 'patients', 'families']

  constMsg: string = "Loading...";
  initMsg: string = this.constMsg;

  isLoading!: boolean;


  constructor(private sync: SyncService, private dbUtils: DatabaseUtilService) { }


  dataListToDeleteFilterFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl("", [Validators.required, Validators.minLength(7)]),
      end_date: new FormControl("", [Validators.required, Validators.minLength(7)]),
      sources: new FormControl("Tonoudayo", [Validators.required]),
      districts: new FormControl("", [Validators.required]),
      sites: new FormControl("", [Validators.required]),
      zones: new FormControl("", [Validators.required]),
      chws: new FormControl("", [Validators.required]),
      type: new FormControl("", [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.dataListToDeleteForm = this.dataListToDeleteFilterFormGroup();
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
          this.initMsg = 'Chargement des Zones ...';
          this.sync.getZonesList().subscribe(async (_z$: { status: number, data: Zones[] }) => {
            if (_z$.status == 200) this.Zones$ = _z$.data;
            this.initMsg = 'Chargement des ASC ...';
            this.sync.getChwsList().subscribe(async (_c$: { status: number, data: Chws[] }) => {
              if (_c$.status == 200) this.Chws$ = _c$.data;
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
      }, (err: any) => {
        this.isLoading = false;
        console.log(err.error);
      });
  }

  getListOfDataToDeleteFromCouchDb() {
    this.initMsg = this.constMsg;
    this.isLoading = true;
    this.foundedDataToDelete = [];
    this.selectedListToBeDelete = [];
    this.responseMsg = '';
    this.dbUtils.getDataToDeleteFromCouchDb(this.ParamsToFilter()).subscribe(async (res: { status: number, data: any }) => {
      if (res.status == 200) {
        this.foundedDataToDelete = res.data;
        for (let d = 0; d < this.foundedDataToDelete.length; d++) {
          const data = this.foundedDataToDelete[d];
          this.selectedListToBeDelete.push({ _deleted: true, _id: data.id, _rev: data.rev })
        }
      } else {
        this.responseMsg = res.data;
      }
      this.isLoading = false;
    }, (err: any) => {
      console.log(err.error);
      this.isLoading = false;
      this.responseMsg = err.toString();
    });
  }

  deleteSelectedDataFromCouchDb() {
    this.initMsg = this.constMsg;
    this.responseMsg = '';
    if (this.selectedListToBeDelete.length > 0) {
      this.dbUtils.deleteDataFromCouchDb(this.selectedListToBeDelete, this.dataListToDeleteForm.value.type).subscribe(async (res: { status: number, data: any }) => {
        if (res.status == 200) {
          this.responseMsg = 'Done successfuly !';
          this.foundedDataToDelete = [];
          this.selectedListToBeDelete = [];
        } else {
          this.responseMsg = 'Problem with query, retry!';
        }
        // this.responseMsg = res.data.toString();
        // if (res.status == 200) console.log(res.data);
      }, (err: any) => {
        console.log(err);
        this.responseMsg = 'Error found when deleting ...';
        // this.responseMsg = err.toString();
      });
    } else {
      this.responseMsg = 'Not data provied!';
    }
  }

  ParamsToFilter(): FilterParams {
    var params: FilterParams = {
      start_date: this.dataListToDeleteForm.value.start_date,
      end_date: this.dataListToDeleteForm.value.end_date,
      sources: returnDataAsArray(this.dataListToDeleteForm.value.sources) as string[],
      districts: returnDataAsArray(this.dataListToDeleteForm.value.districts) as string[],
      sites: returnDataAsArray(this.dataListToDeleteForm.value.sites) as string[],
      zones: returnDataAsArray(this.dataListToDeleteForm.value.zones) as string[],
      chws: returnDataAsArray(this.dataListToDeleteForm.value.chws) as string[],
      type: this.dataListToDeleteForm.value.type,
      withDhis2Data: false
    }
    return params;
  }

  genarateSites() {
    this.sites$ = [];
    this.zones$ = [];
    this.chws$ = [];
    const dist: string = this.dataListToDeleteForm.value.districts;
    this.dataListToDeleteForm.value.sites = "";
    this.dataListToDeleteForm.value.chws = "";
    if (notNull(dist)) {
      for (let d = 0; d < this.Sites$.length; d++) {
        const site = this.Sites$[d];
        if (notNull(site)) if (dist == site.district.id) this.sites$.push(site)
      }
    } else {
      this.sites$ = [];
    }
  }

  genarateZones() {
    this.zones$ = [];
    this.chws$ = [];
    const site: string = this.dataListToDeleteForm.value.sites;
    this.dataListToDeleteForm.value.zones = "";
    this.dataListToDeleteForm.value.chws = "";
    if (notNull(site)) {
      for (let z = 0; z < this.Zones$.length; z++) {
        const zone = this.Zones$[z];
        if (notNull(site)) if (site == zone.site.id) this.zones$.push(zone)
      }
    } else {
      this.zones$ = [];
    }
  }

  genarateChws() {
    this.chws$ = [];
    const zone: string = this.dataListToDeleteForm.value.zones;
    this.dataListToDeleteForm.value.chws = "";
    if (notNull(zone)) {
      for (let d = 0; d < this.Chws$.length; d++) {
        const chws = this.Chws$[d];
        if (notNull(chws)) if (zone == chws.zone.id) this.chws$.push(chws)
      }
    } else {
      this.chws$ = [];
    }
  }
}