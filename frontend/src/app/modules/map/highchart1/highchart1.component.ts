import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Chws, ChwsDataFormDb, CompareData, Dhis2Sync, Districts, FilterParams, HighChart, Sites } from "@ih-app/models/Sync";
import { AuthService } from "@ih-app/services/auth.service";
import { AppStorageService } from "@ih-app/services/cookie.service";
import { SyncService } from "@ih-app/services/sync.service";
import { notNull, DateUtils, Functions } from "@ih-app/shared/functions";
import { Roles } from "@ih-app/shared/roles";

declare var highmaps: any;

@Component({
    selector: "my-app",
    templateUrl: "./highchart1.component.html",
    styleUrls: ["./highchart1.component.css"]
})
export class HighchartMap1Component implements OnInit {

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

    bodyData: CompareData[] = [];
    ChwsDataFromDb$: ChwsDataFormDb[] = [];
    Districts$: Districts[] = [];
    Chws$: Chws[] = [];
    Sites$: Sites[] = [];

    chws$: Chws[] = [];
    sites$: Sites[] = [];

    initMsg!: string;
    isLoading!: boolean;
    dhis2Params!: Dhis2Sync;
    responseMessage: string = '';

    constructor(private store: AppStorageService, private auth: AuthService, private route: ActivatedRoute, private sync: SyncService) {
        if (!this.roles.isSupervisorMentor() && !this.roles.isChws() && !this.roles.onlySeeData()) location.href = this.auth.userValue()?.defaultRedirectUrl!;
    }

    public roles = new Roles(this.store);

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

    highMapsChart(chartOptions: HighChart) {
        highmaps(chartOptions)
    }

    ParamsToFilter(): FilterParams {
        const startDate: string = this.aggradateDataForm.value.start_date;
        const endDate: string = this.aggradateDataForm.value.end_date;

        var districts: string[] = [];
        var sites: string[] = [];
        var chws: string[] = [];

        if (!this.roles.isChws()) {
            // const sources: string[] = Functions.returnDataAsArray(this.aggradateDataForm.value.sources) as string[];
            districts = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.districts);
            sites = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.sites);
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
            withDhis2Data: false
        }
        return params;
    }

    initDataFilted(params?: FilterParams): void {
        this.initMsg = 'Loading Data ...';
        this.isLoading = true;
        this.genarateChws();
        this.sync.getAllChwsDataWithParams(params ?? this.ParamsToFilter()).subscribe((res: { status: number, data: any }) => {
            if (res.status == 200) {
                this.ChwsDataFromDb$ = res.data;

                for (let i = 0; i < this.ChwsDataFromDb$.length; i++) {
                    const data = this.ChwsDataFromDb$[i];
                    if (notNull(data.geolocation)) console.log(data.geolocation)
                }
                this.genarateGeoMap(params ?? this.ParamsToFilter());
            } else {
                this.isLoading = false;
                this.responseMessage = res.data
            }
        }, (err: any) => {
            this.isLoading = false;
            console.log(err);
        });
    }

    genarateGeoMap(params?: FilterParams) {
        this.sync.syncGeojsonData().subscribe((res: { status: number, map: any, data: any }) => {
            if (res.status == 200) {
                var mapData = res.map;
                var data = res.data;
                const colors = ["#B8D8BA", "#D9DBBC", "#FCDDBC", "#EF959D", "#69585F"];

                const chartOptions = {
                    backgroundColor: {
                        linearGradient: [0, 0, 500, 500],
                        stops: [
                            [0, 'rgb(255, 255, 255)'],
                            [1, 'rgb(240, 240, 255)'],
                        ],
                    },
                    borderWidth: 2,
                    plotBackgroundColor: 'rgba(255, 255, 255, .9)',
                    plotShadow: true,
                    plotBorderWidth: 1,
                };

                const highchartsOptions = {
                    // chart: {
                    //     renderTo: 'container',
                    //     type: 'bar'
                    //     map: this.map
                    // },
                    colorAxis: {
                        min: 0,
                        stops: [[0, colors[0]], [0.5, colors[1]], [1, colors[2]]],
                    },
                    tooltip: {
                    },
                    credits: {
                        enabled: true,
                    },
                    // chart: {
                    //     backgroundColor: "rgba(0, 0, 0, 0.0)",
                    //     margin: [0, 0, 0, 0],
                    // },
                    legend: {
                        enabled: true
                    },
                    title: {
                        text: 'World map'
                    },
                    subtitle: {
                        text:
                            'Source map: <a href="http://code.highcharts.com/mapdata/custom/world.js">World, Miller projection, medium resolution</a>'
                    },
                    mapNavigation: {
                        enabled: true,
                        buttonOptions: {
                            alignTo: "spacingBox"
                        }
                    },
                    series: [
                        {
                            name: 'Countries',
                            type: "map",
                            mapData: mapData,
                        },
                        {
                            name: 'Points',
                            type: 'mappoint',
                            states: {
                                hover: {
                                    color: "#BADA55"
                                }
                            },
                            dataLabels: {
                                enabled: true,
                                format: "{point.name}"
                            },
                            allAreas: false,
                            data: data
                        },
                    ]
                };

                this.highMapsChart({
                    cibleId: 'highchart_container',
                    chartOptions: chartOptions,
                    highchartsOptions: highchartsOptions
                })


            }

            this.isLoading = false;
        });
    }

}
