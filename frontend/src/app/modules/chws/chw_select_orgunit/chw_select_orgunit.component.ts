import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Chws, Districts, Sites } from '@ih-app/models/Sync';
import { AuthService } from '@ih-app/services/auth.service';
import { DatabaseUtilService } from '@ih-app/services/database-utils.service';
import { SyncService } from '@ih-app/services/sync.service';
import { Roles } from '@ih-app/models/Roles';
import { returnDataAsArray, notNull, getSavedUrl } from '@ih-src/app/shared/functions';
import { User } from '@ih-src/app/models/User';

@Component({
  selector: 'app-chw_select_orgunit',
  templateUrl: `./chw_select_orgunit.component.html`,

})
export class SelectOrgUnitComponent implements OnInit {
  activeSave() {
    throw new Error('Method not implemented.');
  }
  District$: Districts[] = [];
  Sites$: Sites[] = [];
  Chws$: Chws[] = [];

  district$: Districts[] = [];
  sites$: Sites[] = [];
  chws$: Chws[] = [];

  orgUnitForm!: FormGroup;
  isLoading: boolean = false;
  LoadingMsg: string = "Loading...";
  message: string = '';
  currentUser: User | null | undefined;

  constructor(private db: DatabaseUtilService, private auth: AuthService, private sync: SyncService, private router: Router) {
  }

  public roles = new Roles(this.auth);

  chwOU: Chws | null | undefined;

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser();
    this.chwOU = this.currentUser?.chw_found;
    this.initAllData();
    this.orgUnitForm = this.createFilterFormGroup();
  }

  async initAllData() {
    this.isLoading = true;
    this.sync.getDistrictsList().subscribe((_distResp: { status: number, data: Districts[] }) => {
      if (_distResp.status == 200) this.District$ = _distResp.data;
      this.sync.getSitesList().subscribe((_siteResp: { status: number, data: Sites[] }) => {
        if (_distResp.status == 200) this.Sites$ = _siteResp.data;
        this.sync.getChwsList().subscribe((_chwResp: { status: number, data: Chws[] }) => {
          if (_chwResp.status == 200) this.Chws$ = _chwResp.data;
          if (this.chwOU != null) {
            this.genarateSites(true)
            this.genarateChws(true)
          }
          this.isLoading = false;
        }, (err: any) => {
          console.log(err);
          this.isLoading = false;
        });
      }, (err: any) => {
        console.log(err);
        this.isLoading = false;
      });
    }, (err: any) => {
      console.log(err);
      this.isLoading = false;
    });
  }

  createFilterFormGroup(): FormGroup {
    return new FormGroup({
      districts: new FormControl(this.chwOU!=null ? this.chwOU.site.district.id : '', [Validators.required]),
      sites: new FormControl(this.chwOU!=null ? this.chwOU.site.id : '', [Validators.required]),
      chws: new FormControl(this.chwOU!=null ? this.chwOU.id : '', [Validators.required]),
    });
  }

  genarateSites(custom:boolean = false) {
    const dist = custom && this.chwOU!=null? this.chwOU.site.district.id : this.orgUnitForm.value.districts;
    const district: string[] = returnDataAsArray(dist);
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

  genarateChws(custom:boolean = false) {
    const sit = custom && this.chwOU!=null? this.chwOU.site.id : this.orgUnitForm.value.sites;
    const sites: string[] = returnDataAsArray(sit);
    this.chws$ = [];
    this.orgUnitForm.value.chws = "";
    if (notNull(sites)) {
      for (let d = 0; d < this.Chws$.length; d++) {
        const chws = this.Chws$[d];
        if (notNull(chws)) if (sites.includes(chws.site.id)) this.chws$.push(chws)
      }
    } else {
      this.chws$ = [];
    }
  }

  getChwInfo(chwIds: string[]): Chws | null{
    for (let d = 0; d < this.chws$.length; d++) {
      const chws = this.chws$[d];
      if (chwIds.includes(chws.id)) return chws;
    }
    return null;
  }

  updateChwsOrgUnit() {

    const chwId = this.orgUnitForm.value.chws;
    const chw_found = this.getChwInfo(returnDataAsArray(notNull(chwId)?chwId:this.chwOU!.id) as string[]);

    // const filter: any = {
    //   districts: returnDataAsArray(this.orgUnitForm.value.districts) as string[],
    //   sites: returnDataAsArray(this.orgUnitForm.value.sites) as string[],
    //   chws: chwsF,
    //   name: chwFound!=null ? chwFound.name : ''
    // }

    if (chw_found!=null && notNull(chw_found)) {
      if (this.currentUser) {
        this.currentUser.chw_found = chw_found;
        this.auth.setUser(this.currentUser);
        const savedUrl = getSavedUrl();
        if (savedUrl && notNull(savedUrl)) {
          // location.href = savedUrl;
          this.router.navigate([savedUrl]);
          return;
        }
        this.auth.GoToDefaultPage();
        return;
      }
      return this.auth.logout();
    } else {
      this.message = 'Erreur, veullez rééssayer ou contacter le superviseur!';
    }
  }

}