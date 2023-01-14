import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { Chws, Districts, FilterParams, Sites, Zones } from '@ih-app/models/Sync';
import { AuthService } from '@ih-app/services/auth.service';
import { SyncService } from '@ih-app/services/sync.service';
import { Functions } from '@ih-app/shared/functions';
import { User } from '@ih-models/User';
// import usersDb from '@ih-databases/users.json'; 

declare var $: any;
declare var showToast: any;
@Component({
  selector: 'app-chws_manage',
  templateUrl: `./chws_manage-list.component.html`,

})
export class ChwsManageComponent implements OnInit {
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

  constructor(private auth: AuthService, private syncService: SyncService, private router: Router) { }

  ngOnInit(): void {
    this.initAllData();
    this.filterForm = this.createFilterFormGroup();
    this.replacementChwsForm = this.createReplacementChwsFormGroup();
  }

  async initAllData() {
    const filter: FilterParams = {
      sources: ['Tonoudayo']
    }
    this.syncService.getDistrictsList(filter).subscribe((district: any) => {
      this.District$ = district;
      this.syncService.getSitesList(filter).subscribe((sites: any) => {
        this.Sites$ = sites;

      }, (err: any) => console.log(err.error));
    }, (err: any) => console.log(err.error));
  }

  getReplacementChws() {
    this.isLoading1 = true;
    const filter: FilterParams = {
      sources: ['Tonoudayo'],
      sites: [`${this.filterForm.value.site}`]
    }
    this.syncService.getZoneList(filter).subscribe((zones: any) => {
      this.Zones$ = zones;
      this.syncService.getChwsList(filter).subscribe((chws: Chws[]) => {
        this.replacementChws$ = [];
        for (let i = 0; i < chws.length; i++) {
          const chw = chws[i];
          if (chw.name.includes('(R)')) {
            this.replacementChws$.push(chw)
          }
        }
        this.isLoading1 = false;
      }, (err: any) => {
        console.log(err.error);
        this.isLoading1 = false;
      });
    }, (err: any) => {
      console.log(err.error); 
      this.isLoading1 = false;
    });
  }

  EditChwsZone(chw: Chws) {
    this.isEditMode = true;
    this.replacementChwsForm = this.createReplacementChwsFormGroup(chw);
    this.selectedChw(chw);
  }

  selectedChw(chw: Chws) {
    this.chw = chw;
  }

  updateChwsFacilityIdAndContactPlace() {
    this.isLoading2 = true;
    return this.auth.updateUserFacilityIdAndContactPlace(this.replacementChwsForm.value).subscribe((res: any) => {
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
      district: new FormControl('', [Validators.required]),
      site: new FormControl('', [Validators.required]),
    });
  }

  createReplacementChwsFormGroup(chw?: Chws): FormGroup {
    return new FormGroup({
      host: new FormControl(chw != null ? 'portal-integratehealth.org:444' : '', [Validators.required]),
      contact: new FormControl(chw != null ? chw.id : '', [Validators.required]),
      parent: new FormControl(chw != null ? chw.zone.id : '', [Validators.required]),
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
    const district: string[] = Functions.returnDataAsArray(this.filterForm.value.district);
    this.sites$ = [];
    // this.replacementChws$ = [];

    if (Functions.notNull(district)) {
      for (let d = 0; d < this.Sites$.length; d++) {
        const site = this.Sites$[d];
        if (Functions.notNull(site)) if (district.includes(site.district.id)) this.sites$.push(site)
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