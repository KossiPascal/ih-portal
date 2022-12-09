import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CacheComponent } from './cache.component';


export const routes:Routes = [
  { path: '', redirectTo:'list', pathMatch: 'full' },
  { path: 'list', component: CacheComponent, data: {title: 'Error'}},
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CachesRoutingModule { }
