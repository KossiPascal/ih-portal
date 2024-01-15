import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@ih-services/auth-guard.service';
import { SetMetaTags } from '@ih-app/services/set-meta-tags.service';
import { MeetingReportComponent } from './mr.component';

const routes: Routes = [
  { path: '', redirectTo: 'reports', pathMatch: 'full' },
  {
    path: 'reports', component: MeetingReportComponent, canActivate: [AuthGuard, SetMetaTags], data: {
      href: "reports",
      icon: "fa fa-user",
      label: "reports",
      title: "RAPPORT DE REUNION"
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IhMeetingReportRoutingModule { }