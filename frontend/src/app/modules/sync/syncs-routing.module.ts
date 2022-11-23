import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '@ih-services/auth-guard.service';

import { SyncComponent } from './sync.component';

export const routes:Routes = [
  { path: '', component: SyncComponent , canActivate: [AuthGuard], data: {title: 'Sync Data'}},
];
 

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SyncsRoutingModule { }
