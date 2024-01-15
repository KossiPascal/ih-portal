import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@ih-services/auth-guard.service';
import { Dashboard1Component } from './dash1/dashboard-1.component';
import { Dashboard2Component } from './dash2/dashboard-2.component';
import { Dashboard3Component } from './dash3/dashboard-3.component';
import { Dashboard4Component } from './dash4/dashboard-4.component';
import { SetMetaTags } from '@ih-app/services/set-meta-tags.service';
import { ChwsDrugComponent } from '../ih_drug/chws_drug/chws_drug.component';

const routes: Routes = [
  { path: '', redirectTo: 'dash1', pathMatch: 'full'},
  {
    path: 'dash1', component: Dashboard1Component, canActivate: [AuthGuard,SetMetaTags], data: {
      href: "dashboard1",
      icon: "fa fa-user",
      label: "Dashboard-1",
      title: "Activité des ASC"
    }
  },
  {
    path: 'dash2', component: Dashboard2Component, canActivate: [AuthGuard,SetMetaTags], data: {
      href: "dashboard2",
      icon: "fa fa-user",
      label: "Dashboard-2",
      title: "ASC Données détaillées"
    }
  },
  {
    path: 'dash3', component: Dashboard3Component, canActivate: [AuthGuard, SetMetaTags], data: {
      href: "dashboard3",
      icon: "fa fa-user",
      label: "Dashboard-3",
      title: "Effectifs des patients"
    }
  },
  {
    path: 'dash4', component: Dashboard4Component, canActivate: [AuthGuard, SetMetaTags], data: {
      href: "dashboard4",
      icon: "fa fa-user",
      label: "Dashboard-4",
      title: "Détails Visite Ménages"
    }
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardsRoutingModule { }
