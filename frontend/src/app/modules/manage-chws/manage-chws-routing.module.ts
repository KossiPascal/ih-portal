import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChwsReplacementManageComponent } from './chws_manage/chws_manage-list.component';
import { ChwsDrugManageComponent } from './chws_drug/chws_drug.component';
import { LoginAccessGuard } from '@ih-src/app/guards/login-access-guard';


const routes: Routes = [
  { path: '', redirectTo: 'replacements', pathMatch: 'full'},
  {
    path: 'replacements', component: ChwsReplacementManageComponent,
    canActivate:[LoginAccessGuard],
    data: { 
      href: "replacements", 
      icon: "fa fa-user", 
      label: "Remplacants", 
      title: 'Gestion ASC Remplacantes' 
    }
  },
  { path: 'chws-drug', component: ChwsDrugManageComponent, 
    canActivate: [LoginAccessGuard], 
    data: {
      href: "chws_drug",
      icon: "fa fa-user",
      label: "chws_drug",
      title: "Situation Médicament ASC"
    }
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageChwsRoutingModule { }
