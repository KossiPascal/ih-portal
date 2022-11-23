import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@ih-app/services/auth-guard.service';
import { DocumentationComponent } from './documentation.component';

const routes:Routes = [
  { path: '', component: DocumentationComponent , canActivate: [AuthGuard], data: {title: 'Documentation'} },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentationsRoutingModule { }
