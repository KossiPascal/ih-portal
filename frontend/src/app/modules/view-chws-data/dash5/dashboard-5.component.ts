import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PatientDataInfos } from '@ih-app/models/DataAggragate';
import { Dhis2Sync, Districts, FilterParams, Sites, Zones } from '@ih-app/models/Sync';
import { AuthService } from '@ih-app/services/auth.service';
import { SyncService } from '@ih-app/services/sync.service';
import { currentMonth, currentYear, getMonthLabelById, getMonthsList, getYearsList, notNull, toArray } from '@ih-app/shared/functions';
import { Roles } from '@ih-src/app/models/Roles';

@Component({
    selector: 'app-dashboard-5',
    templateUrl: `./dashboard-5.component.html`,
    styleUrls: [
        './dashboard-5.component.css'
    ],
    encapsulation: ViewEncapsulation.None
})
export class Dashboard5Component implements OnInit {
    constructor(private auth: AuthService, private sync: SyncService) {
    }
    public roles = new Roles(this.auth);

    _formGroup!: FormGroup;
    patientData$: { month: string, pecime: number, maternel: number, total: number }[] = [];
    Months$: { labelEN: string; labelFR: string; id: string; uid: number }[] = [];
    Years$: number[] = [];
    month$!: { labelEN: string; labelFR: string; id: string; uid: number };
    year$!: number;

    createDataFilterFormGroup(): FormGroup {
        return new FormGroup({
            year: new FormControl(this.year$, [Validators.required]),
            months: new FormControl([this.month$.id], [Validators.required]),
            districts: new FormControl("", [Validators.required]),
            sites: new FormControl("", []),
            zones: new FormControl("", []),
        });
    }

    Districts$: Districts[] = [];
    Zones$: Zones[] = [];
    Sites$: Sites[] = [];

    zones$: Zones[] = [];
    sites$: Sites[] = [];

    initMsg!: string;
    isLoading!: boolean;
    dhis2Params!: Dhis2Sync;
    responseMessage: any = '';

    ngOnInit(): void {
        this.isLoading = false;
        this.year$ = currentYear();
        this.month$ = currentMonth();
        this.Months$ = getMonthsList().filter(m => this.month$ && m.uid <= this.month$.uid);
        this.Years$ = getYearsList().filter(y => this.year$ && y <= this.year$);

        this._formGroup = this.createDataFilterFormGroup();
        this.initAllData();

    }

    initMonthList() {
        if (this._formGroup.value.year > currentYear()) {
            this.Months$ = [];
        } else if (this._formGroup.value.year == currentYear()) {
            this.Months$ = getMonthsList().filter(m => this.month$ && m.uid <= this.month$.uid);
        } else {
            this.Months$ = getMonthsList();
        }
    }

    isSelected(data: string | number, type: 'year' | 'month' | 'districts' | 'sites' | 'zones'): boolean {
        if (type === 'year') return this._formGroup.value.year === data;
        if (type === 'month') return toArray(this._formGroup.value.months).includes(`${data}`);
        if (type === 'districts') return this._formGroup.value.districts === data;
        if (type === 'sites') return this._formGroup.value.sites === data;
        if (type === 'zones') return toArray(this._formGroup.value.zones).includes(`${data}`);
        return false;
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
        const dist: string = this._formGroup.value["districts"];
        this._formGroup.value["sites"] = "";
        this._formGroup.value["zones"] = [];

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
        const sites: string[] = this._formGroup.value["sites"];
        this.zones$ = [];
        this._formGroup.value["zones"] = [];
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
        const districts = this._formGroup.value.districts;
        const sites = this._formGroup.value.sites;
        const zones = this._formGroup.value.zones;
        let months;
        try {
            const m = this._formGroup.value.months;
            months = m.sort((a: string, b: string) => parseInt(a, 10) - parseInt(b, 10));
        } catch (error) {
            months = this._formGroup.value.months;
        }
        
        var params: FilterParams = {
            year: this._formGroup.value.year,
            months: months,
            districts: sites.length > 0 ? districts : undefined,
            sites: sites.length > 0 ? sites : undefined,
            zones: zones.length > 0 ? zones : undefined,
            withDhis2Data: false
        }
        return params;
    }

    initDataFilted(params?: FilterParams): void {
        this.initMsg = 'Loading Data ...';
        this.isLoading = true;
        this.patientData$ = [];

        this.sync.getPatientDataInfos(params ?? this.ParamsToFilter()).subscribe((res: { status: number, data: PatientDataInfos[] }) => {
            if (res.status == 200) {
                let pecimeT = 0;
                let maternelT = 0;
                let totalT = 0;
                for (const dt of res.data) {
                    pecimeT += dt.data.pecime;
                    maternelT += dt.data.maternel;
                    totalT += dt.data.total;
                    this.patientData$.push({ month: getMonthLabelById(dt.month), pecime: dt.data.pecime, maternel: dt.data.maternel, total: dt.data.total });
                }
                if (res.data.length > 1) {
                    this.patientData$.push({ month: "TOTAL", pecime: pecimeT, maternel: maternelT, total: totalT });
                }
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



