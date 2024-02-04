import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Dashboard1Component } from './dash1/dashboard-1.component';
import { Dashboard2Component } from './dash2/dashboard-2.component';
import { Dashboard3Component } from './dash3/dashboard-3.component';
import { Dashboard4Component } from './dash4/dashboard-4.component';
import { MapChartComponent } from './map-chart/map-chart.component';
import { HighchartMap1Component } from './highchart1/highchart1.component';
import { HighchartMap2Component } from './highchart2/highchart2.component';
import { GooglemapComponent } from './goolemap/googlemap.component';
import { LoginAccessGuard } from '@ih-src/app/guards/login-access-guard';

const routes: Routes = [
  { path: '', redirectTo: 'dash1', pathMatch: 'full' },
  {
    path: 'dashboard1',
    component: Dashboard1Component,
    canActivate: [LoginAccessGuard],
    data: {
      href: 'dashboard1',
      icon: 'fa fa-user',
      label: 'Dashboard-1',
      title: 'Activité des ASC',
    },
  },
  {
    path: 'dashboard2',
    component: Dashboard2Component,
    canActivate: [LoginAccessGuard],
    data: {
      href: 'dashboard2',
      icon: 'fa fa-user',
      label: 'Dashboard-2',
      title: 'ASC Données détaillées',
    },
  },
  {
    path: 'dashboard3',
    component: Dashboard3Component,
    canActivate: [LoginAccessGuard],
    data: {
      href: 'dashboard3',
      icon: 'fa fa-user',
      label: 'Dashboard-3',
      title: 'Effectifs des patients',
    },
  },
  {
    path: 'dashboard4',
    component: Dashboard4Component,
    canActivate: [LoginAccessGuard],
    data: {
      href: 'dashboard4',
      icon: 'fa fa-user',
      label: 'Dashboard-4',
      title: 'Détails Visite Ménages',
    },
  },
  {
    path: 'highchartmap1',
    component: MapChartComponent,
    canActivate: [LoginAccessGuard],
    data: { title: 'Highchart Map 1' },
  },
  {
    path: 'highchartmap2',
    component: HighchartMap1Component,
    canActivate: [LoginAccessGuard],
    data: { title: 'Highchart Map 2' },
  },
  {
    path: 'highchartmap3',
    component: HighchartMap2Component,
    canActivate: [LoginAccessGuard],
    data: { title: 'Highchart Map 3' },
  },
  {
    path: 'googlemap',
    component: GooglemapComponent,
    canActivate: [LoginAccessGuard],
    data: { title: 'Google Map' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewChwsDataRoutingModule {}
