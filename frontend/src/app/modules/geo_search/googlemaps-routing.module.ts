import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GooglemapComponent } from './googlemap.component';


export const routes:Routes = [
  { path: '', redirectTo:'googlemap', pathMatch: 'full' },
  { path: 'googlemap', component: GooglemapComponent, data: {title: 'Google Map'}},
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GoogleMapsRoutingModule { }
