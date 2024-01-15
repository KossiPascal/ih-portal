import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataInfos } from '@ih-app/models/DataAggragate';
import { Chws, Dhis2Sync, Districts, FilterParams, Sites, Zones } from '@ih-app/models/Sync';
import { AuthService } from '@ih-app/services/auth.service';
import { AppStorageService } from '@ih-app/services/cookie.service';
import { SyncService } from '@ih-app/services/sync.service';
import { Functions, DateUtils, notNull } from '@ih-app/shared/functions';
import { Roles } from '@ih-app/shared/roles';

@Component({
    selector: 'app-dashboard-4',
    templateUrl: `./dashboard-4.component.html`,
    styleUrls: [
        './dashboard-4.component.css'
    ]
})
export class Dashboard4Component implements OnInit {
    constructor(private store: AppStorageService, private auth: AuthService, private sync: SyncService) {
        if(this.roles.hasNoAccess()) this.auth.logout();
        if (!this.roles.isSupervisorMentor() && !this.roles.isChws()) location.href = this.auth.userValue()?.defaultRedirectUrl ?? ''!;
    }


    public roles = new Roles(this.store);

    aggradateDataForm!: FormGroup;
    initDate!: { start_date: string, end_date: string };


    createDataFilterFormGroup(): FormGroup {
        return new FormGroup({
            start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
            end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
            districts: new FormControl("", !this.roles.isChws() ? [Validators.required] : []),
            sites: new FormControl("",!this.roles.isChws() ? [Validators.required] : []),
            zones: new FormControl("", !this.roles.isChws() ? [Validators.required] : []),
        });
    }

    ChwsDataInfos$: DataInfos | undefined;

    Districts$: Districts[] = [];
    Zones$: Zones[] = [];
    Sites$: Sites[] = [];

    zones$: Zones[] = [];
    sites$: Sites[] = [];

    initMsg!: string;
    isLoading!: boolean;
    dhis2Params!: Dhis2Sync;
    responseMessage: string = '';

    chwOU: Chws | null = null;

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
                this.initMsg = 'Chargement des Zones ...';
                this.sync.getZonesList().subscribe(async (_z$: { status: number, data: Zones[] }) => {
                    if (_z$.status == 200) this.Zones$ = _z$.data;
                    this.isLoading = false;
                    this.initMsg = '';
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


    generateSites() {
        this.sites$ = [];
        this.zones$ = [];
        const dist: string = this.aggradateDataForm.value["districts"];
        this.aggradateDataForm.value["sites"] = "";
        this.aggradateDataForm.value["zones"] = [];

        if (notNull(dist)) {
            for (let d = 0; d < this.Sites$.length; d++) {
                const site = this.Sites$[d];
                if (notNull(site)) if (dist.includes(site.district.id)) this.sites$.push(site)
            }
        } else {
            this.sites$ = [];
        }
    }

    generateZones() {
        const sites: string[] = Functions.returnDataAsArray(this.aggradateDataForm.value.sites);
        this.zones$ = [];
        this.aggradateDataForm.value["zones"] = [];
        if (notNull(sites)) {
            for (let z = 0; z < this.Zones$.length; z++) {
                const zones = this.Zones$[z];
                if (notNull(zones)) if (sites.includes(zones.site.id)) this.zones$.push(zones)
            }
        } else {
            this.zones$ = [];
        }
    }

    ParamsToFilter(): FilterParams {
        const startDate: string = this.aggradateDataForm.value.start_date;
        const endDate: string = this.aggradateDataForm.value.end_date;

        var districts: string[] = [];
        var sites: string[] = [];
        var zones: string[] = [];

        if (!this.roles.isChws()) {
            // const sources: string[] = Functions.returnDataAsArray(this.aggradateDataForm.value.sources) as string[];
            districts = Functions.returnDataAsArray(this.aggradateDataForm.value.districts);
            sites = Functions.returnDataAsArray(this.aggradateDataForm.value.sites);
            zones = Functions.returnDataAsArray(this.aggradateDataForm.value.zones);
        } else {
            if (this.chwOU != null && notNull(this.chwOU)) {
                districts = Functions.returnDataAsArray(this.chwOU.site.district.id);
                sites = Functions.returnDataAsArray(this.chwOU.site.id);
                zones = Functions.returnDataAsArray(this.chwOU.zone.id);
            }
        }


        var params: FilterParams = {
            // sources: sources,
            start_date: startDate,
            end_date: endDate,
            districts: districts,
            sites: sites,
            zones: zones,
            withDhis2Data: false
        }
        return params;
    }

    initDataFilted(params?: FilterParams): void {
        this.initMsg = 'Loading Data ...';
        this.isLoading = true;
        this.ChwsDataInfos$ = undefined;
        
        this.sync.getDataInformations(params ?? this.ParamsToFilter()).subscribe((res: { status: number, data: any }) => {
            if (res.status == 200) {
                this.ChwsDataInfos$ = res.data;
            } else {
                this.responseMessage = res.data
            }
            this.isLoading = false;
        }, (err: any) => {
            this.isLoading = false;
            console.log(err);
        });
    }

}



