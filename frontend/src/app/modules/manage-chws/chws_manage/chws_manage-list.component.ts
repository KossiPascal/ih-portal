import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { Chws, Districts, FilterParams, Sites, Zones } from '@ih-app/models/Sync';
import { AuthService } from '@ih-app/services/auth.service';
import { DatabaseUtilService } from '@ih-app/services/database-utils.service';
import { SyncService } from '@ih-app/services/sync.service';
import { Consts } from '@ih-app/shared/constantes';
import { notNull, returnDataAsArray } from '@ih-app/shared/functions';
// import usersDb from '@ih-databases/users.json'; 

declare var $: any;
declare var showToast: any;
@Component({
  selector: 'app-chws_manage',
  templateUrl: `./chws_manage-list.component.html`,

})
export class ChwsReplacementManageComponent implements OnInit {
  activeSave() {
    throw new Error('Method not implemented.');
  }
  District$: Districts[] = [];
  Sites$: Sites[] = [];
  Zones$: Zones[] = [];

  district$: Districts[] = [];
  sites$: Sites[] = [];

  replacementChws$: Chws[] = [];

  replacementChwsForm!: FormGroup;
  filterForm!: FormGroup;
  isLoginForm: boolean = false;
  isLoading1: boolean = false;
  isLoading2: boolean = false;
  LoadingMsg: string = "Loading...";
  isEditMode: boolean = false;
  chw!: Chws | null;
  message: string = '';

  APP_LOGO: string = Consts.APP_LOGO;

  constructor(private db: DatabaseUtilService, private auth: AuthService, private sync: SyncService, private router: Router) {
   }

    


  ngOnInit(): void {
    this.initAllData();
    this.filterForm = this.createFilterFormGroup();
    this.replacementChwsForm = this.createReplacementChwsFormGroup();
  }

  async initAllData() {
    this.sync.getDistrictsList().subscribe((_distResp: { status: number, data: Districts[] }) => {
      if (_distResp.status == 200) this.District$ = _distResp.data;
      this.sync.getSitesList().subscribe((_siteResp: { status: number, data: Sites[] }) => {
        if (_siteResp.status == 200) this.Sites$ = _siteResp.data;
      }, (err: any) => console.log(err.error));
    }, (err: any) => console.log(err.error));
  }

  getReplacementChws() {
    this.isLoading1 = true;
    const filter: FilterParams = {
      districts: returnDataAsArray(this.filterForm.value.districts) as string[],
      sites: returnDataAsArray(this.filterForm.value.sites) as string[],
      withDhis2Data:false
    }
    this.sync.getZonesList(filter).subscribe((_zoneResp: { status: number, data: Zones[] }) => {
      if (_zoneResp.status == 200) this.Zones$ = _zoneResp.data;
      this.sync.getChwsList(filter).subscribe((_chwsResp: { status: number, data: Chws[] }) => {
        this.replacementChws$ = [];
        if (_chwsResp.status == 200) {
          for (let i = 0; i < _chwsResp.data.length; i++) {
            const _chw = _chwsResp.data[i];
            if (_chw.name.includes('(R)')) {
              this.replacementChws$.push(_chw);
            }
          }
        }
        this.isLoading1 = false;
      }, (err: any) => {
        console.log(err);
        this.isLoading1 = false;
      });
    }, (err: any) => {
      console.log(err);
      this.isLoading1 = false;
    });
  }

  EditChwsZone(chw: Chws) {
    this.message = '';
    this.isEditMode = true;
    this.replacementChwsForm = this.createReplacementChwsFormGroup(chw);
    this.selectedChw(chw);
  }

  selectedChw(chw: Chws) {
    this.chw = chw;
  }

  updateChwsFacilityIdAndContactPlace() {
    this.isLoading2 = true;
    this.message = '';
    return this.db.updateUserFacilityContactPlace(this.replacementChwsForm.value).subscribe((res: any) => {
      this.message = res.message;
      this.getReplacementChws();
      this.closeModal();
      this.isLoading2 = false;
    }, (err: any) => {
      this.message = err;
      this.isLoading2 = false;
      console.log(this.message);
    });
  }

  createFilterFormGroup(): FormGroup {
    return new FormGroup({
      districts: new FormControl('', [Validators.required]),
      sites: new FormControl('', [Validators.required]),
    });
  }

  createReplacementChwsFormGroup(chw?: Chws): FormGroup {
    return new FormGroup({
      contact: new FormControl(chw != null ? chw.id : '', [Validators.required]),
      parent: new FormControl(chw != null ? chw.zone.id : '', [Validators.required]),
      code: new FormControl(chw != null ? chw.external_id : '', [Validators.required]),
      new_parent: new FormControl('', [Validators.required]),
    }, [this.MatchValidator('parent', 'new_parent')]);
  }

  MatchValidator(source: string, cible: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const sourceCtrl = control.get(source);
      const cibleCtrl = control.get(cible);

      if (sourceCtrl && cibleCtrl) {
        if (this.isEditMode && sourceCtrl.value == cibleCtrl.value) {
          return { mismatch: true };
        }
      }
      return null;
    };
  }

  genarateSites() {
    const district: string[] = returnDataAsArray(this.filterForm.value.districts);
    this.sites$ = [];
    // this.replacementChws$ = [];
    if (notNull(district)) {
      for (let d = 0; d < this.Sites$.length; d++) {
        const site = this.Sites$[d];
        if (notNull(site)) if (district.includes(site.district.id)) this.sites$.push(site)
      }
    } else {
      this.sites$ = [];
    }
  }

  showModalToast(icon: string, title: string) {
    showToast(icon, title);
    this.closeModal('close-delete-modal');
  }

  closeModal(btnId: string = 'close-modal') {
    $('#' + btnId).trigger('click');
  }

}