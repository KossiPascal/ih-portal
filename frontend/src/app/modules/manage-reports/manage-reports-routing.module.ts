import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MeetingReportComponent } from './meeting_report/meeting_report.component';
import { LoginAccessGuard } from '@ih-src/app/guards/login-access-guard';

const routes: Routes = [
  { path: '', redirectTo: 'meeting-report', pathMatch: 'full' },
  {
    path: 'meeting-report', component: MeetingReportComponent, canActivate: [LoginAccessGuard], data: {
      href: "meeting-report",
      icon: "fa fa-user",
      label: "meeting-report",
      title: "RAPPORT DE REUNION"
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageReportRoutingModule { }