import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChwsReplacementManageComponent } from './chws_manage/chws_manage-list.component';
import { LoginAccessGuard } from '@ih-src/app/guards/login-access-guard';
import { DrugPerChwManageComponent } from './drug_per_chw/drug_per_chw.component';
import { DrugPerSelectedManageComponent } from './drug_per_selected/drug_per_selected.component';

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
  { path: 'drug-per-chw', component: DrugPerChwManageComponent, 
    canActivate: [LoginAccessGuard], 
    data: {
      href: "drug_per_chw",
      icon: "fa fa-user",
      label: "drug_per_chw",
      title: "Médicament Par ASC"
    }
  },
  { path: 'drug-per-selected', component: DrugPerSelectedManageComponent, 
    canActivate: [LoginAccessGuard], 
    data: {
      href: "drug_per_selected",
      icon: "fa fa-user",
      label: "drug_per_selected",
      title: "Gestion Médicament ASC"
    }
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageChwsRoutingModule { }
