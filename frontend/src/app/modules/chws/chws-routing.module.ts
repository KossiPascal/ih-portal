import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SelectOrgUnitComponent } from './chw_select_orgunit/chw_select_orgunit.component';
import { ChwsDashboard1Component } from './dash1/dashboard-1.component';
import { ChwsDashboard2Component } from './dash2/dashboard-2.component';
import { ChwsDashboard3Component } from './dash3/dashboard-3.component';
import { ChwsDashboard4Component } from './dash4/dashboard-4.component';
import { LoginAccessGuard } from '@ih-src/app/guards/login-access-guard';


const routes: Routes = [
  { path: '', redirectTo: 'dash1', pathMatch: 'full' },
  {
    path: 'dashboard1', component: ChwsDashboard1Component,
    canActivate: [LoginAccessGuard], data: {
      href: "dashboard1",
      icon: "fa fa-user",
      label: "Dashboard-1",
      title: "Activité des ASC"
    }
  },
  {
    path: 'dashboard2', component: ChwsDashboard2Component,
    canActivate: [LoginAccessGuard], data: {
      href: "dashboard2",
      icon: "fa fa-user",
      label: "Dashboard-2",
      title: "ASC Données détaillées"
    }
  },
  {
    path: 'dashboard3', component: ChwsDashboard3Component,
    canActivate: [LoginAccessGuard], data: {
      href: "dashboard3",
      icon: "fa fa-user",
      label: "Dashboard-3",
      title: "Effectifs des patients"
    }
  },
  {
    path: 'dashboard4', component: ChwsDashboard4Component,
    canActivate: [LoginAccessGuard], data: {
      href: "dashboard4",
      icon: "fa fa-user",
      label: "Dashboard-4",
      title: "Détails Visite Ménages"
    }
  },
  {
    path: 'select_orgunit', component: SelectOrgUnitComponent,
    canActivate: [LoginAccessGuard],
    data: {
      href: "select_orgunit",
      icon: "fa fa-user",
      label: "Choisir OrgUnit",
      title: 'Choisir OrgUnit'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChwsRoutingModule { }
