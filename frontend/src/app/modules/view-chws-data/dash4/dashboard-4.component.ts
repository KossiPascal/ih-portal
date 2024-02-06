import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataInfos } from '@ih-app/models/DataAggragate';
import { Dhis2Sync, Districts, FilterParams, Sites, Zones } from '@ih-app/models/Sync';
import { AuthService } from '@ih-app/services/auth.service';
import { SyncService } from '@ih-app/services/sync.service';
import { notNull, returnDataAsArray } from '@ih-app/shared/functions';
import { Roles } from '@ih-src/app/models/Roles';
import { startEnd21and20Date } from '@ih-src/app/shared/dates-utils';

@Component({
    selector: 'app-dashboard-4',
    templateUrl: `./dashboard-4.component.html`,
    styleUrls: [
        './dashboard-4.component.css'
    ]
})
export class Dashboard4Component implements OnInit {
    constructor(private auth: AuthService, private sync: SyncService) {
    }
    public roles = new Roles(this.auth);

    aggradateDataForm!: FormGroup;
    initDate!: { start_date: string, end_date: string };


    createDataFilterFormGroup(): FormGroup {
        return new FormGroup({
            start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
            end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
            districts: new FormControl("", [Validators.required]),
            sites: new FormControl("", [Validators.required]),
            zones: new FormControl("", [Validators.required]),
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

    ngOnInit(): void {
        this.isLoading = false;
        this.initDate = startEnd21and20Date();
        this.aggradateDataForm = this.createDataFilterFormGroup();
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
        const sites: string[] = returnDataAsArray(this.aggradateDataForm.value.sites);
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

        const districts: string[] = returnDataAsArray(this.aggradateDataForm.value.districts);
        const sites: string[] = returnDataAsArray(this.aggradateDataForm.value.sites);
        const zones: string[] = returnDataAsArray(this.aggradateDataForm.value.zones);

        var params: FilterParams = {
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



