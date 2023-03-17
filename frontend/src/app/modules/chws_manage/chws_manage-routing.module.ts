import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChwsManageComponent } from './chws_manage-list.component';
import { SelectOrgUnitComponent } from './chw_select_orgunit.component';


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
  },
  {
    path: 'select_orgunit', component: SelectOrgUnitComponent,
    data: { 
      href: "select_orgunit", 
      icon: "fa fa-user", 
      label: "Choisir OrgUnit", 
      title: 'Choisir OrgUnit' 
    }
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChwsManageRoutingModule { }
