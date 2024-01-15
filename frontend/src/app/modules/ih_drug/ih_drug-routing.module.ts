import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@ih-services/auth-guard.service';
import { SetMetaTags } from '@ih-app/services/set-meta-tags.service';
import { ChwsDrugComponent } from './chws_drug/chws_drug.component';

const routes: Routes = [
  { path: '', redirectTo: 'chws', pathMatch: 'full'},
  { path: 'chws', component: ChwsDrugComponent, canActivate: [AuthGuard,SetMetaTags], data: {
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
export class IhDrugRoutingModule { }