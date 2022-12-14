import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '@ih-services/auth-guard.service';
import { Dashboard1Component } from './dash1/dashboard-1.component';
import { Dashboard2Component } from './dash2/dashboard-2.component';
import { Dashboard3Component } from './dash3/dashboard-3.component';
import { Dashboard4Component } from './dash4/dashboard-4.component';

function isEq(){
  var x = 2;
  var y = 2;
  return x==y;
}

const routes: Routes = [
  { path: '', redirectTo: 'dash1', pathMatch: 'full'},
  {
    path: 'dash1', component: Dashboard1Component, canActivate: [AuthGuard], data: {
      href: "dashboard1",
      icon: "fa fa-user",
      label: "Dashboard-1",
      title: "Dashboard-1"
    }
  },
  {
    path: 'dash2', component: Dashboard2Component, canActivate: [AuthGuard], data: {
      href: "dashboard2",
      icon: "fa fa-user",
      label: "Dashboard-2",
      title: "Dashboard-2"
    }
  },
  {
    path: 'dash3', component: Dashboard3Component, canActivate: [AuthGuard], data: {
      href: "dashboard3",
      icon: "fa fa-user",
      label: "Dashboard-3",
      title: "Dashboard-3"
    }
  },
  {
    path: 'dash4', component: Dashboard4Component, canActivate: [AuthGuard], data: {
      href: "dashboard4",
      icon: "fa fa-user",
      label: "Dashboard-4",
      title: "Dashboard-4"
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardsRoutingModule { }
