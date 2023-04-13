import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '@ih-services/auth-guard.service';

import { SyncComponent } from './sync.component';
import { SyncOrgUnitDataComponent } from './sync-orgunit-data.component';

export const routes:Routes = [
  { path: '', redirectTo: 'data', pathMatch: 'full'},
  { path: 'data/:cible', component: SyncComponent , canActivate: [AuthGuard], data: {title: 'Sync Data'}},
  { path: 'sync/:cible', component: SyncOrgUnitDataComponent , canActivate: [AuthGuard], data: {title: 'Sync OrgUnit & Data'}},
];
 

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SyncsRoutingModule { }
