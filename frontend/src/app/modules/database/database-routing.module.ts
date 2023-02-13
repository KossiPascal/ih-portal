import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatabaseUtilsComponent } from './database_utils.component';

const routes: Routes = [
  {
    path: '', component: DatabaseUtilsComponent,
    data: {href: "truncate_db",icon: "fa fa-user",label: "DatabaseUtils", title: 'DatabaseUtils'},
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatabaseUtilsRoutingModule { }
