import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChwsManageComponent } from './chws_manage-list.component';
import { SelectOrgUnitComponent } from './chw_select_orgunit.component';
import { SetMetaTags } from '@ih-app/services/set-meta-tags.service';


const routes: Routes = [
  { path: '', redirectTo: 'replacements', pathMatch: 'full'},
  {
    path: 'replacements', component: ChwsManageComponent,
    data: { 
      href: "replacements", 
      icon: "fa fa-user", 
      label: "Remplacants", 
      title: 'Gestion ASC Remplacantes' 
    }, canActivate:[SetMetaTags]
  },
  {
    path: 'select_orgunit', component: SelectOrgUnitComponent,
    data: { 
      href: "select_orgunit", 
      icon: "fa fa-user", 
      label: "Choisir OrgUnit", 
      title: 'Choisir OrgUnit' 
    }, canActivate:[SetMetaTags]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChwsManageRoutingModule { }
