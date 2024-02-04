// import { Component, OnInit } from "@angular/core";
// import { FormGroup, FormControl, Validators } from "@angular/forms";
// import { ActivatedRoute } from "@angular/router";
// import { Chws, ChwsDataFormDb, CompareData, Dhis2Sync, Districts, FilterParams, HighChart, Sites } from "@ih-app/models/Sync";
// import { AuthService } from "@ih-app/services/auth.service";
// import { SyncService } from "@ih-app/services/sync.service";
// import { notNull, DateUtils, Functions } from "@ih-app/shared/functions";
// import { Roles } from "@ih-app/models/Roles";
// import Highcharts from "highcharts";
// import proj4 from "proj4";

// declare var highmaps: any;

// @Component({
//     selector: "my-app",
//     templateUrl: "./highchart1.component.html",
//     styleUrls: ["./highchart1.component.css"]
// })
// export class HighchartMap1Component implements OnInit {

//     aggradateDataForm!: FormGroup;
//     initDate!: { start_date: string, end_date: string };
//     chwOU: Chws | null = null;

//     createDataFilterFormGroup(): FormGroup {
//         return new FormGroup({
//             start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
//             end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
//             districts: new FormControl(""),
//             sites: new FormControl(""),
//             withRatio: new FormControl(false, [Validators.required]),
//         });
//     }

//     bodyData: CompareData[] = [];
//     ChwsDataFromDb$: ChwsDataFormDb[] = [];
//     Districts$: Districts[] = [];
//     Chws$: Chws[] = [];
//     Sites$: Sites[] = [];

//     chws$: Chws[] = [];
//     sites$: Sites[] = [];

//     initMsg!: string;
//     isLoading!: boolean;
//     dhis2Params!: Dhis2Sync;
//     responseMessage: string = '';

//     constructor(private auth: AuthService, private route: ActivatedRoute, private sync: SyncService) {
//     }

//     public roles = new Roles(this.auth);

//     ngOnInit(): void {
//         this.chwOU = this.auth.chwsOrgUnit();
//         if (this.roles.isChws() && (this.chwOU == null || !notNull(this.chwOU))) {
//             location.href = 'chws/select_orgunit';
//         }
//         this.isLoading = false;
//         this.initDate = startEnd21and20Date();
//         this.aggradateDataForm = this.createDataFilterFormGroup();
//         if (!this.roles.isChws()) {
//             this.initAllData();
//         } else {
//             this.initDataFilted();
//         }

//     }


//     async initAllData() {
//         this.isLoading = true;
//         this.initMsg = 'Chargement des Districts ...';
//         this.sync.getDistrictsList().subscribe(async (_d$: { status: number, data: Districts[] }) => {
//             if (_d$.status == 200) this.Districts$ = _d$.data;
//             this.initMsg = 'Chargement des Sites ...';
//             this.sync.getSitesList().subscribe(async (_s$: { status: number, data: Sites[] }) => {
//                 if (_s$.status == 200) this.Sites$ = _s$.data;
//                 this.genarateSites()
//                 this.initMsg = 'Chargement des ASC ...';
//                 this.sync.getChwsList().subscribe(async (_c$: { status: number, data: Chws[] }) => {
//                     if (_c$.status == 200) {
//                         this.Chws$ = _c$.data;
//                     }
//                     this.genarateChws();


//                     this.initDataFilted();


//                     this.isLoading = false;
//                 }, (err: any) => {
//                     this.isLoading = false;
//                     console.log(err.error);
//                 });
//             }, (err: any) => {
//                 this.isLoading = false;
//                 console.log(err.error);
//             });
//         }, (err: any) => {
//             this.isLoading = false;
//             console.log(err.error);
//         });
//     }

//     genarateSites() {
//         this.sites$ = [];
//         this.chws$ = [];
//         const dist: string = this.aggradateDataForm.value["districts"];
//         this.aggradateDataForm.value["sites"] = "";
//         this.aggradateDataForm.value["chws"] = [];

//         if (notNull(dist)) {
//             for (let d = 0; d < this.Sites$.length; d++) {
//                 const site = this.Sites$[d];
//                 if (notNull(site)) if (dist.includes(site.district.id)) this.sites$.push(site)
//             }
//         } else {
//             this.sites$ = [];
//         }
//     }

//     genarateChws() {
//         const sites: string[] = returnDataAsArray(this.aggradateDataForm.value.sites);
//         this.chws$ = [];
//         this.aggradateDataForm.value["chws"] = [];
//         if (notNull(sites)) {
//             for (let d = 0; d < this.Chws$.length; d++) {
//                 const chws = this.Chws$[d];
//                 if (notNull(chws)) if (sites.includes(chws.site.id)) this.chws$.push(chws)
//             }
//         } else {
//             this.chws$ = this.Chws$;
//         }
//     }

