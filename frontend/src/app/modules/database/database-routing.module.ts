import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatabaseUtilsComponent } from './database_utils.component';
import { AuthGuard } from '@ih-src/app/services/auth-guard.service';
import { SetMetaTags } from '@ih-src/app/services/set-meta-tags.service';

const routes: Routes = [
  { path: '', redirectTo: 'utils', pathMatch: 'full'},
  {
    path: 'utils', component: DatabaseUtilsComponent, canActivate: [AuthGuard,SetMetaTags], data: {
      href: "utils",
      icon: "fa fa-user",
      label: "DatabaseUtils",
      title: "DatabaseUtils"
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatabaseUtilsRoutingModule { }
