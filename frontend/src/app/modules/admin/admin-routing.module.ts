import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentationComponent } from './documentation/documentation.component';
import { UserComponent } from './user-list/user-list.component';
import { RoleComponent } from './role/role-list.component';
import { LoginAccessGuard } from '@ih-src/app/guards/login-access-guard';
import { ApiComponent } from './api-list/api-list.component';
import { TruncateDatabaseComponent } from './truncate_database/truncate_database.component';
import { DeleteCouchdbDataComponent } from './delete_couchdb_data/delete_couchdb_data.component';

const routes: Routes = [
  { path: '', redirectTo: 'documentations', pathMatch: 'full' },
  { path: 'documentations', component: DocumentationComponent, canActivate: [LoginAccessGuard], data: { title: 'Documentation' } },
  {
    path: 'delete-couchdb-data', component: DeleteCouchdbDataComponent, canActivate: [LoginAccessGuard], data: {
      href: "delete-couchdb-data",
      icon: "fa fa-user",
      label: "DeleteCouchdbData",
      title: "DeleteCouchdbData"
    }
  },
  {
    path: 'truncate-database', component: TruncateDatabaseComponent, canActivate: [LoginAccessGuard], data: {
      href: "truncate-database",
      icon: "fa fa-user",
      label: "TruncateDatabase",
      title: "TruncateDatabase"
    }
  },
  {
    path: 'users-list', component: UserComponent, canActivate: [LoginAccessGuard],
    data: { href: "user", icon: "fa fa-user", label: "Users", title: 'Users' },
  },
  {
    path: 'roles-list', component: RoleComponent, canActivate: [LoginAccessGuard],
    data: { href: "user", icon: "fa fa-user", label: "Roles", title: 'Roles' },
  },
  {
    path: 'api-access-list', component: ApiComponent, canActivate: [LoginAccessGuard],
    data: { href: "user", icon: "fa fa-user", label: "Apis", title: 'Apis' },
  }
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  providers: []
})
export class AdminRoutingModule { }