//     highMapsChart(chartOptions: HighChart) {
//         highmaps(chartOptions)
//     }

//     ParamsToFilter(): FilterParams {
//         const startDate: string = this.aggradateDataForm.value.start_date;
//         const endDate: string = this.aggradateDataForm.value.end_date;

//         var districts: string[] = [];
//         var sites: string[] = [];
//         var chws: string[] = [];

//         if (!this.roles.isChws()) {
//             // const sources: string[] = returnDataAsArray(this.aggradateDataForm.value.sources) as string[];
//             districts = returnEmptyArrayIfNul(this.aggradateDataForm.value.districts);
//             sites = returnEmptyArrayIfNul(this.aggradateDataForm.value.sites);
//             // const chws: string[] = returnEmptyArrayIfNul(this.aggradateDataForm.value.chws);
//         } else {
//             if (this.chwOU != null && notNull(this.chwOU)) {
//                 districts = returnDataAsArray(this.chwOU.site.district.id);
//                 sites = returnDataAsArray(this.chwOU.site.id);
//                 chws = returnDataAsArray(this.chwOU.id);
//             }
//         }


//         var params: FilterParams = {
//             // sources: sources,
//             start_date: startDate,
//             end_date: endDate,
//             districts: districts,
//             sites: sites,
//             chws: chws,
//             withDhis2Data: false
//         }
//         return params;
//     }

//     initDataFilted(params?: FilterParams): void {
//         this.initMsg = 'Loading Data ...';
//         this.isLoading = true;
//         this.genarateChws();
//         this.sync.getAllChwsDataWithParams(params ?? this.ParamsToFilter()).subscribe((res: { status: number, data: any }) => {
//             if (res.status == 200) {
//                 this.ChwsDataFromDb$ = res.data;
//                 this.genarateGeoMap(params ?? this.ParamsToFilter());
//             } else {
//                 this.isLoading = false;
//                 this.responseMessage = res.data
//             }
//         }, (err: any) => {
//             this.isLoading = false;
//             console.log(err);
//         });
//     }

//     // {
//     //     latitude: '9.5186117', 
//     //     longitude: '0.87494', 
//     //     altitude: '260', 
//     //     accuracy: '7.900000095367432', 
//     //     altitudeAccuracy: 'null',
//     //     heading: "null",
//     //     speed: "0"
//     // }

//     //   async generateGeoMap(){

//     //     const geojson = await fetch(
//     //         'https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/australia.geo.json'
//     //     ).then(response => response.json());

//     //     // Prepare the geojson
//     //     const states = Highcharts.geojson(geojson, 'map'),
//     //         rivers = Highcharts.geojson(geojson, 'mapline'),
//     //         cities = Highcharts.geojson(geojson, 'mappoint'),
//     //         specialCityLabels = {
//     //             Melbourne: {
//     //                 align: 'right'
//     //             },
//     //             Canberra: {
//     //                 align: 'right',
//     //                 y: -5
//     //             },
//     //             Wollongong: {
//     //                 y: 5
//     //             },
//     //             Brisbane: {
//     //                 y: -5
//     //             }
//     //         };

//     //     // Skip or move some labels to avoid collision
//     //     states.forEach(state => {
//     //         // Disable data labels
//     //         if (state.properties.code_hasc === 'AU.CT' || state.properties.code_hasc === 'AU.JB') {
//     //             state.dataLabels = {
//     //                 enabled: false
//     //             };
//     //         }
//     //         if (state.properties.code_hasc === 'AU.TS') {
//     //             state.dataLabels = {
//     //                 style: {
//     //                     color: '#333333'
//     //                 }
//     //             };
//     //         }
//     //         // Move center for data label
//     //         if (state.properties.code_hasc === 'AU.SA') {
//     //             state.middleY = 0.3;
//     //         }
//     //         if (state.properties.code_hasc === 'AU.QL') {
//     //             state.middleY = 0.7;
//     //         }
//     //     });

//     //     cities.forEach(city => {
//     //         if (specialCityLabels[city.name]) {
//     //             city.dataLabels = specialCityLabels[city.name];
//     //         }
//     //     });




//     genarateGeoMap(params?: FilterParams) {
//         this.sync.syncGeojsonData().subscribe((res: { status: number, map: any, data: any }) => {
//             if (res.status == 200) {
//                 var mapData = res.map;
//                 // var data = res.data;
//                 var data: (number | [number, number | null] | Highcharts.SeriesMappointDataOptions | null)[] | undefined = [];
//                 var data2: any = [];





//                 for (let i = 0; i < this.ChwsDataFromDb$.length; i++) {
//                     const e = this.ChwsDataFromDb$[i];



//                     if (notNull(e.geolocation)) {
//                         mapData.features.push(
//                             { "type": "Feature", "properties": { "name": "Gold Coast" }, "geometry": { "type": "Point", "coordinates": [parseFloat(e.geolocation.latitude), parseFloat(e.geolocation.longitude)] } }
//                         );
//                         data.push(
//                             {
//                                 name: e.chw.name,
//                                 lat: parseFloat(e.geolocation.latitude),
//                                 lon: parseFloat(e.geolocation.longitude),
//                             }
//                         );
//                         data2.push(
//                             {
//                                 name: e.chw.name,
//                                 lat: parseFloat(e.geolocation.latitude),
//                                 lon: parseFloat(e.geolocation.longitude),
//                             }
//                         )
//                     }
//                 }
//                 const colors = ["#B8D8BA", "#D9DBBC", "#FCDDBC", "#EF959D", "#69585F"];

//                 const chartOptions = {
//                     backgroundColor: {
//                         linearGradient: [0, 0, 500, 500],
//                         stops: [
//                             [0, 'rgb(255, 255, 255)'],
//                             [1, 'rgb(240, 240, 255)'],
//                         ],
//                     },
//                     borderWidth: 2,
//                     plotBackgroundColor: 'rgba(255, 255, 255, .9)',
//                     plotShadow: true,
//                     plotBorderWidth: 1,
//                 };

//                 const highchartsOptions = {
//                     chart: {
//                         renderTo: 'highchart_container',
//                         type: 'FeatureCollection',
//                         map: mapData,
//                         // proj4: proj4
//                     },
//                     colorAxis: {
//                         min: 0,
//                         stops: [[0, colors[0]], [0.5, colors[1]], [1, colors[2]]],
//                     },
//                     accessibility: {
//                         description: 'Map where city locations have been defined using latitude/longitude.'
//                     },
//                     tooltip: {
//                         // headerFormat: '{point.name}',
//                         pointFormat: '<b>{point.features}</b><br>Lat: {point.x}, Lon: {point.y}'
//                     },
//                     credits: {
//                         enabled: true,
//                     },
//                     // chart: {
//                     //     backgroundColor: "rgba(0, 0, 0, 0.0)",
//                     //     margin: [0, 0, 0, 0],
//                     // },
//                     legend: {
//                         enabled: true
//                     },
//                     title: {
//                         text: 'World map'
//                     },
//                     subtitle: {
//                         text:
//                             'Source map: <a href="http://code.highcharts.com/mapdata/custom/world.js">World, Miller projection, medium resolution</a>'
//                     },
//                     mapNavigation: {
//                         enabled: true,
//                         buttonOptions: {
//                             alignTo: "spacingBox",
//                             verticalAlign: 'bottom'
//                         }
//                     },
//                     series: [
//                         {
//                             // Use the gb-all map with no data as a basemap
//                             name: 'Great Britain',
//                             borderColor: '#A0A0A0',
//                             nullColor: 'rgba(200, 200, 200, 0.3)',
//                             showInLegend: false
//                         }, 
//                         // {
//                         //     // name: 'Countries',
//                         //     type: "map",
//                         //     // mapData: mapData,
//                         //     data: Highcharts.geojson(mapData, 'map'),
//                         //     color: Highcharts.color(colors[2])
//                         //         .setOpacity(0.75)
//                         //         .get(),
//                         //     states: {
//                         //         hover: {
//                         //             color: colors[0]
//                         //         }
//                         //     },
//                         //     dataLabels: {

//                         //     },
//                         //     tooltip: {
//                         //         pointFormat: '{point.features.properties.site}',
//                         //     },
//                         //     onPoint: () => {
//                         //         console.log('point');
//                         //     }
//                         // },
//                         {
//                             name: 'Points',
//                             type: 'mappoint',
//                             // states: {
//                             //     hover: {
//                             //         color: "#BADA55"
//                             //     }
//                             // },
//                             // dataLabels: {
//                             //     enabled: true,
//                             //     format: "{point.name}"
//                             // },
//                             // allAreas: false,
//                             data: data


//                         },
//                     ]
//                 };

//                 this.highMapsChart({
//                     cibleId: 'highchart_container',
//                     chartOptions: chartOptions,
//                     highchartsOptions: highchartsOptions
//                 })

//             }

//             this.isLoading = false;
//         });
//     }

// }
