import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GooglemapComponent } from './goolemap/googlemap.component';
import { HighchartMap1Component } from './highchart1/highchart1.component';
import { HighchartMap2Component } from './highchart2/highchart2.component';


export const routes:Routes = [
  { path: '', redirectTo:'highchartmap1', pathMatch: 'full' },
  { path: 'highchartmap1', component: HighchartMap1Component, data: {title: 'Highchart Map 1'}},
  { path: 'highchartmap2', component: HighchartMap2Component, data: {title: 'Highchart Map 2'}},
  { path: 'googlemap', component: GooglemapComponent, data: {title: 'Google Map'}},
  
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapsRoutingModule { }
