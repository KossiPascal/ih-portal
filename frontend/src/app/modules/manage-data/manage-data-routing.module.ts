import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SyncToDhis2Component } from './sync-to-dhis2/sync-to-dhis2.component';
import { SyncOrgUnitDataComponent } from './sync-orgunit-data/sync-orgunit-data.component';
import { FullOrgUnitDataSyncComponent } from './full-orgunit-data-sync/full-orgunit-data-sync.component';
import { SyncWeeklyDataComponent } from './sync-weekly-data/sync-weekly-data.component';
import { LoginAccessGuard } from '@ih-src/app/guards/login-access-guard';

export const routes:Routes = [
  { path: '', redirectTo: 'sync-weekly-data', pathMatch: 'full'},
  { path: 'sync-weekly-data', component: SyncWeeklyDataComponent , canActivate: [LoginAccessGuard], data: {title: 'Sync Data'}},
  { path: 'sync-to-dhis2', component: SyncToDhis2Component , canActivate: [LoginAccessGuard], data: {title: 'Sync OrgUnit & Data'}},
  { path: 'sync-steply', component: SyncOrgUnitDataComponent , canActivate: [LoginAccessGuard], data: {title: 'Sync OrgUnit & Data'}},
  { path: 'auto-full-sync', component: FullOrgUnitDataSyncComponent , canActivate: [LoginAccessGuard], data: {title: 'Sync OrgUnit & Data'}},
];
 

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageDataRoutingModule { }
