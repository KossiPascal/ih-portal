import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CacheComponent } from './cache.component';
import { SetMetaTags } from '@ih-app/services/set-meta-tags.service';


export const routes:Routes = [
  { path: '', redirectTo:'list', pathMatch: 'full' },
  { path: 'list', component: CacheComponent, data: {title: 'Error'}, canActivate:[SetMetaTags]},
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CachesRoutingModule { }
