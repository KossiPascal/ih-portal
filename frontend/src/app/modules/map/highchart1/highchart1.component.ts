import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Chws, ChwsDataFormDb, CompareData, Dhis2Sync, Districts, FilterParams, HighChart, Sites } from "@ih-app/models/Sync";
import { AuthService } from "@ih-app/services/auth.service";
import { AppStorageService } from "@ih-app/services/cookie.service";
import { SyncService } from "@ih-app/services/sync.service";
import { notNull, DateUtils, Functions } from "@ih-app/shared/functions";
import { Roles } from "@ih-app/shared/roles";
// // import Highcharts from "highcharts";
// import proj4 from "proj4";
// import * as Highcharts from 'highcharts';
// import HC_map from 'highcharts/modules/map';

// HC_map(Highcharts);

// declare var highmaps: any;

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




    // Highcharts: typeof Highcharts = Highcharts; // required
    // chartConstructor: string = 'chart'; // optional string, defaults to 'chart'
    // chartOptions: Highcharts.Options = {}; // required
    // chartCallback: Highcharts.ChartCallbackFunction = function (chart) { } // optional function, defaults to null
    // updateFlag: boolean = false; // optional boolean
    // oneToOneFlag: boolean = true; // optional boolean, defaults to false
    // runOutsideAngular: boolean = false; // optional boolean, defaults to false


    // constructor(private store: AppStorageService, private auth: AuthService, private route: ActivatedRoute, private sync: SyncService) {
    //     if (!this.roles.isSupervisorMentor() && !this.roles.isChws()) location.href = this.auth.userValue()?.defaultRedirectUrl ?? ''!;
    // }

    //public roles = new Roles(this.store);

    ngOnInit(): void {
        // this.chwOU = this.auth.chwsOrgUnit();
        // if (this.roles.isChws() && (this.chwOU == null || !notNull(this.chwOU))) {
        //     location.href = 'chws/select_orgunit';
        // }
        // this.isLoading = false;
        // this.initDate = DateUtils.startEnd21and20Date();
        // this.aggradateDataForm = this.createDataFilterFormGroup();
        // if (!this.roles.isChws()) {
        //     this.initAllData();
        // } else {
        //     this.initDataFilted();
        // }

    }


    // async initAllData() {
    //     this.isLoading = true;
    //     this.initMsg = 'Chargement des Districts ...';
    //     this.sync.getDistrictsList().subscribe(async (_d$: { status: number, data: Districts[] }) => {
    //         if (_d$.status == 200) this.Districts$ = _d$.data;
    //         this.initMsg = 'Chargement des Sites ...';
    //         this.sync.getSitesList().subscribe(async (_s$: { status: number, data: Sites[] }) => {
    //             if (_s$.status == 200) this.Sites$ = _s$.data;
    //             this.genarateSites()
    //             this.initMsg = 'Chargement des ASC ...';
    //             this.sync.getChwsList().subscribe(async (_c$: { status: number, data: Chws[] }) => {
    //                 if (_c$.status == 200) {
    //                     this.Chws$ = _c$.data;
    //                 }
    //                 this.genarateChws();


    //                 this.initDataFilted();


    //                 this.isLoading = false;
    //             }, (err: any) => {
    //                 this.isLoading = false;
    //                 console.log(err.error);
    //             });
    //         }, (err: any) => {
    //             this.isLoading = false;
    //             console.log(err.error);
    //         });
    //     }, (err: any) => {
    //         this.isLoading = false;
    //         console.log(err.error);
    //     });
    // }

    // genarateSites() {
    //     this.sites$ = [];
    //     this.chws$ = [];
    //     const dist: string = this.aggradateDataForm.value["districts"];
    //     this.aggradateDataForm.value["sites"] = "";
    //     this.aggradateDataForm.value["chws"] = [];

    //     if (notNull(dist)) {
    //         for (let d = 0; d < this.Sites$.length; d++) {
    //             const site = this.Sites$[d];
    //             if (notNull(site)) if (dist.includes(site.district.id)) this.sites$.push(site)
    //         }
    //     } else {
    //         this.sites$ = [];
    //     }
    // }

    // genarateChws() {
    //     const sites: string[] = Functions.returnDataAsArray(this.aggradateDataForm.value.sites);
    //     this.chws$ = [];
    //     this.aggradateDataForm.value["chws"] = [];
    //     if (notNull(sites)) {
    //         for (let d = 0; d < this.Chws$.length; d++) {
    //             const chws = this.Chws$[d];
    //             if (notNull(chws)) if (sites.includes(chws.site.id)) this.chws$.push(chws)
    //         }
    //     } else {
    //         this.chws$ = this.Chws$;
    //     }
    // }

    // highMapsChart(chartOptions: HighChart) {
    //     highmaps(chartOptions)
    // }

    // ParamsToFilter(): FilterParams {
    //     const startDate: string = this.aggradateDataForm.value.start_date;
    //     const endDate: string = this.aggradateDataForm.value.end_date;

    //     var districts: string[] = [];
    //     var sites: string[] = [];
    //     var chws: string[] = [];

    //     if (!this.roles.isChws()) {
    //         // const sources: string[] = Functions.returnDataAsArray(this.aggradateDataForm.value.sources) as string[];
    //         districts = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.districts);
    //         sites = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.sites);
    //         // const chws: string[] = Functions.returnEmptyArrayIfNul(this.aggradateDataForm.value.chws);
    //     } else {
    //         if (this.chwOU != null && notNull(this.chwOU)) {
    //             districts = Functions.returnDataAsArray(this.chwOU.site.district.id);
    //             sites = Functions.returnDataAsArray(this.chwOU.site.id);
    //             chws = Functions.returnDataAsArray(this.chwOU.id);
    //         }
    //     }


    //     var params: FilterParams = {
    //         // sources: sources,
    //         start_date: startDate,
    //         end_date: endDate,
    //         districts: districts,
    //         sites: sites,
    //         chws: chws,
    //         withDhis2Data: false
    //     }
    //     return params;
    // }

    // initDataFilted(params?: FilterParams): void {
    //     this.initMsg = 'Loading Data ...';
    //     this.isLoading = true;
    //     this.genarateChws();
    //     this.sync.getAllChwsDataWithParams(params ?? this.ParamsToFilter()).subscribe((res: { status: number, data: any }) => {
    //         if (res.status == 200) {
    //             this.ChwsDataFromDb$ = res.data;

    //             // for (let i = 0; i < this.ChwsDataFromDb$.length; i++) {
    //             //     const data = this.ChwsDataFromDb$[i];
    //             //     if (notNull(data.geolocation)) console.log(data.geolocation)
    //             // }
    //             this.genarateGeoMap(params ?? this.ParamsToFilter());
    //         } else {
    //             this.isLoading = false;
    //             this.responseMessage = res.data
    //         }
    //     }, (err: any) => {
    //         this.isLoading = false;
    //         console.log(err);
    //     });
    // }

    // genarateGeoMap(params?: FilterParams) {
    //     this.sync.syncGeojsonData().subscribe((res: { status: number, map: any, data: any }) => {
    //         if (res.status == 200) {
    //             var mapData = res.map;
    //             // var data = res.data;
    //             var data: any = [];

    //             var data2: any = {
    //                 type: "FeatureCollection",
    //                 name: "ASC",
    //                 // crs: {
    //                 //     type: "name",
    //                 //     properties: {
    //                 //         name: "urn:ogc:def:crs:EPSG::3112"
    //                 //     }
    //                 // },
    //                 features: []
    //             };

    //             var data3: any = [];
    //             var data4: any = [];





    //             for (let i = 0; i < this.ChwsDataFromDb$.length; i++) {
    //                 const e = this.ChwsDataFromDb$[i];
    //                 if (notNull(e.geolocation)) {

    //                     // var dist = Functions.convertLatLonToXY({lat:parseFloat(e.geolocation.latitude), lon:parseFloat(e.geolocation.longitude)});
    //                     // var dist = Functions.getXYforLatLng(parseFloat(e.geolocation.latitude),parseFloat(e.geolocation.longitude), 1);

    //                     // var dist = Functions.degrees2meters(parseFloat(e.geolocation.latitude), parseFloat(e.geolocation.longitude));
    //                     var dist = Functions.LatLonToMercator(parseFloat(e.geolocation.latitude), parseFloat(e.geolocation.longitude));

    //                     mapData.features.push(
    //                         { "type": "Feature", "properties": { "name": e.chw.name, "site": e.site.name }, "geometry": { "type": "Point", "coordinates": [dist.x, dist.y] } }
    //                     );
    //                     data2.features.push(
    //                         { "type": "Feature", "properties": { "name": e.chw.name, "site": e.site.name }, "geometry": { "type": "Point", "coordinates": [dist.x, dist.y] } }
    //                     );


    //                     data3.push({
    //                         name: e.chw.name,
    //                         site: {
    //                             name: e.site.name
    //                         },
    //                         geometry: {
    //                             type: 'Point',
    //                             coordinates: [dist.x, dist.y]
    //                         }
    //                     });
    //                     data4.push({
    //                         name: e.chw.name,
    //                         site: {
    //                             name: e.site.name
    //                         },
    //                         geometry: {
    //                             type: 'LineString',
    //                             coordinates: [dist.x, dist.y]
    //                         }
    //                     });



    //                     data.push(
    //                         {
    //                             name: e.chw.name,
    //                             lat: parseFloat(e.geolocation.latitude),
    //                             lon: parseFloat(e.geolocation.longitude),
    //                         }
    //                     );
    //                 }
    //             }




    //             const colors = ["#B8D8BA", "#D9DBBC", "#FCDDBC", "#EF959D", "#69585F"];

    //             const chartOptions = {
    //                 backgroundColor: {
    //                     linearGradient: [0, 0, 500, 500],
    //                     stops: [
    //                         [0, 'rgb(255, 255, 255)'],
    //                         [1, 'rgb(240, 240, 255)'],
    //                     ],
    //                 },
    //                 borderWidth: 2,
    //                 plotBackgroundColor: 'rgba(255, 255, 255, .9)',
    //                 plotShadow: true,
    //                 plotBorderWidth: 1,
    //             };

    //             var states = Highcharts.geojson(mapData, 'map');

    //             var chws = Highcharts.geojson(mapData, 'mappoint');
    //             // var chws = Highcharts.geojson(data2, 'mappoint');


    //             // // Skip or move some labels to avoid collision
    //             // states.forEach(state => {
    //             //     // Disable data labels
    //             //     if (state.properties.code_hasc === 'AU.CT' || state.properties.code_hasc === 'AU.JB') {
    //             //         state.dataLabels = {
    //             //             enabled: false
    //             //         };
    //             //     }
    //             //     if (state.properties.code_hasc === 'AU.TS') {
    //             //         state.dataLabels = {
    //             //             style: {
    //             //                 color: '#333333'
    //             //             }
    //             //         };
    //             //     }
    //             //     // Move center for data label
    //             //     if (state.properties.code_hasc === 'AU.SA') {
    //             //         state.middleY = 0.3;
    //             //     }
    //             //     if (state.properties.code_hasc === 'AU.QL') {
    //             //         state.middleY = 0.7;
    //             //     }
    //             // });
    //             // var specialCityLabels: any = {
    //             //     Melbourne: {
    //             //         align: 'right'
    //             //     },
    //             //     Canberra: {
    //             //         align: 'right',
    //             //         y: -5
    //             //     },
    //             //     Wollongong: {
    //             //         y: 5
    //             //     },
    //             //     Brisbane: {
    //             //         y: -5
    //             //     }
    //             // };

    //             // chws.forEach(city => {
    //             //     if (specialCityLabels[city.name]) {
    //             //         city.dataLabels = specialCityLabels[city.name];
    //             //     }
    //             // });

    //             const highchartsOptions = {
    //                 chart: {
    //                     map: states,
    //                     proj4: proj4
    //                 },
    //                 // chart: {
    //                 //     map: Highcharts.geojson(mapData, 'map'),
    //                 //     renderTo: 'highchart_container',
    //                 //     type: 'map',
    //                 // },
    //                 // colorAxis: {
    //                 //     min: 0,
    //                 //     stops: [[0, colors[0]], [0.5, colors[1]], [1, colors[2]]],
    //                 // },
    //                 // tooltip: {
    //                 // },
    //                 // credits: {
    //                 //     enabled: true,
    //                 // },
    //                 // chart: {
    //                 //     backgroundColor: "rgba(0, 0, 0, 0.0)",
    //                 //     // margin: [0, 0, 0, 0],
    //                 //     type: 'mappoint',
    //                 //     map: 'countries/in/custom/in-all-disputed',
    //                 //     proj4: proj4
    //                 // },
    //                 // legend: {
    //                 //     enabled: false,
    //                 //     layout: 'vertical',
    //                 //     align: 'left',
    //                 //     verticalAlign: 'bottom'
    //                 // },

    //                 title: {
    //                     text: 'World map'
    //                 },
    //                 subtitle: {
    //                     text:
    //                         'Source map: <a href="http://code.highcharts.com/mapdata/custom/world.js">World, Miller projection, medium resolution</a>'
    //                 },


    //                 accessibility: {
    //                     series: {
    //                         descriptionFormat: '{series.name}, map with {series.points.length} areas.',
    //                         pointDescriptionEnabledThreshold: 50
    //                     },
    //                     point: {
    //                         valueDescriptionFormat: '{xDescription}.'
    //                     },
    //                     description: 'Map of Australia, showing examples of multiple geometry types in Highcharts Maps: Map areas (used for regions), map lines (used for rivers), and map points (used for cities).'
    //                 },

    //                 mapNavigation: {
    //                     enabled: true,
    //                     buttonOptions: {
    //                         verticalAlign: 'bottom',
    //                         alignTo: 'spacingBox',
    //                         x: 10,
    //                         y: 10,
    //                     }
    //                 },

    //                 mapView: {
    //                 },




    //                 series: [

    //                     {
    //                         name: 'Sites',
    //                         mapData: Highcharts.maps["countries/fr/fr-idf-all"],
    //                         data: states,
    //                         type: "map",
    //                         color: Highcharts.color(colors[2]).setOpacity(0.75).get(),
    //                         tooltip: {
    //                             pointFormat: '{point.properties.site}'
    //                         },
    //                         borderColor: "#ffffff",
    //                         joinBy: ["hc-key", "CODE_REGION"],
    //                         keys: ["CODE_REGION", "value"],

    //                         dataLabels: {
    //                             enabled: true,
    //                             format: "{point.properties.site}",
    //                             style: {
    //                                 width: '80px', // force line-wrap
    //                                 textTransform: 'uppercase',
    //                                 fontWeight: 'normal',
    //                                 textOutline: 'none',
    //                                 color: '#888'
    //                             }
    //                         },
    //                         allAreas: true,
    //                         states: {
    //                             hover: {
    //                                 color: colors[4]
    //                             }
    //                         },
    //                         // opacity: 0.5,

    //                     }, {
    //                         type: 'mapline',
    //                         data: data4,
    //                         showInLegend: true,
    //                         lineWidth: 2,
    //                         name: "Road",
    //                         nullColor: '#f00',
    //                         color: '#f00',
    //                         // enableMouseTracking: false
    //                     },


    //                     {
    //                         name: 'ASC',
    //                         type: 'mappoint',
    //                         // data: chws,
    //                         data: data3,
    //                         // data: data,

    //                         color: 'purple',

    //                         proj4: proj4,
    //                         marker: {
    //                             radius: 5,
    //                             fillColor: 'green' //'tomato'
    //                         },
    //                         dataLabels: {
    //                             enabled: true,
    //                             format: '{point.name}',
    //                             align: 'left',
    //                             verticalAlign: 'middle',
    //                             style: {
    //                                 fontWeight: 100,
    //                                 fontSize: '10px',
    //                                 textOutline: 'none'
    //                             },
    //                             point: {
    //                                 events: {
    //                                     click: null
    //                                 }
    //                             }
    //                         },
    //                         animation: true,
    //                         tooltip: {
    //                             pointFormat: '<strong>{point.name}</strong><br><em>{point.site.name}</em>'
    //                         },

    //                         states: {
    //                             hover: {
    //                                 color: "#BADA55"
    //                             }
    //                         },

    //                         allAreas: true,
    //                         nullColor: '#333333',
    //                         showInLegend: true,
    //                         enableMouseTracking: true,
    //                         accessibility: {
    //                             enabled: true
    //                         },
    //                     }
    //                 ]
    //             };

    //             Highcharts.mapChart('highchart_container', highchartsOptions as any)

    //             // this.highMapsChart({
    //             //     cibleId: 'highchart_container',
    //             //     chartOptions: chartOptions,
    //             //     highchartsOptions: highchartsOptions
    //             // })



    //             // ################################################################################





    //             this.chartOptions = {
    //                 chart: {
    //                     map: mapData,
    //                     proj4: proj4
    //                 },
    //                 title: {
    //                     text: 'Highcharts Maps - basic demo'
    //                 },
    //                 subtitle: {
    //                     text: `Selected Canadian cities were marked using their lat/lon coordinates.<br>
    //   Source map: <a href="http://code.highcharts.com/mapdata/custom/world.js">World, Miller projection, medium resolution</a>.`
    //                 },
    //                 mapNavigation: {
    //                     enabled: true,
    //                     buttonOptions: {
    //                         alignTo: 'spacingBox'
    //                     }
    //                 },
    //                 legend: {
    //                     enabled: true
    //                 },
    //                 colorAxis: {
    //                     min: 0
    //                 },
    //                 series: [
    //                     // {
    //                     //     name: 'Sites',
    //                     //     // mapData: Highcharts.maps["countries/fr/fr-idf-all"],
    //                     //     data: mapData,
    //                     //     type: "map",
    //                     //     color: Highcharts.color(colors[2]).setOpacity(0.75).get(),
    //                     //     tooltip: {
    //                     //         pointFormat: '{point.properties.site}'
    //                     //     },
    //                     //     borderColor: "#ffffff",
    //                     //     joinBy: ["hc-key", "CODE_REGION"],
    //                     //     keys: ["CODE_REGION", "value"],

    //                     //     dataLabels: {
    //                     //         enabled: true,
    //                     //         format: "{point.properties.site}",
    //                     //         // style: {
    //                     //         //     width: '80px', // force line-wrap
    //                     //         //     textTransform: 'uppercase',
    //                     //         //     fontWeight: 'normal',
    //                     //         //     textOutline: 'none',
    //                     //         //     color: '#888'
    //                     //         // }
    //                     //     },
    //                     //     allAreas: true,
    //                     //     states: {
    //                     //         hover: {
    //                     //             color: colors[4]
    //                     //         }
    //                     //     },
    //                     //     // opacity: 0.5,

    //                     // } as Highcharts.SeriesMapOptions,
    //                     {
    //                     name: 'Random data',
    //                     states: {
    //                         hover: {
    //                             color: '#BADA55'
    //                         }
    //                     },
    //                     dataLabels: {
    //                         enabled: true,
    //                         format: '{point.name}'
    //                     },
    //                     allAreas: false,
    //                     data: data3
    //                 } as Highcharts.SeriesMapOptions,
    //                 {
    //                     // Specify points using lat/lon
    //                     type: 'mappoint',
    //                     name: 'Canada cities',
    //                     marker: {
    //                         radius: 5,
    //                         fillColor: 'tomato'
    //                     },
    //                     data: [
    //                         {
    //                             name: 'Vancouver',
    //                             lat: 49.246292,
    //                             lon: -123.116226
    //                         },
    //                         {
    //                             name: 'Quebec City',
    //                             lat: 46.829853,
    //                             lon: -71.254028
    //                         },
    //                         {
    //                             name: 'Yellowknife',
    //                             lat: 62.4540,
    //                             lon: -114.3718
    //                         }
    //                     ]
    //                 } as Highcharts.SeriesMappointOptions]
    //             };

    //             Highcharts.setOptions(this.chartOptions);


    //         }

    //         this.isLoading = false;
    //     });
    // }

}
