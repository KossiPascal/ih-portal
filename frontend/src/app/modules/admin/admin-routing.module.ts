import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatabaseUtilsComponent } from './database/database_utils.component';
import { DocumentationComponent } from './documentation/documentation.component';
import { UserComponent } from './user/user-list.component';
import { RoleComponent } from './role/role-list.component';
import { LoginAccessGuard } from '@ih-src/app/guards/login-access-guard';

const routes: Routes = [
  { path: '', redirectTo: 'documentations', pathMatch: 'full' },
  { path: 'documentations', component: DocumentationComponent, canActivate: [LoginAccessGuard], data: {title: 'Documentation'} },
  {
    path: 'database-utils', component: DatabaseUtilsComponent, canActivate: [LoginAccessGuard], data: {
      href: "utils",
      icon: "fa fa-user",
      label: "DatabaseUtils",
      title: "DatabaseUtils"
    }
  },
  {
    path: 'users-list', component: UserComponent, canActivate: [LoginAccessGuard],
    data: {href: "user",icon: "fa fa-user",label: "Users", title: 'Users'},
  },
  {
    path: 'roles-list', component: RoleComponent, canActivate: [LoginAccessGuard],
    data: {href: "user",icon: "fa fa-user",label: "Roles", title: 'Roles'},
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
