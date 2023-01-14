import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChwsManageComponent } from './chws_manage-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'replacements', pathMatch: 'full'},
  {
    path: 'replacements', component: ChwsManageComponent,
    data: { 
      href: "replacements", 
      icon: "fa fa-user", 
      label: "Remplacants", 
      title: 'Remplacants' 
    }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChwsManageRoutingModule { }
