import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';

const routes: Routes = [
  
  { path: '', redirectTo: 'auths', pathMatch: 'full' },
  { path: 'auths', loadChildren: () => import('./modules/auth/auths.module').then(m => m.AuthsModule)},
  { path: 'users', loadChildren: () => import('./modules/user/users.module').then(m => m.UsersModule)},
  { path: 'chws', loadChildren: () => import('./modules/chws_manage/chws_manage.module').then(m => m.ChwsManageModule)},
  { path: 'dashboards', loadChildren: () => import('./modules/dashboard/dashboards.module').then(m => m.DashboardsModule)},
  { path: 'docs', loadChildren: () => import('./modules/documentation/documentations.module').then(m => m.DocumentationsModule)},
  { path: 'fetch', loadChildren: () => import('./modules/sync/syncs.module').then(m => m.SyncsModule)},
  { path: 'maps', loadChildren: () => import('./modules/map/maps.module').then(m => m.MapsModule)},
  { path: 'cache', loadChildren: () => import('./modules/cache/caches.module').then(m => m.CachesModule)},
  { path: 'ihDrug', loadChildren: () => import('./modules/ih_drug/ih_drug.module').then(m => m.IhDrugModule)},
  { path: 'meetings', loadChildren: () => import('./modules/meeting_reports/mrs.module').then(m => m.IhMeetingReportModule)},
  { path: 'database', loadChildren: () => import('./modules/database/database_utils.module').then(m => m.DatabaseUtilsModule)},
  { path: 'error', loadChildren: () => import('./modules/error/errors.module').then(m => m.ErrorsModule)},
  { path: '**', redirectTo: 'error' },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    SharedModule,
    RouterModule.forRoot(routes, { useHash: false, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
