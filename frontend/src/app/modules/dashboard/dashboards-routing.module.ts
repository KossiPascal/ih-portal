import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '@ih-services/auth-guard.service';
import { DashboardOneComponent } from './dash1/dashboard-1.component';
import { DashboardTwoComponent } from './dash2/dashboard-2.component';

function isEq(){
  var x = 2;
  var y = 2;
  return x==y;
}

const routes: Routes = [
  { path: '', redirectTo: 'dash1', pathMatch: 'full'},
  {
    path: 'dash1', component: DashboardOneComponent, canActivate: [AuthGuard], data: {
      href: "dashboard1",
      icon: "fa fa-user",
      label: "Dashboard-1",
      title: "Dashboard-1"
    }
  },
  {
    path: 'dash2', component: DashboardTwoComponent, canActivate: [AuthGuard], data: {
      href: "dashboard2",
      icon: "fa fa-user",
      label: "Dashboard-2",
      title: "Dashboard-2"
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardsRoutingModule { }
