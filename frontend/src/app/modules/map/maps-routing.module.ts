import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GooglemapComponent } from './goolemap/googlemap.component';
import { HighchartMap1Component } from './highchart1/highchart1.component';
import { HighchartMap2Component } from './highchart2/highchart2.component';
import { SetMetaTags } from '@ih-app/services/set-meta-tags.service';
import { MapChartComponent } from './map-chart/map-chart.component';


export const routes:Routes = [
  { path: '', redirectTo:'highchartmap0', pathMatch: 'full' },
  { path: 'highchartmap0', component: MapChartComponent, data: {title: 'Highchart Map 0'}, canActivate:[SetMetaTags]},
  { path: 'highchartmap1', component: HighchartMap1Component, data: {title: 'Highchart Map 1'}, canActivate:[SetMetaTags]},
  { path: 'highchartmap2', component: HighchartMap2Component, data: {title: 'Highchart Map 2'}, canActivate:[SetMetaTags]},
  { path: 'googlemap', component: GooglemapComponent, data: {title: 'Google Map'}, canActivate:[SetMetaTags]},
  
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapsRoutingModule { }
